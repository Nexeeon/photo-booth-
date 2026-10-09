import React, { useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, VideoOff, RotateCcw } from 'lucide-react'

interface WebcamFeedProps {
  webcamRef: React.RefObject<Webcam | null>
  showFlash: boolean
  isCapturing: boolean
  countdownCount: number
  isCountdownActive: boolean
  onReady?: () => void
  mirrored?: boolean
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  webcamRef,
  showFlash,
  isCapturing,
  countdownCount,
  isCountdownActive,
  onReady,
  mirrored = true,
}) => {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user')

  const handleUserMedia = useCallback(() => {
    setHasPermission(true)
    onReady?.()
  }, [onReady])

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false)
  }, [])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-strong">
      {/* Webcam */}
      {hasPermission !== false && (
        <Webcam
          ref={webcamRef}
          audio={false}
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

      {/* No permission state */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
          <VideoOff size={48} className="text-white/30" />
          <p className="text-white/50 text-center text-sm px-6">
            Camera access denied.<br />
            Please allow camera permissions in your browser.
          </p>
        </div>
      )}

      {/* Loading state */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
          <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-pink-400 animate-spin" />
          <p className="text-white/50 text-sm">Starting camera...</p>
        </div>
      )}

      {/* Countdown overlay */}
      {isCountdownActive && countdownCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div
            key={countdownCount}
            className="countdown-number text-9xl font-black text-white drop-shadow-2xl"
            style={{ textShadow: '0 0 40px rgba(255,105,180,0.8)' }}
          >
            {countdownCount}
          </div>
        </div>
      )}

      {/* Capturing flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white animate-ping opacity-75 pointer-events-none" />
      )}

      {/* Live indicator */}
      {hasPermission && !isCountdownActive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 glass rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-white/80 tracking-wider">LIVE</span>
        </div>
      )}

      {/* Camera toggle button */}
      {hasPermission && (
        <button
          onClick={toggleCamera}
          className="absolute top-3 right-3 glass p-2 rounded-full text-white/60 hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      )}

      {/* Decorative corner brackets */}
      <div className="absolute inset-3 pointer-events-none">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-pink-400/60 rounded-tl-md" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-pink-400/60 rounded-tr-md" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-400/60 rounded-bl-md" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-400/60 rounded-br-md" />
      </div>
    </div>
  )
}
