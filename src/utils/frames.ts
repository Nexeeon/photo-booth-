import type { FrameTemplate } from '../types'

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'classic-pink',
    label: 'Rosy Bliss',
    color: '#FF69B4',
    bgColor: 'linear-gradient(160deg, #FF69B4 0%, #FFB6C1 50%, #FF1493 100%)',
    textColor: '#fff',
    accentColor: '#fff',
    borderStyle: '6px solid rgba(255,255,255,0.6)',
  },
  {
    id: 'midnight-purple',
    label: 'Midnight Haze',
    color: '#9333EA',
    bgColor: 'linear-gradient(160deg, #1a0533 0%, #4a1272 50%, #9333EA 100%)',
    textColor: '#f0d9ff',
    accentColor: '#d8b4fe',
    borderStyle: '6px solid rgba(147,51,234,0.6)',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    color: '#F59E0B',
    bgColor: 'linear-gradient(160deg, #78350F 0%, #B45309 40%, #F59E0B 100%)',
    textColor: '#fffbeb',
    accentColor: '#fde68a',
    borderStyle: '6px solid rgba(245,158,11,0.6)',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    color: '#06B6D4',
    bgColor: 'linear-gradient(160deg, #0F172A 0%, #0369A1 40%, #06B6D4 100%)',
    textColor: '#e0f7fa',
    accentColor: '#67e8f9',
    borderStyle: '6px solid rgba(6,182,212,0.5)',
  },
]

export const PHOTO_COUNT = 4
export const COUNTDOWN_SECONDS = 3
export const BETWEEN_PHOTO_DELAY = 1500 // ms between each capture
