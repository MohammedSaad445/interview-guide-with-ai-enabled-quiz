import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuizHistory } from '../context/QuizHistoryContext'
import { getTopicMeta } from '../utils/textFormatter'

function ScoreRing({ score }) {
  const radius       = 54
  const circumference = 2 * Math.PI * radius
  const offset        = circumference - (score / 100) * circumference

  const color = score >= 70 ? 'text-green-500'
              : score >= 40 ? 'text-amber-500'
              : 'text-red-500'

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor"
                strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor"
                strokeWidth="8" strokeDasharray={circumference}
                strokeDashoffset={offset} strokeLinecap="round"
                className={color}
                style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
          {score}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
      </div>
    </div>
  )
}

function VerdictIcon({ verdict }) {
  return verdict === 'correct' ? '✅' : verdict === 'partial' ? '⚠️' : '❌'
}

function ReviewItem({ question, answer, index }) {
  const [open, setOpen] = useState(false)
  const verdict = answer?.verdict ?? 'incorrect'
  const score   = answer?.score   ?? 0

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden
      ${open
        ? 'border-accent/40 dark:border-accent/30 shadow-md'
        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
      }`}>
      <button
        className="w-full flex items-start gap-3 px-5 py-4 text-left
                   hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="shrink-0 mt-0.5 text-base"><VerdictIcon verdict={verdict} /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed line-clamp-2">
            Q{index + 1}. {question.question}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
            ${score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
            {score}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4
                        bg-gray-50/70 dark:bg-gray-700/20 space-y-3">
          {/* User answer */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Your answer
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {answer?.userAnswer || <em className="opacity-60">No answer submitted</em>}
            </p>
          </div>
          {/* AI feedback */}
          {answer?.feedback && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                AI Feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {answer.feedback}
              </p>
            </div>
          )}
          {/* Key points */}
          {question.keyPoints?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Key Points
              </p>
              <ul className="space-y-1">
                {question.keyPoints.map((kp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    {kp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function QuizResults({ questions, answers, score, config, onRetake, onReset }) {
  const { addResult } = useQuizHistory()
  const meta          = getTopicMeta(config?.topic)

  // Persist to session history once on mount
  useEffect(() => {
    addResult({
      topic:      config?.topic,
      section:    config?.section,
      mode:       config?.mode,
      difficulty: config?.difficulty,
      score,
      questions:  questions.map((q, i) => ({
        question:   q.question,
        userAnswer: answers[i]?.userAnswer,
        verdict:    answers[i]?.verdict,
        feedback:   answers[i]?.feedback,
        score:      answers[i]?.score,
      })),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const correct  = answers.filter(a => a.verdict === 'correct').length
  const partial  = answers.filter(a => a.verdict === 'partial').length
  const wrong    = answers.filter(a => a.verdict === 'incorrect').length

  const resultLabel = score >= 80 ? '🎉 Excellent!' : score >= 60 ? '👍 Good job!' : score >= 40 ? '📚 Keep studying' : '💪 Keep practicing'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">

      {/* ── Score summary card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                      dark:border-gray-700 shadow-card p-6 sm:p-8 text-center space-y-5">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {resultLabel}
        </h1>

        <ScoreRing score={score} />

        <p className="text-gray-500 dark:text-gray-400 text-sm">Overall Score</p>

        {/* Quick stat pills */}
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            ✅ {correct} correct
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            ⚠️ {partial} partial
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            ❌ {wrong} incorrect
          </span>
        </div>

        {/* Meta tags */}
        <div className="flex justify-center gap-2 flex-wrap text-xs text-gray-400">
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 capitalize">
            {meta.icon} {config?.topic}
          </span>
          {config?.section && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">{config.section}</span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 capitalize">{config?.mode}</span>
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 capitalize">{config?.difficulty}</span>
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">{questions.length} questions</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRetake}
            className="flex-1 py-2.5 rounded-xl border-2 border-accent text-accent
                       hover:bg-accent hover:text-white font-semibold text-sm transition-all"
          >
            ↺ Retake Quiz
          </button>
          <Link
            to={`/topic/${config?.topic}`}
            className="flex-1 py-2.5 rounded-xl bg-navy dark:bg-gray-700 hover:bg-navy-dark
                       dark:hover:bg-gray-600 text-white font-semibold text-sm transition-all text-center"
          >
            ← Back to {config?.topic?.charAt(0).toUpperCase() + config?.topic?.slice(1)}
          </Link>
          <button
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200
                       dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all"
          >
            🏠 New Quiz
          </button>
        </div>
      </div>

      {/* ── Per-question review ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Question Review
        </h2>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <ReviewItem key={i} question={q} answer={answers[i]} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

