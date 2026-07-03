# Supabase Setup for CIRCLE

## Project
- Ref: `ijvzvxbgpclslcvdspot`
- URL: `https://ijvzvxbgpclslcvdspot.supabase.co`

## 1. Environment Variables

Update `.env.local` (already created with placeholders):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ijvzvxbgpclslcvdspot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Get from Dashboard → Project Settings → API

DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.ijvzvxbgpclslcvdspot.supabase.co:5432/postgres

SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server only
```

**Where to find keys:**
- Dashboard → Project Settings → API
- `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
- Database password → Project Settings → Database → Connection String (or the one you used to create the project)

## 2. Apply the Database Schema

### Option A: Using the script (recommended)
```bash
# 1. Fill in the real password in .env.local
# 2. Run:
./scripts/apply-supabase-schema.sh
# or with explicit string:
./scripts/apply-supabase-schema.sh "postgresql://postgres:realpass@db.ijvzvxbgpclslcvdspot.supabase.co:5432/postgres"
```

### Option B: Direct psql
```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
psql "postgresql://postgres:YOUR_PASSWORD@db.ijvzvxbgpclslcvdspot.supabase.co:5432/postgres" \
  -f supabase/migrations/20250630120000_create_circle_schema.sql
```

### Option C: Supabase Dashboard (easiest for first time)
1. Go to https://supabase.com/dashboard/project/ijvzvxbgpclslcvdspot/sql/new
2. Copy the entire content of `supabase/migrations/20250630120000_create_circle_schema.sql`
3. Paste and run.

## 3. Enable Realtime (if not already)
The migration already runs:
```sql
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.messages;
```

You can verify in Dashboard → Database → Replication.

## 4. Authentication Setup
- Go to Authentication → Providers
- Enable **Email** (for now)
- Optionally enable **Google** (add OAuth credentials later)

## 5. Next.js Integration
The app is already prepared with:
- `@supabase/supabase-js`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- Type-safe Database types

After setting the two `NEXT_PUBLIC_SUPABASE_*` vars and restarting the dev server, the client will connect.

## 6. (Optional) Supabase CLI full setup
If you want to use `supabase` commands fully:

```bash
# In your terminal (not this agent)
supabase login
supabase link --project-ref ijvzvxbgpclslcvdspot
supabase db push
```

This is useful for local development (`supabase start`) later.

## Tables Created
- `profiles`
- `games`
- `game_participants`
- `messages`
- `communities`
- `community_members`
- `ratings`

All with proper RLS policies for security.

## Next
Once the schema is applied and keys are in `.env.local`:
- Restart `npm run dev`
- The app will be ready to use real Supabase (auth + data)
- We can then replace the remaining mock data with live queries.
