import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Camera, Users, Zap, ArrowRight, Hash, Sparkles, Heart } from 'lucide-react'
import { generateRoomId, getOrCreateUserId, getOrCreateUserName } from '../utils/helpers'
import { useFirebaseRoom } from '../hooks/useFirebaseRoom'
import type { RoomUser } from '../types'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const firebaseRoom = useFirebaseRoom(undefined)

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const newRoomId = generateRoomId()
      const hostUser: RoomUser = {
        id: getOrCreateUserId(),
        role: 'host',
        name: getOrCreateUserName(),
        joinedAt: Date.now(),
        isOnline: true,
      }
      await firebaseRoom.createRoom(newRoomId, hostUser)
      navigate(`/booth/${newRoomId}?role=host`)
    } catch (err: any) {
      console.error('Failed to create room:', err)
      alert(`Gagal membuat room. Error: ${err.message || err.toString()}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    const code = roomCode.trim().toUpperCase()
    if (!code || code.length !== 6) {
      setJoinError('Please enter a valid 6-character room code')
      return
    }
    setIsJoining(true)
    setJoinError('')
    try {
      const guestUser: RoomUser = {
        id: getOrCreateUserId(),
        role: 'guest',
        name: getOrCreateUserName(),
        joinedAt: Date.now(),
        isOnline: true,
      }
      const success = await firebaseRoom.joinRoom(code, guestUser)
      if (success) {
        navigate(`/booth/${code}?role=guest`)
      } else {
        setJoinError('Room not found. Check the code and try again.')
      }
    } catch (err: any) {
      console.error('Failed to join room:', err)
      const errorMsg = err.message || err.toString()
      setJoinError(`Failed to join room: ${errorMsg}`)
      alert(`Gagal Join: ${errorMsg}`)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 slide-up">
              <Sparkles size={14} className="text-pink-400" />
              <span className="text-sm text-white/70">Real-time Multiplayer Photobooth</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight slide-up"
              style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">Strike a Pose</span>
              <br />
              <span className="text-white">Together</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
              style={{ animationDelay: '0.2s' }}>
              Create a shared photo booth session with anyone, anywhere.
              Take synchronized photos, choose beautiful frames, and download
              your memories together — in real time.
            </p>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto slide-up"
              style={{ animationDelay: '0.3s' }}>

              {/* Create Room */}
              <div className="glass-strong rounded-3xl p-6 text-left group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#FF69B4,#9333EA)' }}>
                  <Camera size={22} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Create a Booth</h2>
                <p className="text-sm text-white/40 mb-5">
                  Start a new session and invite your friend with a shareable link or QR code.
                </p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      Create Room <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Join Room */}
              <div className="glass-strong rounded-3xl p-6 text-left group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>
                  <Users size={22} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Join a Booth</h2>
                <p className="text-sm text-white/40 mb-4">
                  Got a room code? Enter it below to join your friend's session instantly.
                </p>
                <div className="relative mb-3">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={roomCode}
                    onChange={e => {
                      setRoomCode(e.target.value.toUpperCase())
                      setJoinError('')
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                    maxLength={6}
                    className="input-glass !pl-10 !py-3 text-center tracking-[0.3em] font-bold uppercase text-sm"
                  />
                </div>
                {joinError && (
                  <p className="text-xs text-red-400 mb-2">{joinError}</p>
                )}
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode}
                  className="btn-secondary w-full flex items-center justify-center gap-2 !py-3 disabled:opacity-40"
                >
                  {isJoining ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      Join Session <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="px-4 py-20 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-center gradient-text mb-3">Why FlashBooth?</h2>
          <p className="text-center text-white/40 mb-12">Everything you need for the perfect virtual photo session</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-4 py-20 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-center gradient-text mb-3">How It Works</h2>
          <p className="text-center text-white/40 mb-14">Three simple steps to your perfect photo strip</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <StepCard key={i} step={i + 1} {...s} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-white/30 text-sm flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-pink-400 fill-pink-400" /> by FlashBooth
          </p>
        </footer>
      </main>
    </div>
  )
}

const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: 'Real-time Sync',
    desc: 'Both users see the countdown simultaneously. Every photo is synced instantly via Firebase.',
    color: '#FF69B4',
  },
  {
    icon: <Camera size={22} />,
    title: 'Beautiful Frames',
    desc: 'Choose from multiple premium frames and create a stunning vertical photo strip.',
    color: '#9333EA',
  },
  {
    icon: <Users size={22} />,
    title: 'Multiplayer Rooms',
    desc: 'Join via link, QR code, or room code. No account needed — just click and shoot.',
    color: '#F59E0B',
  },
]

const STEPS = [
  { emoji: '🎉', title: 'Create a Room', desc: 'Click "Create a Booth" to generate a unique room and get an invite link.' },
  { emoji: '📱', title: 'Share & Join', desc: 'Send the link or QR to your friend. They join in one click.' },
  { emoji: '📸', title: 'Shoot & Download', desc: 'Both cameras roll simultaneously. Download your shared photo strip!' },
]

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, color }) => (
  <div className="glass-strong rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300">
    <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white"
      style={{ background: `${color}30`, border: `1px solid ${color}40`, color }}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
  </div>
)

interface StepCardProps {
  step: number
  emoji: string
  title: string
  desc: string
}

const StepCard: React.FC<StepCardProps> = ({ step, emoji, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center text-3xl mb-4 relative">
      {emoji}
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#FF69B4,#9333EA)' }}>
        {step}
      </div>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-white/40 leading-relaxed max-w-xs">{desc}</p>
  </div>
)

export default HomePage
