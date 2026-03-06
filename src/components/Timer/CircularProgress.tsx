'use client'

import { cn } from '@/lib/utils'

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
  className?: string
  trackColor?: string
  progressColor?: string
}

export function CircularProgress({
  progress,
  size = 200,
  strokeWidth = 3,
  children,
  className,
  trackColor = 'rgba(255, 255, 255, 0.08)',
  progressColor = 'rgba(255, 255, 255, 0.5)'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear animate-breathe"
          style={{
            filter: `drop-shadow(0 0 8px ${progressColor})`
          }}
        />
      </svg>
      {/* Children in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
