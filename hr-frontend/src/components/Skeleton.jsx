/**
 * Skeleton Component
 * Loading placeholder with pulse animation.
 * Supports various shapes and sizes.
 */
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { skeletonVariants } from '../lib/motion'

export function Skeleton({ 
  className,
  variant = 'text', // text, circular, rectangular, rounded
  width,
  height,
  lines = 1,
}) {
  const baseStyles = 'bg-gray-200'
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            variants={skeletonVariants}
            animate="animate"
            className={cn(
              baseStyles,
              variantStyles.text,
              i === lines - 1 && 'w-3/4' // Last line shorter
            )}
            style={{ 
              width: i === lines - 1 ? '75%' : width,
              height,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={skeletonVariants}
      animate="animate"
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// Pre-built skeleton compositions
export function ChatBubbleSkeleton({ isUser = false }) {
  return (
    <div className={cn(
      'flex gap-3 max-w-3xl',
      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
    )}>
      <Skeleton variant="rounded" className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="rounded" className="h-16 w-64" />
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton variant="rounded" className="h-12 w-full" />
      <Skeleton variant="rounded" className="h-10 w-full" />
      <Skeleton variant="rounded" className="h-10 w-full" />
      <div className="pt-4 space-y-2">
        <Skeleton variant="text" className="w-20 h-3" />
        <Skeleton variant="rounded" className="h-8 w-full" />
        <Skeleton variant="rounded" className="h-8 w-full" />
      </div>
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" className="w-10 h-10" />
        <Skeleton variant="text" className="w-24 h-4" />
      </div>
      <Skeleton variant="text" className="w-16 h-8" />
      <Skeleton variant="text" className="w-20 h-3 mt-2" />
    </div>
  )
}

export default Skeleton

/*
ACCESSIBILITY NOTES:
- Skeletons are decorative (no aria needed)
- Parent should have aria-busy="true" while loading
- Screen readers will skip these elements

PERFORMANCE NOTES:
- CSS-based pulse animation
- Minimal DOM elements
- Staggered animation via CSS delay

ANIMATION TEST CHECKLIST:
[ ] Pulse animation is smooth
[ ] Multiple skeletons don't cause jank
[ ] Animation timing feels natural
*/

