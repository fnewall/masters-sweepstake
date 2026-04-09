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
            fontWeight: '9
