import { nanoid } from 'nanoid'

/**
 * Generate a short, URL-safe room ID (6 characters)
 */
export function generateRoomId(): string {
  // Simple alphanumeric, uppercase for readability
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/**
 * Generate a unique user/device ID stored in sessionStorage
 */
export function getOrCreateUserId(): string {
  const stored = sessionStorage.getItem('photobooth_user_id')
  if (stored) return stored
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  sessionStorage.setItem('photobooth_user_id', id)
  return id
}

/**
 * Get or set a user display name
 */
export function getOrCreateUserName(): string {
  const stored = sessionStorage.getItem('photobooth_user_name')
  if (stored) return stored
  const adjectives = ['Happy', 'Sunny', 'Cosmic', 'Dreamy', 'Neon', 'Velvet', 'Starry']
  const nouns = ['Panda', 'Fox', 'Bear', 'Bunny', 'Cat', 'Wolf', 'Deer']
  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
  sessionStorage.setItem('photobooth_user_name', name)
  return name
}

/**
 * Format date for photo strip footer
 */
export function formatPhotoDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Re-export nanoid if needed elsewhere
export { nanoid }
