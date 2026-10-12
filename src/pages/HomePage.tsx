import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
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
    } catch (err: unknown) {
      console.error('Failed to create room:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      alert(`Gagal membuat room. Error: ${errorMsg}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    const code = roomCode.trim().toUpperCase()
    if (!code || code.length !== 6) {
      setJoinError('PLEASE ENTER A VALID 6-CHARACTER TELETYPE CODE')
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
        setJoinError('ROOM CODE NOT FOUND. VERIFY CODE WITH YOUR HOST.')
      }
    } catch (err: unknown) {
      console.error('Failed to join room:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setJoinError(`FAILED TO JOIN: ${errorMsg}`)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans-clean selection:bg-white selection:text-black">
      {/* ================= TOP NAVIGATION ================= */}
      <header className="border-b border-white px-6 py-4 flex items-center justify-between bg-black sticky top-0 z-50">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 font-mono-retro text-xs tracking-[0.2em]">
          <a href="#home" className="text-white hover:underline underline-offset-4">
            HOME
          </a>
          <a href="#about" className="text-neutral-400 hover:text-white transition-colors">
            ABOUT
          </a>
          <a href="#gallery" className="text-neutral-400 hover:text-white transition-colors">
            GALLERY
          </a>
          <button
            type="button"
            onClick={handleCreateRoom}
            className="btn-flat-white !py-2 !px-4 text-[11px]"
          >
            BOOK NOW
          </button>
        </nav>
      </header>

      {/* ================= HERO & HEADLINE ================= */}
      <main id="home" className="flex-1 flex flex-col">
        {/* Editorial Sub-header Rule */}
        <section className="border-b border-neutral-800 bg-black py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono-retro text-neutral-400 tracking-[0.25em] uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white" />
              <span>PHOTO YUK MONOCHROME STUDIO // EDITION 2026</span>
            </div>
            <span>TWO DISTANT OPERATORS • SYNCHRONOUS SHUTTER</span>
            <span>PARALLEL 35MM FRAMES</span>
          </div>
        </section>

        {/* Main Headline Hero Banner */}
        <section className="border-b border-white bg-black py-16 sm:py-24 px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <span className="font-mono-retro text-xs tracking-[0.35em] text-neutral-400 uppercase block mb-6">
              THE VINTAGE 2D TELETYPE PHOTO APPARATUS
            </span>
            <h1 className="font-serif-classic text-6xl sm:text-8xl md:text-9xl font-black tracking-tight leading-[0.9] uppercase mb-8">
              PHOTO YUK
            </h1>
            <p className="font-serif-classic italic text-2xl sm:text-3xl md:text-4xl text-neutral-300 font-normal tracking-wide max-w-3xl mx-auto mb-10">
              Two places. One photo strip.
            </p>
            <div className="w-24 h-0.5 bg-white mx-auto mb-10" />
            <p className="font-mono-retro text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed tracking-wider uppercase">
              Capture shared moments across distances. Real-time split camera synchronization, instant peer exposure,
              and tactile monochrome photo strip printing.
            </p>
          </div>
        </section>

        {/* ================= CAPTURING GRID BLOCK: YOUR PHOTO BOOTH ================= */}
        <section className="border-b border-white bg-charcoal py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Block Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-12 border-b-2 border-white">
              <div>
                <span className="font-mono-retro text-[10px] tracking-[0.3em] uppercase text-neutral-400 block mb-2">
                  MODULE 01 // TELECOMMUNICATION & APPARATUS
                </span>
                <h2 className="font-serif-classic text-3xl sm:text-5xl font-bold tracking-tight uppercase">
                  YOUR PHOTO BOOTH
                </h2>
              </div>
              <p className="font-mono-retro text-xs text-neutral-400 uppercase tracking-widest mt-2 md:mt-0">
                [REAL-TIME CAMERA STATUS & DUAL TRIGGER]
              </p>
            </div>

            {/* Split Grid: Camera Action on Left, Vintage Strip on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side (Col 1-7): Camera Status & Flat Triggers */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Camera Status Card */}
                <div className="border-2 border-white bg-black p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800 font-mono-retro text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-white inline-block animate-pulse" />
                      <span className="font-bold uppercase tracking-widest text-white">OPTICS & PEER STATUS</span>
                    </div>
                    <span className="text-neutral-500 uppercase">SYS://READY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 font-mono-retro text-xs">
                    <div className="border border-neutral-700 p-4 bg-charcoal">
                      <span className="text-[10px] text-neutral-400 uppercase block mb-1">LOCAL OPERATOR</span>
                      <span className="text-sm font-bold text-white block">CAMERA STANDBY</span>
                      <span className="text-[9px] text-neutral-500 uppercase mt-2 block">1280 × 720 HD MONOCHROME</span>
                    </div>
                    <div className="border border-neutral-700 p-4 bg-charcoal">
                      <span className="text-[10px] text-neutral-400 uppercase block mb-1">REMOTE PEER</span>
                      <span className="text-sm font-bold text-white block">WEBRTC P2P TUNNEL</span>
                      <span className="text-[9px] text-neutral-500 uppercase mt-2 block">LATENCY &lt; 45MS SYNC</span>
                    </div>
                  </div>

                  <p className="font-mono-retro text-xs text-neutral-300 leading-relaxed uppercase tracking-wider mb-8">
                    INITIATE A SYNCHRONIZED SESSION. ONCE YOUR PARTNER CONNECTS, BOTH CAMERAS CAPTURE 4 EXPOSURES
                    SIMULTANEOUSLY INTO ONE COLLECTIVE STRIP.
                  </p>

                  {/* Dual Action Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Create Room Trigger */}
                    <button
                      type="button"
                      onClick={handleCreateRoom}
                      disabled={isCreating}
                      className="btn-flat-white !py-4 text-center text-xs tracking-[0.2em]"
                    >
                      {isCreating ? 'INITIALIZING BOOTH...' : 'CREATE NEW BOOTH →'}
                    </button>

                    {/* Join Room Box */}
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="ENTER 6-DIGIT CODE"
                          value={roomCode}
                          onChange={(e) => {
                            setRoomCode(e.target.value.toUpperCase())
                            setJoinError('')
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && void handleJoinRoom()}
                          maxLength={6}
                          className="input-flat flex-1 text-xs text-center !py-3 tracking-[0.2em] font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleJoinRoom}
                          disabled={isJoining || !roomCode}
                          className="btn-flat-black !py-3 !px-4 text-xs border-l-0"
                        >
                          {isJoining ? '...' : 'JOIN'}
                        </button>
                      </div>
                      {joinError && (
                        <span className="font-mono-retro text-[10px] text-white bg-charcoal border border-white p-1 text-center uppercase tracking-widest">
                          {joinError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specs Meter Box */}
                <div className="grid grid-cols-3 border border-neutral-800 bg-black text-center font-mono-retro py-4">
                  <div className="border-r border-neutral-800 px-2">
                    <span className="text-[9px] text-neutral-500 uppercase block mb-1">RESOLUTION</span>
                    <span className="text-xs font-bold text-white uppercase">300 DPI MATTE</span>
                  </div>
                  <div className="border-r border-neutral-800 px-2">
                    <span className="text-[9px] text-neutral-500 uppercase block mb-1">COLOR PALETTE</span>
                    <span className="text-xs font-bold text-white uppercase">#000000 / #FFFFFF</span>
                  </div>
                  <div className="px-2">
                    <span className="text-[9px] text-neutral-500 uppercase block mb-1">OUTPUT FORMAT</span>
                    <span className="text-xs font-bold text-white uppercase">2×6 INCH STRIP</span>
                  </div>
                </div>
              </div>

              {/* Right Side (Col 8-12): Vintage 2D Photo Strip Mockup */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="border-2 border-white bg-black p-6 w-full max-w-sm flex flex-col items-center">
                  <span className="font-mono-retro text-[10px] text-neutral-400 uppercase tracking-widest block mb-4 text-center">
                    ARCHIVAL SPECIMEN STRIP MOCKUP
                  </span>

                  {/* The Vintage 2D Paper Strip */}
                  <div className="w-[220px] bg-white text-black p-4 border-2 border-black flex flex-col items-center font-sans">
                    {/* Header */}
                    <div className="w-full text-center pb-2 mb-2 border-b border-black">
                      <p className="font-serif-classic font-bold text-xs tracking-[0.2em] uppercase">
                        PHOTO YUK
                      </p>
                      <p className="font-mono-retro text-[7px] tracking-widest uppercase opacity-75">
                        TWO PLACES • ONE STRIP
                      </p>
                    </div>

                    {/* 4 Multi-frame Photographic Mockups */}
                    <div className="w-full flex flex-col gap-2">
                      <div className="border border-black aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                        <img
                          src="/images/hero_booth.png"
                          alt="Vintage photo booth frame 01"
                          className="w-full h-full object-cover grayscale contrast-150"
                        />
                        <span className="absolute bottom-1 right-1 bg-black text-white px-1 text-[7px] font-mono font-bold">
                          01A
                        </span>
                      </div>
                      <div className="border border-black aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                        <img
                          src="/images/editorial_guests.png"
                          alt="Vintage photo booth frame 02"
                          className="w-full h-full object-cover grayscale contrast-150"
                        />
                        <span className="absolute bottom-1 right-1 bg-black text-white px-1 text-[7px] font-mono font-bold">
                          02A
                        </span>
                      </div>
                      <div className="border border-black aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                        <img
                          src="/images/booth_portrait.png"
                          alt="Vintage photo booth frame 03"
                          className="w-full h-full object-cover grayscale contrast-150"
                        />
                        <span className="absolute bottom-1 right-1 bg-black text-white px-1 text-[7px] font-mono font-bold">
                          03A
                        </span>
                      </div>
                      <div className="border border-black aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                        <img
                          src="/images/booth_automat.png"
                          alt="Vintage photo booth frame 04"
                          className="w-full h-full object-cover grayscale contrast-150"
                        />
                        <span className="absolute bottom-1 right-1 bg-black text-white px-1 text-[7px] font-mono font-bold">
                          04A
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full mt-3 pt-2 border-t border-black text-center font-mono-retro">
                      <p className="text-[7px] font-bold tracking-widest uppercase">
                        SESSION #PY-8921
                      </p>
                      <p className="text-[6px] tracking-wider uppercase opacity-75 mt-0.5">
                        MONOCHROME PRINT ARCHIVE
                      </p>
                    </div>
                  </div>

                  <span className="font-mono-retro text-[9px] text-neutral-500 uppercase tracking-widest mt-4 text-center">
                    [TRUE VINTAGE MONOCHROME SILVER TONING]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FLAT CONTENT GRID CARDS: SERVICE OPTIONS ================= */}
        <section id="about" className="border-b border-white bg-black py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-12 border-b border-neutral-800">
              <div>
                <span className="font-mono-retro text-[10px] tracking-[0.3em] uppercase text-neutral-400 block mb-2">
                  MODULE 02 // ARCHIVAL SERVICE OPTIONS
                </span>
                <h2 className="font-serif-classic text-3xl sm:text-5xl font-bold tracking-tight uppercase">
                  OUR CAPABILITIES
                </h2>
              </div>
              <p className="font-mono-retro text-xs text-neutral-400 uppercase tracking-widest mt-2 md:mt-0">
                HARD BORDERS • SHARP GEOMETRY • ZERO GIMMICKS
              </p>
            </div>

            {/* 3 Hard 2px/1px Border Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Unlimited Prints */}
              <div className="border-2 border-white p-8 bg-charcoal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-700 font-mono-retro text-xs">
                    <span className="text-white font-bold uppercase">STANDARD 01</span>
                    <span className="text-neutral-400">UNLIMITED</span>
                  </div>
                  <h3 className="font-serif-classic text-2xl font-bold uppercase tracking-wider mb-4">
                    UNLIMITED PRINTS
                  </h3>
                  <p className="font-mono-retro text-xs text-neutral-300 leading-relaxed uppercase tracking-wider mb-8">
                    NO QUOTAS OR ARTIFICIAL CEILINGS. EXPOSE AND GENERATE CONTINUOUS HIGH-DEFINITION PHOTO STRIPS FOR ALL
                    YOUR SESSIONS WITHOUT RESTRAINT.
                  </p>
                </div>
                <div className="border-t border-neutral-700 pt-4 font-mono-retro text-[10px] text-neutral-400 uppercase tracking-widest">
                  [INSTANT LOCAL RENDER ENGINE]
                </div>
              </div>

              {/* Option 2: Classic Photo Strips */}
              <div className="border-2 border-white p-8 bg-black flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-700 font-mono-retro text-xs">
                    <span className="text-white font-bold uppercase">STANDARD 02</span>
                    <span className="text-neutral-400">ANALOG 2D</span>
                  </div>
                  <h3 className="font-serif-classic text-2xl font-bold uppercase tracking-wider mb-4">
                    CLASSIC PHOTO STRIPS
                  </h3>
                  <p className="font-mono-retro text-xs text-neutral-300 leading-relaxed uppercase tracking-wider mb-8">
                    AUTHENTIC 4-FRAME VERTICAL COMPOSITIONS CRAFTED ON VINTAGE PAPER AESTHETICS. RETRO BORDER MARGINS,
                    CUSTOM SERIAL INSCRIPTIONS, AND HIGH-CONTRAST MONOCHROME.
                  </p>
                </div>
                <div className="border-t border-neutral-700 pt-4 font-mono-retro text-[10px] text-neutral-400 uppercase tracking-widest">
                  [HISTORIC 2×6" PROPORTIONS]
                </div>
              </div>

              {/* Option 3: Digital Gallery */}
              <div className="border-2 border-white p-8 bg-charcoal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-700 font-mono-retro text-xs">
                    <span className="text-white font-bold uppercase">STANDARD 03</span>
                    <span className="text-neutral-400">PERMANENCE</span>
                  </div>
                  <h3 className="font-serif-classic text-2xl font-bold uppercase tracking-wider mb-4">
                    DIGITAL GALLERY
                  </h3>
                  <p className="font-mono-retro text-xs text-neutral-300 leading-relaxed uppercase tracking-wider mb-8">
                    REAL-TIME FIRESTORE REPOSITORY. BOTH GUESTS RECEIVE INSTANT CLOUD ACCESS TO EVERY HIGH-RESOLUTION
                    INDIVIDUAL FRAME AND COMBINED COMPOSITE STRIP.
                  </p>
                </div>
                <div className="border-t border-neutral-700 pt-4 font-mono-retro text-[10px] text-neutral-400 uppercase tracking-widest">
                  [LOSSLESS PNG COMPRESSION]
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GALLERY EXHIBITION ================= */}
        <section id="gallery" className="border-b border-white bg-charcoal py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-12 border-b border-neutral-700">
              <div>
                <span className="font-mono-retro text-[10px] tracking-[0.3em] uppercase text-neutral-400 block mb-2">
                  MODULE 03 // ARCHIVE EXHIBIT
                </span>
                <h2 className="font-serif-classic text-3xl sm:text-5xl font-bold tracking-tight uppercase">
                  RECENT EXPOSURES
                </h2>
              </div>
              <p className="font-mono-retro text-xs text-neutral-400 uppercase tracking-widest mt-2 md:mt-0">
                PROOFS FROM DUAL-OPERATOR TELETYPE SESSIONS
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: '/images/hero_booth.png', title: 'SESSION 8921', desc: 'NEW YORK • LONDON' },
                { img: '/images/editorial_guests.png', title: 'SESSION 8922', desc: 'PARIS • TOKYO' },
                { img: '/images/booth_portrait.png', title: 'SESSION 8923', desc: 'BERLIN • ZÜRICH' },
                { img: '/images/booth_automat.png', title: 'SESSION 8924', desc: 'SYDNEY • TORONTO' },
              ].map((item, idx) => (
                <div key={idx} className="border border-white bg-black p-4 flex flex-col">
                  <div className="aspect-[4/5] border border-neutral-800 overflow-hidden mb-4">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  <div className="font-mono-retro text-xs flex justify-between items-center text-white font-bold uppercase">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MANIFESTO BANNER ================= */}
        <section className="bg-white text-black py-16 px-6 border-b border-black text-center">
          <div className="max-w-4xl mx-auto font-mono-retro">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
              THE 2D MONOCHROME PRINCIPLE
            </span>
            <p className="font-serif-classic text-2xl sm:text-4xl font-bold uppercase leading-snug mb-6">
              "Black and white strip the world of excess, leaving only geometry, memory, and presence."
            </p>
            <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest pt-2">
              <button
                type="button"
                onClick={handleCreateRoom}
                className="bg-black text-white border-2 border-black px-6 py-3 hover:bg-white hover:text-black transition-colors"
              >
                OPEN YOUR BOOTH NOW
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= EDITORIAL FOOTER ================= */}
      <footer className="bg-black text-white py-12 px-6 border-t border-neutral-800 font-mono-retro text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Logo />
            <span className="text-neutral-500 uppercase tracking-widest text-[10px]">
              CERTIFIED MONOCHROME TELETYPE NETWORK
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-neutral-400 tracking-widest uppercase">
            <span>#000000 / #FFFFFF</span>
            <span>2D FLAT INTERFACE</span>
            <span>NO SHADOWS • NO GRADIENTS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
