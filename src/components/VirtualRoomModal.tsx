import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight, Video, Users } from 'lucide-react'
import { generateRoomId } from '../utils/helpers'

interface VirtualRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export const VirtualRoomModal: React.FC<VirtualRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId()
    onClose()
    navigate(`/booth/${newRoomId}?role=host`)
  }

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const cleanedCode = roomCode.trim().toUpperCase()
    if (!cleanedCode) {
      setError('Please enter a valid room code.')
      return
    }
    onClose()
    navigate(`/booth/${cleanedCode}?role=guest`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-editorial-sans">
      <div className="bg-white border border-black w-full max-w-lg p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border border-black hover:bg-black hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        <div className="border-b border-black pb-4 mb-6">
          <span className="font-editorial-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
            DIGITAL PROTOCOL // TWO PLACES. ONE PHOTO STRIP.
          </span>
          <h2 className="font-editorial-serif text-3xl font-black uppercase text-black">
            Sync Virtual Booth
          </h2>
          <p className="font-editorial-sans text-xs text-neutral-600 mt-1">
            Capture synchronized 4-frame strips with your partner in real time, no matter where they are in the world.
          </p>
        </div>

        <div className="space-y-6">
          {/* Create Room Option */}
          <div className="border border-black p-5 bg-neutral-50">
            <div className="flex items-center gap-2 mb-2">
              <Video size={16} className="text-black" />
              <h3 className="font-editorial-mono text-xs font-bold uppercase tracking-wider text-black">
                Host a New Photo Booth Session
              </h3>
            </div>
            <p className="font-editorial-sans text-xs text-neutral-600 mb-4">
              Create an exclusive session room and invite a friend with an instant code or link.
            </p>
            <button
              onClick={handleCreateRoom}
              className="btn-noir-primary w-full text-xs"
            >
              CREATE NEW ROOM & LAUNCH CAMERA
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Join Room Option */}
          <div className="border border-black p-5 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-black" />
              <h3 className="font-editorial-mono text-xs font-bold uppercase tracking-wider text-black">
                Join an Existing Room
              </h3>
            </div>
            <p className="font-editorial-sans text-xs text-neutral-600 mb-4">
              Enter the 6-character room code shared by your partner.
            </p>
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <div>
                <input
                  type="text"
                  maxLength={10}
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  placeholder="ENTER 6-DIGIT CODE (e.g. AB7K9X)"
                  className="w-full border border-black p-2.5 text-xs font-editorial-mono uppercase tracking-widest focus:outline-none"
                />
                {error && (
                  <p className="text-xs text-black font-editorial-mono mt-1 font-bold">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn-noir-secondary w-full text-xs"
              >
                JOIN PARTNER&apos;S ROOM
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualRoomModal
