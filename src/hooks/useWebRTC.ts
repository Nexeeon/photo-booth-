import { useEffect, useState, useRef } from 'react'
import { collection, doc, setDoc, onSnapshot, addDoc, getDoc } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import type { UserRole } from '../types'

const STUN_SERVERS = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
}

export function useWebRTC(roomId: string, role: UserRole, localStream: MediaStream | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const connectingRef = useRef(false)

  useEffect(() => {
    if (!roomId || !localStream || connectingRef.current) return
    connectingRef.current = true

    const isMock = import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key'
    if (isMock) {
      console.warn("WebRTC membutuhkan Firebase asli. Silakan isi .env Anda untuk mengaktifkan video P2P lintas jaringan.")
      return
    }

    const initWebRTC = async () => {
      const pc = new RTCPeerConnection(STUN_SERVERS)
      pcRef.current = pc

      const remoteMediaStream = new MediaStream()
      setRemoteStream(remoteMediaStream)

      // 1. Masukkan video/audio lokal kita ke dalam PeerConnection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      // 2. Dengarkan track yang masuk dari stream teman (Remote)
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track)
        })
      }

      // Firestore Refs
      const roomDoc = doc(firestore, 'webrtc_rooms', roomId)
      const callerCandidatesCol = collection(roomDoc, 'callerCandidates')
      const calleeCandidatesCol = collection(roomDoc, 'calleeCandidates')

      if (role === 'host') {
        // --- LOGIKA HOST ---

        // Setiap kali kita menemukan rute jaringan (ICE), simpan di Firestore agar terbaca oleh Guest
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(callerCandidatesCol, event.candidate.toJSON())
          }
        }

        // Buat Offer
        const offerDescription = await pc.createOffer()
        await pc.setLocalDescription(offerDescription)

        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        }

        // Simpan Offer ke dalan document room
        await setDoc(roomDoc, { offer })

        // Pantau kapan Guest merespons dengan Answer
        onSnapshot(roomDoc, (snapshot) => {
          const data = snapshot.data()
          if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer)
            pc.setRemoteDescription(answerDescription)
          }
        })

        // Pantau ICE candidates yang dikirim oleh Guest
        onSnapshot(calleeCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.addIceCandidate(candidate)
            }
          })
        })

      } else {
        // --- LOGIKA GUEST ---

        // Tangkap rute jaringan kita, simpan di subkoleksi callee
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(calleeCandidatesCol, event.candidate.toJSON())
          }
        }

        // Baca data Room yang berisi Offer dari Host
        const roomSnapshot = await getDoc(roomDoc)
        if (roomSnapshot.exists()) {
          const data = roomSnapshot.data()
          
          if (data?.offer && !pc.currentRemoteDescription) {
            const offerDescription = new RTCSessionDescription(data.offer)
            await pc.setRemoteDescription(offerDescription)

            // Buat Answer untuk merespons Offer
            const answerDescription = await pc.createAnswer()
            await pc.setLocalDescription(answerDescription)

            const answer = {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            }

            // Update document room dengan Answer kita
            await setDoc(roomDoc, { answer }, { merge: true })
          }
        }

        // Pantau jika Host menambahkan rute baru di tengah jalan
        onSnapshot(callerCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.addIceCandidate(candidate)
            }
          })
        })
      }
    }

    initWebRTC()

    return () => {
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
      connectingRef.current = false
    }
  }, [roomId, role, localStream])

  return { remoteStream }
}
