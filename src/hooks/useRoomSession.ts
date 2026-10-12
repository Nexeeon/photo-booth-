import { useState, useEffect, useCallback, type RefObject } from 'react'
import type Webcam from 'react-webcam'
import { useFirebaseRoom } from './useFirebaseRoom'
import { getOrCreateUserId, getOrCreateUserName, sleep } from '../utils/helpers'
import { PHOTO_COUNT, COUNTDOWN_SECONDS, BETWEEN_PHOTO_DELAY } from '../utils/frames'
import type { RoomSession, RoomUser, CapturedPhoto, UserRole, SessionState } from '../types'

interface UseRoomSessionProps {
  roomId: string
  role: UserRole
}

interface UseRoomSessionReturn {
  session: RoomSession | null
  users: RoomUser[]
  currentUser: RoomUser
  isLoading: boolean
  error: string | null
  startSession: () => Promise<void>
  capturePhoto: (webcamRef: RefObject<Webcam | null>) => Promise<void>
  changeFrame: (frameId: string) => Promise<void>
  sessionState: SessionState
  countdownCount: number
  isCapturing: boolean
  showFlash: boolean
}

export function useRoomSession({ roomId, role }: UseRoomSessionProps): UseRoomSessionReturn {
  const [session, setSession] = useState<RoomSession | null>(null)
  const [users, setUsers] = useState<RoomUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const [currentUser] = useState<RoomUser>(() => ({
    id: getOrCreateUserId(),
    role,
    name: getOrCreateUserName(),
    joinedAt: Date.now(),
    isOnline: true,
  }))

  const firebaseRoom = useFirebaseRoom(roomId)

  // Subscribe to room data
  useEffect(() => {
    if (!roomId) return

    const unsubRoom = firebaseRoom.subscribeToRoom(roomId, (data) => {
      setSession(data)
      setIsLoading(false)
    })

    const unsubUsers = firebaseRoom.subscribeToUsers(roomId, (u) => {
      setUsers(u)
    })

    return () => {
      unsubRoom()
      unsubUsers()
    }
  }, [roomId, firebaseRoom])

  const sessionState: SessionState = session?.state || 'waiting'
  const countdownCount: number = session?.countdown?.count ?? 0

  /** HOST: start the session, drive all countdown + capture */
  const startSession = useCallback(async () => {
    if (role !== 'host') return
    await firebaseRoom.updateSessionState(roomId, 'countdown')

    // Drive countdown for each photo
    for (let photoIdx = 0; photoIdx < PHOTO_COUNT; photoIdx++) {
      // Countdown 3→1
      for (let count = COUNTDOWN_SECONDS; count >= 1; count--) {
        await firebaseRoom.updateCountdown(roomId, {
          isActive: true,
          count,
          photoIndex: photoIdx,
        })
        await sleep(1000)
      }
      // Signal capture
      await firebaseRoom.updateSessionState(roomId, 'capturing')
      await firebaseRoom.updateCountdown(roomId, {
        isActive: false,
        count: 0,
        photoIndex: photoIdx,
      })
      await sleep(500)

      if (photoIdx < PHOTO_COUNT - 1) {
        // Brief pause between photos
        await firebaseRoom.updateSessionState(roomId, 'countdown')
        await sleep(BETWEEN_PHOTO_DELAY)
      }
    }

    // All done
    await firebaseRoom.updateSessionState(roomId, 'preview')
  }, [roomId, role, firebaseRoom])

  /** BOTH users: capture photo when state=capturing */
  const capturePhoto = useCallback(async (webcamRef: RefObject<Webcam | null>) => {
    if (!webcamRef.current || !session) return
    if (isCapturing) return

    setIsCapturing(true)
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 500)

    try {
      const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 720 })
      if (!imageSrc) return

      const now = Date.now()
      const photoId = `photo_${now}_${currentUser.id}`
      const photo: CapturedPhoto = {
        id: photoId,
        dataUrl: imageSrc,
        capturedAt: now,
        capturedBy: currentUser.id,
      }

      await firebaseRoom.addPhoto(roomId, photo)
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture photo')
    } finally {
      setIsCapturing(false)
    }
  }, [roomId, session, isCapturing, firebaseRoom, currentUser.id])

  const changeFrame = useCallback(async (frameId: string) => {
    await firebaseRoom.updateFrame(roomId, frameId)
  }, [roomId, firebaseRoom])

  return {
    session,
    users,
    currentUser,
    isLoading,
    error,
    startSession,
    capturePhoto,
    changeFrame,
    sessionState,
    countdownCount,
    isCapturing,
    showFlash,
  }
}
