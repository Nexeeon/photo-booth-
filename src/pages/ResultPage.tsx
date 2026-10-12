import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import { PhotoStrip } from '../components/PhotoStrip'
import { FrameSelector } from '../components/FrameSelector'
import { Logo } from '../components/Logo'
import { UsersOnline } from '../components/UsersOnline'
import type { RoomSession, RoomUser } from '../types'
import { PHOTO_COUNT } from '../utils/frames'
import { Home, Loader2, RefreshCw } from 'lucide-react'

const ResultPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
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
  }, [roomId, firebaseRoom])

  const handleFrameChange = async (frameId: string) => {
    if (!roomId) return
    await firebaseRoom.updateFrame(roomId, frameId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-editorial-sans">
        <div className="flex flex-col items-center gap-4 border border-black p-10 bg-white">
          <Loader2 size={32} className="text-black animate-spin" />
          <p className="font-editorial-mono text-xs uppercase tracking-widest text-neutral-600">
            Developing your prints...
          </p>
        </div>
      </div>
    )
  }

  if (!session || !session.photos || session.photos.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 font-editorial-sans">
        <div className="text-center border border-black p-10 max-w-sm w-full">
          <h2 className="font-editorial-serif text-2xl font-bold uppercase mb-2">No Photos Found</h2>
          <p className="text-xs font-editorial-sans text-neutral-600 mb-6">
            No capture session was recorded for this room.
          </p>
          <Link to="/" className="btn-noir-primary inline-flex items-center gap-2">
            <Home size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-editorial-sans">
      {/* Header */}
      <header className="border-b border-black px-6 py-4 flex items-center justify-between bg-white">
        <Logo />
        <UsersOnline users={users} />
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-10 pb-6 border-b border-black">
          <span className="font-editorial-mono text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-2">
            ARCHIVAL CONTACT SHEET // SESSION NO. {roomId}
          </span>
          <h1 className="font-editorial-serif text-4xl sm:text-5xl font-black uppercase tracking-tight text-black mb-3">
            Your Photo Strip Is Ready
          </h1>
          <p className="font-editorial-sans text-sm text-neutral-600 max-w-lg mx-auto">
            High-contrast silver gelatin tone proofs ready for digital archival or physical print download.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start max-w-5xl mx-auto">
          {/* Large photo grid */}
          <div>
            <div className="border border-black p-6 mb-6 bg-white">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black text-xs font-editorial-mono text-neutral-500 uppercase">
                <span>INDIVIDUAL CAPTURES</span>
                <span>{session.photos.length} FRAMES</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {session.photos.slice(0, PHOTO_COUNT).map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-[4/3] border border-black overflow-hidden bg-neutral-100 group">
                    <img
                      src={photo.dataUrl}
                      alt={`Frame ${idx + 1}`}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                    <div className="absolute bottom-2 left-2 bg-black text-white text-[9px] font-editorial-mono px-2 py-0.5 uppercase tracking-widest">
                      FRAME 0{idx + 1}
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

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/" className="btn-noir-secondary flex items-center justify-center gap-2 flex-1">
                <Home size={14} />
                Return to Home
              </Link>
              <Link
                to={`/booth/${roomId}?role=host`}
                className="btn-noir-primary flex items-center justify-center gap-2 flex-1"
              >
                <RefreshCw size={14} />
                Retake Session
              </Link>
            </div>
          </div>

          {/* Photo strip download */}
          <div>
            <div className="border border-black p-6 bg-white flex flex-col items-center">
              <span className="font-editorial-mono text-xs uppercase tracking-widest text-neutral-500 mb-6 block text-center">
                ARCHIVAL PRINT PREVIEW
              </span>
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
