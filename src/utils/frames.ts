import type { FrameTemplate } from '../types'

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'classic-white',
    label: 'VINTAGE WHITE',
    color: '#000000',
    bgColor: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#000000',
    borderStyle: '2px solid #000000',
  },
  {
    id: 'noir-black',
    label: 'ARCHIVE NOIR',
    color: '#FFFFFF',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    borderStyle: '2px solid #FFFFFF',
  },
  {
    id: 'charcoal-matte',
    label: 'MATTE CHARCOAL',
    color: '#FFFFFF',
    bgColor: '#1A1A1A',
    textColor: '#FFFFFF',
    accentColor: '#CCCCCC',
    borderStyle: '2px solid #333333',
  },
  {
    id: 'newsprint',
    label: 'NEWSPRINT RAW',
    color: '#000000',
    bgColor: '#F4F4F4',
    textColor: '#000000',
    accentColor: '#1A1A1A',
    borderStyle: '2px solid #000000',
  },
]

export const PHOTO_COUNT = 4
export const COUNTDOWN_SECONDS = 3
export const BETWEEN_PHOTO_DELAY = 1500 // ms between each capture
