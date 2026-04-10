import React, { useState } from 'react'

export default function ParticipantRow({ participant, previousRank, index, isMobile }) {
  const [expanded, setExpanded] = useState(false)
  const { rank, name, totalScore, pickDetails } = participant

  const movement = previousRank !== undefined ? previousRank - rank : 0
  const isLeader = rank === 1
  const movementIcon = movement > 0 ? '▲' : movement < 0 ? '▼' : '—'
  const movementColor = movement > 0 ? '#4ade80' : movement < 0 ? '#f87171' : 'var(--text-muted)'

  return (
    <>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '28px 1fr 44px 24px' : '48px 1fr 80px 80px 40px',
          alignItems: 'center',
          padding: isMobile ? '10px 12px' : '14px 20px',
          cursor: 'pointer',
          background: isLeader
            ? 'linear-gradient(90deg, rgba(201,168,76,0.12) 0%, transparent 100%)'
            : index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          borderBottom: '1px solid var(--border)',
          transition: 'background 0.2s',
          animation: `rise 0.4s ease ${index * 0.05}s both`,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = isLeader
          ? 'linear-gradient(90deg, rgba(201,168,76,0.12) 0%, transparent 100%)'
          : index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
        }
      >
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? '14px' : '20px',
          fontWeight: '700',
          color: rank <= 3 ? ['var(--gold)', '#c0c0c0', '#cd7f32'][rank - 1] : 'var(--text-muted)',
        }}>{rank}</div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? '12px' : '15px',
            fontWeight: isLeader ? '700' : '500',
            color: isLeader ? 'var(--gold-light)' : 'var(--white)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{name}</div>
          {!isMobile && (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {pickDetails?.map(p => p.golferName).join(' · ')}
            </div>
          )}
        </div>

        <div style={{
          textAlign: 'right',
          fontSize: isMobile ? '13px' : '18px',
          fontWeight: '500',
          color: isLeader ? 'var(--gold)' : 'var(--white)',
        }}>{totalScore}</div>

        {!isMobile && (
          <div style={{
            textAlign: 'right',
            fontSize: '13px',
            color: movementColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
          }}>
            <span>{movementIcon}</span>
            {movement !== 0 && <span>{Math.abs(movement)}</span>}
          </div>
        )}

        <div style={{
          textAlign: 'right',
          color: 'var(--text-muted)',
          fontSize: '12px',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▾</div>
      </div>

      {expanded && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid var(--border)',
          padding: isMobile ? '10px 12px 14px' : '12px 20px 16px 68px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
          }}>
            {pickDetails?.map((pick, i) => (
              <div key={i} style={{
                background: pick.isCut ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)',
                border: pick.isCut ? '1px solid rgba(248,113,113,0.3)' : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 10px',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '11px',
                  color: pick.isCut ? '#f87171' : 'var(--white)',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{pick.golferName}</div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}>
                  <span style={{ color: pick.isCut ? '#f87171' : 'var(--gold)' }}>{pick.positionDisplay}</span>
                  <span>{pick.score}</span>
                  <span>{pick.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
