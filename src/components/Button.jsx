/**
 * Button Component
 * Versatile button with multiple variants and animated states.
 */
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { buttonVariants as motionVariants } from '../lib/motion'

export const Button = forwardRef(function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className,
  ...props
}, ref) {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-soft',
    secondary: 'bg-darkbg text-white hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <motion.button
      ref={ref}
      variants={motionVariants}
      initial="idle"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
})

export default Button

/*
ACCESSIBILITY NOTES:
- Native button element
- disabled state communicated to AT
- Focus visible ring for keyboard users
- Loading state is visual only (add aria-busy if needed)

PERFORMANCE NOTES:
- forwardRef for composition
- Motion variants defined externally
- CSS transitions for colors

ANIMATION TEST CHECKLIST:
[ ] Hover scales up slightly
[ ] Tap compresses instantly
[ ] Loading spinner animates
[ ] Focus ring visible on keyboard focus
*/

