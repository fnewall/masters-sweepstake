import React from 'react'

export default function NewsTicker({ headlines }) {
  if (!headlines || headlines.length === 0) return null

  return (
    <div style={{
      background: 'rgba(201,168,76,0.08)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '20px',
    }}>
      <div style={{
        fontSize: '9px',
        color: 'var(--gold)',
        letterSpacing: '0.15em',
        marginBottom: '10px',
      }}>
        ⛳ LATEST FROM AUGUSTA
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {headlines.slice(0, 3).map((h, i) => (
          <div key={i} style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
            paddingLeft: '12px',
            borderLeft: '2px solid var(--green-bright)',
            animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
          }}>
            {h.headline}
          </div>
        ))}
      </div>
    </div>
  )
}
