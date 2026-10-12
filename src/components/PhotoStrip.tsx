import React, { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { FRAME_TEMPLATES } from '../utils/frames'
import { formatPhotoDate } from '../utils/helpers'
import type { CapturedPhoto } from '../types'

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
        backgroundColor: null,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `photo-yuk-${roomId}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const isLightFrame = frame.bgColor === '#FFFFFF' || frame.bgColor === '#F4F4F4'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 2D Flat Vintage Paper Strip Target */}
      <div
        ref={stripRef}
        className="relative flex flex-col items-center"
        style={{
          backgroundColor: frame.bgColor,
          color: frame.textColor,
          width: '240px',
          padding: '24px 16px 20px',
          border: isLightFrame ? '2px solid #000000' : '2px solid #FFFFFF',
        }}
      >
        {/* Header Branding Inscription */}
        <div className="w-full text-center pb-3 mb-3 border-b" style={{ borderColor: isLightFrame ? '#000000' : '#333333' }}>
          <p className="font-serif-classic font-bold text-sm tracking-[0.25em] uppercase">
            PHOTO YUK
          </p>
          <p className="font-mono-retro text-[8px] tracking-[0.2em] uppercase opacity-75 mt-0.5">
            TWO PLACES • ONE STRIP
          </p>
        </div>

        {/* 4 Multi-frame Exposures */}
        <div className="w-full flex flex-col gap-2.5">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative overflow-hidden"
              style={{
                border: isLightFrame ? '1px solid #000000' : '1px solid #444444',
                aspectRatio: '4/3',
              }}
            >
              <img
                src={photo.dataUrl}
                alt={`Frame ${idx + 1}`}
                className="w-full h-full object-cover grayscale contrast-125"
                crossOrigin="anonymous"
              />
              <div
                className="absolute bottom-1 right-1 px-1 py-0.2 font-mono-retro text-[8px] uppercase tracking-wider"
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                }}
              >
                0{idx + 1}A
              </div>
            </div>
          ))}
        </div>

        {/* Footer Editorial Metadata */}
        <div className="w-full mt-4 pt-3 border-t text-center" style={{ borderColor: isLightFrame ? '#000000' : '#333333' }}>
          <p className="font-mono-retro text-[8px] tracking-[0.18em] uppercase font-bold">
            ROOM ID: #{roomId}
          </p>
          <p className="font-mono-retro text-[7px] tracking-[0.15em] uppercase opacity-70 mt-0.5">
            {formatPhotoDate()} • ARCHIVE NOIR
          </p>
        </div>
      </div>

      {/* Flat Download Action */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!isReady || isDownloading}
        className="btn-flat-white w-full max-w-[240px] text-center"
      >
        {isDownloading ? 'EXPORTING STRIP...' : 'DOWNLOAD PHOTO STRIP'}
      </button>
    </div>
  )
}
