import React, { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { BoothRoom } from '../components/BoothRoom'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import { getOrCreateUserId, getOrCreateUserName } from '../utils/helpers'
import type { UserRole, RoomUser } from '../types'
import { Loader2 } from 'lucide-react'

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

    // Guest needs to register their presence
    if (role === 'guest') {
      firebaseRoom.joinRoom(roomId, user).then(success => {
        if (!success) {
          alert('Room not found!')
          navigate('/')
        }
      })
    }
  }, [roomId, role])

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Invalid room ID</p>
      </div>
    )
  }

  return <BoothRoom roomId={roomId} role={role} />
}

export default BoothPage
