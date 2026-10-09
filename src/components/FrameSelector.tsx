import React from 'react'
import { FRAME_TEMPLATES } from '../utils/frames'
import type { FrameTemplate } from '../types'
import { Check } from 'lucide-react'

interface FrameSelectorProps {
  selectedFrameId: string
  onSelect: (frameId: string) => void
  disabled?: boolean
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrameId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="card-glass">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">
        Choose Frame
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {FRAME_TEMPLATES.map((frame) => (
          <FrameButton
            key={frame.id}
            frame={frame}
            isSelected={selectedFrameId === frame.id}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

interface FrameButtonProps {
  frame: FrameTemplate
  isSelected: boolean
  onSelect: (id: string) => void
  disabled: boolean
}

const FrameButton: React.FC<FrameButtonProps> = ({ frame, isSelected, onSelect, disabled }) => (
  <button
    onClick={() => !disabled && onSelect(frame.id)}
    disabled={disabled}
    className={`
      relative flex flex-col items-center gap-1.5 p-2 rounded-xl
      transition-all duration-300 group
      ${isSelected ? 'ring-2 ring-white/40 scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'}
      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    `}
    title={frame.label}
  >
    {/* Color swatch */}
    <div
      className="w-10 h-14 rounded-lg relative overflow-hidden"
      style={{ background: frame.bgColor, border: frame.borderStyle }}
    >
      {/* Mini photo strip preview */}
      <div className="absolute inset-1 flex flex-col gap-0.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 rounded-sm bg-black/20" />
        ))}
      </div>
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Check size={14} className="text-white drop-shadow" />
        </div>
      )}
    </div>
    <span className="text-[10px] font-medium text-white/60 text-center leading-none">
      {frame.label}
    </span>
  </button>
)
