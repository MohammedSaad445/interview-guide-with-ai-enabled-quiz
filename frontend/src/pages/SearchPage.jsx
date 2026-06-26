import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAllTopics } from '../hooks/useTopicData'
import QAItem from '../components/QAItem'
import { getTopicMeta } from '../utils/textFormatter'

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query                           = searchParams.get('q') || ''
  const [input, setInput]               = useState(query)
  const { allTopics, loading }          = useAllTopics()
  const [results, setResults]           = useState([])

  /* Sync input when URL query changes (e.g. from navbar) */
  useEffect(() => { setInput(query) }, [query])

  /* Run search whenever query or data changes */
  const runSearch = useCallback(() => {
    if (!query.trim() || allTopics.length === 0) { setResults([]); return }
    const q   = query.toLowerCase()
    const out = []
    for (const topic of allTopics) {
      for (const sec of topic.sections) {
        for (const qa of sec.questionAnswers) {
          const inQuestion = qa.question?.toLowerCase().includes(q)
          const inAnswer   = qa.answer?.toLowerCase().includes(q)
          const inCode     = qa.codeBlocks?.some(c => c?.toLowerCase().includes(q))
          if (inQuestion || inAnswer || inCode) {
            out.push({ qa, section: sec, topic })
          }
        }
      }
    }
    setResults(out)
  }, [query, allTopics])

  useEffect(() => { runSearch() }, [runSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page title ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Search Q&amp;As</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search across all topics, sections, questions, and answers
        </p>
      </div>

      {/* ── Search form ── */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. JVM, Docker networking, kubectl commands…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                       shadow-sm transition-all text-sm"
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 py-4">
          <SpinnerIcon />
          <span className="text-sm">Loading all topic data…</span>
        </div>
      )}

      {/* ── Results summary ── */}
      {query && !loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {results.length > 0
            ? <><strong className="text-gray-800 dark:text-gray-200">{results.length}</strong> result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</>
            : <>No results for &ldquo;<strong>{query}</strong>&rdquo; — try a different keyword</>
          }
        </p>
      )}

      {/* ── No results illustration ── */}
      {query && !loading && results.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400 dark:text-gray-500 mb-2">Nothing found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try searching for a technology name, concept, or command
          </p>
        </div>
      )}

      {/* ── Result cards ── */}
      {results.length > 0 && (
        <div className="space-y-5">
          {results.map(({ qa, section, topic }, i) => {
            const m = getTopicMeta(topic.slug)
            return (
              <div key={i}>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-1.5 ml-1">
                  <span className="text-base leading-none">{m.icon}</span>
                  <Link to={`/topic/${topic.slug}`}
                    className="hover:text-accent font-medium transition-colors capitalize">
                    {topic.topicName}
                  </Link>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link to={`/topic/${topic.slug}/${section.slug}`}
                    className="hover:text-accent transition-colors">
                    {section.title}
                  </Link>
                </div>
                <QAItem qa={qa} qNum={i + 1} defaultOpen={results.length === 1} />
              </div>
            )
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {!query && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💡</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Start typing to search
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Searches across all topics — questions, answers, and code examples
          </p>
        </div>
      )}
    </div>
  )
}

