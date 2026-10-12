import React, { useEffect, useRef, useState, useCallback } from 'react'
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
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const hasCapturedRef = useRef<Set<number>>(new Set())
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

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

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const roomUrl = origin ? `${origin}/booth/${roomId}?role=guest` : ''
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
    if (!roomUrl) return
    void navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStreamReady = useCallback((stream: MediaStream) => {
    setLocalStream(stream)
  }, [])

  const canStart = role === 'host' && onlineUsers.length >= 1 && sessionState === 'waiting'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-editorial-sans">
        <div className="flex flex-col items-center gap-4 border border-black p-10 bg-white">
          <Loader2 size={32} className="text-black animate-spin" />
          <p className="font-editorial-mono text-xs uppercase tracking-widest text-neutral-600">
            Connecting to Booth Room...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-editorial-sans">
      {/* Header */}
      <header className="border-b border-black px-6 py-4 flex items-center justify-between bg-white">
        <Logo />
        <div className="flex items-center gap-4">
          <UsersOnline users={users} />
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-noir-secondary !py-2 !px-4 text-xs flex items-center gap-2"
          >
            <Share2 size={13} />
            <span>Invite</span>
          </button>
        </div>
      </header>

      {/* QR / Invite panel */}
      {showQR && (
        <div className="border-b border-black bg-neutral-50 px-6 py-6">
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-6 border border-black p-6 bg-white">
            <div className="shrink-0 bg-white p-2 border border-black">
              {roomUrl && <QRCode value={roomUrl} size={100} />}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                SESSION CODE
              </span>
              <div className="font-editorial-serif text-3xl font-black tracking-widest text-black mb-2">
                {roomId}
              </div>
              <p className="font-editorial-mono text-[11px] text-neutral-600 mb-4 break-all">
                {roomUrl}
              </p>
              <button
                onClick={handleCopyLink}
                className="btn-noir-primary !py-2 !px-4 text-xs inline-flex items-center gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy Invitation Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 h-full">
          {/* Left: Camera */}
          <div className="flex flex-col gap-6">
            <WebcamFeed
              webcamRef={webcamRef}
              remoteStream={remoteStream}
              onReady={handleStreamReady}
              showFlash={showFlash}
              isCapturing={isCapturing}
              countdownCount={countdownCount}
              isCountdownActive={sessionState === 'countdown' && session?.countdown?.isActive === true}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between border border-black p-4 bg-white">
              <div className="flex items-center gap-3">
                <StatusDot state={sessionState} />
                <span className="font-editorial-mono text-xs uppercase tracking-wider text-black font-semibold">
                  {getStatusLabel(sessionState, role)}
                </span>
              </div>
              <div className="font-editorial-mono text-xs text-neutral-500 uppercase">
                CAPTURED: {session?.photos?.length ?? 0} / {PHOTO_COUNT}
              </div>
            </div>

            {/* Frame selector */}
            <FrameSelector
              selectedFrameId={session?.frameId ?? 'classic-white'}
              onSelect={changeFrame}
              disabled={sessionState !== 'waiting'}
            />

            {/* Start button (host only) */}
            {role === 'host' && (
              <button
                onClick={() => void startSession()}
                disabled={!canStart}
                className={`
                  btn-noir-primary flex items-center justify-center gap-3 text-sm py-4
                  ${!canStart ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                <Play size={16} fill="currentColor" />
                {sessionState === 'waiting' ? 'START PHOTO SESSION (4 SHOTS)' : 'SESSION RUNNING...'}
              </button>
            )}

            {role === 'guest' && sessionState === 'waiting' && (
              <div className="border border-black p-6 text-center bg-neutral-50">
                <p className="font-editorial-mono text-xs text-neutral-600 uppercase tracking-widest">
                  Waiting for the host to initiate the shutter sequence...
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
  const isPulse = state === 'countdown' || state === 'capturing'
  return (
    <span
      className={`w-2.5 h-2.5 border border-black inline-block ${
        state === 'waiting'
          ? 'bg-neutral-300'
          : state === 'countdown'
          ? 'bg-black animate-pulse'
          : state === 'capturing'
          ? 'bg-black animate-ping'
          : 'bg-black'
      } ${isPulse ? 'ring-2 ring-black/20' : ''}`}
    />
  )
}

function getStatusLabel(state: string, role: UserRole): string {
  switch (state) {
    case 'waiting':
      return role === 'host' ? 'READY — PRESS START TO SHOOT' : 'CONNECTED — AWAITING HOST TRIGGER'
    case 'countdown':
      return 'COUNTDOWN IN PROGRESS...'
    case 'capturing':
      return 'HOLD POSE — EXPOSING SHUTTER...'
    case 'preview':
      return 'WRAPPING UP SESSION...'
    case 'done':
      return 'DEVELOPING FINAL STRIP...'
    default:
      return state.toUpperCase()
  }
}

export default BoothRoom
