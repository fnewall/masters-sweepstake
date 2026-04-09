export async function fetchMastersLeaderboard() {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error('ESPN fetch failed')
    const json = await res.json()

    const events = json.events || []
    const masters = events.find(e =>
      e.name?.toLowerCase().includes('masters') ||
      e.shortName?.toLowerCase().includes('masters')
    ) || events[0]

    if (!masters) return { golfers: [], round: null, status: 'unavailable' }

    const competition = masters.competitions?.[0]
    const competitors = competition?.competitors || []

    const golfers = competitors.map(c => {
      const athlete = c.athlete || {}
      const isCut = c.status?.type?.name === 'cut' ||
        c.status?.displayValue?.toLowerCase().includes('cut') ||
        c.status?.type?.description?.toLowerCase().includes('cut')

      let position = c.status?.position?.id
        ? parseInt(c.status.position.id)
        : 999

      const scoreVal = c.statistics?.find(s => s.name === 'totalScore')?.displayValue
        || c.score || 'E'

      const totalScore = parseInt(c.statistics?.find(s => s.name === 'totalScore')?.value) || 0
      const todayScore = parseInt(c.linescores?.slice(-1)[0]?.value) || 0

      return {
        id: athlete.id,
        name: athlete.displayName || athlete.fullName || 'Unknown',
        shortName: athlete.shortName || athlete.displayName,
        position: isCut ? null : position,
        positionDisplay: isCut ? 'CUT' : (c.status?.position?.displayName || `${position}`),
        score: scoreVal,
        totalScore,
        today: todayScore,
        thru: c.status?.thru || '-',
        isCut,
      }
    }).sort((a, b) => {
      if (a.isCut && !b.isCut) return 1
      if (!a.isCut && b.isCut) return -1
      return (a.position || 999) - (b.position || 999)
    })

    const status = competition?.status?.type?.description || 'In Progress'
    const round = competition?.status?.period || 1

    return { golfers, round, status, eventName: masters.name }
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
    return { golfers: [], round: null, status: 'unavailable' }
  }
}

export function calculateSweepstakeScores(participants, golfers) {
  const positionMap = {}
  golfers.forEach(g => {
    positionMap[g.name.toLowerCase().trim()] = g
  })

  const scored = participants.map(p => {
    const picks = p.picks || []
    let totalScore = 0
    const pickDetails = picks.map(pick => {
      const name = pick.golfer_name.toLowerCase().trim()
      let golfer = positionMap[name]
      if (!golfer) {
        const lastName = name.split(' ').slice(-1)[0]
        golfer = golfers.find(g =>
          g.name.toLowerCase().includes(lastName) ||
          g.shortName?.toLowerCase().includes(lastName)
        )
      }

      let points = 100
      let position = null
      let positionDisplay = 'N/A'
      let isCut = false

      if (golfer) {
        if (golfer.isCut) {
          points = 100
          positionDisplay = 'CUT'
          isCut = true
        } else {
          points = golfer.position || 100
          position = golfer.position
          positionDisplay = golfer.positionDisplay
        }
      }

      totalScore += points
      return {
        golferName: pick.golfer_name,
        points,
        position,
        positionDisplay,
        isCut,
        score: golfer?.score || '-',
        today: golfer?.today || 0,
        thru: golfer?.thru || '-',
        found: !!golfer,
      }
    })

    return { ...p, totalScore, pickDetails, rank: 0 }
  })

  scored.sort((a, b) => a.totalScore - b.totalScore)
  let currentRank = 1
  scored.forEach((p, i) => {
    if (i > 0 && p.totalScore === scored[i - 1].totalScore) {
      p.rank = scored[i - 1].rank
    } else {
      p.rank = currentRank
    }
    currentRank++
  })

  return scored
}

export async function fetchMastersNews() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/golf/pga/news?limit=5')
    if (!res.ok) throw new Error()
    const json = await res.json()
    return (json.articles || []).slice(0, 4).map(a => ({
      headline: a.headline,
      description: a.description,
      published: a.published,
    }))
  } catch {
    return []
  }
}
