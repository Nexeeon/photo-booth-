import React from 'react'
import { Link } from 'react-router-dom'

export const Logo: React.FC = () => (
  <Link to="/" className="inline-flex items-center gap-3 group">
    <div className="w-8 h-8 border border-black flex items-center justify-center bg-black text-white group-hover:bg-white group-hover:text-black transition-colors duration-200">
      <span className="font-editorial-serif text-sm font-bold tracking-tighter">PY</span>
    </div>
    <div className="flex flex-col">
      <span className="font-editorial-serif font-black text-lg tracking-wider text-black leading-none uppercase">
        Photo Yuk
      </span>
      <span className="font-editorial-sans text-[8px] tracking-[0.25em] text-neutral-500 uppercase mt-0.5">
        Photomaton Atelier
      </span>
    </div>
  </Link>
)

export default Logo
