import React, { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { FRAME_TEMPLATES } from '../utils/frames'
import { formatPhotoDate } from '../utils/helpers'
import type { CapturedPhoto, PhotoLayout } from '../types'
import { Download, Loader2, Sparkles } from 'lucide-react'

interface PhotoStripProps {
  photos: CapturedPhoto[]
  frameId: string
  layoutId?: PhotoLayout
  roomId: string
}

export const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, frameId, layoutId = 'strip-4', roomId }) => {
  const stripRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const frame = FRAME_TEMPLATES.find(f => f.id === frameId) || FRAME_TEMPLATES[0]

  const displayPhotos = layoutId === 'strip-3' ? photos.slice(0, 3) : photos.slice(0, 4)

  useEffect(() => {
    const loadPromises = photos.map(p => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = p.dataUrl
      })
    })
    Promise.all(loadPromises).then(() => setIsReady(true))
  }, [photos])

  const handleDownload = async () => {
    if (!stripRef.current || isDownloading) return
    setIsDownloading(true)

    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `flashbooth-${roomId}-${layoutId}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Render Target */}
      <div
        ref={stripRef}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: frame.bgColor,
          padding: layoutId === 'grid-2x2' ? '18px 16px' : '16px 14px',
          width: layoutId === 'grid-2x2' ? '320px' : '250px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header Branding */}
        <div className="text-center mb-3">
          <p className="font-bold text-xs tracking-[0.25em] uppercase" style={{ color: frame.accentColor, opacity: 0.9 }}>
            ✦ FlashBooth ✦
          </p>
        </div>

        {/* Photos Layout Container */}
        {layoutId === 'grid-2x2' ? (
          <div className="grid grid-cols-2 gap-2">
            {displayPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-lg aspect-video shadow-sm"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl aspect-video shadow-sm"
                style={{
                  border: '3px solid rgba(255,255,255,0.25)',
                }}
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-3 text-center">
          <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: frame.textColor, opacity: 0.7 }}>
            {formatPhotoDate()} • #{roomId}
          </p>
          <Sparkles
            size={12}
            className="mx-auto mt-1"
            style={{ color: frame.accentColor, opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!isReady || isDownloading}
        className="btn-primary flex items-center gap-3 w-full justify-center !py-3"
      >
        {isDownloading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download size={18} />
            Download Strip
          </>
        )}
      </button>
    </div>
  )
}
