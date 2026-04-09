import React, { useState, useEffect, useRef } from 'react'
import { getParticipants } from '../lib/supabase'
import { fetchMastersLeaderboard, calculateSweepstakeScores, fetchMastersNews } from '../lib/golf'
import Podium from '../components/Podium'
import ParticipantRow from '../components/ParticipantRow'
import GolfLeaderboard from '../components/GolfLeaderboard'
import NewsTicker from '../components/NewsTicker'

const REFRESH_INTERVAL = 60 * 1000

export default function Leaderboard() {
  const [participants, setParticipants] = useState([])
  const [golfers, setGolfers] = useState([])
  const [round, setRound] = useState(null)
  const [status, setStatus] = useState(null)
  const [news, setNews] = useState([])
  const [scored, setScored] = useState([])
  const [previousRanks, setPreviousRanks] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  async function loadAll() {
    try {
      const [parts, lbData, newsData] = await Promise.all([
        getParticipants(),
        fetchMastersLeaderboard(),
        fetchMastersNews(),
      ])
      setGolfers(lbData.golfers)
      setRound(lbData.round)
      setStatus(lbData.status)
      setNews(newsData)
      const newScored = calculateSweepstakeScores(parts, lbData.golfers)
      setScored(prev => {
        const prevRankMap = {}
        prev.forEach(p => { prevRankMap[p.id] = p.rank })
        setPreviousRanks(prevRankMap)
        return newScored
      })
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    intervalRef.current = setInterval(loadAll, REFRESH_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [])

  const top3 = scored.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '400px',
        background: 'radial-gradient(ellipse at 20% 0%, rgba(232,120,154,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 0%, rgba(74,140,92,0.12) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        <header style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '20px' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px', animation: 'float 4s ease infinite' }}>🌸</div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px', letterSpacing: '0.3em',
            color: 'var(--green-light)', marginBottom: '8px',
          }}>AUGUSTA NATIONAL · 2025</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 6vw, 60px)',
            fontWeight: '900', fontStyle: 'italic',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 40%, var(--pink-light) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: '1.1', marginBottom: '8px',
          }}>The Masters</h1>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '16px', fontStyle: 'italic',
            color: 'var(--text-muted)', marginBottom: '16px',
          }}>Sweepstake Leaderboard</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '20px', padding: '6px 16px',
            fontSize: '11px', color: '#4ade80',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#4ade80', display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }} />
            LIVE
            {lastUpdated && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                · {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'float 2s ease infinite' }}>⛳</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.1em' }}>Loading leaderboard...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
            <div>
              {top3.length > 0 && <Podium top3={top3} />}
              <div style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '16px', overflow: 'hidden', marginTop: '24px',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 40px',
                  padding: '10px 20px', fontSize: '9px', letterSpacing: '0.12em',
                  color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                  background: 'linear-gradient(90deg, rgba(201,168,76,0.08) 0%, transparent 100%)',
                }}>
                  <span>POS</span><span>PARTICIPANT</span>
                  <span style={{ textAlign: 'right' }}>POINTS</span>
                  <span style={{ textAlign: 'right' }}>MOVE</span>
                  <span />
                </div>
                {scored.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No participants yet.{' '}
                    <a href="/admin" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Add some →</a>
                  </div>
                ) : (
                  scored.map((p, i) => (
                    <ParticipantRow key={p.id} participant={p} previousRank={previousRanks[p.id]} index={i} />
                  ))
                )}
              </div>
            </div>

            <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <NewsTicker headlines={news} />
              <GolfLeaderboard golfers={golfers} round={round} status={status} />
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <a href="/admin" style={{ color: 'var(--border-bright)', textDecoration: 'none' }}>Admin →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
