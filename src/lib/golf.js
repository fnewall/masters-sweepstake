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
    console.log('ESPN competitor:', JSON.stringify(competitors[0]))

    const golfers = competitors.map(c => {
      const athlete = c.athlete || {}
      const isCut = c.status?.type?.name === 'cut' ||
        c.status?.displayValue?.toLowerCase().includes('cut') ||
        c.status?.type?.description?.toLowerCase().includes('cut')

      const position = c.status?.position?.id
        ? parseInt(c.status.position.id)
        : 999

      const totalScore = parseInt(c.statistics?.find(s => s.name === 'totalScore')?.value) || 0
      const todayScore = parseInt(c.linescores?.slice(-1)[0]?.value) || 0

      return {
        id: athlete.id,
        name: athlete.displayName || athlete.fullName || 'Unknown',
        shortName: athlete.shortName || athlete.displayName,
        position: isCut ? null : position,
        positionDisplay: isCut ? 'CUT' : (c.status?.position?.displayName || `${position}`),
        score: c.score || 'E',
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

function fuzzyMatch(search, target) {
  search = search.toLowerCase().trim()
  target = target.toLowerCase().trim()
  if (target.includes(search)) return true
  const searchParts = search.split(' ')
  const targetParts = target.split(' ')
  // Check last name match with typo tolerance
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
  // Check if all search parts appear somewhere in target
  return searchParts.every(part => part.length > 2 && target.includes(part))
}

export function calculateSweepstakeScores(participants, golfers) {
  const scored = participants.map(p => {
    const picks = p.picks || []
    let totalScore = 0

    const pickDetails = picks.map(pick => {
      const searchName = pick.golfer_name.toLowerCase().trim()

      // Try exact match first
      let golfer = golfers.find(g => g.name.toLowerCase().trim() === searchName)

      // Try fuzzy match
      if (!golfer) {
        golfer = golfers.find(g => fuzzyMatch(searchName, g.name))
      }

      // Try last name only
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
