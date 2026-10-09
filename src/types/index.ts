// Types for the photobooth application

export type UserRole = 'host' | 'guest'

export interface RoomUser {
  id: string
  role: UserRole
  name: string
  joinedAt: number
  isOnline: boolean
}

export interface CapturedPhoto {
  id: string
  dataUrl: string
  capturedAt: number
  capturedBy: string
}

export type SessionState = 'waiting' | 'countdown' | 'capturing' | 'preview' | 'done'

export interface CountdownState {
  isActive: boolean
  count: number
  photoIndex: number
}

export interface FrameTemplate {
  id: string
  label: string
  color: string
  bgColor: string
  textColor: string
  accentColor: string
  borderStyle: string
}

export interface RoomSession {
  id: string
  hostId: string
  guestId?: string
  state: SessionState
  countdown: CountdownState
  photos: CapturedPhoto[]
  frameId: string
  createdAt: number
  selectedPhotoCount: number
}
