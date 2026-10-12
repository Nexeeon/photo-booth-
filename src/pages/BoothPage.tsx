import React, { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { BoothRoom } from '../components/BoothRoom'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import { getOrCreateUserId, getOrCreateUserName } from '../utils/helpers'
import type { UserRole, RoomUser } from '../types'

const BoothPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const firebaseRoom = useFirebaseRoom(roomId)
  const role: UserRole = (searchParams.get('role') as UserRole) || 'guest'
  const initialized = useRef(false)

  useEffect(() => {
    if (!roomId || initialized.current) return
    initialized.current = true

    const user: RoomUser = {
      id: getOrCreateUserId(),
      role,
      name: getOrCreateUserName(),
      joinedAt: Date.now(),
      isOnline: true,
    }

    if (role === 'guest') {
      firebaseRoom.joinRoom(roomId, user)
        .then((success) => {
          if (!success) {
            alert('Room not found! Pastikan Host telah berada di dalam room dan memberikan kode/link yang benar.')
            navigate('/')
          }
        })
        .catch((err: unknown) => {
          console.error('Failed to join room:', err)
          alert('Gagal bergabung ke Firebase. Periksa Security Rules Firestore atau konfigurasi API Key.')
          navigate('/')
        })
    }
  }, [roomId, role, firebaseRoom, navigate])

  if (!roomId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <p className="font-mono-retro text-xs text-neutral-500 uppercase tracking-widest">
          [INVALID SESSION IDENTIFIER]
        </p>
      </div>
    )
  }

  return <BoothRoom roomId={roomId} role={role} />
}

export default BoothPage
