import React from 'react'

const medals = ['🥇', '🥈', '🥉']
const podiumHeights = ['120px', '90px', '70px']
const podiumOrder = [1, 0, 2]

export default function Podium({ top3 }) {
  if (!top3 || top3.length === 0) return null

  const displayed = podiumOrder.map(i => top3[i]).filter(Boolean)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '6px',
      padding: '30px 4px 0',
      marginBottom: '8px',
      overflow: 'hidden',
    }}>
      {displayed.map((p, vi) => {
        const isWinner = podiumOrder[vi] === 0
        const rank = podiumOrder[vi] + 1
        const height = podiumHeights[podiumOrder[vi]]

        return (
          <div key={p.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: isWinner ? '1.2' : '1',
            minWidth: 0,
            animation: `fadeIn 0.6s ease ${vi * 0.15}s both`,
          }}>
            <div style={{
              background: isWinner
                ? 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.08))'
                : 'rgba(255,255,255,0.04)',
              border: isWinner
                ? '1px solid rgba(201,168,76,0.6)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '10px 8px',
              textAlign: 'center',
              marginBottom: '8px',
              width: '100%',
              animation: isWinner ? 'glow 3s ease infinite' : 'none',
              position: 'relative',
              boxSizing: 'border-box',
            }}>
              {isWinner && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '18px',
                  animation: 'float 3s ease infinite',
                }}>👑</div>
              )}
              <div style={{
                fontSize: isWinner ? '13px' : '11px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: isWinner ? '700' : '600',
                color: isWinner ? 'var(--gold-light)' : 'var(--white)',
                marginBottom: '4px',
                marginTop: isWinner ? '6px' : '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{p.name}</div>
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
              }}>{p.totalScore} pts</div>
            </div>

            <div style={{
              width: '100%',
              height,
              background: isWinner
                ? 'linear-gradient(180deg, rgba(201,168,76,0.4) 0%, rgba(201,168,76,0.15) 100%)'
                : rank === 2
                  ? 'linear-gradient(180deg, rgba(192,192,192,0.3) 0%, rgba(192,192,192,0.1) 100%)'
                  : 'linear-gradient(180deg, rgba(180,130,80,0.3) 0%, rgba(180,130,80,0.1) 100%)',
              border: isWinner
                ? '1px solid rgba(201,168,76,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '2px',
            }}>
              <div style={{ fontSize: isWinner ? '22px' : '18px' }}>
                {medals[podiumOrder[vi]]}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isWinner ? '22px' : '18px',
                fontWeight: '900',
                color: isWinner ? 'var(--gold)' : 'var(--text-muted)',
              }}>
                {rank}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
