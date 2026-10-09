import { useEffect, useState, useRef } from 'react'
import { collection, doc, setDoc, onSnapshot, addDoc } from 'firebase/firestore'
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

    let unsubRoom: (() => void) | null = null
    let unsubCandidates: (() => void) | null = null

    const initWebRTC = async () => {
      try {
        const pc = new RTCPeerConnection(STUN_SERVERS)
        pcRef.current = pc

        const remoteMediaStream = new MediaStream()
        setRemoteStream(remoteMediaStream)

        // 1. Masukkan track lokal kita ke PeerConnection
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })

        // 2. Dengarkan track remote dari teman
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0])
          } else {
            event.streams[0]?.getTracks().forEach((track) => {
              remoteMediaStream.addTrack(track)
            })
            setRemoteStream(remoteMediaStream)
          }
        }

        const roomDoc = doc(firestore, 'webrtc_rooms', roomId)
        const callerCandidatesCol = collection(roomDoc, 'callerCandidates')
        const calleeCandidatesCol = collection(roomDoc, 'calleeCandidates')

        const candidateQueue: RTCIceCandidateInit[] = []

        const processCandidate = async (candidate: RTCIceCandidateInit) => {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (e) {
              console.error('Error adding ICE candidate:', e)
            }
          } else {
            candidateQueue.push(candidate)
          }
        }

        const flushCandidateQueue = async () => {
          while (candidateQueue.length > 0) {
            const candidate = candidateQueue.shift()
            if (candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
              } catch (e) {
                console.error('Error flushing candidate:', e)
              }
            }
          }
        }

        if (role === 'host') {
          // --- LOGIKA HOST ---
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(callerCandidatesCol, event.candidate.toJSON()).catch(console.error)
            }
          }

          // Buat Offer
          const offerDescription = await pc.createOffer()
          await pc.setLocalDescription(offerDescription)

          await setDoc(roomDoc, {
            offer: {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            }
          })

          // Pantau Answer dari Guest
          unsubRoom = onSnapshot(roomDoc, async (snapshot) => {
            const data = snapshot.data()
            if (!pc.currentRemoteDescription && data?.answer) {
              const answerDescription = new RTCSessionDescription(data.answer)
              await pc.setRemoteDescription(answerDescription)
              await flushCandidateQueue()
            }
          })

          // Pantau ICE candidates dari Guest
          unsubCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                processCandidate(change.doc.data() as RTCIceCandidateInit)
              }
            })
          })

        } else {
          // --- LOGIKA GUEST ---
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              addDoc(calleeCandidatesCol, event.candidate.toJSON()).catch(console.error)
            }
          }

          // Pantau Offer dari Host (secara reaktif)
          unsubRoom = onSnapshot(roomDoc, async (snapshot) => {
            const data = snapshot.data()
            if (data?.offer && !pc.currentRemoteDescription) {
              const offerDescription = new RTCSessionDescription(data.offer)
              await pc.setRemoteDescription(offerDescription)
              await flushCandidateQueue()

              const answerDescription = await pc.createAnswer()
              await pc.setLocalDescription(answerDescription)

              await setDoc(roomDoc, {
                answer: {
                  sdp: answerDescription.sdp,
                  type: answerDescription.type,
                }
              }, { merge: true })
            }
          })

          // Pantau ICE candidates dari Host
          unsubCandidates = onSnapshot(callerCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                processCandidate(change.doc.data() as RTCIceCandidateInit)
              }
            })
          })
        }
      } catch (err) {
        console.error('WebRTC initialization error:', err)
      }
    }

    initWebRTC()

    return () => {
      unsubRoom?.()
      unsubCandidates?.()
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
      connectingRef.current = false
    }
  }, [roomId, role, localStream])

  return { remoteStream }
}
