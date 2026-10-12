import { useEffect, useState, useRef } from 'react'
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import type { UserRole, WebRTCRoomDocument } from '../types'

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
}

export function useWebRTC(roomId: string, role: UserRole, localStream: MediaStream | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    if (!roomId || !localStream) return

    let isCleanedUp = false
    const unsubscribers: Unsubscribe[] = []
    const queuedRemoteCandidates: RTCIceCandidateInit[] = []

    const pc = new RTCPeerConnection(STUN_SERVERS)
    pcRef.current = pc

    // 1. Register local tracks
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    // 2. Receive remote tracks
    pc.ontrack = (event: RTCTrackEvent) => {
      if (isCleanedUp) return
      if (event.streams[0]) {
        setRemoteStream(event.streams[0])
      }
    }

    // Helper: Drain queued ICE candidates once remote description is set
    const processQueuedCandidates = async () => {
      while (queuedRemoteCandidates.length > 0) {
        const candidateInit = queuedRemoteCandidates.shift()
        if (candidateInit && pc.remoteDescription && pc.signalingState !== 'closed') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidateInit))
          } catch {
            // Silently ignore stale candidates
          }
        }
      }
    }

    // Firestore Document & Candidate Subcollections
    const roomDoc = doc(firestore, 'webrtc_rooms', roomId)
    const callerCandidatesCol = collection(roomDoc, 'callerCandidates')
    const calleeCandidatesCol = collection(roomDoc, 'calleeCandidates')

    if (role === 'host') {
      // ===== CALLER (HOST) =====
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && !isCleanedUp) {
          const candidateData: RTCIceCandidateInit = event.candidate.toJSON()
          void addDoc(callerCandidatesCol, candidateData)
        }
      }

      // Create and save Offer
      const createAndSaveOffer = async () => {
        try {
          const offerDescription = await pc.createOffer()
          await pc.setLocalDescription(offerDescription)

          const roomData: WebRTCRoomDocument = {
            offer: {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            },
          }
          await setDoc(roomDoc, roomData, { merge: true })
        } catch {
          // Handled
        }
      }

      void createAndSaveOffer()

      // Listen for Answer from Callee
      const unsubRoom = onSnapshot(roomDoc, (snapshot) => {
        if (isCleanedUp || !snapshot.exists()) return
        const data = snapshot.data() as DocumentData & WebRTCRoomDocument
        if (data.answer && !pc.currentRemoteDescription && pc.signalingState !== 'closed') {
          const answerDesc = new RTCSessionDescription(data.answer)
          pc.setRemoteDescription(answerDesc)
            .then(() => {
              void processQueuedCandidates()
            })
            .catch(() => {
              // Handled
            })
        }
      })
      unsubscribers.push(unsubRoom)

      // Listen for ICE candidates sent by Callee
      const unsubCalleeCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
        if (isCleanedUp) return
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data() as RTCIceCandidateInit
            if (pc.remoteDescription && pc.signalingState !== 'closed') {
              void pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {})
            } else {
              queuedRemoteCandidates.push(candidateData)
            }
          }
        })
      })
      unsubscribers.push(unsubCalleeCandidates)
    } else {
      // ===== CALLEE (GUEST) =====
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && !isCleanedUp) {
          const candidateData: RTCIceCandidateInit = event.candidate.toJSON()
          void addDoc(calleeCandidatesCol, candidateData)
        }
      }

      // Listen for Offer from Caller via snapshot (solves race conditions)
      let hasHandledOffer = false
      const unsubRoom = onSnapshot(roomDoc, (snapshot) => {
        if (isCleanedUp || !snapshot.exists() || hasHandledOffer) return
        const data = snapshot.data() as DocumentData & WebRTCRoomDocument

        if (data.offer && !pc.currentRemoteDescription && pc.signalingState !== 'closed') {
          hasHandledOffer = true
          const offerDesc = new RTCSessionDescription(data.offer)

          pc.setRemoteDescription(offerDesc)
            .then(async () => {
              void processQueuedCandidates()
              const answerDesc = await pc.createAnswer()
              await pc.setLocalDescription(answerDesc)

              const answerData: WebRTCRoomDocument = {
                answer: {
                  sdp: answerDesc.sdp,
                  type: answerDesc.type,
                },
              }
              await setDoc(roomDoc, answerData, { merge: true })
            })
            .catch(() => {
              hasHandledOffer = false
            })
        }
      })
      unsubscribers.push(unsubRoom)

      // Listen for ICE candidates sent by Caller
      const unsubCallerCandidates = onSnapshot(callerCandidatesCol, (snapshot) => {
        if (isCleanedUp) return
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data() as RTCIceCandidateInit
            if (pc.remoteDescription && pc.signalingState !== 'closed') {
              void pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {})
            } else {
              queuedRemoteCandidates.push(candidateData)
            }
          }
        })
      })
      unsubscribers.push(unsubCallerCandidates)
    }

    // Comprehensive Cleanup
    return () => {
      isCleanedUp = true

      // Unsubscribe all Firestore listeners
      unsubscribers.forEach((unsub) => unsub())

      // Close peer connection and detach callbacks
      if (pcRef.current) {
        pcRef.current.getReceivers().forEach((receiver) => {
          receiver.track?.stop()
        })
        pcRef.current.ontrack = null
        pcRef.current.onicecandidate = null
        pcRef.current.close()
        pcRef.current = null
      }

      setRemoteStream(null)
    }
  }, [roomId, role, localStream])

  return { remoteStream }
}

export default useWebRTC
