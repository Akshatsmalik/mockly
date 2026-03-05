import { clsx } from 'clsx'

/**
 * Merge class names with clsx
 */
export function cn(...inputs) {
  return clsx(inputs)
}

/**
 * Format time duration
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} Minutes`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} Hour${hrs > 1 ? 's' : ''}`
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

