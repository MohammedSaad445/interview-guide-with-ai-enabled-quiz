const BASE = '/api/quiz'

/**
 * Ask Spring AI to generate quiz questions for the given configuration.
 *
 * @param {Object} payload  { topic, section, questionCount, difficulty, mode }
 * @returns {Promise<QuizQuestion[]>}
 */
export async function generateQuiz(payload) {
  const res = await fetch(`${BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

/**
 * Ask Spring AI to evaluate a single answer.
 *
 * @param {Object} payload  { question, keyPoints, userAnswer }
 * @returns {Promise<{ verdict: string, score: number, feedback: string }>}
 */
export async function evaluateAnswer(payload) {
  const res = await fetch(`${BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Request failed with status ${res.status}`)
  }
  return res.json()
}

