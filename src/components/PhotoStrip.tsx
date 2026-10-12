import React, { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { FRAME_TEMPLATES } from '../utils/frames'
import { formatPhotoDate } from '../utils/helpers'
import type { CapturedPhoto } from '../types'
import { Download, Loader2 } from 'lucide-react'

interface PhotoStripProps {
  photos: CapturedPhoto[]
  frameId: string
  roomId: string
}

export const PhotoStrip: React.FC<PhotoStripProps> = ({ photos, frameId, roomId }) => {
  const stripRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const frame = FRAME_TEMPLATES.find((f) => f.id === frameId) || FRAME_TEMPLATES[0]

  useEffect(() => {
    // Pre-load all images
    const loadPromises = photos.map((p) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = p.dataUrl
      })
    })
    void Promise.all(loadPromises).then(() => setIsReady(true))
  }, [photos])

  const handleDownload = async () => {
    if (!stripRef.current || isDownloading) return
    setIsDownloading(true)

    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `photo-yuk-${roomId}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (err: unknown) {
      console.error('Download error:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Photo Strip Render Target */}
      <div
        ref={stripRef}
        className="relative border border-black bg-white"
        style={{
          backgroundColor: frame.bgColor,
          padding: '20px 16px',
          width: '260px',
        }}
      >
        {/* Top Header */}
        <div className="text-center mb-4 pb-2 border-b border-black/20">
          <p
            className="font-editorial-serif font-black text-sm tracking-widest uppercase"
            style={{ color: frame.textColor }}
          >
            Photo Yuk
          </p>
          <p
            className="font-editorial-sans text-[8px] tracking-[0.25em] uppercase opacity-60"
            style={{ color: frame.textColor }}
          >
            Two Places • One Strip
          </p>
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-2.5">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative overflow-hidden bg-neutral-200 border border-black"
              style={{
                aspectRatio: '4/3',
              }}
            >
              <img
                src={photo.dataUrl}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover grayscale contrast-125"
                crossOrigin="anonymous"
              />
              <span className="absolute bottom-1 right-1 font-editorial-mono text-[8px] bg-black text-white px-1 py-0.2">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-black/20 text-center">
          <p
            className="font-editorial-mono text-[9px] uppercase tracking-wider opacity-70"
            style={{ color: frame.textColor }}
          >
            {formatPhotoDate()}
          </p>
          <p
            className="font-editorial-mono text-[8px] tracking-widest uppercase mt-0.5 opacity-50"
            style={{ color: frame.textColor }}
          >
            ARCHIVE NO. {roomId}
          </p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={() => void handleDownload()}
        disabled={!isReady || isDownloading}
        className="btn-noir-primary w-full text-xs"
      >
        {isDownloading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            DEVELOPING ARCHIVAL FILE...
          </>
        ) : (
          <>
            <Download size={14} />
            DOWNLOAD PHOTO STRIP (PNG)
          </>
        )}
      </button>
    </div>
  )
}

export default PhotoStrip
