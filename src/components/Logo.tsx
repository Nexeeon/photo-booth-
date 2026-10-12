import React from 'react'
import { Link } from 'react-router-dom'

export const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-3 group">
    <div className="w-8 h-8 border-flat flex items-center justify-center bg-black group-hover:bg-white transition-colors duration-150">
      <div className="w-3.5 h-3.5 bg-white group-hover:bg-black transition-colors duration-150" />
    </div>
    <div className="flex flex-col">
      <span className="font-serif-classic font-bold text-lg tracking-[0.2em] leading-none text-white">
        PHOTO YUK
      </span>
      <span className="font-mono-retro text-[9px] tracking-[0.25em] text-neutral-400 mt-1 uppercase">
        EST. 2026 // MONO ARCHIVE
      </span>
    </div>
  </Link>
)
