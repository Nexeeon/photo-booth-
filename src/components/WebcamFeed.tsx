import React, { useEffect, useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'
import { VideoOff, RotateCcw, User } from 'lucide-react'

interface WebcamFeedProps {
  webcamRef: React.RefObject<Webcam | null>
  remoteStream: MediaStream | null
  showFlash: boolean
  isCapturing: boolean
  countdownCount: number
  isCountdownActive: boolean
  onReady?: (stream: MediaStream) => void
  mirrored?: boolean
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  webcamRef,
  remoteStream,
  showFlash,
  isCapturing,
  countdownCount,
  isCountdownActive,
  onReady,
  mirrored = true,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleUserMedia = useCallback((stream: MediaStream) => {
    setHasPermission(true)
    onReady?.(stream)
  }, [onReady])

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false)
  }, [])

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const isSplit = Boolean(remoteStream)

  return (
    <div className="relative w-full aspect-video border border-black bg-neutral-100 flex overflow-hidden">
      {/* Local Camera */}
      <div
        className={`relative h-full transition-all duration-300 overflow-hidden ${
          isSplit ? 'w-1/2 border-r border-black' : 'w-full'
        }`}
      >
        {hasPermission !== false && (
          <Webcam
            ref={webcamRef}
            audio={true}
            muted={true}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={{
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode,
            }}
            mirrored={mirrored}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover filter contrast-110"
          />
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-200 p-4">
            <VideoOff size={28} className="text-black" />
            <p className="text-black text-center text-xs font-editorial-mono uppercase tracking-wider">
              Camera access denied
            </p>
          </div>
        )}

        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100">
            <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin" />
            <span className="font-editorial-mono text-[10px] text-neutral-600 uppercase tracking-widest mt-2">
              Initializing Optics...
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black text-white text-[9px] font-editorial-mono uppercase tracking-widest z-10">
          Your Half
        </div>
      </div>

      {/* Remote Camera */}
      {isSplit && (
        <div className="relative w-1/2 h-full overflow-hidden bg-neutral-200">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover filter contrast-110"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black text-white text-[9px] font-editorial-mono uppercase tracking-widest z-10">
            Partner&apos;s Half
          </div>
        </div>
      )}

      {/* Waiting for partner badge */}
      {!isSplit && (
        <div className="absolute top-3 right-3 bg-white border border-black px-3 py-1 flex items-center gap-2 z-10">
          <User size={12} className="text-black" />
          <span className="text-[10px] uppercase font-editorial-mono font-bold tracking-widest text-black">
            Waiting for partner
          </span>
        </div>
      )}

      {/* Countdown overlay */}
      {isCountdownActive && countdownCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] z-20">
          <div
            key={countdownCount}
            className="countdown-number font-editorial-serif text-9xl font-black text-black"
          >
            {countdownCount}
          </div>
        </div>
      )}

      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-white opacity-95 pointer-events-none z-30 transition-opacity duration-300" />
      )}

      {/* Exposing shutter indicator */}
      {isCapturing && !showFlash && (
        <div className="absolute inset-0 border-4 border-black pointer-events-none z-20 flex items-center justify-center">
          <span className="bg-black text-white font-editorial-mono text-xs px-3 py-1 uppercase tracking-widest">
            Exposing Shutter...
          </span>
        </div>
      )}

      {/* Live badge */}
      {hasPermission && !isCountdownActive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white border border-black px-2.5 py-0.5 z-10">
          <span className="w-1.5 h-1.5 bg-black" />
          <span className="text-[9px] font-bold font-editorial-mono tracking-widest text-black uppercase">
            LIVE FEED
          </span>
        </div>
      )}

      {/* Flip camera button */}
      {hasPermission && !isSplit && (
        <button
          onClick={toggleCamera}
          className="absolute top-3 left-28 bg-white border border-black p-1 hover:bg-black hover:text-white transition-colors z-10"
          title="Switch Camera"
        >
          <RotateCcw size={12} />
        </button>
      )}

      {/* Sharp 2D corner crop marks */}
      <div className="absolute inset-2 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-black" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-black" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-black" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-black" />
      </div>
    </div>
  )
}

export default WebcamFeed
