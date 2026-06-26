import { useEffect, useRef, useState, useId } from 'react'
import mermaid from 'mermaid'
import { useTheme } from '../context/ThemeContext'

/**
 * Renders a Mermaid diagram from raw diagram syntax (graph TD, sequenceDiagram, etc.).
 * Re-renders automatically when the app theme changes between light and dark.
 * Falls back to a plain <pre> if Mermaid throws a parse error.
 */
export default function MermaidDiagram({ code }) {
  const { dark }            = useTheme()
  const containerRef        = useRef(null)
  const rawId               = useId()
  // useId() can produce ":r0:" – strip non-alphanumeric for a valid HTML id
  const diagramId           = 'mermaid-' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const [error, setError]   = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // (Re-)initialise Mermaid whenever the theme flips
    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })

    let cancelled = false

    mermaid.render(diagramId, code)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            // Ensure viewBox is present so aspect ratio is preserved when the
            // diagram is scaled down in narrow viewports.
            if (!svgEl.getAttribute('viewBox')) {
              const w = parseFloat(svgEl.getAttribute('width')  || '0')
              const h = parseFloat(svgEl.getAttribute('height') || '0')
              if (w > 0 && h > 0) {
                svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`)
              }
            }
            // Do NOT override max-width here.
            // Mermaid already writes style="max-width: Xpx;" on the SVG element,
            // where X is the natural diagram width.  Overriding that with '100%'
            // would cause narrow diagrams (e.g. simple 3-node flowcharts) to
            // expand to fill the full container width, making them appear
            // disproportionately large.  We only set height:auto so the height
            // scales proportionally when the container is narrower than the diagram.
            svgEl.style.height  = 'auto'
            svgEl.style.display = 'block'
          }
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('Mermaid render error:', err)
          setError(err?.message ?? 'Diagram render error')
        }
      })

    return () => { cancelled = true }
  }, [code, dark, diagramId])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Error fallback – show the raw code with a warning banner
  if (error) {
    return (
      <div className="my-3 rounded-xl overflow-hidden border border-amber-200 dark:border-amber-700 text-sm shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-900/30
                        border-b border-amber-200 dark:border-amber-700">
          <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
            ⚠ Diagram (render error – showing source)
          </span>
        </div>
        <pre className="p-4 text-xs font-mono text-gray-700 dark:text-gray-300
                        bg-white dark:bg-gray-800 overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    )
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-4 py-2
                      bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400"    />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400"  />
          <span className="ml-2 text-xs font-mono font-semibold text-accent">Diagram</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400
                     hover:text-accent transition-colors"
          title="Copy diagram source"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2
                     m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* ── Diagram body ── */}
      <div
        ref={containerRef}
        className="p-4 bg-white dark:bg-gray-800 overflow-x-auto flex justify-center"
      />
    </div>
  )
}



