import { useState } from 'react'
import CodeBlock from './CodeBlock'
import { parseAnswerLines, isMermaidCode } from '../utils/textFormatter'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/** Renders an image segment — shows the actual image if a URL is available,
 *  otherwise falls back to a styled caption-only block. */
function ImageSegment({ label, src }) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <figure className="my-3">
        <img
          src={src}
          alt={label}
          className="max-w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
          onError={() => setErrored(true)}
        />
        {label && (
          <figcaption className="mt-1.5 text-xs text-center text-gray-500 dark:text-gray-400 italic">
            {label}
          </figcaption>
        )}
      </figure>
    )
  }

  // Fallback when no URL or image failed to load
  return (
    <div className="my-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-300
                    dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm
                    text-gray-500 dark:text-gray-400 italic">
      <svg className="w-5 h-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
             m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {label}
    </div>
  )
}

/** Renders a table segment — headers in bold, body rows zebra-striped. */
function TableSegment({ headers, rows }) {
  if (!headers?.length && !rows?.length) return null
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm border-collapse">
        {headers?.length > 0 && (
          <thead>
            <tr className="bg-accent/10 dark:bg-accent/20">
              {headers.map((h, i) => (
                <th key={i}
                  className="px-3 py-2 text-left font-semibold text-gray-800 dark:text-gray-200
                             border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows?.map((row, ri) => (
            <tr key={ri}
              className={ri % 2 === 0
                ? 'bg-white dark:bg-gray-800'
                : 'bg-gray-50 dark:bg-gray-700'}>
              {row.map((cell, ci) => (
                <td key={ci}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300
                             border-b border-gray-100 dark:border-gray-700/50 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnswerSegments({ segments }) {
  if (!segments.length) return null
  return (
    <div className="space-y-2">
      {segments.map((seg, i) => {
        if (seg.type === 'paragraph') {
          return (
            <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {seg.text}
            </p>
          )
        }
        if (seg.type === 'bullet-l1') {
          return (
            <div key={i} className="flex items-start gap-2.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{seg.text}</p>
            </div>
          )
        }
        if (seg.type === 'bullet-l2') {
          return (
            <div key={i} className="flex items-start gap-2.5 ml-6">
              <span className="w-1.5 h-1.5 rounded-full border border-gray-400 dark:border-gray-500 shrink-0 mt-1.5" />
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{seg.text}</p>
            </div>
          )
        }
        if (seg.type === 'image') {
          return <ImageSegment key={i} label={seg.label} src={seg.src} />
        }
        if (seg.type === 'table') {
          return <TableSegment key={i} headers={seg.headers} rows={seg.rows} />
        }
        return null
      })}
    </div>
  )
}

export default function QAItem({ qa, qNum, defaultOpen = false }) {
  const [open, setOpen]  = useState(defaultOpen)
  const segments         = parseAnswerLines(qa.answer)

  // Separate Mermaid diagram blocks from regular code blocks
  const diagramCount = qa.codeBlocks?.filter(isMermaidCode).length ?? 0
  const codeCount    = (qa.codeBlocks?.length ?? 0) - diagramCount
  const hasCode      = codeCount > 0
  const hasDiagrams  = diagramCount > 0
  const hasAnswer    = segments.length > 0 || hasCode || hasDiagrams

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                     border transition-all duration-200
                     ${open
                       ? 'border-accent/40 dark:border-accent/30 shadow-md'
                       : 'border-gray-100 dark:border-gray-700 shadow-card hover:shadow-card-hover hover:border-gray-200 dark:hover:border-gray-600'
                     }`}>

      {/* ── Question header ── */}
      <button
        className="w-full text-left flex items-start gap-3 px-5 py-4
                   hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
        onClick={() => setOpen(!open)}
      >
        {/* Q badge */}
        <span className="shrink-0 w-7 h-7 rounded-lg bg-accent text-white text-xs font-bold
                         flex items-center justify-center mt-0.5 shadow-sm">
          {qNum}
        </span>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed
                        group-hover:text-accent transition-colors">
            {qa.question}
          </p>

          {/* Diagram count badge */}
          {hasDiagrams && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 5h4v4H4V5zm12 0h4v4h-4V5zm-6 9h4v4h-4v-4zM6 9v3a3 3 0 003 3h2m4-6v3a3 3 0 01-3 3h-2" />
              </svg>
              {diagramCount} diagram{diagramCount > 1 ? 's' : ''}
            </span>
          )}

          {/* Code example count badge */}
          {hasCode && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {codeCount} code example{codeCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <ChevronIcon open={open} />
      </button>

      {/* ── Answer body ── */}
      {open && hasAnswer && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <div className="px-5 pt-4 pb-5 bg-gray-50/70 dark:bg-gray-700/20 space-y-4">

            {/* Left-bar accent */}
            <div className="flex gap-4">
              <div className="w-0.5 shrink-0 rounded-full bg-accent/30 self-stretch" />
              <div className="flex-1 space-y-3">
                {segments.length > 0 && <AnswerSegments segments={segments} />}
                {(hasCode || hasDiagrams) && (
                  <div className="space-y-2 mt-3">
                    {qa.codeBlocks.map((code, i) => (
                      <CodeBlock key={i} code={code} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No answer state */}
      {open && !hasAnswer && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 text-sm
                        text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-700/20">
          No answer content available.
        </div>
      )}
    </div>
  )
}
