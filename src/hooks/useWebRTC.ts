import { useEffect, useState, useRef } from 'react'
import { ref, set, onValue, onChildAdded, push, onDisconnect, remove } from 'firebase/database'
import { database } from '../lib/firebase'
import type { UserRole } from '../types'

const servers = {
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
      console.warn("WebRTC requires real Firebase config. Using mock fallback for single-tab demo without video sync.")
      return
    }

    const initWebRTC = async () => {
      const pc = new RTCPeerConnection(servers)
      pcRef.current = pc

      const remoteMediaStream = new MediaStream()
      setRemoteStream(remoteMediaStream)

      // Add local tracks to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      // Listen for remote tracks
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track)
        })
      }

      const roomRef = ref(database, `rooms/${roomId}/webrtc`)
      const callerCandidatesRef = ref(database, `rooms/${roomId}/webrtc/callerCandidates`)
      const calleeCandidatesRef = ref(database, `rooms/${roomId}/webrtc/calleeCandidates`)

      if (role === 'host') {
        // Clear previous connection data when host starts
        await remove(roomRef)

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            push(callerCandidatesRef, event.candidate.toJSON())
          }
        }

        // Create Offer
        const offerDescription = await pc.createOffer()
        await pc.setLocalDescription(offerDescription)

        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        }
        await set(ref(database, `rooms/${roomId}/webrtc/offer`), offer)

        // Listen for remote answer
        onValue(ref(database, `rooms/${roomId}/webrtc/answer`), (snapshot) => {
          const data = snapshot.val()
          if (!pc.currentRemoteDescription && data) {
            const answerDescription = new RTCSessionDescription(data)
            pc.setRemoteDescription(answerDescription)
          }
        })

        // Listen for remote ICE candidates
        onChildAdded(calleeCandidatesRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const candidate = new RTCIceCandidate(data)
            pc.addIceCandidate(candidate)
          }
        })

      } else {
        // Role is guest
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            push(calleeCandidatesRef, event.candidate.toJSON())
          }
        }

        // Wait for offer, then create answer
        onValue(ref(database, `rooms/${roomId}/webrtc/offer`), async (snapshot) => {
          const offerStr = snapshot.val()
          if (offerStr && !pc.currentRemoteDescription) {
            const offerDescription = new RTCSessionDescription(offerStr)
            await pc.setRemoteDescription(offerDescription)

            const answerDescription = await pc.createAnswer()
            await pc.setLocalDescription(answerDescription)

            const answer = {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            }
            await set(ref(database, `rooms/${roomId}/webrtc/answer`), answer)
          }
        })

        // Listen for caller ICE candidates
        onChildAdded(callerCandidatesRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const candidate = new RTCIceCandidate(data)
            pc.addIceCandidate(candidate)
          }
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
