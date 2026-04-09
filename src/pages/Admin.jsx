import React, { useState, useEffect } from 'react'
import { getParticipants, addParticipant, updateParticipant, deleteParticipant, setPicks } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'masters2026'

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: 'var(--white)',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

const btnStyle = (variant = 'primary') => ({
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
    color: 'var(--bg)',
  } : variant === 'danger' ? {
    background: 'rgba(248,113,113,0.15)',
    border: '1px solid rgba(248,113,113,0.3)',
    color: '#f87171',
  } : {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
  }),
})

function EditModal({ participant, onSave, onClose }) {
  const [name, setName] = useState(participant?.name || '')
  const [picks, setPicks_] = useState(
    participant?.picks?.map(p => p.golfer_name) || ['', '', '', '']
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const picksArr = [...picks]
  while (picksArr.length < 4) picksArr.push('')

  async function handleSave() {
    if (!name.trim()) return setError('Name required')
    setSaving(true)
    setError('')
    try {
      let id = participant?.id
      if (!id) {
        const p = await addParticipant(name.trim())
        id = p.id
      } else {
        await updateParticipant(id, name.trim())
      }
      await setPicks(id, picksArr.filter(p => p.trim()))
      onSave()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '20px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border-bright)',
        borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
        animation: 'fadeIn 0.2s ease',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px', fontWeight: '700',
          color: 'var(--gold-light)', marginBottom: '24px',
        }}>
          {participant?.id ? 'Edit Participant' : 'Add Participant'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              PARTICIPANT NAME
            </label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
              GOLFER PICKS (UP TO 4)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {picksArr.map((pick, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</span>
                  <input
                    style={inputStyle}
                    value={pick}
                    onChange={e => {
                      const next = [...picksArr]
                      next[i] = e.target.value
                      setPicks_(next)
                    }}
                    placeholder={`Golfer ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div style={{ fontSize: '12px', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '10px', borderRadius: '6px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button style={btnStyle('ghost')} onClick={onClose}>Cancel</button>
            <button style={btnStyle('primary')} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      loadParticipants()
    } else {
      setPwError('Incorrect password')
    }
  }

  async function loadParticipants() {
    setLoading(true)
    try {
      const data = await getParticipants()
      setParticipants(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}?`)) return
    await deleteParticipant(id)
    loadParticipants()
  }

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)', padding: '20px',
      }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border-bright)',
          borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '360px',
          textAlign: 'center', animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⛳</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px', fontWeight: '700',
            color: 'var(--gold-light)', marginBottom: '8px',
          }}>Admin Panel</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Masters 2025 Sweepstake
          </p>
          <input
            style={{ ...inputStyle, marginBottom: '12px', textAlign: 'center' }}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
          />
          {pwError && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px' }}>{pwError}</div>}
          <button style={{ ...btnStyle('primary'), width: '100%' }} onClick={handleLogin}>Enter</button>
          <div style={{ marginTop: '20px' }}>
            <a href="/" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to leaderboard</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 20px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '32px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: '28px',
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px', fontWeight: '700', color: 'var(--gold-light)',
            }}>Admin Panel</h1>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Leaderboard</a>
            <button style={btnStyle('primary')} onClick={() => { setEditTarget(null); setShowModal(true) }}>
              + Add Participant
            </button>
          </div>
        </div>

        <input
          style={{ ...inputStyle, marginBottom: '20px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search participants..."
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {search ? 'No results' : 'No participants yet. Add the first one!'}
              </div>
            )}
            {filtered.map(p => (
              <div key={p.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: 'fadeIn 0.3s ease',
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '15px', fontWeight: '600', color: 'var(--white)', marginBottom: '4px',
                  }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {p.picks?.length > 0 ? p.picks.map(pk => pk.golfer_name).join(' · ') : 'No picks yet'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={btnStyle('ghost')} onClick={() => { setEditTarget(p); setShowModal(true) }}>Edit</button>
                  <button style={btnStyle('danger')} onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EditModal
          participant={editTarget}
          onSave={() => { setShowModal(false); loadParticipants() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
