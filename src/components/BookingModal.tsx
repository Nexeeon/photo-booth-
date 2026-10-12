import React, { useState } from 'react'
import { X, Check, Calendar, MapPin, Mail, User, Clock } from 'lucide-react'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialPackage?: string
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialPackage = 'CLASSIC PHOTO STRIPS',
}) => {
  const [packageName, setPackageName] = useState(initialPackage)
  const [clientName, setClientName] = useState('')
  const [email, setEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [hours, setHours] = useState('3')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setClientName('')
    setEmail('')
    setEventDate('')
    setLocation('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-editorial-sans">
      <div className="bg-white border border-black w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 border border-black hover:bg-black hover:text-white transition-colors"
          aria-label="Close reservation dialog"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 border border-black mx-auto mb-4 flex items-center justify-center bg-black text-white">
              <Check size={24} />
            </div>
            <h3 className="font-editorial-serif text-2xl font-bold uppercase mb-2">
              Reservation Inquired
            </h3>
            <p className="font-editorial-sans text-xs text-neutral-600 max-w-md mx-auto mb-6">
              Thank you, {clientName || 'valued guest'}. Our atelier curator has received your request for {packageName} on {eventDate || 'your selected date'}. We will confirm calendar availability within 24 hours.
            </p>
            <button onClick={handleResetAndClose} className="btn-noir-primary">
              Return to Catalog
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-black pb-4 mb-6">
              <span className="font-editorial-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                PHOTO YUK // RESERVATION ATELIER
              </span>
              <h2 className="font-editorial-serif text-3xl font-black uppercase text-black">
                Book Your Photo Booth
              </h2>
              <p className="font-editorial-sans text-xs text-neutral-600 mt-1">
                Reserve an authentic vintage monochrome booth for your wedding, gala, or celebration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                  Selected Experience Package
                </label>
                <select
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full border border-black p-2.5 bg-white text-xs font-editorial-sans focus:outline-none"
                >
                  <option value="CLASSIC PHOTO STRIPS">Classic Photo Strips (3 Hours, Unlimited Strips)</option>
                  <option value="UNLIMITED PRINTS & ALBUM">Unlimited Prints + Archival Leather Album (4 Hours)</option>
                  <option value="THE GRAND GALA ATELIER">The Grand Gala Atelier (Full Day, Dual Cutters)</option>
                  <option value="DIGITAL VIRTUAL ROOM">Virtual Sync Digital Booth (Worldwide Online)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-black p-2.5 text-xs font-editorial-sans focus:outline-none pl-8"
                    />
                    <User size={14} className="absolute left-2.5 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full border border-black p-2.5 text-xs font-editorial-sans focus:outline-none pl-8"
                    />
                    <Mail size={14} className="absolute left-2.5 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full border border-black p-2.5 text-xs font-editorial-sans focus:outline-none pl-8"
                    />
                    <Calendar size={14} className="absolute left-2.5 top-3 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                    Rental Duration
                  </label>
                  <div className="relative">
                    <select
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full border border-black p-2.5 text-xs font-editorial-sans focus:outline-none pl-8"
                    >
                      <option value="3">3 Hours Service</option>
                      <option value="4">4 Hours Service</option>
                      <option value="6">6 Hours Service</option>
                      <option value="full">Full Evening / Overnight</option>
                    </select>
                    <Clock size={14} className="absolute left-2.5 top-3 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-editorial-mono text-[11px] font-bold uppercase text-black mb-1">
                  Event Location & Venue
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Grand Ballroom / Private Estate / Jakarta, ID"
                    className="w-full border border-black p-2.5 text-xs font-editorial-sans focus:outline-none pl-8"
                  />
                  <MapPin size={14} className="absolute left-2.5 top-3 text-neutral-400" />
                </div>
              </div>

              <div className="pt-4 border-t border-black flex items-center justify-between">
                <span className="font-editorial-mono text-[10px] text-neutral-500 uppercase">
                  ZERO CANCELLATION FEE BEFORE 30 DAYS
                </span>
                <button type="submit" className="btn-noir-primary text-xs">
                  Submit Reservation Request
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal
