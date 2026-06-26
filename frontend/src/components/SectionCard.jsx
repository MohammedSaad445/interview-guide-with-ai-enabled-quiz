import { Link } from 'react-router-dom'
import { getTopicMeta } from '../utils/textFormatter'

export default function SectionCard({ section, topicSlug, index }) {
  const meta = getTopicMeta(topicSlug)

  return (
    <Link to={`/topic/${topicSlug}/${section.slug}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700
                      p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5
                      transition-all duration-200">
        <div className="flex items-center gap-4">

          {/* Number badge */}
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.gradient} shrink-0
                           flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {index + 1}
          </div>

          {/* Title + count */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-accent
                           transition-colors truncate text-sm leading-snug">
              {section.title}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {section.questionAnswers.length} Questions &amp; Answers
            </p>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-accent
                           shrink-0 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

