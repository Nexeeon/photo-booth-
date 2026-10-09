import type { FrameTemplate } from '../types'

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'classic-pink',
    label: 'Rosy Bliss',
    color: '#FF69B4',
    bgColor: 'linear-gradient(160deg, #FF69B4 0%, #FFB6C1 50%, #FF1493 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    borderStyle: '6px solid rgba(255,255,255,0.7)',
  },
  {
    id: 'korean-white',
    label: 'Seoul Minimal',
    color: '#E2E8F0',
    bgColor: 'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
    textColor: '#1E293B',
    accentColor: '#0F172A',
    borderStyle: '6px solid #CBD5E1',
  },
  {
    id: 'korean-y2k',
    label: 'K-Y2K Cyber',
    color: '#38BDF8',
    bgColor: 'linear-gradient(160deg, #0284C7 0%, #E0E7FF 50%, #F43F5E 100%)',
    textColor: '#ffffff',
    accentColor: '#38BDF8',
    borderStyle: '6px solid #38BDF8',
  },
  {
    id: 'midnight-purple',
    label: 'Midnight Haze',
    color: '#9333EA',
    bgColor: 'linear-gradient(160deg, #1A0533 0%, #4A1272 50%, #9333EA 100%)',
    textColor: '#F0D9FF',
    accentColor: '#D8B4FE',
    borderStyle: '6px solid rgba(147,51,234,0.6)',
  },
  {
    id: 'pastel-mint',
    label: 'Pastel Mint',
    color: '#34D399',
    bgColor: 'linear-gradient(160deg, #D1FAE5 0%, #A7F3D0 50%, #34D399 100%)',
    textColor: '#065F46',
    accentColor: '#047857',
    borderStyle: '6px solid #6EE7B7',
  },
  {
    id: 'vintage-film',
    label: 'Retro Film',
    color: '#D97706',
    bgColor: 'linear-gradient(160deg, #451A03 0%, #78350F 50%, #D97706 100%)',
    textColor: '#FEF3C7',
    accentColor: '#FDE68A',
    borderStyle: '6px solid #B45309',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    color: '#F59E0B',
    bgColor: 'linear-gradient(160deg, #78350F 0%, #B45309 40%, #F59E0B 100%)',
    textColor: '#FFFBEB',
    accentColor: '#FDE68A',
    borderStyle: '6px solid rgba(245,158,11,0.6)',
  },
  {
    id: 'aurora',
    label: 'Aurora Cyber',
    color: '#06B6D4',
    bgColor: 'linear-gradient(160deg, #0F172A 0%, #0369A1 40%, #06B6D4 100%)',
    textColor: '#E0F7FA',
    accentColor: '#67E8F9',
    borderStyle: '6px solid rgba(6,182,212,0.5)',
  },
]

export const PHOTO_COUNT = 4
export const COUNTDOWN_SECONDS = 3
export const BETWEEN_PHOTO_DELAY = 1500 // ms between each capture

