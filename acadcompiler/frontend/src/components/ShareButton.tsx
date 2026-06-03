import React, { useState } from 'react'
import { getShareLink } from '../hooks/useApi'
import { IconShare } from './icons'

interface Props { docId: string; style: string }

export function ShareButton({ docId, style }: Props) {
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    setLoading(true)
    try {
      const r = await getShareLink(docId, style)
      const url = `${window.location.origin}${r.share_url}`
      setLink(url)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { setLink('Share failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={handleShare} disabled={loading} className="btn btn-secondary btn-sm">
        <IconShare size={14}/> {loading ? 'Sharing…' : 'Share report'}
      </button>
      {link && <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{copied ? 'Copied!' : 'Link ready'}</span>}
    </div>
  )
}
