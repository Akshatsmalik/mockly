/**
 * Sidebar Component
 * Dark sidebar with navigation icons, new chat button, and recent items.
 * Uses slide-in animation and hover state transitions.
 */
import { motion } from 'framer-motion'
import { 
  PenSquare, 
  Search, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { cn } from '../lib/utils'
import { sidebarVariants, listContainerVariants, listItemVariants, buttonVariants } from '../lib/motion'

// Navigation items
const navItems = [
  { icon: PenSquare, label: 'New Chat', active: true, primary: true },
  { icon: Search, label: 'Search Chat' },
  { icon: MessageSquare, label: 'Results' },
]

const bottomItems = [
  { icon: HelpCircle, label: 'Help' },
  { icon: Settings, label: 'Settings' },
  { icon: LogOut, label: 'Sign out' },
]

export function Sidebar({ 
  recentItems = [], 
  onNewChat, 
  onNavigate,
  className 
}) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'w-72 h-screen bg-darkbg flex flex-col',
        'fixed left-0 top-0 z-40',
        className
      )}
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <MocklyLogo />
        <span className="text-white text-xl font-semibold tracking-tight">
          Mockly.AI
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 flex-1">
        <motion.ul 
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {navItems.map((item) => (
            <motion.li key={item.label} variants={listItemVariants}>
              <NavButton 
                icon={item.icon} 
                label={item.label} 
                active={item.active}
                primary={item.primary}
                onClick={() => item.primary ? onNewChat?.() : onNavigate?.(item.label)}
              />
            </motion.li>
          ))}
        </motion.ul>

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <div className="mt-6">
            <span className="px-3 text-xs font-medium text-muted uppercase tracking-wider">
              Recent
            </span>
            <motion.ul 
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="mt-2 space-y-1"
            >
              {recentItems.map((item, idx) => (
                <motion.li key={idx} variants={listItemVariants}>
                  <RecentItem 
                    title={item.title} 
                    onClick={() => onNavigate?.(item)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <NavButton 
              key={item.label}
              icon={item.icon} 
              label={item.label}
              onClick={() => onNavigate?.(item.label)}
            />
          ))}
        </ul>
      </div>
    </motion.aside>
  )
}

// Sub-components
function NavButton({ icon: Icon, label, active, primary, onClick }) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
        'text-sm font-medium transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        primary 
          ? 'bg-white/10 text-white hover:bg-white/15' 
          : active 
            ? 'bg-white/5 text-white' 
            : 'text-white/70 hover:text-white hover:bg-white/5'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" strokeWidth={1.5} />
      <span>{label}</span>
    </motion.button>
  )
}

function RecentItem({ title, onClick }) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2.5 rounded-lg',
        'text-sm text-white/70 hover:text-white hover:bg-white/5',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'truncate'
      )}
    >
      {title}
    </motion.button>
  )
}

function MocklyLogo() {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" fill="white"/>
      <circle cx="14" cy="16" r="3" fill="#393939"/>
      <circle cx="26" cy="16" r="3" fill="#393939"/>
      <path 
        d="M14 26 Q20 30 26 26" 
        stroke="#393939" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="28" cy="12" rx="4" ry="3" fill="#393939"/>
    </svg>
  )
}

export default Sidebar

/*
ACCESSIBILITY NOTES:
- Uses aria-current for active navigation state
- All interactive elements are keyboard focusable
- Focus visible ring for keyboard navigation
- Screen reader friendly labels

PERFORMANCE NOTES:
- Motion variants defined outside component (no re-creation)
- Conditional rendering for recent items
- CSS transitions for color changes (hardware accelerated)

ANIMATION TEST CHECKLIST:
[ ] Sidebar slides in from left on mount
[ ] Nav items stagger in with fade/slide
[ ] Hover states on buttons scale up smoothly
[ ] Tap states provide instant feedback
[ ] Recent items animate independently
*/

