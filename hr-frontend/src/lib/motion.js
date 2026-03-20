/**
 * Animation System for Mockly
 * Consistent motion design tokens and variants
 */

// Duration tokens (in seconds)
export const duration = {
  xs: 0.08,   // micro interactions
  s: 0.15,    // quick feedback
  m: 0.3,     // standard transitions
  l: 0.45,    // emphasis animations
  xl: 0.6,    // dramatic reveals
}

// Easing functions
export const easing = {
  primary: [0.22, 0.9, 0.33, 1],      // snappy, natural
  soft: [0.25, 0.46, 0.45, 0.94],     // gentle, smooth
  elastic: [0.5, 1.6, 0.64, 1],       // bouncy (use sparingly)
  out: [0, 0, 0.2, 1],                // decelerate
  in: [0.4, 0, 1, 1],                 // accelerate
}

// Stagger delays
export const stagger = {
  fast: 0.04,
  list: 0.06,
  hero: 0.12,
  slow: 0.15,
}

// Base transition presets
export const transition = {
  primary: { duration: duration.m, ease: easing.primary },
  fast: { duration: duration.s, ease: easing.primary },
  slow: { duration: duration.l, ease: easing.soft },
  elastic: { duration: duration.l, ease: easing.elastic },
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 },
}

// Card entrance variant
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 10, 
    scale: 0.995 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: transition.primary,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: transition.fast,
  },
}

// Button hover variant
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03, transition: transition.fast },
  tap: { scale: 0.97, transition: { duration: duration.xs } },
}

// Popover/dropdown variant
export const popoverVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.97, 
    y: -4,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: transition.primary,
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: -4,
    transition: { duration: duration.s, ease: easing.soft },
  },
}

// Sidebar slide variant
export const sidebarVariants = {
  hidden: { x: -24, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transition.primary,
  },
}

// Chat bubble variants
export const bubbleVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: transition.primary,
  },
}

// Fade variants
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: duration.m } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: duration.s } 
  },
}

// Slide up variants
export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transition.primary,
  },
}

// List container variants (for staggered children)
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.list,
      delayChildren: 0.1,
    },
  },
}

// List item variants
export const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transition.primary,
  },
}

// Scroll reveal viewport settings
export const scrollReveal = {
  once: true,
  amount: 0.2,
}

// Skeleton pulse animation
export const skeletonVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Typing indicator
export const typingDotVariants = {
  animate: (i) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: easing.soft,
    },
  }),
}

// Toast variants
export const toastVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: transition.spring,
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    transition: { duration: duration.s },
  },
}

// Modal variants
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.m } },
  exit: { opacity: 0, transition: { duration: duration.s } },
}

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: transition.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: duration.s },
  },
}

// Input focus animation
export const inputVariants = {
  idle: { boxShadow: '0 0 0 0px rgba(14, 165, 255, 0)' },
  focus: { 
    boxShadow: '0 0 0 3px rgba(14, 165, 255, 0.15)',
    transition: transition.fast,
  },
}

// KPI tile counter animation helper
export const counterSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
}

