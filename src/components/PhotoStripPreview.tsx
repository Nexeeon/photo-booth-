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
    <div className="card-glass">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">
        Photo Strip Preview
      </h3>
      <div className="flex flex-col gap-2">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const photo = photos[idx]
          const isCurrent = idx === currentPhotoIndex && isCapturing
          const isCaptured = !!photo

          return (
            <div
              key={idx}
              className={`
                relative aspect-video rounded-xl overflow-hidden
                transition-all duration-500
                ${isCurrent ? 'ring-2 ring-pink-400 scale-[1.02]' : ''}
                ${!isCaptured ? 'bg-white/5 border border-dashed border-white/10' : ''}
              `}
            >
              {photo ? (
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Camera size={16} className="text-white/20" />
                      <span className="text-[10px] text-white/20 font-medium">Photo {idx + 1}</span>
                    </>
                  )}
                </div>
              )}

              {/* Slot number badge */}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full glass flex items-center justify-center">
                <span className="text-[9px] font-bold text-white/70">{idx + 1}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
