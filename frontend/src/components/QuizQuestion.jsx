import { useState } from 'react'

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  mode,
  savedAnswer,
  onAnswerChange,
  isFirst,
  isLast,
  allAnswered,
  onPrev,
  onNext,
  onSubmitAll,
  submittingAll,
  submitError,
}) {
  const isMcq = mode === 'mcq'

  // Initialise from savedAnswer so navigation back/forward restores prior input
  const [selectedOption, setSelectedOption] = useState(() => {
    if (isMcq && savedAnswer != null) {
      const idx = question.options?.indexOf(savedAnswer)
      return idx >= 0 ? idx : null
    }
    return null
  })
  const [textAnswer, setTextAnswer] = useState(savedAnswer ?? '')

  const progress = ((questionNumber - 1) / totalQuestions) * 100

  const handleOptionClick = (idx) => {
    setSelectedOption(idx)
    onAnswerChange(question.options[idx])
  }

  const handleTextChange = (e) => {
    setTextAnswer(e.target.value)
    onAnswerChange(e.target.value)
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
              const isSelected = selectedOption === idx
              const optStyle = isSelected
                ? 'border-accent bg-accent/5 dark:bg-accent/10'
                : 'border-gray-200 dark:border-gray-600 hover:border-accent/50 dark:hover:border-accent/40'

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(idx)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left
                              transition-all ${optStyle}`}
                >
                  <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                                   text-xs font-bold mt-0.5 transition-colors
                    ${isSelected
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
              onChange={handleTextChange}
              rows={5}
              placeholder="Type your answer here…"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent
                         focus:border-transparent placeholder-gray-400 leading-relaxed"
            />
            <p className="text-xs text-gray-400 text-right">{textAnswer.length} chars</p>
          </div>
        )}

        {/* ── Submit error ── */}
        {isLast && submitError && (
          <p className="text-sm text-red-500 dark:text-red-400">⚠️ {submitError} — please try again.</p>
        )}

        {/* ── Navigation buttons ── */}
        <div className="flex gap-3">

          {/* Previous — hidden on the first question */}
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200
                         dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold text-sm
                         transition-all flex items-center justify-center gap-2"
            >
              <span>←</span> Previous
            </button>
          )}

          {/* Next — shown on all questions except the last */}
          {!isLast && (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 py-3 rounded-xl bg-navy dark:bg-gray-700 hover:bg-navy-dark
                         dark:hover:bg-gray-600 text-white font-bold text-sm transition-all
                         flex items-center justify-center gap-2"
            >
              Next Question <span>→</span>
            </button>
          )}

          {/* Submit Answers — only on the last question, enabled when all answered */}
          {isLast && (
            <button
              type="button"
              onClick={onSubmitAll}
              disabled={!allAnswered || submittingAll}
              className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-bold text-sm transition-all
                         flex items-center justify-center gap-2"
            >
              {submittingAll ? (
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
                <>Submit Answers 🎉</>
              )}
            </button>
          )}
        </div>

        {/* Hint when on last question but not all answered */}
        {isLast && !allAnswered && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Answer all questions to enable submission. You can use the Previous button to go back.
          </p>
        )}
      </div>
    </div>
  )
}
