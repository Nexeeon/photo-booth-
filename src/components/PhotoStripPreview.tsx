import React from 'react'
import type { CapturedPhoto } from '../types'
import { Camera } from 'lucide-react'

interface PhotoStripPreviewProps {
  photos: CapturedPhoto[]
  totalSlots: number
  currentPhotoIndex: number
  isCapturing: boolean
}

export const PhotoStripPreview: React.FC<PhotoStripPreviewProps> = ({
  photos,
  totalSlots,
  currentPhotoIndex,
  isCapturing,
}) => {
  return (
    <div className="border border-black p-4 bg-white">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
        <h3 className="text-xs font-editorial-mono font-bold uppercase tracking-wider text-black">
          STRIP PREVIEW
        </h3>
        <span className="font-editorial-mono text-[10px] text-neutral-500">
          {photos.length}/{totalSlots}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const photo = photos[idx]
          const isCurrent = idx === currentPhotoIndex && isCapturing
          const isCaptured = Boolean(photo)

          return (
            <div
              key={idx}
              className={`
                relative aspect-[4/3] overflow-hidden border transition-all duration-200
                ${isCurrent ? 'border-2 border-black bg-neutral-100' : 'border border-black'}
                ${!isCaptured ? 'bg-neutral-50' : 'bg-white'}
              `}
            >
              {photo ? (
                <img
                  src={photo.dataUrl}
                  alt={`Capture ${idx + 1}`}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
                  {isCurrent ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Camera size={16} className="text-neutral-400" />
                      <span className="text-[9px] font-editorial-mono uppercase tracking-widest text-neutral-400">
                        FRAME 0{idx + 1}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Slot number badge */}
              <div className="absolute top-1 left-1 bg-black text-white px-1 py-0.2">
                <span className="text-[8px] font-editorial-mono font-bold leading-none">0{idx + 1}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PhotoStripPreview
