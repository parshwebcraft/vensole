'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setProgress((window.scrollY / totalScroll) * 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Run once on mount
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-rose-600 via-orange-500 to-yellow-500 z-[100] transition-all duration-75 ease-out origin-left pointer-events-none"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  )
}
