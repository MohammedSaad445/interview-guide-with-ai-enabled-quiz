import { createContext, useContext, useState } from 'react'

const QuizHistoryContext = createContext(null)

/**
 * In-memory session store for quiz results.
 * All data lives for the duration of the browser tab/session and is cleared on close.
 * No localStorage – scores are purely session-scoped as intended.
 */
export function QuizHistoryProvider({ children }) {
  const [history, setHistory] = useState([])

  /** Prepend a new result to the history array */
  const addResult = (result) => {
    setHistory(prev => [
      { ...result, id: Date.now(), timestamp: new Date() },
      ...prev,
    ])
  }

  const clearHistory = () => setHistory([])

  /** Average score across all session quizzes, or null if none yet */
  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.score, 0) / history.length)
    : null

  return (
    <QuizHistoryContext.Provider value={{ history, addResult, clearHistory, avgScore }}>
      {children}
    </QuizHistoryContext.Provider>
  )
}

export function useQuizHistory() {
  const ctx = useContext(QuizHistoryContext)
  if (!ctx) throw new Error('useQuizHistory must be used within QuizHistoryProvider')
  return ctx
}

