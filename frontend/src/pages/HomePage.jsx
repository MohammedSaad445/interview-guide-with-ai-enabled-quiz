import { Link } from 'react-router-dom'
import { useIndex } from '../hooks/useTopicData'
import TopicCard from '../components/TopicCard'

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-52
                                 border border-gray-100 dark:border-gray-700 animate-pulse" />
      ))}
    </div>
  )
}

function StatPill({ value, label }) {
  return (
    <div className="text-center px-6 py-2">
      <div className="text-3xl font-extrabold text-white tabular-nums">{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const { data: topics, loading, error } = useIndex()

  const totalSections = topics ? topics.reduce((s, t) => s + t.sectionCount,  0) : 0
  const totalQAs      = topics ? topics.reduce((s, t) => s + t.questionCount, 0) : 0
  const hasData       = totalQAs > 0

  return (
    <div>
      {/* ═══════════════════════════════  HERO  ═══════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-navy via-navy-light to-[#0E2040] text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0  w-64 h-64 rounded-full bg-white/5  translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                             rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Interview Preparation Series
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
              Master Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-teal-light">
                Technical Interview
              </span>
            </h1>

            <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Curated Q&amp;As for Java, DevOps, Cloud, Docker, Kubernetes, Terraform, and Git —
              everything you need to crack your next interview.
            </p>

            {/* Stats row */}
            {hasData && (
              <div className="flex flex-wrap justify-center divide-x divide-white/20 mb-10">
                <StatPill value={topics.length}   label="Topics"    />
                <StatPill value={totalSections}   label="Sections"  />
                <StatPill value={`${totalQAs}+`}  label="Q&As"      />
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#topics"
                className="bg-accent hover:bg-accent-light text-white px-7 py-3 rounded-xl
                           font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Browse Topics
              </a>
              <Link to="/quiz"
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white
                           px-7 py-3 rounded-xl font-semibold transition-all duration-200">
                🧠 Test Your Knowledge
              </Link>
              <Link to="/search"
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white
                           px-7 py-3 rounded-xl font-semibold transition-all duration-200">
                Search Q&amp;As
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 1440 56" className="block w-full" preserveAspectRatio="none" style={{ height: 56 }}>
          <path d="M0,56 L0,28 Q360,0 720,28 Q1080,56 1440,28 L1440,56 Z"
                className="fill-gray-50 dark:fill-gray-950" />
        </svg>
      </div>

      {/* ═══════════════════════════════  TOPICS GRID  ═══════════════════════ */}
      <section id="topics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Topic</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Select a technology to explore its interview Q&amp;As
          </p>
        </div>

        {loading && <SkeletonGrid />}

        {error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Data not found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Run the Java scraper to populate the interview guide content, then refresh this page.
            </p>
            <div className="inline-block bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-4 text-left">
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300 mb-1">$ mvn package</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
                $ java -jar target/webscraper-1.0.0.jar
              </p>
            </div>
          </div>
        )}

        {topics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topics.map(topic => <TopicCard key={topic.slug} topic={topic} />)}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════  HOW IT WORKS  ══════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            How to use this guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Pick a Topic',      desc: 'Choose from Java, DevOps, Cloud, Docker, Kubernetes, Terraform, or Git.' },
              { step: '02', title: 'Browse Sections',   desc: 'Each topic is split into focused sections covering key interview areas.'  },
              { step: '03', title: 'Study Q&As',        desc: 'Expand questions to read answers and study included code examples.'       },
              { step: '04', title: 'Test Yourself',     desc: 'Take an AI-powered quiz to validate your understanding before interviews.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center
                                 justify-center text-accent font-extrabold text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

