import { Link } from 'react-router-dom'

const TOPICS = ['Java', 'DevOps', 'Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Git']

export default function Footer() {
  return (
    <footer className="bg-navy dark:bg-navy-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">IG</div>
              <span className="text-white font-bold text-lg tracking-tight">Interview Guide</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A comprehensive, hands-on interview preparation guide for Java, DevOps, Cloud, and more.
              Ace your next technical interview.
            </p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Topics</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {TOPICS.map(t => (
                <Link
                  key={t}
                  to={`/topic/${t.toLowerCase()}`}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/"       className="block text-sm text-gray-400 hover:text-accent transition-colors">Home</Link>
              <Link to="/search" className="block text-sm text-gray-400 hover:text-accent transition-colors">Search Q&amp;As</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Interview Preparation Guide</span>
          <span>Built with React &amp; Java</span>
        </div>
      </div>
    </footer>
  )
}

