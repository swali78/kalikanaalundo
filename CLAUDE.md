# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This project runs **Next.js 16** (App Router, React 19). APIs, conventions, and file structure differ from older Next.js. Before writing framework code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices. Note that both `dev` and `build` scripts pass `--webpack` (Turbopack is not used here).

## Commands

```bash
npm install
npm run dev      # next dev --webpack  → http://localhost:3000
npm run build    # next build --webpack
npm run start    # serve production build
npm run lint     # eslint (config: eslint.config.mjs, extends next)
```

There is no test runner configured.

## What this app is

CIRCLE (branded "kalikkanaalundo.com") is a real-time sports player matchmaking platform for Kerala — "Hinge for sports." Users discover/host/join nearby games, broadcast instant availability ("Play Now" / "Quick Match"), join local communities, chat, and rate players. Scope is Kerala-only, organized around 10 districts (see `District` in `lib/types.ts`).

## Architecture

- **`app/`** — App Router. `layout.tsx` sets fonts/metadata; `app/auth/callback/route.ts` handles the Supabase OAuth redirect. **`app/page.tsx` is currently a static placeholder landing page** and does not yet wire up the feature components below.
- **`components/`** — The actual application UI, all `"use client"`. Two kinds:
  - **Views**: `DiscoverView`, `PlayersNearbyView`, `MyGamesView`, `CommunitiesView`, `ProfileView`.
  - **Modals**: `LoginModal`, `OnboardingModal`, `PlayNowModal`, `QuickMatchModal`, `HostGameModal`, `ChatModal`, `CommunityDetailModal`, `ProfileUpdatePrompt`.
  These are prop-driven: a parent holds shared state (`currentUser`, `games`, `communities`) and passes data + `on*` callbacks down. When wiring the app, the top-level page owns this state.
- **`components/ui/`** — shadcn/ui primitives (see `components.json`).
- **`lib/types.ts`** — Single source of domain types: `User`, `Game`, `Community`, `Sport`, `District`, `SkillLevel`, etc. Read this first to understand the data model.
- **`lib/mockData.ts`** — Mock seed data and helpers (e.g. `getSportEmoji`). Most components import from here as a demo fallback.
- **`lib/supabase/`** — Intended data layer: `client.ts` (browser), `server.ts` (server), `api.ts` (all queries: `fetchNearbyPlayers`, `createGame`, `fetchMessages`/`sendMessage`, `updateProfile`, `signInWithEmail`/`signInWithGoogle`/`signOut`, `fetchOnboardedUsersByDistrict`, `calculateHaversineDistance`, …), plus generated `database.types.ts`.
- **Maps** — Leaflet + react-leaflet. `MapInner.tsx` holds the actual map and must be loaded client-side only (dynamic import, no SSR); `MapViewer.tsx`/`PlayersMap.tsx`/`CommunityMap.tsx` wrap it. Nearby distance uses Haversine on lat/lng, with optional privacy fuzzing (`privacyFuzzLocation`).

### Data flow

Components call into `lib/supabase/api.ts` for live data and fall back to `lib/mockData.ts` for the demo. District is the primary filter dimension throughout (strict district matching for nearby players/games); GPS lat/lng refine "nearby" ordering.

> ⚠️ Working-tree note: `git status` currently shows `lib/supabase/*`, `components/ui/*`, and `supabase/migrations/*` as **deleted**. Components still import from `@/lib/supabase/api` and `@/components/ui/*`, so the build will fail until these are restored (`git checkout -- lib/supabase components/ui supabase/migrations`) or the imports are updated.

## Supabase

See `SUPABASE.md` for full setup. Env vars live in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`). Schema lives in `supabase/migrations/`; apply with `./scripts/apply-supabase-schema.sh`. Tables: `profiles`, `games`, `game_participants`, `messages`, `communities`, `community_members`, `ratings`, all with RLS. Realtime is enabled on `games` and `messages`.

## Conventions

- Path alias `@/*` maps to the repo root (see `tsconfig.json`).
- Styling is Tailwind v4 (`app/globals.css`, `@tailwindcss/postcss`); brand colors green `#22C55E` and blue `#3B82F6`. Mobile-first design. Note `app/page.tsx` uses inline styles — the rest of the app uses Tailwind.
- Icons via `lucide-react`; toasts via `sonner`/`react-hot-toast`; animation via `framer-motion`; forms via `react-hook-form` + `zod`.
