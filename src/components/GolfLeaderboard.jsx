import React from 'react'

export default function GolfLeaderboard({ golfers, round, status }) {
  const top20 = golfers.slice(0, 20)

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, rgba(74,140,92,0.15) 0%, transparent 100%)',
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--green-light)',
            letterSpacing: '0.05em',
          }}>MASTERS LEADERBOARD</div>
          {round && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Round {round} · {status}
            </div>
          )}
        </div>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: status === 'unavailable' ? '#f87171' : '#4ade80',
          animation: status === 'unavailable' ? 'none' : 'pulse 2s infinite',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 50px 60px',
        padding: '8px 16px',
        fontSize: '9px',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        borderBottom: '1px solid var(--border)',
      }}>
        <span>POS</span>
        <span>PLAYER</span>
        <span style={{ textAlign: 'right' }}>SCORE</span>
        <span style={{ textAlign: 'right' }}>THRU</span>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {top20.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {status === 'unavailable' ? 'Live data unavailable' : 'Tournament not started yet'}
          </div>
        )}
        {top20.map((g, i) => (
          <div key={g.id || i} style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 50px 60px',
            padding: '9px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            animation: `rise 0.3s ease ${i * 0.03}s both`,
            background: g.isCut ? 'rgba(248,113,113,0.04)' : 'transparent',
          }}>
            <div style={{
              fontSize: '12px', fontWeight: '600',
              color: i === 0 ? 'var(--gold)' : g.isCut ? '#f87171' : 'var(--text-muted)',
            }}>{g.positionDisplay}</div>
            <div style={{
              fontSize: '12px',
              fontFamily: "'Playfair Display', serif",
              color: g.isCut ? 'var(--text-muted)' : 'var(--white)',
            }}>{g.name}</div>
            <div style={{
              fontSize: '11px', textAlign: 'right',
              color: g.totalScore < 0 ? '#4ade80' : g.totalScore > 0 ? '#f87171' : 'var(--text-muted)',
            }}>
              {g.totalScore === 0 ? 'E' : g.totalScore > 0 ? `+${g.totalScore}` : g.totalScore}
            </div>
            <div style={{ fontSize: '11px', textAlign: 'right', color: 'var(--text-muted)' }}>
              {g.thru}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
