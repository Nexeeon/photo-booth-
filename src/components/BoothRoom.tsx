import React, { useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import { useRoomSession } from '../hooks/useRoomSession'
import { useWebRTC } from '../hooks/useWebRTC'
import { WebcamFeed } from './WebcamFeed'
import { UsersOnline } from './UsersOnline'
import { FrameSelector } from './FrameSelector'
import { PhotoStripPreview } from './PhotoStripPreview'
import { Logo } from './Logo'
import { PHOTO_COUNT } from '../utils/frames'
import type { UserRole } from '../types'
import { useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'

interface BoothRoomProps {
  roomId: string
  role: UserRole
}

export const BoothRoom: React.FC<BoothRoomProps> = ({ roomId, role }) => {
  const webcamRef = useRef<Webcam>(null)
  const navigate = useNavigate()
  const [copied, setCopied] = React.useState(false)
  const [showQR, setShowQR] = React.useState(false)
  const hasCapturedRef = useRef<Set<number>>(new Set())
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null)

  const { remoteStream } = useWebRTC(roomId, role, localStream)

  const {
    session,
    users,
    isLoading,
    startSession,
    capturePhoto,
    changeFrame,
    sessionState,
    countdownCount,
    showFlash,
  } = useRoomSession({ roomId, role })

  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/booth/${roomId}?role=guest` : ''
  const photoIndex = session?.countdown?.photoIndex ?? 0
  const onlineUsers = users.filter((u) => u.isOnline)

  // Trigger capture when state shifts to 'capturing' — avoid double triggers per photoIndex
  useEffect(() => {
    if (sessionState === 'capturing' && !hasCapturedRef.current.has(photoIndex)) {
      hasCapturedRef.current.add(photoIndex)
      void capturePhoto(webcamRef)
    }
  }, [sessionState, photoIndex, capturePhoto])

  // Redirect to results when done
  useEffect(() => {
    if (sessionState === 'preview' && session?.photos && session.photos.length >= PHOTO_COUNT) {
      navigate(`/result/${roomId}`)
    }
  }, [sessionState, session?.photos, navigate, roomId])

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const canStart = role === 'host' && onlineUsers.length >= 1 && sessionState === 'waiting'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-mono-retro">
        <div className="border-flat p-8 bg-charcoal max-w-sm w-full">
          <p className="text-sm uppercase tracking-widest text-white mb-2 animate-pulse">
            CONNECTING APPARATUS...
          </p>
          <p className="text-[10px] text-neutral-400 uppercase">
            CALIBRATING ROOM CHASSIS #{roomId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans-clean selection:bg-white selection:text-black">
      {/* Editorial Top Navigation */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-black">
        <Logo />
        <div className="flex items-center gap-4">
          <UsersOnline users={users} />
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="btn-flat-black text-xs !py-2 !px-3"
          >
            {showQR ? 'HIDE INVITE' : 'SHARE LINK'}
          </button>
        </div>
      </header>

      {/* QR / Invite Accordion */}
      {showQR && (
        <div className="border-b border-white bg-charcoal px-6 py-5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-white border-2 border-black shrink-0">
              <QRCode value={roomUrl} size={100} fgColor="#000000" bgColor="#FFFFFF" />
            </div>
            <div className="flex-1 font-mono-retro">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                SESSION TELETYPE CODE:
              </span>
              <p className="font-serif-classic text-3xl font-black text-white tracking-[0.2em] mb-2">
                {roomId}
              </p>
              <p className="text-[11px] text-neutral-300 break-all mb-3 border-l-2 border-white pl-2">
                {roomUrl}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-flat-white text-[10px] !py-1.5 !px-4"
              >
                {copied ? '[COPIED TO CLIPBOARD]' : 'COPY DIRECT URL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Console */}
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        {/* Module Header Strip */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-800 font-mono-retro text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white" />
            <span className="uppercase tracking-widest text-white">YOUR PHOTO BOOTH CONSOLE</span>
          </div>
          <span className="uppercase tracking-wider">ROOM: #{roomId}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: Camera Feed & Controller */}
          <div className="flex flex-col gap-6">
            <WebcamFeed
              webcamRef={webcamRef}
              remoteStream={remoteStream}
              showFlash={showFlash}
              countdownCount={countdownCount}
              isCountdownActive={sessionState === 'countdown' && session?.countdown?.isActive === true}
              onReady={(stream) => setLocalStream(stream)}
            />

            {/* Status Bar */}
            <div className="border-flat px-4 py-3 flex items-center justify-between bg-charcoal font-mono-retro text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 inline-block ${sessionState === 'capturing' ? 'bg-white animate-ping' : 'bg-neutral-300'}`} />
                <span className="uppercase tracking-wider font-bold text-white">
                  {getStatusLabel(sessionState, role)}
                </span>
              </div>
              <div className="text-neutral-400 uppercase text-[11px]">
                CAPTURES: {session?.photos?.length ?? 0} / {PHOTO_COUNT}
              </div>
            </div>

            {/* Frame Selector */}
            <FrameSelector
              selectedFrameId={session?.frameId ?? 'classic-white'}
              onSelect={changeFrame}
              disabled={sessionState !== 'waiting'}
            />

            {/* Host Shutter Trigger */}
            {role === 'host' && (
              <button
                type="button"
                onClick={startSession}
                disabled={!canStart}
                className="btn-flat-white !py-4 text-sm w-full tracking-[0.2em]"
              >
                {sessionState === 'waiting'
                  ? 'START PHOTO SESSION (EXPOSE 4 FRAMES)'
                  : 'SESSION RUNNING...'}
              </button>
            )}

            {role === 'guest' && sessionState === 'waiting' && (
              <div className="border border-neutral-800 p-4 bg-charcoal text-center font-mono-retro text-xs text-neutral-400 uppercase tracking-widest">
                [AWAITING HOST TO RELEASE SHUTTER]
              </div>
            )}
          </div>

          {/* Right: Strip Contact Sheet Preview */}
          <div className="flex flex-col gap-4">
            <PhotoStripPreview
              photos={session?.photos ?? []}
              totalSlots={PHOTO_COUNT}
              currentPhotoIndex={photoIndex}
              isCapturing={sessionState === 'capturing'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function getStatusLabel(state: string, role: UserRole): string {
  switch (state) {
    case 'waiting':
      return role === 'host' ? 'READY — TRIGGER SHUTTER' : 'WAITING FOR HOST'
    case 'countdown':
      return 'COUNTDOWN IN PROGRESS...'
    case 'capturing':
      return 'HOLD POSE — EXPOSING!'
    case 'preview':
      return 'DEVELOPING PHOTO STRIP...'
    case 'done':
      return 'SESSION COMPLETE'
    default:
      return state.toUpperCase()
  }
}
