import React, { useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'

interface WebcamFeedProps {
  webcamRef: React.RefObject<Webcam | null>
  remoteStream: MediaStream | null
  showFlash: boolean
  countdownCount: number
  isCountdownActive: boolean
  onReady?: (stream: MediaStream) => void
  mirrored?: boolean
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  webcamRef,
  remoteStream,
  showFlash,
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
    <div className="relative w-full aspect-video border-flat bg-black overflow-hidden flex">
      {/* Local Feed */}
      <div className={`relative h-full overflow-hidden ${isSplit ? 'w-1/2 border-r border-neutral-700' : 'w-full'}`}>
        {hasPermission !== false && (
          <Webcam
            ref={webcamRef}
            audio={true}
            muted={true}
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
            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
          />
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-charcoal p-4 text-center">
            <span className="font-mono-retro text-xs text-white uppercase tracking-widest">
              [CAMERA ACCESS DENIED]
            </span>
            <p className="font-mono-retro text-[10px] text-neutral-400">
              PLEASE ENABLE CAMERA PERMISSIONS IN BROWSER
            </p>
          </div>
        )}

        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <span className="font-mono-retro text-xs text-white uppercase tracking-widest animate-pulse">
              INITIALIZING OPTICS...
            </span>
          </div>
        )}

        {/* Local Feed Label Stamp */}
        <div className="absolute bottom-2 left-2 bg-black px-2 py-0.5 border border-white text-white font-mono-retro text-[9px] uppercase tracking-widest z-10">
          FEED 01 // LOCAL
        </div>
      </div>

      {/* Remote Feed */}
      {isSplit && (
        <div className="relative w-1/2 h-full overflow-hidden bg-charcoal">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute bottom-2 right-2 bg-black px-2 py-0.5 border border-white text-white font-mono-retro text-[9px] uppercase tracking-widest z-10">
            FEED 02 // REMOTE GUEST
          </div>
        </div>
      )}

      {/* Waiting Indicator if solo */}
      {!isSplit && (
        <div className="absolute top-2 right-2 bg-black px-2.5 py-1 border border-neutral-700 text-neutral-400 font-mono-retro text-[9px] uppercase tracking-wider z-10">
          STATUS: WAITING FOR REMOTE GUEST
        </div>
      )}

      {/* Countdown Overlay */}
      {isCountdownActive && countdownCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <div
            key={countdownCount}
            className="font-serif-classic text-9xl font-black text-white tracking-widest border-4 border-white px-8 py-2 bg-black"
          >
            {countdownCount}
          </div>
        </div>
      )}

      {/* Hard Flash Overlay */}
      {showFlash && (
        <div className="flash-white" />
      )}

      {/* Status Live Tag */}
      {hasPermission && !isCountdownActive && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black px-2 py-0.5 border border-white text-white font-mono-retro text-[9px] uppercase tracking-widest z-10">
          <span className="w-1.5 h-1.5 bg-white inline-block animate-pulse" />
          <span>SHUTTER LIVE</span>
        </div>
      )}

      {/* Switch Camera if supported */}
      {hasPermission && !isSplit && (
        <button
          type="button"
          onClick={toggleCamera}
          className="absolute top-2 left-[120px] bg-black hover:bg-white hover:text-black transition-colors px-2 py-0.5 border border-neutral-600 text-[9px] font-mono-retro uppercase tracking-wider text-white z-10"
        >
          FLIP CAM
        </button>
      )}

      {/* Hard Crosshair Frame Crop Marks */}
      <div className="absolute inset-2 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />
      </div>
    </div>
  )
}
