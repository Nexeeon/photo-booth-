import React from 'react'
import type { CapturedPhoto } from '../types'

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
    <div className="border-flat p-4 bg-black">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <h3 className="font-mono-retro text-xs font-bold text-neutral-300 uppercase tracking-widest">
          STRIP EXPOSURES
        </h3>
        <span className="font-mono-retro text-[10px] text-neutral-500">
          {photos.length} / {totalSlots}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const photo = photos[idx]
          const isCurrent = idx === currentPhotoIndex && isCapturing
          const isCaptured = !!photo

          return (
            <div
              key={idx}
              className={`
                relative aspect-video overflow-hidden transition-colors
                ${isCurrent ? 'border-2 border-white bg-charcoal' : 'border border-neutral-800'}
                ${!isCaptured && !isCurrent ? 'bg-black border-dashed border-neutral-800' : ''}
              `}
            >
              {photo ? (
                <img
                  src={photo.dataUrl}
                  alt={`Exposure ${idx + 1}`}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                  {isCurrent ? (
                    <span className="font-mono-retro text-xs font-bold text-white uppercase tracking-widest animate-pulse">
                      EXPOSING #{idx + 1}...
                    </span>
                  ) : (
                    <span className="font-mono-retro text-[10px] text-neutral-600 uppercase tracking-wider">
                      FRAME 0{idx + 1} // BLANK
                    </span>
                  )}
                </div>
              )}

              {/* Frame index stamp */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/90 border border-neutral-700 text-white font-mono-retro text-[9px] uppercase tracking-widest">
                0{idx + 1}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
