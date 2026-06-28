import { useState } from 'react'
import { evaluateAnswer } from '../api/quizApi'

function VerdictBadge({ verdict, score }) {
  const cfg = {
    correct:   { icon: '✅', label: 'Correct',          cls: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300' },
    partial:   { icon: '⚠️', label: 'Partially Correct', cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300' },
    incorrect: { icon: '❌', label: 'Incorrect',         cls: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300'   },
  }[verdict?.toLowerCase()] ?? { icon: '🤔', label: verdict, cls: 'bg-gray-100 text-gray-700' }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.cls}`}>
        {cfg.icon} {cfg.label}
      </span>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
        ${score >= 70 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
          : score >= 40 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
          : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
        {score}/100
      </span>
    </div>
  )
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  mode,
  onAnswer,
  onNext,
}) {
  const [selectedOption, setSelectedOption] = useState(null)  // MCQ: 0–3
  const [textAnswer,     setTextAnswer]     = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [feedback,       setFeedback]       = useState(null)   // EvaluateResponse
  const [evalError,      setEvalError]      = useState(null)

  const isMcq      = mode === 'mcq'
  const isAnswered = feedback !== null
  const canSubmit  = isMcq ? selectedOption !== null : textAnswer.trim().length > 0

  const progress = ((questionNumber - 1) / totalQuestions) * 100

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    const userAnswer = isMcq ? question.options[selectedOption] : textAnswer.trim()

    setSubmitting(true)
    setEvalError(null)
    try {
      const result = await evaluateAnswer({
        question:   question.question,
        keyPoints:  question.keyPoints,
        userAnswer,
      })
      setFeedback(result)
      onAnswer({ userAnswer, ...result })
    } catch (e) {
      setEvalError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Progress bar ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-semibold">Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                      dark:border-gray-700 shadow-card p-6 sm:p-8 space-y-6">

        {/* Question text */}
        <div className="flex gap-3">
          <span className="shrink-0 w-8 h-8 rounded-xl bg-accent text-white text-sm font-bold
                           flex items-center justify-center shadow-sm">{questionNumber}</span>
          <p className="text-gray-900 dark:text-white font-semibold text-base leading-relaxed pt-1">
            {question.question}
          </p>
        </div>

        {/* ── MCQ Options ── */}
        {isMcq && (
          <div className="space-y-2.5">
            {question.options?.map((opt, idx) => {
              let optStyle = 'border-gray-200 dark:border-gray-600 hover:border-accent/50 dark:hover:border-accent/40'
              if (isAnswered) {
                if (idx === question.correctIndex)
                  optStyle = 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500'
                else if (idx === selectedOption && idx !== question.correctIndex)
                  optStyle = 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                else
                  optStyle = 'border-gray-200 dark:border-gray-600 opacity-60'
              } else if (selectedOption === idx) {
                optStyle = 'border-accent bg-accent/5 dark:bg-accent/10'
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left
                              transition-all disabled:cursor-default ${optStyle}`}
                >
                  <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                                   text-xs font-bold mt-0.5 transition-colors
                    ${isAnswered && idx === question.correctIndex
                        ? 'border-green-500 bg-green-500 text-white'
                        : isAnswered && idx === selectedOption
                        ? 'border-red-500 bg-red-500 text-white'
                        : selectedOption === idx
                        ? 'border-accent bg-accent text-white'
                        : 'border-gray-300 dark:border-gray-500 text-gray-400'
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Free Text Input ── */}
        {!isMcq && (
          <div className="space-y-2">
            <textarea
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              disabled={isAnswered}
              rows={5}
              placeholder="Type your answer here…"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent
                         focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed
                         placeholder-gray-400 leading-relaxed"
            />
            <p className="text-xs text-gray-400 text-right">{textAnswer.length} chars</p>
          </div>
        )}

        {/* ── Submit / Eval error ── */}
        {!isAnswered && (
          <>
            {evalError && (
              <p className="text-sm text-red-500 dark:text-red-400">⚠️ {evalError} — please try again.</p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-bold text-sm transition-all
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating…
                </>
              ) : (
                'Submit Answer'
              )}
            </button>
          </>
        )}

        {/* ── AI Feedback Panel ── */}
        {isAnswered && feedback && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-700/30 p-4 space-y-3 animate-fade-in">
            <VerdictBadge verdict={feedback.verdict} score={feedback.score} />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {feedback.feedback}
            </p>
            {isMcq && question.correctIndex != null && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">Correct answer: </span>
                {question.options[question.correctIndex]}
              </p>
            )}
          </div>
        )}

        {/* ── Next Question button — always visible, disabled until answered ── */}
        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered}
          className="w-full py-3 rounded-xl bg-navy dark:bg-gray-700 hover:bg-navy-dark
                     dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed
                     text-white font-bold text-sm transition-all
                     flex items-center justify-center gap-2"
        >
          {questionNumber < totalQuestions ? (
            <>Next Question <span>→</span></>
          ) : (
            <>View Results 🎉</>
          )}
        </button>
      </div>
    </div>
  )
}

