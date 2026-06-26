import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../context/ThemeContext'
import { detectLanguage, LANG_LABEL, isMermaidCode } from '../utils/textFormatter'
import MermaidDiagram from './MermaidDiagram'

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function CodeBlock({ code }) {
  const { dark }           = useTheme()
  const [copied, setCopied] = useState(false)

  // Route Mermaid diagram code to the dedicated renderer
  if (isMermaidCode(code)) {
    return <MermaidDiagram code={code} />
  }

  const lang  = detectLanguage(code)
  const label = LANG_LABEL[lang] ?? 'Code'

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 text-sm shadow-sm">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-4 py-2
                      bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400"   />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400"  />
          <span className="ml-2 text-xs font-mono font-semibold text-accent">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400
                     hover:text-accent transition-colors"
        >
          {copied ? (
            <><CheckIcon /><span className="text-green-500">Copied!</span></>
          ) : (
            <><CopyIcon />Copy</>
          )}
        </button>
      </div>

      {/* ── Code body ── */}
      <SyntaxHighlighter
        language={lang === 'docker' ? 'dockerfile' : lang === 'hcl' ? 'bash' : lang}
        style={dark ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.78rem', lineHeight: '1.6' }}
        showLineNumbers={code.split('\n').length > 6}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
