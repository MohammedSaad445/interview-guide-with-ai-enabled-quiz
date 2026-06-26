import { Link } from 'react-router-dom'
import { getTopicMeta } from '../utils/textFormatter'

const basePath = import.meta.env.BASE_URL;

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export default function TopicCard({ topic }) {
  const meta    = getTopicMeta(topic.slug)
  const hasData = topic.sectionCount > 0

  return (
    <Link to={`/topic/${topic.slug}`} className="group block">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                      border border-gray-100 dark:border-gray-700
                      shadow-card hover:shadow-card-hover hover:-translate-y-1
                      transition-all duration-250">

        {/* Gradient top bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />

        <div className="p-6">
          {/* Icon row */}
          <div className="flex items-start justify-between mb-5">
            <div className={`w-13 h-13 w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center text-2xl`}>
              {meta.icon}
            </div>
            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-accent transition-colors mt-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-accent transition-colors">
            {topic.topicName}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Interview Guide</p>

          {/* Stats badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasData ? (
              <>
                <span className={`badge ${meta.badge}`}>{topic.sectionCount} Sections</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {topic.questionCount} Q&amp;As
                </span>
              </>
            ) : (
              <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                Run scraper to load
              </span>
            )}
          </div>
        </div>

        {/* Card footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700
                        flex items-center justify-between">
          <span className="text-xs font-semibold text-accent group-hover:underline">
            Explore →
          </span>
           {topic.pdfFile && hasData && (
             <a
               href={`${basePath}pdfs/${topic.pdfFile}`}
               download
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500
                         hover:text-accent transition-colors"
              title="Download PDF"
            >
              <DownloadIcon /> PDF
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}

