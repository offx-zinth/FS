'use client'

import { useEffect, useMemo, useState } from 'react'

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your focus determines your reality.", author: "George Lucas" },
  { text: "Concentrate all your thoughts upon the work in hand.", author: "Alexander Graham Bell" },
  { text: "The successful warrior is the average person with laser-like focus.", author: "Bruce Lee" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "You can do anything, but not everything.", author: "David Allen" },
  { text: "Lack of direction, not lack of time, is the problem.", author: "Zig Ziglar" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "The key is not to prioritize your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Do the difficult things while they are easy.", author: "Lao Tzu" },
]

// Get a random quote based on the current minute to change every 5 minutes
function getQuoteForCurrentTime() {
  const fiveMinuteIndex = Math.floor(Date.now() / (5 * 60 * 1000))
  return quotes[fiveMinuteIndex % quotes.length]
}

export function Quote() {
  const [bucket, setBucket] = useState(() => Math.floor(Date.now() / (5 * 60 * 1000)))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBucket(Math.floor(Date.now() / (5 * 60 * 1000)))
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const quote = useMemo(() => quotes[bucket % quotes.length], [bucket])

  return (
    <div className="text-center max-w-md">
      <p className="text-white/50 text-sm italic font-light leading-relaxed">
        "{quote.text}"
      </p>
      <p className="text-white/30 text-xs mt-2">— {quote.author}</p>
    </div>
  )
}
