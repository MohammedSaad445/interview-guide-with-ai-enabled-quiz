import { useState, useEffect } from 'react'
import { useIndex, useTopic } from '../hooks/useTopicData'
import { getTopicMeta } from '../utils/textFormatter'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const MODES = [
  { value: 'mcq',      label: '📋 MCQ',       desc: 'Multiple choice questions' },
  { value: 'freetext', label: '✍️ Free Text',  desc: 'Open-ended written answers' },
]

export default function QuizSetup({ prefilledTopic, onStart, error }) {
  const { data: topics, loading: topicsLoading } = useIndex()

  const [selectedTopic,   setSelectedTopic]   = useState(prefilledTopic || '')
  const [selectedSection, setSelectedSection] = useState('')
  const [difficulty,      setDifficulty]      = useState('medium')
  const [questionCount,   setQuestionCount]   = useState(10)
  const [mode,            setMode]            = useState('mcq')

  const { data: topicData } = useTopic(selectedTopic)

  // Pre-fill topic when arriving via /quiz/:topicSlug
  useEffect(() => {
    if (prefilledTopic) {
      setSelectedTopic(prefilledTopic)
      setSelectedSection('')
    }
  }, [prefilledTopic])

  // Reset section when topic changes
  useEffect(() => { setSelectedSection('') }, [selectedTopic])

  const meta     = getTopicMeta(selectedTopic)
  const sections = topicData?.sections ?? []
  const canStart = !!selectedTopic

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canStart) return
    onStart({
      topic:         selectedTopic,
      section:       selectedSection || null,
      questionCount,
      difficulty,
      mode,
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                        bg-accent/10 dark:bg-accent/20 mb-4">
          <span className="text-3xl">🧠</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Test Your Knowledge
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          AI-Powered · Choose your topic and let AI quiz you
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <span className="font-semibold">⚠️ Error: </span>{error}
        </div>
      )}

      <form onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                       dark:border-gray-700 shadow-card p-6 sm:p-8 space-y-7">

        {/* ── Topic ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Topic <span className="text-red-400">*</span>
          </label>
          {topicsLoading ? (
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <div className="relative">
              {selectedTopic && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                  {meta.icon}
                </span>
              )}
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                            py-2.5 pr-4 focus:outline-none focus:ring-2 focus:ring-accent
                            focus:border-transparent appearance-none cursor-pointer
                            ${selectedTopic ? 'pl-9' : 'pl-4'}`}
                required
              >
                <option value="">Select a topic…</option>
                {topics?.map(t => (
                  <option key={t.slug} value={t.slug}>
                    {t.topicName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Section (optional) ── */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Section
            <span className="ml-1.5 text-xs font-normal text-gray-400">(optional – leave blank for full topic)</span>
          </label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            disabled={!selectedTopic || sections.length === 0}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                       px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent
                       focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                       appearance-none cursor-pointer"
          >
            <option value="">All sections</option>
            {sections.map(s => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* ── Difficulty ── */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border capitalize transition-all
                  ${difficulty === d
                    ? d === 'easy'   ? 'bg-green-500 border-green-500 text-white shadow-sm'
                    : d === 'medium' ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    :                  'bg-red-500   border-red-500   text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                  }`}
              >
                {d === 'easy' ? '😊 Easy' : d === 'medium' ? '🤔 Medium' : '🔥 Hard'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Question Count ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Number of Questions
            </label>
            <span className="text-sm font-bold text-accent tabular-nums">{questionCount}</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5</span><span>20</span>
          </div>
        </div>

        {/* ── Mode ── */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quiz Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`p-3 rounded-xl border text-left transition-all
                  ${mode === m.value
                    ? 'border-accent bg-accent/5 dark:bg-accent/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className={`text-sm font-semibold mb-0.5 ${mode === m.value ? 'text-accent' : 'text-gray-800 dark:text-gray-200'}`}>
                  {m.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!canStart}
          className="w-full py-3 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50
                     disabled:cursor-not-allowed text-white font-bold text-sm transition-all
                     shadow-lg hover:shadow-xl"
        >
          🚀 Start Quiz
        </button>
      </form>
    </div>
  )
}

