import { useState } from 'react'

export default function ShareButton({ item }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const url = window.location.href
  const text = `🔍 ${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} — ${item.location}`

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      bg: '#f0fdf4',
      border: '#86efac',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
    },
    {
      label: 'Facebook',
      icon: '👥',
      color: '#1877F2',
      bg: '#eff6ff',
      border: '#93c5fd',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    },
    {
      label: 'Twitter/X',
      icon: '🐦',
      color: '#000000',
      bg: '#f8fafc',
      border: '#cbd5e1',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    },
    {
      label: 'Copy Link',
      icon: copied ? '✅' : '🔗',
      color: '#0d9488',
      bg: '#f0fdfb',
      border: '#99f6e4',
      action: () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: '#f8fafc', border: '2px solid #e2e8f0',
          borderRadius: '12px', padding: '10px 18px',
          fontFamily: 'Syne, sans-serif', fontWeight: 600,
          fontSize: '14px', cursor: 'pointer', color: '#475569',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s'
        }}>
        📤 Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div style={{
            position: 'absolute', top: '110%', right: 0,
            background: 'white', borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            padding: '12px', width: '200px', zIndex: 50,
            animation: 'fadeIn 0.15s ease'
          }}>
            <p style={{ fontFamily: 'Syne, sans-serif', color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px 8px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
              Share this item
            </p>
            {shareOptions.map(opt => (
              <button key={opt.label}
                onClick={() => { opt.action(); if (opt.label !== 'Copy Link') setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                  color: '#374151', transition: 'all 0.15s', textAlign: 'left'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = opt.bg; e.currentTarget.style.color = opt.color }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}>
                <span style={{ fontSize: '18px' }}>{opt.icon}</span>
                <span style={{ fontWeight: 500 }}>{opt.label === 'Copy Link' && copied ? 'Copied!' : opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}