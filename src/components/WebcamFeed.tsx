import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import Webcam from 'react-webcam'
import { VideoOff, RotateCcw, User } from 'lucide-react'

export interface WebcamFeedHandle {
  captureCompositeCanvas: () => string | null
}

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

export const WebcamFeed = forwardRef<WebcamFeedHandle, WebcamFeedProps>(({
  webcamRef,
  remoteStream,
  showFlash,
  countdownCount,
  isCountdownActive,
  onReady,
  mirrored = true,
}, ref) => {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user')
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Function to draw local + remote video onto 1 single combined canvas
  const captureCompositeCanvas = useCallback((): string | null => {
    const localVideo = webcamRef.current?.video
    const remoteVideo = remoteVideoRef.current

    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    ctx.fillStyle = '#0A0612'
    ctx.fillRect(0, 0, 1280, 720)

    const isRemoteActive = remoteVideo && remoteVideo.readyState >= 2 && !remoteVideo.paused

    if (isRemoteActive && localVideo && localVideo.readyState >= 2) {
      // --- SPLIT SCREEN: LEFT = LOCAL, RIGHT = REMOTE ---

      // 1. Draw Local Video (Left 640x720)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, 640, 720)
      ctx.clip()

      // Mirror horizontally
      ctx.translate(640, 0)
      ctx.scale(-1, 1)

      // Object-cover crop logic for local video
      const vWidth = localVideo.videoWidth || 640
      const vHeight = localVideo.videoHeight || 720
      const scale = Math.max(640 / vWidth, 720 / vHeight)
      const sw = 640 / scale
      const sh = 720 / scale
      const sx = (vWidth - sw) / 2
      const sy = (vHeight - sh) / 2

      ctx.drawImage(localVideo, sx, sy, sw, sh, 0, 0, 640, 720)
      ctx.restore()

      // 2. Draw Remote Video (Right 640x720)
      ctx.save()
      ctx.beginPath()
      ctx.rect(640, 0, 640, 720)
      ctx.clip()

      ctx.translate(1920, 0)
      ctx.scale(-1, 1)

      const rvWidth = remoteVideo.videoWidth || 640
      const rvHeight = remoteVideo.videoHeight || 720
      const rScale = Math.max(640 / rvWidth, 720 / rvHeight)
      const rsw = 640 / rScale
      const rsh = 720 / rScale
      const rsx = (rvWidth - rsw) / 2
      const rsy = (rvHeight - rsh) / 2

      ctx.drawImage(remoteVideo, rsx, rsy, rsw, rsh, 640, 0, 640, 720)
      ctx.restore()

      // 3. Center divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(640, 0)
      ctx.lineTo(640, 720)
      ctx.stroke()

    } else if (localVideo && localVideo.readyState >= 2) {
      // --- SOLO CAMERA (FULL 1280x720) ---
      ctx.save()
      ctx.translate(1280, 0)
      ctx.scale(-1, 1)

      const vWidth = localVideo.videoWidth || 1280
      const vHeight = localVideo.videoHeight || 720
      const scale = Math.max(1280 / vWidth, 720 / vHeight)
      const sw = 1280 / scale
      const sh = 720 / scale
      const sx = (vWidth - sw) / 2
      const sy = (vHeight - sh) / 2

      ctx.drawImage(localVideo, sx, sy, sw, sh, 0, 0, 1280, 720)
      ctx.restore()
    } else {
      return null
    }

    return canvas.toDataURL('image/jpeg', 0.95)
  }, [webcamRef])

  useImperativeHandle(ref, () => ({
    captureCompositeCanvas,
  }))

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
          <div className="absolute bottom-3 right-3 px-2 py-1 glass rounded-md flex items-center justify-center z-10">
             <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md">Friend</span>
          </div>
        </div>
      )}

      {/* Waiting overlay */}
      {!isSplit && (
        <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse z-10 border border-white/10">
           <User size={12} className="text-white/50" />
           <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Waiting for friend...</span>
        </div>
      )}

      {/* Global Countdown Overlay */}
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
})
WebcamFeed.displayName = 'WebcamFeed'
