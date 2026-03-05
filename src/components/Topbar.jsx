/**
 * Topbar Component
 * Minimal top bar with menu dots and avatar button.
 * Triggers profile popover on avatar click.
 */
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { cn } from '../lib/utils'
import { buttonVariants, fadeVariants } from '../lib/motion'

export function Topbar({ 
  user,
  onMenuClick,
  onAvatarClick,
  className 
}) {
  return (
    <motion.header
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'h-16 flex items-center justify-end gap-2 px-6',
        'bg-white/80 backdrop-blur-sm',
        'border-b border-gray-100',
        className
      )}
    >
      {/* Menu dots */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={onMenuClick}
        className={cn(
          'p-2 rounded-lg',
          'text-muted hover:text-gray-700',
          'hover:bg-gray-100',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
        )}
        aria-label="More options"
      >
        <MoreVertical className="w-5 h-5" />
      </motion.button>

      {/* Avatar button */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={onAvatarClick}
        className={cn(
          'w-10 h-10 rounded-xl overflow-hidden',
          'bg-darkbg flex items-center justify-center',
          'border-2 border-transparent hover:border-brand-500',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
        )}
        aria-label={`Profile menu for ${user?.name || 'User'}`}
        aria-haspopup="menu"
      >
        <AvatarIcon />
      </motion.button>
    </motion.header>
  )
}

function AvatarIcon() {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      className="text-white"
      aria-hidden="true"
    >
      <rect x="7" y="4" width="10" height="4" rx="1" fill="currentColor"/>
      <rect x="9" y="9" width="6" height="8" rx="1" fill="currentColor"/>
      <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor"/>
      <rect x="4" y="10" width="4" height="1" fill="currentColor"/>
      <rect x="16" y="10" width="4" height="1" fill="currentColor"/>
      <rect x="4" y="12" width="4" height="1" fill="currentColor"/>
      <rect x="16" y="12" width="4" height="1" fill="currentColor"/>
    </svg>
  )
}

export default Topbar

/*
ACCESSIBILITY NOTES:
- aria-label on icon-only buttons
- aria-haspopup indicates dropdown menu
- Focus visible ring for keyboard navigation
- Backdrop blur doesn't affect readability

PERFORMANCE NOTES:
- Minimal DOM elements
- CSS-only blur effect (GPU accelerated)
- No state management in component

ANIMATION TEST CHECKLIST:
[ ] Fades in on mount
[ ] Buttons scale on hover
[ ] Buttons compress on tap
[ ] Smooth color transitions
*/

