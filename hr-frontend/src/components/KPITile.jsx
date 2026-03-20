/**
 * KPITile Component
 * Statistic card with icon, label, value, and optional status.
 * Animated number counter on mount.
 */
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { Clock, Timer, ThumbsUp, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'
import { cardVariants, counterSpring } from '../lib/motion'

const iconMap = {
  rounds: RotateCcw,
  time: Clock,
  score: ThumbsUp,
  timer: Timer,
}

export function KPITile({
  icon = 'rounds',
  label,
  value,
  subLabel,
  status, // 'success' | 'warning' | 'error'
  animate: shouldAnimate = true,
  className,
}) {
  const Icon = iconMap[icon] || Clock

  const statusColors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.3 }}
      className={cn(
        'bg-white rounded-2xl p-6',
        'border border-gray-100',
        'shadow-soft',
        'flex flex-col',
        className
      )}
    >
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted" strokeWidth={1.5} />
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        {shouldAnimate && typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : (
          <span className="text-3xl font-bold text-gray-900">{value}</span>
        )}
      </div>

      {/* Sub label with optional status */}
      {subLabel && (
        <span className={cn(
          'mt-2 text-sm',
          status ? statusColors[status] : 'text-muted'
        )}>
          {subLabel}
        </span>
      )}
    </motion.div>
  )
}

// Animated number counter
function AnimatedNumber({ value }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, latest => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1,
      ease: [0.22, 0.9, 0.33, 1],
    })
    return controls.stop
  }, [value, count])

  return (
    <motion.span className="text-3xl font-bold text-gray-900">
      {rounded}
    </motion.span>
  )
}

export default KPITile

/*
ACCESSIBILITY NOTES:
- Semantic structure with clear labels
- Color is not the only status indicator
- Text remains readable at all sizes

PERFORMANCE NOTES:
- useMotionValue prevents re-renders during animation
- viewport: once prevents re-triggering
- Conditional animation for static values

ANIMATION TEST CHECKLIST:
[ ] Card fades/slides in on scroll reveal
[ ] Number counts up smoothly
[ ] Hover state lifts card slightly
[ ] No jank with multiple tiles
*/

