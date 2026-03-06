'use client'

import { useSettingsStore } from '@/stores'
import { cn } from '@/lib/utils'

interface BackgroundManagerProps {
  className?: string
}

export function BackgroundManager({ className }: BackgroundManagerProps) {
  const { backgroundUrl, backgroundType } = useSettingsStore()

  // Soft gradient background (default)
  const defaultGradient = `
    radial-gradient(circle at 30% 20%, rgba(76, 76, 143, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(28, 31, 74, 0.5) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.2) 0%, transparent 60%),
    radial-gradient(ellipse at center, #4c4c8f 0%, #1c1f4a 40%, #0b0e2a 100%)
  `

  // Custom background with subtle blur - visible but not distracting
  if ((backgroundType === 'image' || backgroundType === 'video') && backgroundUrl) {
    return (
      <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
        {/* Background media */}
        {backgroundType === 'video' ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              filter: 'blur(2px) brightness(0.7)',
            }}
          >
            <source src={backgroundUrl} type="video/mp4" />
            <source src={backgroundUrl} type="video/webm" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backgroundUrl})`,
              filter: 'blur(2px) brightness(0.7)',
            }}
          />
        )}
        
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Subtle gradient overlay for calm atmosphere */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 0%, rgba(11, 14, 42, 0.4) 100%)
            `
          }}
        />
      </div>
    )
  }

  // Default soft gradient background
  return (
    <div className={cn("fixed inset-0 -z-10", className)}>
      {/* Main gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: defaultGradient }}
      />
      
      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden animate-float-gradient">
        {/* Top left orb */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(100, 100, 180, 0.4) 0%, transparent 70%)',
            animation: 'floatGradient 25s ease-in-out infinite'
          }}
        />
        
        {/* Bottom right orb */}
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(75, 0, 130, 0.3) 0%, transparent 70%)',
            animation: 'floatGradient 30s ease-in-out infinite reverse'
          }}
        />
        
        {/* Center subtle orb */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 rounded-full opacity-10"
          style={{ 
            background: 'radial-gradient(circle, rgba(147, 112, 219, 0.2) 0%, transparent 70%)',
            animation: 'floatGradient 35s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  )
}
