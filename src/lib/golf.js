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
    const status = competition?.status?.type?.description || 'In Progress'
    const round = competition?.status?.period || 1

    const golfers = competitors.map((c, index) => {
      const athlete = c.athlete || {}
      const linescores = c.linescores || []
      const stats = c.statistics?.categories?.[0]?.stats || []

      // Total score is in linescores - each entry is a round
      // value is score relative to par for that round
      const roundScores = linescores.filter(l => l.scoreType?.displayValue !== undefined)
      const totalScoreVal = roundScores.reduce((sum, l) => sum + (parseInt(l.value) || 0), 0)

      // Today's round score
      const todayScore = roundScores.length > 0
        ? (parseInt(roundScores[roundScores.length - 1].value) || 0)
        : 0

      // Thru holes - stats[5] appears to be holes played
      const thruVal = stats[5]?.displayValue || '-'

      // Has started if any round scores exist
      const hasStarted = roundScores.length > 0 || (thruVal !== '-' && thruVal !== '0')

      return {
        id: athlete.id,
        name: athlete.displayName || athlete.fullName || 'Unknown',
        shortName: athlete.shortName || athlete.displayName,
        position: hasStarted ? index + 1 : 999,
        positionDisplay: hasStarted ? `${index + 1}` : '-',
        totalScore: totalScoreVal,
        today: todayScore,
        thru: thruVal,
        isCut: false,
        hasStarted,
      }
    })

    const started = golfers.filter(g => g.hasStarted).sort((a, b) => a.totalScore - b.totalScore)
    const notStarted = golfers.filter(g => !g.hasStarted)
    started.forEach((g, i) => {
      g.position = i + 1
      g.positionDisplay = `${i + 1}`
    })

    return {
      golfers: [...started, ...notStarted],
      round,
      status,
      eventName: masters.name
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
    return { golfers: [], round: null, status: 'unavailable' }
  }
}

function fuzzyMatch(search, target) {
  search = search.toLowerCase().trim()
  target = target.toLowerCase().trim()
  if (target.includes(search)) return true
  const searchParts = search.split(' ')
  const targetParts = target.split(' ')
  const searchLast = searchParts[searchParts.length - 1]
  const targetLast = targetParts[targetParts.length - 1]
  if (searchLast.length > 3) {
    let diff = 0
    const len = Math.max(searchLast.length, targetLast.length)
    for (let i = 0; i < len; i++) {
      if (searchLast[i] !== targetLast[i]) diff++
    }
    if (diff <= 2) return true
  }
  return searchParts.every(part => part.length > 2 && target.includes(part))
}

export function calculateSweepstakeScores(participants, golfers) {
  const scored = participants.map(p => {
    const picks = p.picks || []
    let totalScore = 0

    const pickDetails = picks.map(pick => {
      const searchName = pick.golfer_name.toLowerCase().trim()
      let golfer = golfers.find(g => g.name.toLowerCase().trim() === searchName)
      if (!golfer) golfer = golfers.find(g => fuzzyMatch(searchName, g.name))
      if (!golfer) {
        const lastName = searchName.split(' ').slice(-1)[0]
        golfer = golfers.find(g => g.name.toLowerCase().includes(lastName))
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
        } else if (!golfer.hasStarted) {
          points = 50
          positionDisplay = 'DNS'
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
        score: golfer?.totalScore !== undefined
          ? golfer.totalScore === 0 ? 'E'
            : golfer.totalScore > 0 ? `+${golfer.totalScore}`
            : `${golfer.totalScore}`
          : '-',
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
