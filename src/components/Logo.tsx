import React from 'react'
import { Camera } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="relative">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FF69B4, #9333EA)' }}>
        <Camera size={18} className="text-white" />
      </div>
      <div className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, #FF69B4, #9333EA)', filter: 'blur(8px)', zIndex: -1 }} />
    </div>
    <span className="font-bold text-xl tracking-tight">
      <span className="gradient-text">Flash</span>
      <span className="text-white/80">Booth</span>
    </span>
  </Link>
)
