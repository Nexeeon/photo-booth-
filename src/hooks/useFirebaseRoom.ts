import { useEffect, useRef, useCallback, useState } from 'react'
import { ref, set, onValue, update, onDisconnect, get } from 'firebase/database'
import { database } from '../lib/firebase'
import type { RoomSession, RoomUser, CapturedPhoto, CountdownState } from '../types'

const isMock = 
  !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key' ||
  import.meta.env.VITE_FIREBASE_API_KEY?.includes('your_api_key');

// --- Local Storage Mock for Demo Mode ---
const MOCK_KEY = 'photobooth_rooms'

function getMockData() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveMockData(data: any) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('storage_mock'))
}

export function useFirebaseRoom(roomId: string | undefined) {
  if (isMock) {
    return useLocalMockRoom(roomId)
  }
  return useRealFirebaseRoom(roomId)
}

function useLocalMockRoom(roomId: string | undefined) {
  const listenersRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    listenersRef.current.forEach(unsub => unsub())
    listenersRef.current = []
  }, [])

  useEffect(() => {
    return cleanup
  }, [roomId, cleanup])

  const createRoom = async (rid: string, hostUser: RoomUser): Promise<void> => {
    const data = getMockData()
    data[rid] = {
      id: rid,
      hostId: hostUser.id,
      state: 'waiting',
      countdown: { isActive: false, count: 0, photoIndex: 0 },
      photos: {},
      frameId: 'classic-pink',
      createdAt: Date.now(),
      selectedPhotoCount: 4,
      users: { [hostUser.id]: { ...hostUser, isOnline: true } }
    }
    saveMockData(data)
  }

  const joinRoomAsUser = async (rid: string, user: RoomUser): Promise<void> => {
    const data = getMockData()
    if (!data[rid]) return
    if (!data[rid].users) data[rid].users = {}
    data[rid].users[user.id] = { ...user, isOnline: true, joinedAt: Date.now() }
    saveMockData(data)
    
    // onDisconnect mock essentially removes the user if the tab is closed
    const handleUnload = () => {
      const currentData = getMockData()
      if (currentData[rid]?.users?.[user.id]) {
        currentData[rid].users[user.id].isOnline = false
        saveMockData(currentData)
      }
    }
    window.addEventListener('unload', handleUnload)
    listenersRef.current.push(() => window.removeEventListener('unload', handleUnload))
  }

  const joinRoom = async (rid: string, user: RoomUser): Promise<boolean> => {
    const data = getMockData()
    if (!data[rid]) return false
    await joinRoomAsUser(rid, user)
    return true
  }

  const leaveRoom = async (rid: string, userId: string): Promise<void> => {
    const data = getMockData()
    if (data[rid]?.users?.[userId]) {
      data[rid].users[userId].isOnline = false
      saveMockData(data)
    }
  }

  const updateSessionState = async (rid: string, state: RoomSession['state']): Promise<void> => {
    const data = getMockData()
    if (data[rid]) {
      data[rid].state = state
      saveMockData(data)
    }
  }

  const updateCountdown = async (rid: string, countdown: CountdownState): Promise<void> => {
    const data = getMockData()
    if (data[rid]) {
      data[rid].countdown = countdown
      saveMockData(data)
    }
  }

  const addPhoto = async (rid: string, photo: CapturedPhoto): Promise<void> => {
    const data = getMockData()
    if (data[rid]) {
      if (!data[rid].photos) data[rid].photos = {}
      data[rid].photos[photo.id] = photo
      saveMockData(data)
    }
  }

  const updateFrame = async (rid: string, frameId: string): Promise<void> => {
    const data = getMockData()
    if (data[rid]) {
      data[rid].frameId = frameId
      saveMockData(data)
    }
  }

  const subscribeToRoom = (
    rid: string,
    callback: (session: RoomSession | null) => void
  ): (() => void) => {
    const handler = () => {
      const data = getMockData()
      const room = data[rid]
      if (room) {
        const photosObj = room.photos || {}
        const photos: CapturedPhoto[] = (Object.values(photosObj) as CapturedPhoto[])
          .sort((a, b) => a.capturedAt - b.capturedAt)
        callback({ ...room, photos } as RoomSession)
      } else {
        callback(null)
      }
    }
    
    window.addEventListener('storage', handler)
    window.addEventListener('storage_mock', handler) // Same-tab fallback
    handler() // initial load
    
    const unsub = () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('storage_mock', handler)
    }
    listenersRef.current.push(unsub)
    return unsub
  }

  const subscribeToUsers = (
    rid: string,
    callback: (users: RoomUser[]) => void
  ): (() => void) => {
    const handler = () => {
      const data = getMockData()
      const room = data[rid]
      if (room?.users) {
        callback(Object.values(room.users))
      } else {
        callback([])
      }
    }
    
    window.addEventListener('storage', handler)
    window.addEventListener('storage_mock', handler)
    handler()
    
    const unsub = () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('storage_mock', handler)
    }
    listenersRef.current.push(unsub)
    return unsub
  }

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

// --- Real Firebase Hook (Original) ---
function useRealFirebaseRoom(roomId: string | undefined) {
  const listenersRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    listenersRef.current.forEach(unsub => unsub())
    listenersRef.current = []
  }, [])

  useEffect(() => {
    return cleanup
  }, [roomId, cleanup])

  const createRoom = async (rid: string, hostUser: RoomUser): Promise<void> => {
    const roomRef = ref(database, `rooms/${rid}`)
    const session: RoomSession = {
      id: rid,
      hostId: hostUser.id,
      state: 'waiting',
      countdown: { isActive: false, count: 0, photoIndex: 0 },
      photos: [],
      frameId: 'classic-pink',
      createdAt: Date.now(),
      selectedPhotoCount: 4,
    }
    await set(roomRef, session)
    await joinRoomAsUser(rid, hostUser)
  }

  const joinRoom = async (rid: string, user: RoomUser): Promise<boolean> => {
    const roomRef = ref(database, `rooms/${rid}`)
    const snapshot = await get(roomRef)
    if (!snapshot.exists()) return false
    await joinRoomAsUser(rid, user)
    return true
  }

  const joinRoomAsUser = async (rid: string, user: RoomUser): Promise<void> => {
    const userRef = ref(database, `rooms/${rid}/users/${user.id}`)
    const userWithOnline: RoomUser = { ...user, isOnline: true, joinedAt: Date.now() }
    await set(userRef, userWithOnline)
    const disconnectRef = onDisconnect(userRef)
    await disconnectRef.update({ isOnline: false })
  }

  const leaveRoom = async (rid: string, userId: string): Promise<void> => {
    const userRef = ref(database, `rooms/${rid}/users/${userId}`)
    await update(userRef, { isOnline: false })
  }

  const updateSessionState = async (rid: string, state: RoomSession['state']): Promise<void> => {
    await update(ref(database, `rooms/${rid}`), { state })
  }

  const updateCountdown = async (rid: string, countdown: CountdownState): Promise<void> => {
    await update(ref(database, `rooms/${rid}`), { countdown })
  }

  const addPhoto = async (rid: string, photo: CapturedPhoto): Promise<void> => {
    const photosRef = ref(database, `rooms/${rid}/photos/${photo.id}`)
    await set(photosRef, photo)
  }

  const updateFrame = async (rid: string, frameId: string): Promise<void> => {
    await update(ref(database, `rooms/${rid}`), { frameId })
  }

  const subscribeToRoom = (
    rid: string,
    callback: (session: RoomSession | null) => void
  ): (() => void) => {
    const roomRef = ref(database, `rooms/${rid}`)
    const unsub = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const photosObj = data.photos || {}
        const photos: CapturedPhoto[] = (Object.values(photosObj) as CapturedPhoto[])
          .sort((a, b) => a.capturedAt - b.capturedAt)
        callback({ ...data, photos } as RoomSession)
      } else {
        callback(null)
      }
    })
    listenersRef.current.push(unsub)
    return unsub
  }

  const subscribeToUsers = (
    rid: string,
    callback: (users: RoomUser[]) => void
  ): (() => void) => {
    const usersRef = ref(database, `rooms/${rid}/users`)
    const unsub = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersObj = snapshot.val()
        const users: RoomUser[] = Object.values(usersObj)
        callback(users)
      } else {
        callback([])
      }
    })
    listenersRef.current.push(unsub)
    return unsub
  }

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
