import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-8xl font-extrabold text-gray-100 dark:text-gray-800 mb-2">404</div>
      <div className="text-5xl mb-6">😕</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="btn-primary">← Go to Home</Link>
    </div>
  )
}

