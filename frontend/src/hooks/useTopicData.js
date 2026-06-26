import { useState, useEffect } from 'react'

const basePath = import.meta.env.BASE_URL;

/**
 * Fetches /data/index.json – the list of all topic summaries.
 */
export function useIndex() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch(`${basePath}data/index.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d  => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}

/**
 * Fetches /data/{slug}.json – full data for a single topic.
 */
export function useTopic(slug) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setData(null)
    setError(null)
    fetch(`${basePath}data/${slug}.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d  => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [slug])

  return { data, loading, error }
}

/**
 * Fetches all topics (used by the Search page).
 * Depends on the index being loaded first.
 */
export function useAllTopics() {
  const { data: index, loading: indexLoading } = useIndex()
  const [allTopics, setAllTopics] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!index) return
    if (index.length === 0) { setLoading(false); return }

    Promise.all(
      index.map(t =>
        fetch(`${basePath}data/${t.slug}.json`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      setAllTopics(results.filter(Boolean))
      setLoading(false)
    })
  }, [index])

  return { allTopics, loading: indexLoading || loading }
}
