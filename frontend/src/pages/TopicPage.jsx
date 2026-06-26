import { useParams, Link } from 'react-router-dom'
import { useTopic } from '../hooks/useTopicData'
import SectionCard from '../components/SectionCard'
import { getTopicMeta } from '../utils/textFormatter'

function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function TopicPage() {
  const { slug }                        = useParams()
  const { data: topic, loading, error } = useTopic(slug)
  const meta                            = getTopicMeta(slug)

  if (loading) return <SkeletonPage />

  if (error || !topic) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-5">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Topic not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Run the scraper to generate content for <strong>{slug}</strong>.
        </p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    )
  }

  const totalQ = topic.sections.reduce((s, sec) => s + sec.questionAnswers.length, 0)

  return (
    <div>
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium capitalize">{topic.topicName}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Title block */}
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl ${meta.iconBg} flex items-center justify-center text-3xl shadow-sm`}>
                {meta.icon}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {topic.topicName} Interview Guide
                </h1>
                <p className="text-gray-400 mt-1 text-sm">
                  {topic.sections.length} section{topic.sections.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {totalQ} Q&amp;As
                </p>
              </div>
            </div>

            {/* PDF download + Quiz shortcut */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/quiz/${slug}`}
                className="flex items-center gap-2 bg-accent/80 hover:bg-accent border border-accent/50
                           text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                🧠 Quiz this topic
              </Link>
              {topic.pdfFile && totalQ > 0 && (
                <a
                  href={`/pdfs/${topic.pdfFile}`}
                  download
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20
                             text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {topic.sections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400">No sections found. Re-run the scraper.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Sections</h2>
              <span className={`badge ${meta.badge}`}>{topic.sections.length} sections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topic.sections.map((sec, i) => (
                <SectionCard key={sec.slug} section={sec} topicSlug={slug} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

