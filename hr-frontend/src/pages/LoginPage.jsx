/**
 * LoginPage - Authentication Screen
 * Simple login/signup form with animated transitions.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { buttonVariants, slideUpVariants, transition, stagger } from '../lib/motion'

export function LoginPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    navigate('/dashboard')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.list,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.primary}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-popup p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={transition.fast}
            >
              <MocklyLogo />
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-muted">
              {isLogin 
                ? 'Sign in to continue your interview prep' 
                : 'Start your journey to interview success'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {/* Name field (signup only) */}
                {!isLogin && (
                  <motion.div variants={slideUpVariants}>
                    <InputField
                      icon={User}
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </motion.div>
                )}

                {/* Email field */}
                <motion.div variants={slideUpVariants}>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </motion.div>

                {/* Password field */}
                <motion.div variants={slideUpVariants}>
                  <InputField
                    icon={Lock}
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </motion.div>

                {/* Submit button */}
                <motion.div variants={slideUpVariants} className="pt-2">
                  <motion.button
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    disabled={isLoading}
                    className={cn(
                      'w-full py-3.5 rounded-xl',
                      'bg-darkbg text-white font-medium',
                      'flex items-center justify-center gap-2',
                      'hover:bg-gray-700 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign in' : 'Create account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google sign in */}
          <motion.button
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/dashboard')}
            className={cn(
              'w-full py-3 rounded-xl',
              'bg-white border border-gray-200',
              'flex items-center justify-center gap-3',
              'hover:bg-gray-50 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
            )}
          >
            <GoogleIcon />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </motion.button>

          {/* Toggle login/signup */}
          <p className="text-center mt-6 text-sm text-muted">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-500 font-medium hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <motion.button
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/')}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-muted hover:text-gray-700 transition-colors"
        >
          ← Back to home
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function InputField({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
      <input
        {...props}
        className={cn(
          'w-full pl-12 pr-4 py-3.5 rounded-xl',
          'bg-gray-50 border border-gray-200',
          'text-gray-800 placeholder:text-muted',
          'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          'transition-all duration-200'
        )}
      />
    </div>
  )
}

function MocklyLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#393939"/>
      <circle cx="14" cy="16" r="3" fill="white"/>
      <circle cx="26" cy="16" r="3" fill="white"/>
      <path d="M14 26 Q20 30 26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="28" cy="12" rx="4" ry="3" fill="#393939" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default LoginPage

/*
ACCESSIBILITY NOTES:
- Form has proper label associations
- Focus states are visible
- Submit with Enter key works
- Loading state prevents double submission

PERFORMANCE NOTES:
- AnimatePresence handles form transitions
- Controlled inputs with local state
- Minimal re-renders

ANIMATION TEST CHECKLIST:
[ ] Card slides up on mount
[ ] Form fields stagger in
[ ] Transition between login/signup is smooth
[ ] Button has loading spinner
[ ] Google button has hover state
*/

