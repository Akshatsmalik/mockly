/**
 * Hero Component
 * Center hero section with logo, headline, subtitle, and CTA.
 * Used on dashboard landing page.
 */
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { slideUpVariants, buttonVariants, transition, stagger } from '../lib/motion'

export function Hero({
  userName,
  onStartChat,
  className,
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.hero,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        className
      )}
    >
      {/* Grid icon */}
      <motion.div variants={slideUpVariants} className="mb-8">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-gray-300">
          <rect x="4" y="4" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="3"/>
          <rect x="30" y="4" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="3"/>
          <rect x="4" y="30" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="3"/>
          <rect x="30" y="30" width="22" height="22" rx="4" stroke="currentColor" strokeWidth="3"/>
        </svg>
      </motion.div>

      {/* Greeting */}
      <motion.h1 
        variants={slideUpVariants}
        className="text-4xl font-bold text-gray-900 mb-3"
      >
        Hello, {userName || 'there'}
      </motion.h1>

      {/* Subtitle */}
      <motion.h2 
        variants={slideUpVariants}
        className="text-4xl font-light text-gray-300 mb-4"
      >
        Lets Start with your Interview
      </motion.h2>

      {/* Description */}
      <motion.p 
        variants={slideUpVariants}
        className="text-muted text-base mb-8"
      >
        Your Personal AI interviewer for your placements
      </motion.p>
    </motion.div>
  )
}

export default Hero

/*
ACCESSIBILITY NOTES:
- Semantic heading hierarchy (h1, h2)
- Text is readable at all viewport sizes
- CTA button has adequate contrast

PERFORMANCE NOTES:
- Staggered animation uses single container
- No layout shift during animation
- Static content after animation completes

ANIMATION TEST CHECKLIST:
[ ] Elements stagger in from bottom
[ ] Smooth opacity fade accompanies slide
[ ] CTA button has hover/tap feedback
[ ] No jank on slower devices
*/

