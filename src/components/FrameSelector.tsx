import React from 'react'
import { FRAME_TEMPLATES } from '../utils/frames'
import type { FrameTemplate, PhotoLayout } from '../types'
import { Check, LayoutGrid, Rows, Layers } from 'lucide-react'

interface FrameSelectorProps {
  selectedFrameId: string
  selectedLayout?: PhotoLayout
  onSelectFrame: (frameId: string) => void
  onSelectLayout?: (layoutId: PhotoLayout) => void
  disabled?: boolean
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrameId,
  selectedLayout = 'strip-4',
  onSelectFrame,
  onSelectLayout,
  disabled = false,
}) => {
  return (
    <div className="card-glass flex flex-col gap-4">
      {/* Layout Selection */}
      {onSelectLayout && (
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <LayoutGrid size={13} className="text-pink-400" />
            Choose Layout
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <LayoutOption
              id="strip-4"
              label="4-Strip Classic"
              icon={<Rows size={16} />}
              isSelected={selectedLayout === 'strip-4'}
              onSelect={onSelectLayout}
              disabled={disabled}
            />
            <LayoutOption
              id="grid-2x2"
              label="2x2 Photocard"
              icon={<LayoutGrid size={16} />}
              isSelected={selectedLayout === 'grid-2x2'}
              onSelect={onSelectLayout}
              disabled={disabled}
            />
            <LayoutOption
              id="strip-3"
              label="3-Strip Mini"
              icon={<Layers size={16} />}
              isSelected={selectedLayout === 'strip-3'}
              onSelect={onSelectLayout}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Frame Selection */}
      <div>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
          Choose Frame Color
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
          {FRAME_TEMPLATES.map((frame) => (
            <FrameButton
              key={frame.id}
              frame={frame}
              isSelected={selectedFrameId === frame.id}
              onSelect={onSelectFrame}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface LayoutOptionProps {
  id: PhotoLayout
  label: string
  icon: React.ReactNode
  isSelected: boolean
  onSelect: (id: PhotoLayout) => void
  disabled: boolean
}

const LayoutOption: React.FC<LayoutOptionProps> = ({ id, label, icon, isSelected, onSelect, disabled }) => (
  <button
    onClick={() => !disabled && onSelect(id)}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium
      transition-all duration-300
      ${isSelected 
        ? 'bg-pink-500/20 border-pink-400 text-white shadow-lg shadow-pink-500/10' 
        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
)

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
      relative flex flex-col items-center gap-1.5 p-1.5 rounded-xl
      transition-all duration-300 group
      ${isSelected ? 'ring-2 ring-white/50 scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'}
      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    `}
    title={frame.label}
  >
    <div
      className="w-9 h-12 rounded-lg relative overflow-hidden shrink-0"
      style={{ background: frame.bgColor, border: frame.borderStyle }}
    >
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
    <span className="text-[9px] font-medium text-white/70 text-center leading-none truncate w-full">
      {frame.label}
    </span>
  </button>
)
