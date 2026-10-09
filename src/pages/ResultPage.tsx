import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import { PhotoStrip } from '../components/PhotoStrip'
import { FrameSelector } from '../components/FrameSelector'
import { Logo } from '../components/Logo'
import { UsersOnline } from '../components/UsersOnline'
import type { RoomSession, RoomUser } from '../types'
import { PHOTO_COUNT } from '../utils/frames'
import { Home, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { getOrCreateUserId } from '../utils/helpers'

const ResultPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const firebaseRoom = useFirebaseRoom(roomId)

  const [session, setSession] = useState<RoomSession | null>(null)
  const [users, setUsers] = useState<RoomUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    const unsubRoom = firebaseRoom.subscribeToRoom(roomId, (data) => {
      setSession(data)
      setIsLoading(false)
    })
    const unsubUsers = firebaseRoom.subscribeToUsers(roomId, setUsers)

    return () => {
      unsubRoom()
      unsubUsers()
    }
  }, [roomId])

  const handleFrameChange = async (frameId: string) => {
    if (!roomId) return
    await firebaseRoom.updateFrame(roomId, frameId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-pink-400 animate-spin" />
          <p className="text-white/50">Loading your photos...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.photos || session.photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-strong rounded-3xl p-10 max-w-sm mx-4">
          <p className="text-white/50 mb-6">No photos found in this session.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Logo />
        <UsersOnline users={users} />
      </header>

      <main className="flex-1 px-4 py-10 max-w-7xl mx-auto w-full">
        {/* Hero text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-pink-400" />
            <span className="text-sm text-white/70">Your memories are ready!</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">Photo Strip Ready ✨</h1>
          <p className="text-white/40">Download your shared memories below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start max-w-5xl mx-auto">
          {/* Large photo grid */}
          <div>
            <div className="glass-strong rounded-3xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
                Individual Photos
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {session.photos.slice(0, PHOTO_COUNT).map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-video rounded-2xl overflow-hidden group">
                    <img
                      src={photo.dataUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-xs text-white/70 font-medium">Photo {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame selector for result page too */}
            <FrameSelector
              selectedFrameId={session.frameId}
              onSelect={handleFrameChange}
            />

            {/* New session button */}
            <div className="mt-6 flex gap-3">
              <Link to="/" className="btn-secondary flex items-center gap-2 flex-1 justify-center">
                <Home size={16} />
                Home
              </Link>
              <Link
                to={`/booth/${roomId}?role=host`}
                className="glass flex items-center gap-2 flex-1 justify-center px-6 py-3 rounded-2xl text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                <RefreshCw size={14} />
                Retake
              </Link>
            </div>
          </div>

          {/* Photo strip download */}
          <div>
            <div className="glass-strong rounded-3xl p-8 flex flex-col items-center">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6">
                Your Photo Strip
              </h2>
              {roomId && (
                <PhotoStrip
                  photos={session.photos.slice(0, PHOTO_COUNT)}
                  frameId={session.frameId}
                  roomId={roomId}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResultPage
