# CIRCLE

> Never Play Alone.

CIRCLE is a modern player matchmaking platform for sports in Kerala. Think Hinge for sports — discover, join, and host games with people nearby.

**MVP Goal:** Can someone in Kerala open CIRCLE, find a nearby game within minutes, join it effortlessly, and show up to play?

## Key Differentiator: Play Now

Instead of only listing static posts, the signature "Play Now" feature lets users instantly broadcast:

"I'm free today from 6–8 PM in Kochi looking for 1 beginner badminton partner."

Nearby matching players get notified in real time.

## Tech

- **Next.js 16** + TypeScript + Tailwind
- shadcn/ui + Framer Motion + Sonner
- Pure React state + localStorage for instant demo (Supabase ready to plug)
- Mobile-first, premium minimalist design (Apple + Airbnb + Linear)
- PWA-ready manifest

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

- Click **Join Now** → pick any login option
- Complete the quick onboarding
- Try **Play Now** (the green button)
- Host a game, join games, chat, rate after play

Use "Play Now" → broadcast → accept a match to feel the signature experience.

## Design

- Primary: `#22C55E` (green)
- Accent: `#3B82F6` (blue)
- Large rounded cards, soft shadows, generous spacing
- Light mode first, full dark support

## Data model (ready for Supabase)

- `users`, `games`, `game_players`, `communities`, `ratings`, `messages`

All mock data lives in `lib/mockData.ts` and `lib/types.ts`.

## Next steps for production

- Add real Supabase (Auth + DB + Realtime + Storage)
- Google Maps integration (or Mapbox)
- Real push notifications
- Image uploads for profile + venues
- Approval flow toggle for hosts
- Production deployment to Vercel

## Launch scope

Kerala only. Beginner-friendly. No court booking in MVP.

Built for fast, delightful, reliable experiences.

---

Made to solve one problem really well:

**"I want to play today, but I don't have anyone to play with."**
