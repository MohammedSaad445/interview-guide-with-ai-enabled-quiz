import { useState, useEffect, useRef, useCallback } from 'react'

// ── Config ───────────────────────────────────────────────────────────────────
const MODES = [
  { key: 'focus',  label: 'Focus',       tab: 'Focus',  minutes: 25, color: '#6366f1', emoji: '🎯' },
  { key: 'short',  label: 'Short Break', tab: 'Short',  minutes: 5,  color: '#10b981', emoji: '☕' },
  { key: 'long',   label: 'Long Break',  tab: 'Long',   minutes: 15, color: '#f59e0b', emoji: '🛋️' },
]

const RING_R  = 62           // radius of the main countdown ring
const RING_C  = 2 * Math.PI * RING_R
const FAB_R   = 21           // radius of the tiny FAB ring
const FAB_C   = 2 * Math.PI * FAB_R

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }

function requestNotification(title, body) {
  if ('Notification' in globalThis && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

// ── Icons ────────────────────────────────────────────────────────────────────
function PlayIcon()  {
  return <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
}
function PauseIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
}
function ResetIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0
           0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  )
}
function SkipIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  )
}

function TipBar({ modeIdx, minutes, sessions }) {
  if (modeIdx === 1) return (
    <div className="text-center text-xs text-gray-500 bg-white/5 rounded-xl py-2.5 px-3 leading-relaxed">
      Quick break — stretch, breathe, hydrate ☕
    </div>
  )
  if (modeIdx === 2) return (
    <div className="text-center text-xs text-gray-500 bg-white/5 rounded-xl py-2.5 px-3 leading-relaxed">
      Long break — you earned it, rest well 🛋️
    </div>
  )
  const remaining = 4 - (sessions % 4)
  const sessionsLabel = remaining === 1 ? 'session' : 'sessions'
  return (
    <div className="text-center text-xs text-gray-500 bg-white/5 rounded-xl py-2.5 px-3 leading-relaxed">
      {`Stay focused for ${minutes} min · ${remaining} ${sessionsLabel} until long break`}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PomodoroTimer() {
  const [open,        setOpen]        = useState(false)
  const [modeIdx,     setModeIdx]     = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60)
  const [running,     setRunning]     = useState(false)
  const [sessions,    setSessions]    = useState(0)
  const [finished,    setFinished]    = useState(false)  // flash when done

  const intervalRef = useRef(null)
  const modeIdxRef  = useRef(modeIdx)   // stable ref so interval closure sees current mode
  useEffect(() => { modeIdxRef.current = modeIdx }, [modeIdx])

  const mode         = MODES[modeIdx]
  const totalSeconds = mode.minutes * 60
  const progress     = secondsLeft / totalSeconds  // 1 → 0
  const dashOffset   = RING_C * (1 - progress)    // 0 → RING_C  (arc shrinks as time passes)
  const mins         = pad(Math.floor(secondsLeft / 60))
  const secs         = pad(secondsLeft % 60)

  // ── Tick ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }

    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s > 1) return s - 1
        clearInterval(intervalRef.current)
        const wasFocus = modeIdxRef.current === 0
        setRunning(false)
        setFinished(true)
        if (wasFocus) setSessions(n => n + 1)
        const title = wasFocus ? '🎉 Focus session done!' : '⏰ Break over!'
        const body  = wasFocus ? 'Time for a break.' : 'Back to focusing!'
        requestNotification(title, body)
        return 0
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running])

  // Clear the "finished" flash after 2 s
  useEffect(() => {
    if (!finished) return
    const t = setTimeout(() => setFinished(false), 2000)
    return () => clearTimeout(t)
  }, [finished])
  useEffect(() => {
    if (running) document.title = `${mins}:${secs} ${mode.emoji} — Interview Guide`
    else         document.title = 'Interview Guide'
    return () => { document.title = 'Interview Guide' }
  }, [running, mins, secs, mode.emoji])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecondsLeft(MODES[modeIdx].minutes * 60)
  }, [modeIdx])

  const switchMode = useCallback((idx) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIdx(idx)
    setSecondsLeft(MODES[idx].minutes * 60)
  }, [])

  const toggleRunning = () => {
    if (secondsLeft === 0) { reset(); return }
    if (!running && 'Notification' in globalThis && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setRunning(r => !r)
  }

  // ── FAB mini-ring ───────────────────────────────────────────────────────────
  const fabDashOffset = FAB_C * (1 - progress)

  return (
    <>
      {/* ── Floating panel ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-72 rounded-2xl shadow-2xl border border-white/10
                    bg-[#0f172a] text-white overflow-hidden
                    transition-all duration-300 ease-out origin-bottom-right
                    ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="font-semibold text-sm flex items-center gap-2">
            🍅 <span>Pomodoro Timer</span>
          </span>
          <div className="flex items-center gap-2">
            {sessions > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                {sessions} session{sessions === 1 ? '' : 's'}
              </span>
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Minimize"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-2.5 bg-white/5">
          {MODES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => switchMode(i)}
              className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium transition-all duration-150 whitespace-nowrap ${
                modeIdx === i
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              style={modeIdx === i ? { backgroundColor: m.color + '33', color: m.color } : {}}
            >
              <span>{m.emoji}</span>
              <span>{m.tab}</span>
            </button>
          ))}
        </div>

        {/* Countdown ring */}
        <div className="flex flex-col items-center pt-6 pb-4 gap-5">
          <div className="relative select-none">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Track ring */}
              <circle cx="80" cy="80" r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              {/* Progress arc */}
              <circle
                cx="80" cy="80" r={RING_R}
                fill="none"
                stroke={finished ? '#22c55e' : mode.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 80 80)"
                style={{ transition: running ? 'stroke-dashoffset 1s linear, stroke 0.4s' : 'stroke 0.4s' }}
              />
            </svg>
            {/* Time display — sits well inside the ring's inner diameter (~116 px) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-[1.85rem] font-bold font-mono leading-none tracking-tight">
                {mins}:{secs}
              </span>
              <span
                className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: mode.color + '28', color: mode.color }}
              >
                {finished ? '✓ Done!' : mode.label}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Reset */}
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center
                         text-gray-400 hover:text-white transition-all duration-150"
              title="Reset"
            >
              <ResetIcon />
            </button>

            {/* Play / Pause */}
            <button
              onClick={toggleRunning}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl
                         hover:opacity-90 active:scale-95 transition-all duration-150 text-white"
              style={{ backgroundColor: mode.color }}
              title={running ? 'Pause' : 'Start'}
            >
              {running ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Skip to next mode */}
            <button
              onClick={() => switchMode((modeIdx + 1) % MODES.length)}
              className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center
                         text-gray-400 hover:text-white transition-all duration-150"
              title="Skip to next"
            >
              <SkipIcon />
            </button>
          </div>
        </div>

        {/* Tip bar */}
        <div className="px-4 pb-4">
          <TipBar modeIdx={modeIdx} minutes={mode.minutes} sessions={sessions} />
        </div>

        {/* Session dots */}
        {sessions > 0 && (
          <div className="px-4 pb-4 flex items-center gap-1.5 justify-center">
            {Array.from({ length: Math.min(sessions, 12) }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: n % 4 === 0 ? '#f59e0b' : '#6366f1', opacity: 0.8 }}
                title={`Session ${n}`}
              />
            ))}
            {sessions > 12 && <span className="text-xs text-gray-500 ml-1">+{sessions - 12}</span>}
          </div>
        )}
      </div>

      {/* ── FAB button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl
                    flex items-center justify-center
                    hover:scale-110 active:scale-95 transition-transform duration-150
                    border border-white/10 bg-[#0f172a]`}
        title="Pomodoro Timer"
      >
        {/* Mini arc progress ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r={FAB_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="28" cy="28" r={FAB_R}
            fill="none"
            stroke={mode.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={FAB_C}
            strokeDashoffset={running ? fabDashOffset : FAB_C}
            style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s' }}
          />
        </svg>
        <span className="text-xl relative z-10 select-none">{running ? mode.emoji : '🍅'}</span>
      </button>
    </>
  )
}









