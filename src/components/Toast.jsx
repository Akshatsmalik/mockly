/**
 * Toast Component
 * Notification toast with auto-dismiss and manual close.
 * Supports success, error, warning, info variants.
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { toastVariants, buttonVariants } from '../lib/motion'

// Toast context for global access
const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ 
    title, 
    message, 
    type = 'info', 
    duration = 4000 
  }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Convenience methods
  const toast = {
    success: (message, title) => addToast({ message, title, type: 'success' }),
    error: (message, title) => addToast({ message, title, type: 'error' }),
    warning: (message, title) => addToast({ message, title, type: 'warning' }),
    info: (message, title) => addToast({ message, title, type: 'info' }),
    dismiss: removeToast,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast container
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual toast
function Toast({ title, message, type, onDismiss }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-500',
      title: 'text-amber-800',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
    },
  }

  const Icon = icons[type]
  const style = styles[type]

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'w-80 p-4 rounded-xl border',
        'shadow-popup',
        'flex items-start gap-3',
        style.bg
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.icon)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('font-medium text-sm', style.title)}>
            {title}
          </p>
        )}
        {message && (
          <p className="text-sm text-gray-600 mt-0.5">
            {message}
          </p>
        )}
      </div>

      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={onDismiss}
        className={cn(
          'p-1 rounded-lg flex-shrink-0',
          'text-gray-400 hover:text-gray-600 hover:bg-black/5',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

export default Toast

/*
ACCESSIBILITY NOTES:
- aria-live="polite" for screen reader announcements
- role="alert" on individual toasts
- Keyboard accessible dismiss button
- Focus visible ring on interactive elements

PERFORMANCE NOTES:
- Context prevents prop drilling
- Auto-dismiss with cleanup
- AnimatePresence handles layout animations

ANIMATION TEST CHECKLIST:
[ ] Toast slides up from bottom
[ ] Multiple toasts stack smoothly
[ ] Dismiss animates out
[ ] Layout shift is smooth when one is removed
*/

