import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import { PhotoStrip } from '../components/PhotoStrip'
import { FrameSelector } from '../components/FrameSelector'
import { Logo } from '../components/Logo'
import { UsersOnline } from '../components/UsersOnline'
import type { RoomSession, RoomUser } from '../types'
import { PHOTO_COUNT } from '../utils/frames'

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
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-mono-retro">
        <div className="border-flat p-8 bg-charcoal max-w-sm w-full">
          <p className="text-sm uppercase tracking-widest text-white mb-2 animate-pulse">
            DEVELOPING ARCHIVAL NEGATIVES...
          </p>
          <p className="text-[10px] text-neutral-400 uppercase">
            PROCESSING ROOM #{roomId}
          </p>
        </div>
      </div>
    )
  }

  if (!session || !session.photos || session.photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono-retro">
        <div className="text-center border-flat bg-charcoal p-8 max-w-md w-full">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-6">
            NO NEGATIVE EXPOSURES RECORDED IN THIS SESSION.
          </p>
          <Link to="/" className="btn-flat-white inline-block">
            RETURN TO ARCHIVE HOME
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans-clean selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-black">
        <Logo />
        <UsersOnline users={users} />
      </header>

      <main className="flex-1 px-4 py-12 max-w-7xl mx-auto w-full">
        {/* Title Bar */}
        <div className="text-center mb-12 border-b border-neutral-800 pb-8">
          <span className="font-mono-retro text-xs tracking-[0.3em] uppercase text-neutral-400 block mb-2">
            PROCESSED PROOFS // 4-FRAME CONTACT SHEET
          </span>
          <h1 className="font-serif-classic text-4xl sm:text-5xl font-black tracking-wider uppercase mb-3">
            YOUR PHOTO STRIP IS READY
          </h1>
          <p className="font-mono-retro text-xs text-neutral-400 uppercase tracking-widest">
            TWO PLACES. ONE PHOTO STRIP. READY FOR EXPORT.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start max-w-5xl mx-auto">
          {/* Individual Exposures Gallery */}
          <div className="space-y-6">
            <div className="border-flat p-6 bg-charcoal">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-700 font-mono-retro text-xs">
                <span className="font-bold uppercase tracking-widest text-neutral-300">
                  INDIVIDUAL 35MM EXPOSURES
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">
                  MONOCHROME TONAL CURVES
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {session.photos.slice(0, PHOTO_COUNT).map((photo, idx) => (
                  <div key={photo.id} className="relative aspect-video border border-neutral-700 overflow-hidden bg-black group">
                    <img
                      src={photo.dataUrl}
                      alt={`Exposure ${idx + 1}`}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 left-1 bg-black px-1.5 py-0.5 border border-white text-white font-mono-retro text-[8px] uppercase tracking-widest">
                      EXP 0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame Selector */}
            <FrameSelector
              selectedFrameId={session.frameId}
              onSelect={handleFrameChange}
            />

            {/* Navigation Actions */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link to="/" className="btn-flat-black text-center !py-3">
                ← HOME
              </Link>
              <Link
                to={`/booth/${roomId}?role=host`}
                className="btn-flat-white text-center !py-3"
              >
                RETAKE SESSION →
              </Link>
            </div>
          </div>

          {/* Right Column: Physical Strip Render */}
          <div className="border-flat p-6 bg-charcoal flex flex-col items-center">
            <div className="w-full pb-3 mb-6 border-b border-neutral-700 text-center font-mono-retro">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 block">
                ARCHIVAL PRINT MOCKUP
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                VINTAGE 2D PAPER EDITION
              </span>
            </div>
            {roomId && (
              <PhotoStrip
                photos={session.photos.slice(0, PHOTO_COUNT)}
                frameId={session.frameId}
                roomId={roomId}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResultPage
