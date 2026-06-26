import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useQuizHistory } from '../context/QuizHistoryContext'
import QuizHistory from './QuizHistory'

const TOPICS = ['Java', 'DevOps', 'Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Git']

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}
function SearchIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function Navbar() {
  const { dark, toggle }        = useTheme()
  const { avgScore }            = useQuizHistory()
  const [q, setQ]               = useState('')
  const [mobileOpen, setMobile] = useState(false)
  const [historyOpen, setHistory] = useState(false)
  const navigate                = useNavigate()
  const location                = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); setQ(''); setMobile(false) }
  }

  const isActive      = (slug) => location.pathname.startsWith(`/topic/${slug.toLowerCase()}`)
  const isQuizActive  = location.pathname.startsWith('/quiz')

  return (
    <>
      <nav className="bg-navy dark:bg-navy-dark border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shadow-sm">
                IG
              </div>
              <span className="text-white font-bold text-lg hidden sm:block tracking-tight">
                Interview <span className="text-accent-light">Guide</span>
              </span>
            </Link>

            {/* ── Desktop topic links ── */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1">
              {TOPICS.map(t => (
                <Link
                  key={t}
                  to={`/topic/${t.toLowerCase()}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(t.toLowerCase())
                      ? 'bg-white/15 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {t}
                </Link>
              ))}

              {/* ── Quiz link ── */}
              <Link
                to="/quiz"
                className={`ml-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isQuizActive
                    ? 'bg-accent/30 text-white'
                    : 'text-accent-light hover:text-white hover:bg-white/10'
                  }`}
              >
                🧠 Quiz
              </Link>
            </div>

            {/* ── Search ── */}
            <form onSubmit={handleSearch} className="hidden md:block ml-auto">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search Q&As…"
                  className="bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg
                             pl-9 pr-4 py-1.5 text-sm w-44 focus:w-60 focus:outline-none focus:border-accent
                             transition-all duration-200"
                />
              </div>
            </form>

            {/* ── Score History button ── */}
            <button
              onClick={() => setHistory(true)}
              className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10
                         transition-colors shrink-0"
              title="Quiz History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {avgScore !== null && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full
                                 bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {avgScore}
                </span>
              )}
            </button>

            {/* ── Dark mode ── */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobile(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {/* ── Mobile drawer ── */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-white/10 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-1">
                {TOPICS.map(t => (
                  <Link
                    key={t}
                    to={`/topic/${t.toLowerCase()}`}
                    onClick={() => setMobile(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive(t.toLowerCase())
                        ? 'bg-white/15 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {t}
                  </Link>
                ))}
                {/* Quiz link in mobile */}
                <Link
                  to="/quiz"
                  onClick={() => setMobile(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors col-span-2
                    ${isQuizActive
                      ? 'bg-accent/30 text-white'
                      : 'text-accent-light hover:text-white hover:bg-white/10'
                    }`}
                >
                  🧠 Take a Quiz
                </Link>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search Q&As…"
                  className="flex-1 bg-white/10 text-white placeholder-gray-400 border border-white/20
                             rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-light transition-colors">
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* ── Quiz History slide-in drawer ── */}
      <QuizHistory isOpen={historyOpen} onClose={() => setHistory(false)} />
    </>
  )
}
