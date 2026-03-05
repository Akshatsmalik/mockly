/**
 * HeroPromoPage - Marketing/Promotional Landing
 * Big hero with staggered card animations and parallax effects.
 * Alternative landing page with more visual emphasis.
 */


import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Zap, Target, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'
import { buttonVariants, slideUpVariants, cardVariants, transition, stagger } from '../lib/motion'
import Navbar from '../components/navbar'

export function HeroPromoPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const featuresRef = useRef(null)
  const isInView = useInView(featuresRef, { once: true, amount: 0.2 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.hero,
        delayChildren: 0.3,
      },
    },
  }

  const features = [
    { icon: Target, title: 'Targeted Practice', desc: 'Focus on your weak areas with AI-powered question selection' },
    { icon: Zap, title: 'Real-time Feedback', desc: 'Get instant analysis of your speech, tone, and answers' },
    { icon: TrendingUp, title: 'Track Progress', desc: 'See your improvement over time with detailed analytics' },
  ]

  return (
    <div ref={containerRef} className="min-h-screen blue-50/50" >
    <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-50">
        <Navbar className="shadow-sm mt-[20px] mb-[30px]" />
    </motion.div>      {/* Hero Section */}
      <section className="relative mb-[70px] pt-10 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
        
        {/* Floating decorative elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute left-[10%] top-[25%]"
        >
          <DecorativeCard1 />
        </motion.div>
        
        <motion.div
          style={{ y: y2 }}
          className="absolute right-[10%] top-[20%]"
        >
          <DecorativeCard2 />
        </motion.div>

        <motion.div
          style={{ y: y1 }}
          className="absolute left-[15%] bottom-[20%]"
        >
          <DecorativeCard3 />
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="absolute right-[15%] bottom-[25%]"
        >
          <DecorativeCard4 />
        </motion.div>

        {/* Center content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={slideUpVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              #1 AI Interview Prep Platform
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div variants={slideUpVariants} className="mb-8">
            <MocklyLogoLarge />
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={slideUpVariants} className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Ace Your Next Interview
            <br />
            <span className="text-brand-500">With AI Coaching</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={slideUpVariants} className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Practice with realistic mock interviews, get instant feedback, and land your dream job with confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={slideUpVariants} className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/interview')}
              className={cn(
                'px-8 py-4 rounded-xl',
                'bg-brand-500 text-white font-semibold text-lg',
                'hover:bg-brand-600 shadow-lg shadow-brand-500/30',
                'flex items-center gap-2',
                'transition-colors duration-200'
              )}
            >
              Start Right Now?
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={slideUpVariants} className="mt-12 flex items-center justify-center gap-6 text-sm text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Free forever plan
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={transition.primary}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ delay: idx * 0.15 }}
                whileHover="hover"
                className="bg-white rounded-2xl p-8 shadow-soft"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={transition.primary}
            className="bg-darkbg rounded-3xl p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to ace your interview?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of successful candidates who prepared with Mockly
            </p>
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/interview')}
              className={cn(
                'px-10 py-4 rounded-xl',
                'bg-white text-darkbg font-semibold text-lg',
                'hover:bg-gray-100',
                'transition-colors duration-200'
              )}
            >
              Get Started 
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MocklyLogo />
            <span className="font-semibold text-gray-900">Mockly.AI</span>
          </div>
          <p className="text-sm text-muted">© 2025 Mockly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function DecorativeCard1() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -12, x: -50 }}
      animate={{ opacity: 1, rotate: -6, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="w-52 bg-amber-100 rounded-xl p-4 shadow-card transform -rotate-6"
    >
      <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-red-500 shadow-md" />
      <p className="text-xs text-gray-700">
        "Finally understood how to structure my answers. Game changer!"
      </p>
      <div className="mt-3 flex items-center gap-1">
        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />)}
      </div>
    </motion.div>
  )
}

function DecorativeCard2() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 12, x: 50 }}
      animate={{ opacity: 1, rotate: 6, x: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-48 bg-green-50 rounded-xl p-4 shadow-card transform rotate-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="font-medium text-gray-800 text-sm">Interview Passed!</span>
      </div>
      <p className="text-xs text-gray-600">Score: 92/100</p>
    </motion.div>
  )
}

function DecorativeCard3() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="w-56 bg-blue-50 rounded-xl p-4 shadow-card"
    >
      <p className="text-xs text-blue-600 font-medium mb-2">Progress This Week</p>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ delay: 1, duration: 0.8 }}
          className="h-full bg-blue-500 rounded-full" 
        />
      </div>
      <p className="text-right text-xs text-blue-600 mt-1">+75%</p>
    </motion.div>
  )
}

function DecorativeCard4() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="w-44 bg-purple-50 rounded-xl p-4 shadow-card"
    >
      <p className="text-xs text-purple-600 font-medium mb-2">Sessions Completed</p>
      <p className="text-2xl font-bold text-purple-700">24</p>
      <p className="text-xs text-purple-500">This month</p>
    </motion.div>
  )
}

function MocklyLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#393939"/>
      <circle cx="14" cy="16" r="3" fill="white"/>
      <circle cx="26" cy="16" r="3" fill="white"/>
      <path d="M14 26 Q20 30 26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="28" cy="12" rx="4" ry="3" fill="#393939" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

function MocklyLogoLarge() {
  return (
    <svg width="80" height="80" viewBox="0 0 40 40" fill="none" className="mx-auto">
      <circle cx="20" cy="20" r="18" fill="#393939"/>
      <circle cx="14" cy="16" r="3" fill="white"/>
      <circle cx="26" cy="16" r="3" fill="white"/>
      <path d="M14 26 Q20 30 26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="28" cy="12" rx="4" ry="3" fill="#393939" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default HeroPromoPage

/*
ACCESSIBILITY NOTES:
- Semantic section structure
- Skip link could be added
- All CTAs are keyboard accessible
- Color contrast meets WCAG standards

PERFORMANCE NOTES:
- Parallax uses useTransform (GPU accelerated)
- useInView triggers animations only when visible
- Decorative elements don't block interaction

ANIMATION TEST CHECKLIST:
[ ] Header fades with scroll
[ ] Decorative cards slide in with stagger
[ ] Parallax effect on scroll
[ ] Features cards reveal on scroll
[ ] CTA section scales in
[ ] Progress bar animates
*/

