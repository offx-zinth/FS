# FocusSpace - Production-Grade Aesthetic Productivity App

## Project Overview

Built a comprehensive, production-ready aesthetic productivity application inspired by Flocus, LifeAt, and lo-fi study environments. The application creates a calm immersive digital focus workspace combining timers, ambient environments, task management, and analytics.

## Core Features

### 1. Handwritten Clock
- "Just Another Hand" font for handwritten aesthetic
- 12h/24h toggle
- Optional date and seconds display
- Slow glow animation for calm atmosphere

### 2. Pomodoro Focus Timer
- Customizable durations (Focus/Break/Long Break)
- Start/Pause/Reset controls
- Auto session transitions
- Desktop notifications
- Circular progress animation
- Click clock to toggle timer view

### 3. Scene System
- 6 preset immersive environments:
  - LoFi Garden (🌸)
  - Rainy Cafe (☕)
  - Forest Cabin (🌲)
  - Night City (🌃)
  - Anime Study Room (📚)
  - Minimal (✨)
- Each scene includes background + sound presets
- Custom scene creation support

### 4. Ambient Sound Mixer
- 7 ambient sounds with volume sliders:
  - Rain, Wind, Forest, Fireplace, Cafe, Keyboard, LoFi
- Multiple sounds simultaneously
- Web Audio API integration
- Fallback generated sounds

### 5. Enhanced Task System
- Add/Delete/Complete tasks
- Priority tags (Low/Medium/High)
- Estimated focus sessions
- Session progress tracking
- Active task display

### 6. Session Analytics
- Daily focus time tracking
- Weekly bar chart visualization
- Focus streak counter
- Total focus time accumulation

### 7. Focus Modes
- **Deep Work Mode**: Minimal UI, only settings
- **Study Mode**: Full features (Tasks + Timer + Stats)
- **Chill Mode**: Clock + Ambience only

### 8. Keyboard Shortcuts
- Space: Start/Pause timer
- N: New task
- S: Toggle sounds panel
- F: Fullscreen
- R: Reset timer

### 9. Background Engine
- Support for images (JPG, PNG, WEBP)
- Support for videos (MP4, WEBM)
- Auto loop and muted playback
- GPU efficient rendering
- Heavy blur + dim overlay for focus

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS with custom animations
- **State Management**: Zustand with persistence
- **Audio**: Web Audio API
- **Fonts**: Just Another Hand (clock), Geist Sans (UI)
- **Icons**: Lucide React

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main application
│   └── globals.css         # Custom styles & animations
├── components/
│   ├── Background/
│   │   └── BackgroundManager.tsx
│   ├── Clock/
│   │   └── HandwrittenClock.tsx
│   ├── Scenes/
│   │   └── SceneSelector.tsx
│   ├── Settings/
│   │   └── SettingsPanel.tsx
│   ├── Sounds/
│   │   └── SoundMixer.tsx
│   ├── Stats/
│   │   └── StatsPanel.tsx
│   ├── Tasks/
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   └── Timer/
│       ├── CircularProgress.tsx
│       └── PomodoroTimer.tsx
├── hooks/
│   └── useKeyboardShortcuts.ts
├── stores/
│   └── index.ts            # Zustand stores
└── lib/
    └── utils.ts

public/
├── backgrounds/
│   ├── study-room.png
│   ├── garden.png
│   ├── clouds.png
│   └── cafe.png
└── sounds/                  # Ambient sound files
```

## Design Philosophy

"A calm digital study space that feels like entering a peaceful digital study room."

Key principles:
- Minimal and distraction-free
- Elegant and relaxing UI
- Glassmorphism effects
- Soft gradients and animations
- Calm color palette (deep blue, indigo, purple)
