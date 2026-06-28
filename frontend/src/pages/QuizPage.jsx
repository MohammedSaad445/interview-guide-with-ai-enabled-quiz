import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import QuizSetup    from '../components/QuizSetup'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults  from '../components/QuizResults'
import { generateQuiz } from '../api/quizApi'

// ── Loading screen shown while AI generates questions ────────────────────────
function GeneratingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-accent/10 dark:bg-accent/20
                        flex items-center justify-center">
          <span className="text-4xl">🧠</span>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Generating your quiz…
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-6">
        AI is crafting personalised questions based on your chosen topic and difficulty.
        This usually takes 5–15 seconds.
      </p>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-accent font-semibold">AI is generating your quiz…</span>
      </div>
    </div>
  )
}

// ── Quiz page state machine ────────────────────────────────────────────────────
//  'setup'    → user configures the quiz
//  'loading'  → waiting for AI to generate questions
//  'quiz'     → answering questions one at a time
//  'results'  → score summary + per-question review

export default function QuizPage() {
  const { topicSlug } = useParams()  // pre-fill topic if arriving from /quiz/:topicSlug

  const [phase,       setPhase]       = useState('setup')
  const [questions,   setQuestions]   = useState([])
  const [currentIdx,  setCurrentIdx]  = useState(0)
  const [answers,     setAnswers]     = useState([])   // { userAnswer, verdict, score, feedback }
  const [quizConfig,  setQuizConfig]  = useState(null)
  const [genError,    setGenError]    = useState(null)

  // ── Called when user hits "Start Quiz" ──
  const handleStart = async (config) => {
    setQuizConfig(config)
    setGenError(null)
    setPhase('loading')
    try {
      const qs = await generateQuiz(config)
      if (!qs || qs.length === 0) throw new Error('No questions were returned by the AI.')
      setQuestions(qs)
      setCurrentIdx(0)
      setAnswers([])
      setPhase('quiz')
    } catch (e) {
      setGenError(e.message)
      setPhase('setup')
    }
  }

  // ── Called when an answer has been evaluated ──
  const handleAnswer = (answerData) => {
    setAnswers(prev => [...prev, answerData])
  }

  // ── Called when user clicks "Next Question" or "View Results" ──
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(idx => idx + 1)
    } else {
      setPhase('results')
    }
  }

  // ── Retake same quiz configuration ──
  const handleRetake = () => handleStart(quizConfig)

  // ── Go back to setup ──
  const handleReset = () => {
    setPhase('setup')
    setQuestions([])
    setAnswers([])
    setCurrentIdx(0)
    setQuizConfig(null)
    setGenError(null)
  }

  // ── Breadcrumb helper ──
  const Breadcrumb = () => (
    <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500
                    max-w-2xl mx-auto px-4 sm:px-6 pt-6">
      <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Home</Link>
      <span>/</span>
      <span className="text-gray-600 dark:text-gray-300 font-medium">Quiz</span>
      {topicSlug && phase === 'setup' && (
        <>
          <span>/</span>
          <span className="capitalize">{topicSlug}</span>
        </>
      )}
    </nav>
  )

  return (
    <div>
      <Breadcrumb />

      {phase === 'loading'  && <GeneratingSpinner />}
      {phase === 'setup'    && (
        <QuizSetup
          prefilledTopic={topicSlug}
          onStart={handleStart}
          error={genError}
        />
      )}
      {phase === 'quiz' && (
        <QuizQuestion
          question={questions[currentIdx]}
          questionNumber={currentIdx + 1}
          totalQuestions={questions.length}
          mode={quizConfig.mode}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}
      {phase === 'results' && (
        <QuizResults
          questions={questions}
          answers={answers}
          score={answers.length > 0
            ? Math.round(answers.reduce((s, a) => s + (a.score ?? 0), 0) / answers.length)
            : 0}
          config={quizConfig}
          onRetake={handleRetake}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

