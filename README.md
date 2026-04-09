# Masters 2025 Sweepstake Leaderboard

Live sweepstake leaderboard for The Masters 2025, powered by live ESPN golf data.

## Setup

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and open your project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_PASSWORD=choose_a_password
```

### 3. Deploy to Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Connect your repo
4. Add environment variables in **Site settings → Environment variables**
5. Deploy!

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 4. Local Development

```bash
npm install
npm run dev
```

## Using the App

- **Leaderboard**: `yoursite.netlify.app/`
- **Admin panel**: `yoursite.netlify.app/admin` (password protected)

### Adding Participants

1. Go to `/admin`
2. Enter your admin password
3. Click **+ Add Participant**
4. Enter their name and up to 4 golfer picks
5. Save — they appear on the leaderboard immediately

### Scoring

- Each golfer's tournament position is added together
- Missed cut = 100 points
- Lowest total score wins
- Leaderboard auto-refreshes every 60 seconds

## Tech Stack

- React + Vite
- Supabase (database)
- ESPN unofficial API (live golf data)
- Netlify (hosting)
