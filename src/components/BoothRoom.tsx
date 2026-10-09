import React, { useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import { useRoomSession } from '../hooks/useRoomSession'
import { useWebRTC } from '../hooks/useWebRTC'
import { WebcamFeed } from './WebcamFeed'
import { UsersOnline } from './UsersOnline'
import { FrameSelector } from './FrameSelector'
import { PhotoStripPreview } from './PhotoStripPreview'
import { Logo } from './Logo'
import { Play, Share2, Copy, Check, Loader2 } from 'lucide-react'
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
    isCapturing,
    showFlash,
  } = useRoomSession({ roomId, role })

  const roomUrl = `${window.location.origin}/booth/${roomId}?role=guest`
  const photoIndex = session?.countdown?.photoIndex ?? 0
  const onlineUsers = users.filter(u => u.isOnline)

  // Trigger capture when state shifts to 'capturing' — avoid double triggers per photoIndex
  useEffect(() => {
    if (sessionState === 'capturing' && !hasCapturedRef.current.has(photoIndex)) {
      hasCapturedRef.current.add(photoIndex)
      capturePhoto(webcamRef)
    }
  }, [sessionState, photoIndex, capturePhoto])

  // Redirect to results when done
  useEffect(() => {
    if (sessionState === 'preview' && session?.photos && session.photos.length >= PHOTO_COUNT) {
      navigate(`/result/${roomId}`)
    }
  }, [sessionState, session?.photos?.length, navigate, roomId])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canStart = role === 'host' && onlineUsers.length >= 1 && sessionState === 'waiting'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-pink-400 animate-spin" />
          <p className="text-white/50">Joining the booth...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <UsersOnline users={users} />
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-secondary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Share2 size={14} />
            <span>Invite</span>
          </button>
        </div>
      </header>

      {/* QR / Invite panel */}
      {showQR && (
        <div className="glass border-b border-white/5 px-6 py-4 slide-up">
          <div className="max-w-lg mx-auto flex items-center gap-6">
            <div className="shrink-0 bg-white p-3 rounded-xl">
              <QRCode value={roomUrl} size={96} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/50 mb-2">Room Code</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl font-black tracking-widest gradient-text">{roomId}</span>
              </div>
              <p className="text-xs text-white/40 mb-3 break-all">{roomUrl}</p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 h-full">
          {/* Left: Camera */}
          <div className="flex flex-col gap-4">
            <WebcamFeed
              webcamRef={webcamRef}
              remoteStream={remoteStream}
              onReady={(stream) => setLocalStream(stream)}
              showFlash={showFlash}
              isCapturing={isCapturing}
              countdownCount={countdownCount}
              isCountdownActive={sessionState === 'countdown' && session?.countdown?.isActive === true}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between glass rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2">
                <StatusDot state={sessionState} />
                <span className="text-sm text-white/70 font-medium capitalize">
                  {getStatusLabel(sessionState, role)}
                </span>
              </div>
              <div className="text-sm text-white/40">
                Photos: {session?.photos?.length ?? 0} / {PHOTO_COUNT}
              </div>
            </div>

            {/* Frame selector */}
            <FrameSelector
              selectedFrameId={session?.frameId ?? 'classic-pink'}
              onSelect={changeFrame}
              disabled={sessionState !== 'waiting'}
            />

            {/* Start button (host only) */}
            {role === 'host' && (
              <button
                onClick={startSession}
                disabled={!canStart}
                className={`
                  btn-primary flex items-center justify-center gap-3 text-lg
                  ${!canStart ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                <Play size={20} fill="currentColor" />
                {sessionState === 'waiting' ? 'Start Photo Session' : 'Session Running...'}
              </button>
            )}

            {role === 'guest' && sessionState === 'waiting' && (
              <div className="glass rounded-2xl px-6 py-4 text-center">
                <p className="text-white/50 text-sm">
                  Waiting for the host to start the session...
                </p>
              </div>
            )}
          </div>

          {/* Right: Photo strip preview */}
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

function StatusDot({ state }: { state: string }) {
  const colors: Record<string, string> = {
    waiting: 'bg-white/30',
    countdown: 'bg-amber-400 animate-pulse',
    capturing: 'bg-pink-400 animate-ping',
    preview: 'bg-emerald-400',
    done: 'bg-emerald-400',
  }
  return <span className={`w-2.5 h-2.5 rounded-full ${colors[state] ?? 'bg-white/30'}`} />
}

function getStatusLabel(state: string, role: UserRole): string {
  switch (state) {
    case 'waiting': return role === 'host' ? 'Ready — press Start!' : 'Waiting for host'
    case 'countdown': return 'Get ready...'
    case 'capturing': return '📸 Say cheese!'
    case 'preview': return 'Wrapping up...'
    case 'done': return 'All done!'
    default: return state
  }
}
