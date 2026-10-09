import { useState, useEffect, useRef, useCallback } from 'react'
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
  currentUser: RoomUser | null
  isLoading: boolean
  error: string | null
  startSession: () => Promise<void>
  capturePhoto: (dataUrl: string) => Promise<void>
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

  const currentUserId = useRef(getOrCreateUserId())
  const currentUserName = useRef(getOrCreateUserName())

  const firebaseRoom = useFirebaseRoom(roomId)

  const currentUser: RoomUser = {
    id: currentUserId.current,
    role,
    name: currentUserName.current,
    joinedAt: Date.now(),
    isOnline: true,
  }

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
  }, [roomId])

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
      await sleep(1000)

      if (photoIdx < PHOTO_COUNT - 1) {
        // Brief pause between photos
        await firebaseRoom.updateSessionState(roomId, 'countdown')
        await sleep(BETWEEN_PHOTO_DELAY)
      }
    }

    // All done
    await firebaseRoom.updateSessionState(roomId, 'preview')
  }, [roomId, role, firebaseRoom])

  /** Save photo dataUrl into Firebase */
  const capturePhoto = useCallback(async (dataUrl: string) => {
    if (!dataUrl || !session) return
    if (isCapturing) return

    setIsCapturing(true)
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 500)

    try {
      const photoId = `photo_${Date.now()}_${currentUserId.current}`
      const photo: CapturedPhoto = {
        id: photoId,
        dataUrl,
        capturedAt: Date.now(),
        capturedBy: currentUserId.current,
      }

      await firebaseRoom.addPhoto(roomId, photo)
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture photo')
    } finally {
      setIsCapturing(false)
    }
  }, [roomId, session, isCapturing, firebaseRoom])

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
