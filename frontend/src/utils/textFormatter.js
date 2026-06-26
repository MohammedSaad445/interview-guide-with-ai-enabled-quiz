/**
 * Per-topic visual metadata: icon, gradient, badge colours.
 */
export const TOPIC_META = {
  java: {
    icon: '☕',
    gradient: 'from-orange-500 to-amber-500',
    iconBg:   'bg-orange-50 dark:bg-orange-900/20',
    badge:    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dot:      'bg-orange-400',
  },
  devops: {
    icon: '🔧',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg:   'bg-emerald-50 dark:bg-emerald-900/20',
    badge:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot:      'bg-emerald-400',
  },
  cloud: {
    icon: '☁️',
    gradient: 'from-sky-400 to-blue-600',
    iconBg:   'bg-sky-50 dark:bg-sky-900/20',
    badge:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot:      'bg-sky-400',
  },
  docker: {
    icon: '🐳',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg:   'bg-cyan-50 dark:bg-cyan-900/20',
    badge:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    dot:      'bg-cyan-400',
  },
  kubernetes: {
    icon: '⚙️',
    gradient: 'from-blue-600 to-indigo-700',
    iconBg:   'bg-indigo-50 dark:bg-indigo-900/20',
    badge:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    dot:      'bg-indigo-400',
  },
  terraform: {
    icon: '🏗️',
    gradient: 'from-violet-500 to-purple-700',
    iconBg:   'bg-violet-50 dark:bg-violet-900/20',
    badge:    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    dot:      'bg-violet-400',
  },
  git: {
    icon: '🌿',
    gradient: 'from-orange-600 to-red-600',
    iconBg:   'bg-red-50 dark:bg-red-900/20',
    badge:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot:      'bg-red-400',
  },
}

export function getTopicMeta(slug) {
  return TOPIC_META[slug?.toLowerCase()] ?? {
    icon:     '📚',
    gradient: 'from-gray-500 to-gray-600',
    iconBg:   'bg-gray-50 dark:bg-gray-800',
    badge:    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    dot:      'bg-gray-400',
  }
}

/**
 * Parses the raw answer text (produced by the Java scraper) into structured
 * display segments for React rendering.
 *
 * Supported segment types:
 *   paragraph  – plain prose text
 *   bullet-l1  – top-level bullet (•)
 *   bullet-l2  – nested bullet (◦)
 *   image      – { label, src }   from "[Image: alt | https://url]"
 *   table      – { headers: string[], rows: string[][] }  from pipe-separated rows
 */
export function parseAnswerLines(text) {
  if (!text) return []
  const lines    = text.split('\n')
  const segments = []
  let   paragraphLines = []
  let   tableRows      = []   // accumulates raw cell arrays for the current table block

  const flush = () => {
    if (paragraphLines.length > 0) {
      segments.push({ type: 'paragraph', text: paragraphLines.join(' ') })
      paragraphLines = []
    }
  }

  const flushTable = () => {
    if (tableRows.length === 0) return
    // Separate header from body: if the second row is all dashes it is a separator
    let headers = []
    let rows    = [...tableRows]
    if (rows.length >= 2 && rows[1].every(c => /^-+$/.test(c.trim()))) {
      headers = rows[0]
      rows    = rows.slice(2)
    } else if (rows.length >= 1) {
      headers = rows[0]
      rows    = rows.slice(1)
    }
    segments.push({ type: 'table', headers, rows })
    tableRows = []
  }

  const isTableRow = (line) => {
    const t = line.trim()
    return t.startsWith('|') && t.endsWith('|') && t.length > 2
  }

  const parseTableRow = (line) =>
    line.trim().split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1)

  for (const raw of lines) {
    const line = raw

    if (line.trim() === '') {
      flush()
      flushTable()
      continue
    }

    // ── Image marker: [Image: alt text | https://url] or [Image: alt text] ──
    const imgMatch = line.match(/^\[Image:\s*(.+?)(?:\s*\|\s*(https?:\/\/\S+))?\]\s*$/)
    if (imgMatch) {
      flush()
      flushTable()
      segments.push({ type: 'image', label: imgMatch[1].trim(), src: imgMatch[2] || null })
      continue
    }

    // ── Table row: | cell | cell | ──
    if (isTableRow(line)) {
      flush()
      tableRows.push(parseTableRow(line))
      continue
    }

    // Non-table line after a table block → flush the table first
    flushTable()

    // Level-2 bullet  (◦ – indented)
    if (line.includes('\u25e6')) {
      flush()
      segments.push({ type: 'bullet-l2', text: line.replace(/^\s*\u25e6\s*/, '').trim() })
      continue
    }

    // Level-1 bullet  (• )
    if (line.includes('\u2022')) {
      flush()
      segments.push({ type: 'bullet-l1', text: line.replace(/^\s*\u2022\s*/, '').trim() })
      continue
    }

    paragraphLines.push(line.trim())
  }

  flush()
  flushTable()
  return segments
}

/**
 * Returns true if the code string is Mermaid diagram syntax.
 * Detects all common Mermaid diagram types.
 */
export function isMermaidCode(code) {
  if (!code) return false
  const trimmed = code.trimStart()
  return /^(graph\s+(TD|LR|RL|BT|TB)|flowchart\s+(TD|LR|RL|BT|TB|)|sequenceDiagram|classDiagram|stateDiagram(-v2)?|gantt|pie(\s+title)?|gitGraph|erDiagram|journey|quadrantChart)/i.test(trimmed)
}

/**
 * Simple language detection for the code-block label.
 */
export function detectLanguage(code) {
  if (!code) return 'text'
  if (code.includes('public class') || code.includes('@Override') || code.includes('System.out')) return 'java'
  if (code.includes('apiVersion:')  || code.includes('kind:')      || code.includes('kubectl'))   return 'yaml'
  if (code.includes('FROM ')        || code.includes('COPY ')       || code.includes('RUN '))      return 'docker'
  if (code.includes('resource "')   || code.includes('variable "')  || code.includes('terraform')) return 'hcl'
  if (code.includes('git ')         || code.includes('$ ')          || code.includes('#!/'))       return 'bash'
  if (code.includes('def ')         && code.includes('print('))                                    return 'python'
  if (code.includes('function')     || code.includes('const ')      || code.includes('=>'))        return 'javascript'
  return 'text'
}

export const LANG_LABEL = {
  java: 'Java', yaml: 'YAML / Kubernetes', docker: 'Dockerfile',
  hcl: 'HCL / Terraform', bash: 'Shell', python: 'Python',
  javascript: 'JavaScript', text: 'Code',
}

