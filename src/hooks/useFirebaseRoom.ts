import { useEffect, useRef, useCallback } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import type { RoomSession, RoomUser, CapturedPhoto, CountdownState } from '../types'
import { sleep } from '../utils/helpers'

export function useFirebaseRoom(roomId: string | undefined) {
  const listenersRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    listenersRef.current.forEach(unsub => unsub())
    listenersRef.current = []
  }, [])

  useEffect(() => {
    return cleanup
  }, [roomId, cleanup])

  const leaveRoom = useCallback(async (rid: string, userId: string): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    await setDoc(roomRef, { users: { [userId]: { isOnline: false } } }, { merge: true })
  }, [])

  const joinRoomAsUser = useCallback(async (rid: string, user: RoomUser): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    const now = Date.now()
    await setDoc(roomRef, {
      users: { [user.id]: { ...user, isOnline: true, joinedAt: now } }
    }, { merge: true })

    const handleUnload = () => { void leaveRoom(rid, user.id) }
    window.addEventListener('unload', handleUnload)
    listenersRef.current.push(() => window.removeEventListener('unload', handleUnload))
  }, [leaveRoom])

  const createRoom = useCallback(async (rid: string, hostUser: RoomUser): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    const existing = await getDoc(roomRef)
    if (existing.exists()) {
      // Room already exists; preserve state and update host presence
      await setDoc(roomRef, {
        users: { [hostUser.id]: { ...hostUser, isOnline: true } }
      }, { merge: true })
    } else {
      const now = Date.now()
      const sessionDoc = {
        id: rid,
        hostId: hostUser.id,
        state: 'waiting' as const,
        countdown: { isActive: false, count: 0, photoIndex: 0 },
        photos: {},
        frameId: 'classic-white',
        createdAt: now,
        selectedPhotoCount: 4,
        users: { [hostUser.id]: { ...hostUser, isOnline: true } }
      }
      await setDoc(roomRef, sessionDoc)
    }

    const handleUnload = () => { void leaveRoom(rid, hostUser.id) }
    window.addEventListener('unload', handleUnload)
    listenersRef.current.push(() => window.removeEventListener('unload', handleUnload))
  }, [leaveRoom])

  const joinRoom = useCallback(async (rid: string, user: RoomUser): Promise<boolean> => {
    const roomRef = doc(firestore, 'rooms', rid)
    let snapshot = await getDoc(roomRef)
    // Retry up to 3 seconds in case host is still creating the document
    if (!snapshot.exists()) {
      for (let i = 0; i < 3; i++) {
        await sleep(1000)
        snapshot = await getDoc(roomRef)
        if (snapshot.exists()) break
      }
    }
    if (!snapshot.exists()) return false
    
    await joinRoomAsUser(rid, user)
    return true
  }, [joinRoomAsUser])

  const updateSessionState = useCallback(async (rid: string, state: RoomSession['state']): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    await setDoc(roomRef, { state }, { merge: true })
  }, [])

  const updateCountdown = useCallback(async (rid: string, countdown: CountdownState): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    await setDoc(roomRef, { countdown }, { merge: true })
  }, [])

  const addPhoto = useCallback(async (rid: string, photo: CapturedPhoto): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    await setDoc(roomRef, { photos: { [photo.id]: photo } }, { merge: true })
  }, [])

  const updateFrame = useCallback(async (rid: string, frameId: string): Promise<void> => {
    const roomRef = doc(firestore, 'rooms', rid)
    await setDoc(roomRef, { frameId }, { merge: true })
  }, [])

  const subscribeToRoom = useCallback((
    rid: string,
    callback: (session: RoomSession | null) => void
  ): (() => void) => {
    const roomRef = doc(firestore, 'rooms', rid)
    const unsub = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const photosObj = (data.photos || {}) as Record<string, CapturedPhoto>
        const photos: CapturedPhoto[] = Object.values(photosObj)
          .sort((a, b) => a.capturedAt - b.capturedAt)
        const session: RoomSession = {
          id: data.id || rid,
          hostId: data.hostId || '',
          guestId: data.guestId,
          state: data.state || 'waiting',
          countdown: data.countdown || { isActive: false, count: 0, photoIndex: 0 },
          photos,
          frameId: data.frameId || 'classic-white',
          createdAt: data.createdAt || 0,
          selectedPhotoCount: data.selectedPhotoCount || 4,
        }
        callback(session)
      } else {
        callback(null)
      }
    })
    listenersRef.current.push(unsub)
    return unsub
  }, [])

  const subscribeToUsers = useCallback((
    rid: string,
    callback: (users: RoomUser[]) => void
  ): (() => void) => {
    const roomRef = doc(firestore, 'rooms', rid)
    const unsub = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const usersObj = (data.users || {}) as Record<string, RoomUser>
        const users: RoomUser[] = Object.values(usersObj)
        callback(users)
      } else {
        callback([])
      }
    })
    listenersRef.current.push(unsub)
    return unsub
  }, [])

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    updateSessionState,
    updateCountdown,
    addPhoto,
    updateFrame,
    subscribeToRoom,
    subscribeToUsers,
    cleanup,
  }
}
