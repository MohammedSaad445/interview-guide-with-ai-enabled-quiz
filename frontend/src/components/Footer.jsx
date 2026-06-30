import { Link } from 'react-router-dom'

function GithubIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482
           0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462
           -.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832
           .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683
           -.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59
           0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699
           1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852
           0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12
           c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853
               0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9
               1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337
               7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782
               13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542
               C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24
               .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

const TECH_STACK = [
  { label: 'React 18', desc: 'UI framework' },
  { label: 'Vite', desc: 'Build tool' },
  { label: 'Tailwind CSS', desc: 'Styling' },
  { label: 'Spring Boot', desc: 'Backend API' },
  { label: 'Java 17', desc: 'Runtime' },
  { label: 'Mermaid.js', desc: 'Diagrams' },
]

export default function Footer() {
  return (
    <footer className="bg-navy dark:bg-navy-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand & About ── */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shadow">
                IG
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Interview Guide</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              A comprehensive, hands-on interview preparation platform covering Java, DevOps, Cloud, Docker,
              Kubernetes, Terraform, and Git — designed to help engineers land their next role with confidence.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-gray-500">Actively maintained</span>
            </div>
          </div>

          {/* ── Resources ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-2">
                  <span className="text-accent">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-2">
                  <span className="text-accent">›</span> Search Q&amp;As
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-2">
                  <span className="text-accent">›</span> Take a Quiz
                </Link>
              </li>
              <li>
                <a
                  href="/pdfs/Java_Interview_Guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-2"
                >
                  <span className="text-accent">›</span> Download PDFs
                </a>
              </li>
            </ul>
          </div>

          {/* ── Tech Stack ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Built With</h3>
            <ul className="space-y-2.5">
              {TECH_STACK.map(({ label, desc }) => (
                <li key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-300 font-medium">{label}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full shrink-0">{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Connect</h3>
            <div className="space-y-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                  <GithubIcon />
                </span>
                <span>View on GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#0A66C2] transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#0A66C2]/20 flex items-center justify-center transition-colors">
                  <LinkedInIcon />
                </span>
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:contact@interviewguide.dev"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-accent transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <EmailIcon />
                </span>
                <span>Contact</span>
              </a>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 leading-relaxed">
                Found an issue or want to contribute?{' '}
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                   className="text-accent hover:underline">Open a PR</a>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Interview Preparation Guide. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-600">Built with</span>
              <span className="text-red-400">♥</span>
              <span className="text-gray-600">using React &amp; Spring Boot</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-600">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

