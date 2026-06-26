import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTopic } from '../hooks/useTopicData'
import QAItem from '../components/QAItem'
import { getTopicMeta } from '../utils/textFormatter'

export default function SectionPage() {
  const { slug, sectionSlug }   = useParams()
  const { data: topic, loading } = useTopic(slug)
  const meta                     = getTopicMeta(slug)
  const [expandAll, setExpandAll] = useState(false)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const section = topic?.sections?.find(s => s.slug === sectionSlug)

  if (!section) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-5">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Section not found
        </h2>
        <Link to={`/topic/${slug}`} className="btn-primary capitalize">
          ← Back to {slug}
        </Link>
      </div>
    )
  }

  /* Adjacent section navigation */
  const sectionIndex = topic.sections.findIndex(s => s.slug === sectionSlug)
  const prevSection  = sectionIndex > 0 ? topic.sections[sectionIndex - 1] : null
  const nextSection  = sectionIndex < topic.sections.length - 1 ? topic.sections[sectionIndex + 1] : null

  return (
    <div>
      {/* ── Section header ── */}
      <div className="bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to={`/topic/${slug}`} className="hover:text-white transition-colors capitalize">
              {topic.topicName}
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">{section.title}</span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{section.title}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {section.questionAnswers.length} Questions &amp; Answers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Q&A content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Controls row */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click any question to expand the answer
          </p>
          <div className="flex items-center gap-3">
            <span className={`badge ${meta.badge}`}>{section.questionAnswers.length} Q&amp;As</span>
            <button
              onClick={() => setExpandAll(e => !e)}
              className="text-xs font-semibold text-accent hover:text-accent-light transition-colors"
            >
              {expandAll ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </div>

        {/* Q&A list */}
        <div className="space-y-3">
          {section.questionAnswers.map((qa, i) => (
            <QAItem key={i} qa={qa} qNum={i + 1} defaultOpen={expandAll} />
          ))}
        </div>

        {/* Prev / Next navigation */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div>
            {prevSection && (
              <Link
                to={`/topic/${slug}/${prevSection.slug}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 hover:border-accent hover:shadow-sm transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors shrink-0 mt-0.5"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Previous</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent transition-colors line-clamp-2">
                    {prevSection.title}
                  </p>
                </div>
              </Link>
            )}
          </div>
          <div>
            {nextSection && (
              <Link
                to={`/topic/${slug}/${nextSection.slug}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 hover:border-accent hover:shadow-sm transition-all group text-right"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Next</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent transition-colors line-clamp-2">
                    {nextSection.title}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors shrink-0 mt-0.5"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to={`/topic/${slug}`}
            className="text-sm text-accent hover:text-accent-light font-semibold transition-colors"
          >
            ← All {topic.topicName} sections
          </Link>
        </div>
      </div>
    </div>
  )
}

