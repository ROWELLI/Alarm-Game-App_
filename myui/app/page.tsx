"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/alarms")
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#3B9AE8] flex items-center justify-center">
      <div className="text-white">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Alarm clock icon */}
          <circle cx="60" cy="65" r="40" stroke="white" strokeWidth="4" fill="none" />
          <circle cx="60" cy="65" r="35" stroke="white" strokeWidth="2" fill="none" />
          {/* Clock hands */}
          <line x1="60" y1="65" x2="60" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="65" x2="75" y2="65" stroke="white" strokeWidth="3" strokeLinecap="round" />
          {/* Alarm bells */}
          <circle cx="30" cy="35" r="12" stroke="white" strokeWidth="3" fill="none" />
          <circle cx="90" cy="35" r="12" stroke="white" strokeWidth="3" fill="none" />
          {/* Bell connectors */}
          <line x1="38" y1="43" x2="50" y2="55" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="82" y1="43" x2="70" y2="55" stroke="white" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="35" y1="95" x2="25" y2="110" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="85" y1="95" x2="95" y2="110" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
