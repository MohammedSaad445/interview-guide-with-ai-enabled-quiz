import { useQuizHistory } from '../context/QuizHistoryContext'
import { getTopicMeta } from '../utils/textFormatter'

function ScorePill({ score }) {
  const cls = score >= 70
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    : score >= 40
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {score}/100
    </span>
  )
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function QuizHistory({ isOpen, onClose }) {
  const { history, clearHistory, avgScore } = useQuizHistory()

  if (!isOpen) return null

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-900
                      shadow-2xl z-50 flex flex-col border-l border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              📊 Session History
            </h2>
            {avgScore !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {history.length} quiz{history.length !== 1 ? 'zes' : ''} · avg {avgScore}/100
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                No quizzes taken yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Complete a quiz to see your history here
              </p>
            </div>
          ) : (
            history.map(result => {
              const meta = getTopicMeta(result.topic)
              return (
                <div
                  key={result.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100
                             dark:border-gray-700 px-4 py-3 flex items-center gap-3"
                >
                  {/* Topic icon */}
                  <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center
                                   justify-center text-lg shrink-0`}>
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize truncate">
                      {result.topic}
                      {result.section && (
                        <span className="text-gray-400 font-normal"> · {result.section}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                      {result.mode} · {result.difficulty} · {result.questions?.length} Qs
                      <span className="ml-1.5">· {formatTime(result.timestamp)}</span>
                    </p>
                  </div>

                  {/* Score */}
                  <ScorePill score={result.score} />
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={clearHistory}
              className="w-full py-2 rounded-xl text-xs font-semibold text-red-500
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              🗑️ Clear Session History
            </button>
          </div>
        )}
      </div>
    </>
  )
}

