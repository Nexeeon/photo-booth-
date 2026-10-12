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
    <div className="border border-black p-4 bg-white">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
        <h3 className="text-xs font-editorial-mono font-bold uppercase tracking-wider text-black">
          SELECT FRAME PALETTE
        </h3>
        <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase">
          4 EDITIONS
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
      relative flex flex-col items-center gap-1.5 p-2 border transition-all text-left
      ${isSelected ? 'border-2 border-black bg-neutral-100 font-bold' : 'border-neutral-300 hover:border-black bg-white'}
      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    `}
    title={frame.label}
  >
    {/* Color swatch */}
    <div
      className="w-full h-10 border border-black relative overflow-hidden flex flex-col justify-between p-1"
      style={{ backgroundColor: frame.bgColor }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[7px] font-editorial-mono font-bold" style={{ color: frame.textColor }}>
          PY
        </span>
        {isSelected && <Check size={10} style={{ color: frame.textColor }} />}
      </div>
      <div className="h-0.5 w-full" style={{ backgroundColor: frame.textColor, opacity: 0.3 }} />
    </div>
    <span className="text-[9px] font-editorial-mono uppercase text-black tracking-tight text-center truncate w-full">
      {frame.label}
    </span>
  </button>
)

export default FrameSelector
