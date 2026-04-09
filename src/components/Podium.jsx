import React from 'react'

const medals = ['🥇', '🥈', '🥉']
const podiumHeights = ['140px', '100px', '80px']
const podiumOrder = [1, 0, 2]

export default function Podium({ top3 }) {
  if (!top3 || top3.length === 0) return null

  const displayed = podiumOrder.map(i => top3[i]).filter(Boolean)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '12px',
      padding: '40px 20px 0',
      marginBottom: '8px',
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
            animation: `fadeIn 0.6s ease ${vi * 0.15}s both`,
          }}>
            <div style={{
              background: isWinner
                ? 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.08))'
                : 'rgba(255,255,255,0.04)',
              border: isWinner
                ? '1px solid rgba(201,168,76,0.6)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px 20px',
              textAlign: 'center',
              marginBottom: '12px',
              minWidth: isWinner ? '180px' : '150px',
              animation: isWinner ? 'glow 3s ease infinite' : 'none',
              position: 'relative',
            }}>
              {isWinner && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '24px',
                  animation: 'float 3s ease infinite',
                }}>👑</div>
              )}
              <div style={{
                fontSize: isWinner ? '15px' : '13px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: isWinner ? '700' : '600',
                color: isWinner ? 'var(--gold-light)' : 'var(--white)',
                marginBottom: '6px',
                marginTop: isWinner ? '8px' : '0',
              }}>{p.name}</div>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>{p.totalScore} pts</div>
            </div>

            <div style={{
              width: isWinner ? '160px' : '130px',
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
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: isWinner ? '28px' : '22px' }}>
                {medals[podiumOrder[vi]]}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isWinner ? '28px' : '22px',
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
