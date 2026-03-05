/**
 * ChatTimeline Component
 * Scrollable container for chat messages with auto-scroll to bottom.
 * Staggered entrance for initial messages.
 */
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import ChatBubble from './ChatBubble'
import { listContainerVariants, stagger } from '../lib/motion'

export function ChatTimeline({
  messages = [],
  isTyping = false,
  className,
}) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isTyping])

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto px-6 py-6',
        'scroll-smooth',
        className
      )}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <motion.div
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-4xl mx-auto"
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={msg.id || idx}
            message={msg.content}
            isUser={msg.role === 'user'}
            timestamp={msg.timestamp}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <ChatBubble
            isUser={false}
            isTyping={true}
          />
        )}
      </motion.div>
      
      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-1" aria-hidden="true" />
    </div>
  )
}

export default ChatTimeline

/*
ACCESSIBILITY NOTES:
- role="log" for chat semantics
- aria-live="polite" announces new messages
- aria-label provides context
- Smooth scroll doesn't cause focus issues

PERFORMANCE NOTES:
- useEffect dependency is array length (not full array)
- Scroll behavior is CSS-native
- Keys prevent unnecessary re-renders

ANIMATION TEST CHECKLIST:
[ ] Messages stagger in on initial load
[ ] New messages animate in individually
[ ] Auto-scroll is smooth, not jarring
[ ] Typing indicator appears smoothly
*/

