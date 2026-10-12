import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { BookingModal } from '../components/BookingModal'
import { VirtualRoomModal } from '../components/VirtualRoomModal'
import {
  Camera,
  ArrowRight,
  Maximize2,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
} from 'lucide-react'

export const HomePage: React.FC = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [virtualModalOpen, setVirtualModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState('CLASSIC PHOTO STRIPS')
  const [cameraActive, setCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'couples' | 'portraits' | 'strips'>('all')

  const webcamRef = useRef<Webcam>(null)

  const handleToggleCamera = useCallback(() => {
    setCameraActive((prev) => !prev)
  }, [])

  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [])

  const handleOpenBooking = (pkgTitle: string) => {
    setSelectedOffer(pkgTitle)
    setBookingModalOpen(true)
  }

  // Gallery items using authentic existing assets
  const galleryItems = [
    {
      src: '/images/booth_couple.png',
      caption: 'ARCHIVAL SESSION 01 // WEDDING SALON',
      category: 'couples' as const,
      format: '2×6" DUAL STRIP',
    },
    {
      src: '/images/booth_party.png',
      caption: 'ARCHIVAL SESSION 02 // GALA EVENING',
      category: 'portraits' as const,
      format: '35MM SILVER GELATIN',
    },
    {
      src: '/images/booth_strip_flatlay.png',
      caption: 'ARCHIVAL SESSION 03 // 310 GSM COTTON RAG',
      category: 'strips' as const,
      format: 'MUSEUM EDITION FLATLAY',
    },
    {
      src: '/images/booth_girl_portrait.png',
      caption: 'ARCHIVAL SESSION 04 // VINTAGE 1974 LONDON',
      category: 'portraits' as const,
      format: 'CLASSIC 4-FRAME STRIP',
    },
    {
      src: '/images/booth_prints_offer.png',
      caption: 'ARCHIVAL SESSION 05 // TACTILE PRINTS',
      category: 'strips' as const,
      format: 'HAND-CUT PROOFS',
    },
    {
      src: '/images/booth_partner_placeholder.png',
      caption: 'ARCHIVAL SESSION 06 // PORTRAIT STUDY',
      category: 'portraits' as const,
      format: 'MONOCHROME DENSITY CURVE',
    },
  ]

  const filteredGallery =
    galleryFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === galleryFilter)

  const faqs = [
    {
      q: 'HOW DOES THE TWO PLACES, ONE PHOTO STRIP FEATURE WORK?',
      a: 'Through our proprietary virtual sync booth, two individuals in separate physical locations can enter a synchronized live room. Our camera engine captures both feeds concurrently with an aligned countdown, producing a single merged 4-frame vintage photo strip as if you were in the same booth.',
    },
    {
      q: 'WHAT PHYSICAL FOOTPRINT AND POWER IS REQUIRED FOR ONSITE RENTALS?',
      a: 'Our physical booth units require an area of approximately 2.5m × 2.0m and a standard dedicated 110V/220V household circuit. We arrive 90 minutes prior to your event start time for calibration, discreet cable dressing, and white-glove setup.',
    },
    {
      q: 'ARE PRINTS UNLIMITED FOR OUR GUESTS?',
      a: 'Yes, absolutely. Our high-speed lab-grade printers produce dry, smudge-proof, 310gsm archival paper strips in under 9 seconds. Every guest in the frame receives a physical copy to take home immediately.',
    },
    {
      q: 'CAN WE CUSTOMIZE THE BOTTOM INSCRIPTION WITH OUR EVENT MONOGRAM?',
      a: 'Yes. Our typographic team creates bespoke typography, monograms, event dates, or logo marks using Swiss and classic serif styles, proofed with you prior to the celebration date.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-editorial-sans flex flex-col">
      {/* ================= TOP NAVIGATION ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="font-editorial-serif text-2xl font-black tracking-tight uppercase text-black">
              Photo Yuk
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8 font-editorial-sans text-xs tracking-[0.2em] uppercase font-medium">
            <a href="#hero" className="hover:underline underline-offset-4 transition-colors">
              HOME
            </a>
            <a href="#about" className="hover:underline underline-offset-4 transition-colors">
              ABOUT
            </a>
            <a href="#offers" className="hover:underline underline-offset-4 transition-colors">
              WHAT WE OFFER
            </a>
            <a href="#gallery" className="hover:underline underline-offset-4 transition-colors">
              GALLERY
            </a>
            <button
              onClick={() => handleOpenBooking('CLASSIC PHOTO STRIPS')}
              className="btn-noir-primary !py-2 !px-4 text-[11px]"
            >
              BOOK NOW
            </button>
          </nav>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section id="hero" className="border-b border-black py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Top Index Header */}
            <div className="flex items-center justify-between pb-3 mb-8 border-b border-black font-editorial-mono text-[10px] sm:text-xs tracking-[0.25em] text-neutral-500 uppercase">
              <span>PHOTO YUK • CLASSIC MONOCHROME ARCHIVE</span>
              <span className="hidden sm:inline">VINTAGE 35MM TONAL DISCIPLINE</span>
              <span>TWO PLACES • ONE STRIP</span>
            </div>

            {/* Main Headings */}
            <div className="max-w-4xl mb-12">
              <h1 className="font-editorial-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-black uppercase leading-[0.95] mb-4">
                PHOTO YUK
              </h1>
              <p className="font-editorial-serif italic text-2xl sm:text-3xl text-neutral-800 mb-3">
                Two places. One photo strip.
              </p>
              <p className="font-editorial-sans text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
                Timeless black and white photo booth experiences for weddings, events, and parties.
                Authentic silver gelatin grain, tactile cotton rag paper prints, and seamless real-time digital sync.
              </p>
            </div>

            {/* Split Hero: Left = 2D Capture Container, Right = Vintage Photo Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column (Col 1-7): YOUR PHOTO BOOTH Capture Area */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="border border-black bg-white p-5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-black font-editorial-mono text-xs uppercase tracking-wider">
                    <span className="font-bold text-black flex items-center gap-2">
                      <Camera size={14} />
                      YOUR PHOTO BOOTH
                    </span>
                    <span className="text-neutral-500 text-[10px]">
                      2D DUAL-FRAME SPLIT
                    </span>
                  </div>

                  {/* Dual Frame Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left Frame: Your Half */}
                    <div className="border border-black bg-neutral-50 flex flex-col justify-between overflow-hidden relative">
                      <div className="aspect-[4/5] relative bg-neutral-100 flex items-center justify-center overflow-hidden">
                        {cameraActive ? (
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            videoConstraints={{ facingMode }}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover filter contrast-125 grayscale"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/booth_girl_portrait.png"
                              alt="Your Half Preview Portrait"
                              className="w-full h-full object-cover grayscale contrast-125"
                            />
                            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end p-4">
                              <span className="bg-white text-black font-editorial-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-black font-bold">
                                CAMERA STANDBY
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Top Label */}
                        <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-editorial-mono uppercase tracking-widest z-10">
                          Your Half
                        </div>

                        {cameraActive && (
                          <button
                            onClick={handleSwitchCamera}
                            className="absolute top-2 right-2 bg-white text-black border border-black p-1 hover:bg-black hover:text-white transition-colors z-10"
                            title="Flip Camera"
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                      </div>

                      {/* Controls Below Your Half */}
                      <div className="p-3 border-t border-black bg-white">
                        <button
                          onClick={handleToggleCamera}
                          className="btn-noir-primary w-full !py-2 text-[11px]"
                        >
                          <Camera size={13} />
                          {cameraActive ? 'DISABLE CAMERA' : 'ENABLE CAMERA'}
                        </button>
                      </div>
                    </div>

                    {/* Right Frame: Partner's Half */}
                    <div className="border border-black bg-neutral-50 flex flex-col justify-between overflow-hidden relative">
                      <div className="aspect-[4/5] relative bg-neutral-100 flex items-center justify-center overflow-hidden">
                        <img
                          src="/images/booth_partner_placeholder.png"
                          alt="Space for your partner"
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                        <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-editorial-mono uppercase tracking-widest z-10">
                          Partner&apos;s Half
                        </div>
                        <div className="absolute inset-0 bg-white/20" />
                      </div>

                      {/* Info & Sync Button */}
                      <div className="p-3 border-t border-black bg-white flex flex-col gap-2">
                        <span className="font-editorial-mono text-[10px] text-neutral-600 uppercase tracking-widest text-center">
                          A space for your partner
                        </span>
                        <button
                          onClick={() => setVirtualModalOpen(true)}
                          className="btn-noir-secondary w-full !py-2 text-[11px]"
                        >
                          <Users size={13} />
                          CONNECT PARTNER
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Sub-panel */}
                  <div className="mt-4 pt-3 border-t border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-editorial-mono text-neutral-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-black" />
                      <span>LIVE DUAL OPTICS READY</span>
                    </div>
                    <button
                      onClick={() => setVirtualModalOpen(true)}
                      className="underline uppercase font-bold text-black hover:text-neutral-600"
                    >
                      ENTER FULL BOOTH ROOM →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (Col 8-12): Vintage Photo Strip Showcase */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative border border-black bg-white p-6 w-full max-w-sm">
                  {/* Decorative tape mark */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 border border-neutral-400 bg-neutral-100/90 font-editorial-mono text-[8px] text-neutral-500 uppercase tracking-widest flex items-center justify-center">
                    ARCHIVAL TAPE
                  </div>

                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-black font-editorial-mono text-[10px] text-neutral-500 uppercase">
                    <span>SPECIMEN NO. 4410</span>
                    <span>OCTOBER 2026</span>
                  </div>

                  {/* Vertical Multi-frame Paper Photo Strip */}
                  <div className="border border-black bg-white p-2">
                    <div className="border border-black overflow-hidden bg-neutral-100">
                      <img
                        src="/images/booth_couple.png"
                        alt="Vintage photo booth strip showing candid joyful people"
                        className="w-full h-auto object-cover grayscale contrast-125"
                      />
                    </div>
                  </div>

                  {/* Inscription & Details */}
                  <div className="mt-4 pt-3 border-t border-black flex items-center justify-between">
                    <div>
                      <span className="font-editorial-serif text-sm font-black uppercase text-black block">
                        SILVER GELATIN 4-FRAME
                      </span>
                      <span className="font-editorial-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                        310 GSM COTTON RAG PAPER
                      </span>
                    </div>
                    <button
                      onClick={() => setLightboxImage('/images/booth_couple.png')}
                      className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors"
                      title="Enlarge Photo Strip"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHAT WE OFFER ================= */}
        <section id="offers" className="border-b border-black py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-12 border-b border-black">
              <div>
                <span className="font-editorial-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                  SERVICES & ATELIER PROVISIONS
                </span>
                <h2 className="font-editorial-serif text-4xl sm:text-6xl font-black uppercase tracking-tight text-black">
                  What We Offer
                </h2>
              </div>
              <p className="mt-4 md:mt-0 font-editorial-sans text-neutral-600 max-w-md text-sm leading-relaxed">
                Precision analog optics, heavy cotton archival stocks, and instantaneous digital delivery. Crafted specifically for elevated gatherings.
              </p>
            </div>

            {/* Offer Cards: Thin 1px Black Outline Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: UNLIMITED PRINTS */}
              <div className="border border-black p-6 bg-white flex flex-col justify-between group">
                <div>
                  <div className="aspect-[4/3] border border-black overflow-hidden mb-6 bg-neutral-100">
                    <img
                      src="/images/booth_prints_offer.png"
                      alt="Hands holding unlimited physical photo prints"
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
                    <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                      PROVISION 01
                    </span>
                    <span className="font-editorial-mono text-[10px] bg-black text-white px-2 py-0.2 uppercase">
                      ON-SITE DYE LAB
                    </span>
                  </div>
                  <h3 className="font-editorial-serif text-2xl font-black uppercase text-black mb-3">
                    UNLIMITED PRINTS
                  </h3>
                  <p className="font-editorial-sans text-xs text-neutral-600 leading-relaxed mb-6">
                    Every guest walks away with physical heirloom prints. Using high-speed calibrated dye sublimation engines, double strips are developed and precision-trimmed within 8.5 seconds.
                  </p>
                  <ul className="space-y-2 mb-8 font-editorial-mono text-[11px] text-neutral-700">
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Dual automated print cutter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>310gsm museum cotton paper</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>100-year anti-yellowing coating</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenBooking('UNLIMITED PRINTS')}
                  className="btn-noir-secondary w-full text-xs"
                >
                  SELECT PROVISION →
                </button>
              </div>

              {/* Card 2: CLASSIC PHOTO STRIPS */}
              <div className="border border-black p-6 bg-white flex flex-col justify-between group">
                <div>
                  <div className="aspect-[4/3] border border-black overflow-hidden mb-6 bg-neutral-100">
                    <img
                      src="/images/booth_strip_flatlay.png"
                      alt="Archival flatlay of classic photo strips"
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
                    <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                      PROVISION 02
                    </span>
                    <span className="font-editorial-mono text-[10px] bg-black text-white px-2 py-0.2 uppercase">
                      TRADITIONAL 2×6"
                    </span>
                  </div>
                  <h3 className="font-editorial-serif text-2xl font-black uppercase text-black mb-3">
                    CLASSIC PHOTO STRIPS
                  </h3>
                  <p className="font-editorial-sans text-xs text-neutral-600 leading-relaxed mb-6">
                    The authentic nostalgic 4-frame vertical strip. Custom typography, bespoke event monograms, and authentic analog framing tailored by our in-house design studio.
                  </p>
                  <ul className="space-y-2 mb-8 font-editorial-mono text-[11px] text-neutral-700">
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Custom event monogram typesetting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>True silver gelatin tonal curves</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Classic black or crisp white borders</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenBooking('CLASSIC PHOTO STRIPS')}
                  className="btn-noir-primary w-full text-xs"
                >
                  SELECT PROVISION →
                </button>
              </div>

              {/* Card 3: DIGITAL GALLERY */}
              <div className="border border-black p-6 bg-white flex flex-col justify-between group">
                <div>
                  <div className="aspect-[4/3] border border-black overflow-hidden mb-6 bg-neutral-100">
                    <img
                      src="/images/booth_digital_gallery.png"
                      alt="Smartphone displaying instant digital photo gallery"
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black">
                    <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                      PROVISION 03
                    </span>
                    <span className="font-editorial-mono text-[10px] bg-black text-white px-2 py-0.2 uppercase">
                      INSTANT QR & WEBRTC
                    </span>
                  </div>
                  <h3 className="font-editorial-serif text-2xl font-black uppercase text-black mb-3">
                    DIGITAL GALLERY
                  </h3>
                  <p className="font-editorial-sans text-xs text-neutral-600 leading-relaxed mb-6">
                    Instant access via private QR codes. Download full-resolution individual frames and digital strip scans within seconds of each exposure, complete with live remote sync.
                  </p>
                  <ul className="space-y-2 mb-8 font-editorial-mono text-[11px] text-neutral-700">
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Instant high-res AirDrop & QR access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Two Places virtual booth sync engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} className="text-black" />
                      <span>Full private gallery download link</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenBooking('DIGITAL GALLERY')}
                  className="btn-noir-secondary w-full text-xs"
                >
                  SELECT PROVISION →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT / THE EXPERIENCE ================= */}
        <section id="about" className="border-b border-black py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column (Col 1-5) */}
              <div className="lg:col-span-5">
                <span className="font-editorial-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                  OUR PHILOSOPHY
                </span>
                <h2 className="font-editorial-serif text-4xl sm:text-5xl font-black uppercase text-black leading-tight mb-6">
                  Pure Silver. Pure Memory.
                </h2>
                <p className="font-editorial-sans text-sm text-neutral-700 leading-relaxed mb-4">
                  We founded Photo Yuk with a singular conviction: color distracts, but black and white reveals emotion. In an era saturated by fleeting mobile selfies, our booths offer the tangible joy of physical paper, candid vulnerability, and timeless editorial styling.
                </p>
                <p className="font-editorial-sans text-sm text-neutral-700 leading-relaxed mb-8">
                  Whether our physical booth arrives at your ballroom or you sync with a loved one overseas through our digital twin room, Photo Yuk preserves your most authentic moments forever.
                </p>

                <div className="border border-black p-5 bg-white">
                  <div className="grid grid-cols-2 gap-4 font-editorial-mono text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">OPTICAL GLASS</span>
                      <span className="font-bold text-black uppercase">ZEISS 35MM EQUIV.</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block">PRINT CYCLE</span>
                      <span className="font-bold text-black uppercase">8.5 SECONDS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Imagery (Col 6-12) */}
              <div className="lg:col-span-7">
                <div className="border border-black p-4 bg-white">
                  <div className="aspect-[16/10] overflow-hidden border border-black bg-neutral-100">
                    <img
                      src="/images/booth_party.png"
                      alt="Candid laughing party guests in authentic black and white photobooth"
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between font-editorial-mono text-[10px] text-neutral-500 uppercase">
                    <span>CANDID EMOTION // NO CARTOON PROPS</span>
                    <span>ATELIER EDITION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GALLERY SECTION ================= */}
        <section id="gallery" className="border-b border-black py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-10 border-b border-black">
              <div>
                <span className="font-editorial-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                  ARCHIVAL EXHIBIT
                </span>
                <h2 className="font-editorial-serif text-4xl sm:text-6xl font-black uppercase tracking-tight text-black">
                  The Gallery
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0 font-editorial-mono text-xs">
                {(['all', 'couples', 'portraits', 'strips'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setGalleryFilter(filterKey)}
                    className={`px-3 py-1.5 border transition-colors uppercase ${
                      galleryFilter === filterKey
                        ? 'border-black bg-black text-white font-bold'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-black'
                    }`}
                  >
                    {filterKey === 'all' ? 'ALL WORKS' : filterKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImage(item.src)}
                  className="border border-black p-3 bg-white cursor-pointer group hover:-translate-y-1 transition-transform duration-200"
                >
                  <div className="relative aspect-[4/5] border border-black overflow-hidden bg-neutral-100 mb-3">
                    <img
                      src={item.src}
                      alt={item.caption}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-black text-white font-editorial-mono text-[10px] px-3 py-1.5 uppercase flex items-center gap-1.5">
                        <Maximize2 size={12} />
                        INSPECT PROOF
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-editorial-mono text-[10px] text-neutral-500 uppercase">
                    <span className="font-bold text-black">{item.caption}</span>
                    <span>{item.format}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= EDITORIAL REVIEWS & CRITIQUE ================= */}
        <section className="border-b border-black py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6">
            <span className="font-editorial-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-10 text-center">
              EDITORIAL CRITIQUE & EVENT REVIEWS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-black p-6 bg-white flex flex-col justify-between">
                <p className="font-editorial-serif italic text-base sm:text-lg text-neutral-800 leading-snug mb-6">
                  &ldquo;Photo Yuk brought back genuine analog magic. Guests queued all evening for physical prints that now sit framed on their desks.&rdquo;
                </p>
                <div className="border-t border-black pt-3 flex items-center justify-between font-editorial-mono text-[10px] text-neutral-500 uppercase">
                  <span>BRIDES MAGAZINE</span>
                  <span>BALI ESTATE WEDDING</span>
                </div>
              </div>

              <div className="border border-black p-6 bg-white flex flex-col justify-between">
                <p className="font-editorial-serif italic text-base sm:text-lg text-neutral-800 leading-snug mb-6">
                  &ldquo;A bold, uncompromising commitment to real black and white photography. Completely elevated the aesthetic of our charity gala.&rdquo;
                </p>
                <div className="border-t border-black pt-3 flex items-center justify-between font-editorial-mono text-[10px] text-neutral-500 uppercase">
                  <span>HARPER&apos;S BAZAAR</span>
                  <span>ANNUAL HERITAGE GALA</span>
                </div>
              </div>

              <div className="border border-black p-6 bg-white flex flex-col justify-between">
                <p className="font-editorial-serif italic text-base sm:text-lg text-neutral-800 leading-snug mb-6">
                  &ldquo;The two places, one strip sync feature let our family in Singapore take pictures with us in London in real time. Pure genius.&rdquo;
                </p>
                <div className="border-t border-black pt-3 flex items-center justify-between font-editorial-mono text-[10px] text-neutral-500 uppercase">
                  <span>PRIVATE COMMISSIONS</span>
                  <span>DECEMBER 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section className="border-b border-black py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="pb-6 mb-10 border-b border-black">
              <span className="font-editorial-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                LOGISTICS & SPECIFICATIONS
              </span>
              <h2 className="font-editorial-serif text-3xl sm:text-5xl font-black uppercase text-black">
                Frequently Answered Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx
                return (
                  <div key={idx} className="border border-black bg-white">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-editorial-mono text-xs font-bold text-neutral-400">
                          0{idx + 1}
                        </span>
                        <span className="font-editorial-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                          {faq.q}
                        </span>
                      </div>
                      <span className="p-1 border border-black shrink-0">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-black text-xs sm:text-sm font-editorial-sans text-neutral-700 leading-relaxed bg-neutral-50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CALL TO ACTION ================= */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="font-editorial-mono text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-3">
              RESERVATIONS & COMMISSIONS FOR 2026–2027
            </span>
            <h2 className="font-editorial-serif text-4xl sm:text-6xl font-black uppercase text-black mb-6 leading-tight">
              Reserve Your Photo Booth
            </h2>
            <p className="font-editorial-sans text-neutral-600 max-w-xl mx-auto text-sm mb-8 leading-relaxed">
              We curate a strictly limited number of private celebrations per calendar weekend to ensure impeccable paper quality and attendant care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleOpenBooking('CLASSIC PHOTO STRIPS')}
                className="btn-noir-primary !py-3.5 !px-8 text-xs"
              >
                REQUEST RESERVATION DOSSIER
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setVirtualModalOpen(true)}
                className="btn-noir-secondary !py-3.5 !px-8 text-xs"
              >
                LAUNCH VIRTUAL SYNC BOOTH
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-black py-12 bg-white font-editorial-mono text-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-black">
            <div>
              <span className="font-bold uppercase block text-black mb-2">PHOTO YUK</span>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                High-contrast, timeless black and white photo booth rentals and real-time dual stream synchronization.
              </p>
            </div>
            <div>
              <span className="font-bold uppercase block text-black mb-2">ATELIER CONTACT</span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                hello@photoyuk.com<br />
                +62 (21) 500-2480<br />
                Mon–Sat • 09:00–18:00 WIB
              </p>
            </div>
            <div>
              <span className="font-bold uppercase block text-black mb-2">PROVISIONS</span>
              <ul className="text-neutral-600 text-[11px] space-y-1">
                <li>• Unlimited Archival Prints</li>
                <li>• Classic 2×6" Photo Strips</li>
                <li>• Virtual Synchronized Rooms</li>
                <li>• Leather Guestbook Curation</li>
              </ul>
            </div>
            <div>
              <span className="font-bold uppercase block text-black mb-2">RESERVATIONS</span>
              <button
                onClick={() => handleOpenBooking('CLASSIC PHOTO STRIPS')}
                className="btn-noir-primary w-full text-[10px] !py-2"
              >
                BOOK YOUR BOOTH →
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
            <span>© 2026 PHOTO YUK ATELIER. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-4">
              <span>PREDOMINANTLY WHITE HIGH-CONTRAST UI</span>
              <span>100% PRODUCTION READY</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white border border-black p-4 max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Archival Enlargement Proof"
              className="max-h-[80vh] w-auto object-contain border border-black grayscale contrast-125"
            />
            <p className="font-editorial-mono text-[10px] text-center mt-2 uppercase tracking-widest text-neutral-600">
              CLICK ANYWHERE TO DISMISS PROOF
            </p>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialPackage={selectedOffer}
      />

      {/* Virtual Sync Room Modal */}
      <VirtualRoomModal
        isOpen={virtualModalOpen}
        onClose={() => setVirtualModalOpen(false)}
      />
    </div>
  )
}

export default HomePage
