-- Add support for communities posting games + per-community registration requirements
-- Run this on the live DB (additive, safe)

-- Link games to communities (nullable so individual games continue to work)
ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id);

-- Community game registration requirements
ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS requires_membership boolean DEFAULT false;

ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS min_age integer;

ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS max_age integer;

ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS required_gender text;  -- 'Male' | 'Female' | 'Any' | null

ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS approval_required boolean DEFAULT false;

ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS registration_notes text;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_games_community ON public.games(community_id) WHERE community_id IS NOT NULL;

-- Optional: relax policies slightly so community members can also update/manage games they posted for the community (MVP keeps host-based for simplicity)

-- Add a helper to easily fetch community games
-- (we will use it in client queries)

COMMENT ON COLUMN public.games.community_id IS 'If set, this game is posted on behalf of a community';
COMMENT ON COLUMN public.games.requires_membership IS 'User must be a member of the linked community to register';
COMMENT ON COLUMN public.games.required_gender IS 'Restrict to specific gender for this community event';
