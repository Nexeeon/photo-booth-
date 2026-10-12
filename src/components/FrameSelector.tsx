import React from 'react'
import { FRAME_TEMPLATES } from '../utils/frames'
import type { FrameTemplate } from '../types'

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
    <div className="border-flat p-4 bg-black">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <h3 className="font-mono-retro text-xs font-bold uppercase tracking-widest text-neutral-300">
          SELECT CHASSIS FRAME
        </h3>
        <span className="font-mono-retro text-[10px] text-neutral-500 uppercase">
          [MONO TONAL CURVES]
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    type="button"
    onClick={() => !disabled && onSelect(frame.id)}
    disabled={disabled}
    className={`
      flex flex-col items-center gap-2 p-3 transition-colors duration-150 text-left
      ${isSelected ? 'bg-white text-black border-2 border-white' : 'bg-black text-white border border-neutral-700 hover:border-white'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <div
      className="w-full h-12 flex flex-col justify-between p-1.5"
      style={{
        backgroundColor: frame.bgColor,
        border: frame.borderStyle,
      }}
    >
      <div className="flex justify-between items-center text-[8px] font-mono font-bold" style={{ color: frame.textColor }}>
        <span>PY</span>
        <span>4X</span>
      </div>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2.5 h-3.5 border"
            style={{
              borderColor: frame.textColor,
              backgroundColor: frame.color === '#000000' ? '#000000' : '#FFFFFF',
            }}
          />
        ))}
      </div>
    </div>
    <span className="font-mono-retro text-[10px] font-bold tracking-wider text-center uppercase">
      {frame.label}
    </span>
  </button>
)
