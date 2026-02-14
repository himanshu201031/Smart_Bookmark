'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import IntroAnimation from '@/components/ui/scroll-morph-hero'
import { GetStartedButton } from '@/components/ui/get-started-button'
import Preloader from '@/components/ui/Preloader'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  if (loading) {
    return <Preloader />
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Hero Section - Full Screen */}
      <div className="relative h-full w-full">
        <IntroAnimation />

        {/* Get Started Button Overlay - Below "SCROLL TO EXPLORE" text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="absolute top-[55%] left-1/2 z-20 -translate-x-1/2"
        >
          <GetStartedButton onClick={handleGoogleLogin} />
        </motion.div>
      </div>
    </div>
  )
}
