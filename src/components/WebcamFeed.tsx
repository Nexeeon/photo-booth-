import React, { useEffect, useRef, useCallback } from 'react'
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
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user')
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Get stream from Webcam component on mount
  const handleUserMedia = useCallback((stream: MediaStream) => {
    setHasPermission(true)
    onReady?.(stream)
  }, [onReady])

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false)
  }, [])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const isSplit = !!remoteStream

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-strong flex ring-1 ring-white/10">
      {/* Local Camera */}
      <div className={`relative h-full transition-all duration-500 overflow-hidden ${isSplit ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
        {hasPermission !== false && (
          <Webcam
            ref={webcamRef}
            audio={true} // Explicitly request audio for WebRTC, but we will mute local playback
            muted={true} // Never hear yourself
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={{
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode,
            }}
            mirrored={mirrored}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
          />
        )}
        
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-4">
            <VideoOff size={32} className="text-white/30" />
            <p className="text-white/50 text-center text-xs">Camera access denied.</p>
          </div>
        )}
        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-pink-400 animate-spin" />
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 px-2 py-1 glass rounded-md flex items-center justify-center z-10">
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md">You</span>
        </div>
      </div>

      {/* Remote Camera */}
      {isSplit && (
        <div className="relative w-1/2 h-full overflow-hidden bg-[#0A0612]">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
            style={{ transform: 'scaleX(-1)' }} 
          />
          {/* We do NOT mute remote stream, so we can hear them! */}
          <div className="absolute bottom-3 right-3 px-2 py-1 glass rounded-md flex items-center justify-center z-10">
             <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md">Friend</span>
          </div>
        </div>
      )}

      {/* Wait overlay */}
      {!isSplit && (
        <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse z-10 border border-white/10">
           <User size={12} className="text-white/50" />
           <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Waiting for friend...</span>
        </div>
      )}

      {/* Global Overlays */}
      {isCountdownActive && countdownCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <div
            key={countdownCount}
            className="countdown-number text-9xl font-black text-white drop-shadow-2xl"
            style={{ textShadow: '0 0 40px rgba(255,105,180,0.8)' }}
          >
            {countdownCount}
          </div>
        </div>
      )}

      {showFlash && (
        <div className="absolute inset-0 bg-white animate-ping opacity-75 pointer-events-none z-30" />
      )}

      {hasPermission && !isCountdownActive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 glass rounded-full px-3 py-1 z-10 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-white/90 tracking-wider drop-shadow-sm">LIVE</span>
        </div>
      )}

      {hasPermission && !isSplit && (
        <button
          onClick={toggleCamera}
          className="absolute top-3 left-[88px] glass p-1.5 rounded-full text-white/60 hover:text-white transition-colors z-10 border border-white/10"
        >
          <RotateCcw size={14} />
        </button>
      )}

      {/* Decorative brackets */}
      <div className="absolute inset-3 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-pink-400/60 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-pink-400/60 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-400/60 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-400/60 rounded-br-xl" />
      </div>
    </div>
  )
}
