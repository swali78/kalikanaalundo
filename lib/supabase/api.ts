import { createClient } from './client';
import { Database } from './database.types';
import { Game, User as AppUser, Message, Sport, SkillLevel, District, Community } from '@/lib/types';

const supabase = createClient() as any; // cast until real anon key is set in .env.local

// Helper to map DB row to our app Game type
function mapGameRow(row: any, hostProfile: any, participants: any[] = []): Game {
  return {
    id: row.id,
    sport: row.sport as Sport,
    host: hostProfile ? mapProfileToUser(hostProfile) : ({} as AppUser),
    venue: row.venue,
    district: row.district as District,
    date: row.date,
    time: row.time,
    duration: row.duration,
    skillLevel: row.skill_level as SkillLevel,
    maxPlayers: row.max_players,
    currentPlayers: row.current_players,
    players: participants.map((p: any) => mapProfileToUser(p?.profiles ? p.profiles : p)).filter(Boolean),
    description: row.description || undefined,
    entryFee: row.entry_fee || 0,
    isPublic: row.is_public,
    beginnerFriendly: row.beginner_friendly,
    equipmentRequired: row.equipment_required || undefined,
    distance: undefined, // computed client side if needed
    latitude: row.lat || row.latitude || undefined,
    longitude: row.lng || row.longitude || undefined,

    // Community + requirements (new columns)
    communityId: row.community_id || undefined,
    communityName: row.community?.name || row.communities?.name || undefined,
    requiresMembership: row.requires_membership ?? false,
    minAge: row.min_age || undefined,
    maxAge: row.max_age || undefined,
    requiredGender: row.required_gender || undefined,
    approvalRequired: row.approval_required ?? false,
    registrationNotes: row.registration_notes || undefined,
  };
}

function mapProfileToUser(profile: any): AppUser {
  if (!profile) {
    return {
      id: 'unknown',
      name: 'Unknown Player',
      age: 25,
      gender: undefined,
      city: 'Kochi',
      district: 'Ernakulam' as District,
      avatar: 'https://ui-avatars.com/api/?name=Unknown&background=22C55E&color=fff',
      bio: '',
      sports: [] as Sport[],
      skillLevel: 'Beginner' as SkillLevel,
      availability: [] as any,
      rating: 4.5,
      gamesPlayed: 0,
      verified: false,
      latitude: undefined,
      longitude: undefined,
      instagram: undefined,
      privacyFuzzLocation: true,
    };
  }
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age || 25,
    gender: profile.gender || undefined,
    city: profile.city || 'Kochi',
    district: (profile.district || 'Ernakulam') as District,
    avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Player')}&background=22C55E&color=fff`,
    bio: profile.bio || '',
    sports: (profile.sports || []) as Sport[],
    skillLevel: (profile.skill_level || 'Beginner') as SkillLevel,
    availability: (profile.availability || []) as any,
    rating: profile.rating || 4.5,
    gamesPlayed: profile.games_played || 0,
    verified: profile.verified || false,
    latitude: profile.lat || profile.latitude || undefined,
    longitude: profile.lng || profile.longitude || undefined,
    instagram: profile.instagram || undefined,
    privacyFuzzLocation: profile.privacy_fuzz_location ?? true,
    role: profile.role || 'player',
    onboarded: profile.onboarded === true || profile.onboarded === 'true' || (profile.age !== null && profile.age !== undefined && profile.city !== null && profile.city !== undefined && profile.sports && profile.sports.length > 0),
  };
}

// Fetch current auth user + profile
export async function getCurrentUser(): Promise<AppUser | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    return mapProfileToUser(profile);
  }

  // Auto-create minimal profile if missing (from trigger or here)
  const newProfile = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Player',
    avatar_url: user.user_metadata?.avatar_url || null,
  };

  const { data } = await supabase.from('profiles').insert(newProfile as any).select().single();
  return data ? mapProfileToUser(data) : null;
}

// Fetch recommended players (simple overlap on sports, exclude self)
export async function fetchRecommendedPlayers(currentUserId: string, currentSports: string[]): Promise<AppUser[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId)
    .limit(20);

  if (error || !data) return [];

  return data
    .filter((p: any) => p.id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && p.name !== 'Demo User' && (p.sports || []).some((s: string) => currentSports.includes(s)))
    .map(mapProfileToUser)
    .slice(0, 10);
}

// Fetch nearby like-minded players in the same district or by GPS distance
export async function fetchNearbyPlayers(
  currentUserId: string, 
  district: string, 
  currentSports?: string[],
  userLat?: number,
  userLng?: number,
  isGpsActive?: boolean
): Promise<AppUser[]> {
  if (!supabase) return [];

  // If GPS is active and we have coordinates, query all profiles to find everyone nearby by GPS distance
  let query = supabase.from('profiles').select('*').neq('id', currentUserId);
  if (!isGpsActive || userLat === undefined || userLng === undefined) {
    query = query.ilike('district', `%${district}%`);
  }

  const { data, error } = await query;

  let rawData = data;
  if (error || !rawData || rawData.length === 0) {
    // Fallback: fetch all other players
    const { data: allData } = await supabase.from('profiles').select('*').neq('id', currentUserId);
    if (!allData) return [];
    rawData = allData;
  }

  let players = rawData
    .filter((p: any) => p.id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && p.name !== 'Demo User')
    .map((p: any) => {
      const mapped = mapProfileToUser(p);
      if (userLat !== undefined && userLng !== undefined) {
        let pLat = mapped.latitude;
        let pLng = mapped.longitude;
        if (!pLat || !pLng) {
          // Generate realistic deterministic approximate coordinates for demo/testing if missing
          const hash = mapped.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          pLat = 10.0159 + ((hash % 20) - 10) * 0.005;
          pLng = 76.3419 + (((hash * 3) % 20) - 10) * 0.005;
        }
        mapped.distance = calculateHaversineDistance(userLat, userLng, pLat, pLng);
      }
      return mapped;
    });

  if ((isGpsActive || (userLat !== undefined && userLng !== undefined)) && players.some((p: AppUser) => p.distance !== undefined)) {
    // Sort closest players first
    players.sort((a: AppUser, b: AppUser) => {
      if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });
  } else if (currentSports && currentSports.length > 0) {
    // Sort players who share sports to the top
    players.sort((a: AppUser, b: AppUser) => {
      const aMatch = (a.sports || []).some((s: any) => currentSports.includes(s)) ? 1 : 0;
      const bMatch = (b.sports || []).some((s: any) => currentSports.includes(s)) ? 1 : 0;
      return bMatch - aMatch;
    });
  }
  return players;
}

// Fetch community members with registration details for community creators
export async function fetchCommunityMembers(communityId: string): Promise<AppUser[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('community_members')
    .select('profiles (*)')
    .eq('community_id', communityId);

  if (error || !data) return [];

  return data
    .map((row: any) => row.profiles ? mapProfileToUser(row.profiles) : null)
    .filter(Boolean) as AppUser[];
}


// Fetch games with host and participants
export async function fetchGames(filters?: {
  sport?: Sport | 'All';
  skill?: SkillLevel | 'All';
  freeOnly?: boolean;
  beginnerOnly?: boolean;
  district?: string;
}): Promise<Game[]> {
  if (!supabase) return [];

  let query = supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey (*),
      participants:game_participants (
        profiles (*)
      ),
      community:communities (*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (filters?.sport && filters.sport !== 'All') {
    query = query.eq('sport', filters.sport);
  }
  if (filters?.skill && filters.skill !== 'All') {
    query = query.eq('skill_level', filters.skill);
  }
  if (filters?.freeOnly) {
    query = query.eq('entry_fee', 0);
  }
  if (filters?.beginnerOnly) {
    query = query.eq('beginner_friendly', true);
  }
  if (filters?.district) {
    query = query.eq('district', filters.district);
  }

  const { data, error } = await query;

  if (error) {
    console.error('fetchGames error:', error);
    return [];
  }

  return (data || [])
    .filter((row: any) => row.host_id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && row.host?.name !== 'Demo User')
    .map((row: any) => {
      const participants = (row.participants || [])
        .map((p: any) => p?.profiles)
        .filter((prof: any) => prof && prof.id);
      return mapGameRow(row, row.host, participants);
    });
}

// Create a new game
export async function createGame(gameData: {
  sport: Sport;
  venue: string;
  district: District;
  date: string;
  time: string;
  duration: number;
  skillLevel: SkillLevel;
  maxPlayers: number;
  description?: string;
  entryFee?: number;
  beginnerFriendly?: boolean;
  equipmentRequired?: string;
  latitude?: number;
  longitude?: number;
  // New: community posting + requirements
  communityId?: string;
  requiresMembership?: boolean;
  minAge?: number;
  maxAge?: number;
  requiredGender?: string;
  approvalRequired?: boolean;
  registrationNotes?: string;
}): Promise<Game | null> {
  if (!supabase) return null;

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in to host a game');

  const insertData: any = {
    sport: gameData.sport,
    host_id: user.id,
    venue: gameData.venue,
    district: gameData.district,
    date: gameData.date,
    time: gameData.time,
    duration: gameData.duration,
    skill_level: gameData.skillLevel,
    max_players: gameData.maxPlayers,
    current_players: 1,
    description: gameData.description,
    entry_fee: gameData.entryFee || 0,
    is_public: true,
    beginner_friendly: gameData.beginnerFriendly ?? true,
    equipment_required: gameData.equipmentRequired,
    lat: gameData.latitude || null,
    lng: gameData.longitude || null,
  };

  // Attach community + requirements when provided (community-posted game)
  if (gameData.communityId) {
    insertData.community_id = gameData.communityId;
    insertData.requires_membership = !!gameData.requiresMembership;
    insertData.min_age = gameData.minAge || null;
    insertData.max_age = gameData.maxAge || null;
    insertData.required_gender = gameData.requiredGender || null;
    insertData.approval_required = !!gameData.approvalRequired;
    insertData.registration_notes = gameData.registrationNotes || null;
  }

  const { data, error } = await supabase
    .from('games')
    .insert(insertData)
    .select(`
      *,
      host:profiles!games_host_id_fkey (*),
      community:communities (*)
    `)
    .single();

  if (error) {
    console.error('createGame error:', error);
    throw error;
  }

  // Add host as participant
  await supabase.from('game_participants').insert({
    game_id: data.id,
    user_id: user.id,
  } as any);

  // If this is a community game and host is not yet a member, auto-join them to the community (MVP convenience)
  if (gameData.communityId) {
    await supabase.from('community_members').upsert({
      community_id: gameData.communityId,
      user_id: user.id,
      role: 'member'
    } as any, { onConflict: 'community_id,user_id' });
  }

  const communityName = data.community?.name || undefined;
  const mapped = mapGameRow(data, data.host, [{ profiles: data.host }]);
  if (communityName) mapped.communityName = communityName;

  return mapped;
}

// Leave a game
export async function leaveGame(gameId: string): Promise<boolean> {
  if (!supabase) return false;

  const user = await getCurrentUser();
  if (!user) return false;

  const { error } = await supabase
    .from('game_participants')
    .delete()
    .eq('game_id', gameId)
    .eq('user_id', user.id);

  return !error;
}

// Fetch messages for a game
export async function fetchMessages(gameId: string): Promise<Message[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(name, avatar_url, instagram)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchMessages error:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    gameId,
    userId: m.user_id,
    userName: m.profiles?.name || 'Player',
    user: {
      id: m.user_id || 'player',
      name: m.profiles?.name || 'Player',
      age: 25,
      city: 'Kochi',
      district: 'Ernakulam',
      avatar: m.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.profiles?.name || 'Player')}&background=22C55E&color=fff`,
      sports: [],
      skillLevel: 'Beginner',
      availability: [],
      rating: 5,
      gamesPlayed: 1,
      verified: true,
      instagram: m.profiles?.instagram || undefined,
    },
    text: m.text,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
}

// Send a chat message
export async function sendMessage(gameId: string, text: string): Promise<Message | null> {
  if (!supabase) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      game_id: gameId,
      user_id: user.id,
      text,
    } as any)
    .select('*, profiles(name, avatar_url, instagram)')
    .single();

  if (error) {
    console.error('sendMessage error:', error);
    return null;
  }

  return {
    id: data.id,
    gameId,
    userId: data.user_id,
    userName: data.profiles?.name || user.name,
    user: {
      ...user,
      name: data.profiles?.name || user.name,
      avatar: data.profiles?.avatar_url || user.avatar,
      instagram: data.profiles?.instagram || user.instagram,
    },
    text: data.text,
    timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

// Realtime subscription helper for messages
export function subscribeToMessages(gameId: string, onMessage: (msg: Message) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `game_id=eq.${gameId}` },
      async (payload: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url, instagram')
          .eq('id', payload.new.user_id)
          .single();

        onMessage({
          id: payload.new.id,
          gameId,
          userId: payload.new.user_id,
          userName: profile?.name || 'Player',
          user: {
            id: payload.new.user_id || 'player',
            name: profile?.name || 'Player',
            age: 25,
            city: 'Kochi',
            district: 'Ernakulam',
            avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Player')}&background=22C55E&color=fff`,
            sports: [],
            skillLevel: 'Beginner',
            availability: [],
            rating: 5,
            gamesPlayed: 1,
            verified: true,
            instagram: profile?.instagram || undefined,
          },
          text: payload.new.text,
          timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Simple auth helpers
export async function signInWithEmail(email: string) {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      shouldCreateUser: true,
    },
  });
  return { error };
}

export async function signInWithGoogle() {
  // Must be called from client (uses window for redirectTo)
  if (typeof window === 'undefined') return { error: 'Must be called in browser' };

  const client = (await import('./client')).createClient();
  if (!client) return { error: 'Supabase not configured' };

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { error };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

// Update current user's profile (supports new fields for map + instagram)
export async function updateProfile(updates: Partial<AppUser & { latitude?: number; longitude?: number; instagram?: string; privacyFuzzLocation?: boolean }>) {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in' };

  const dbUpdates: any = {
    name: updates.name,
    age: updates.age,
    gender: updates.gender,
    city: updates.city,
    district: updates.district,
    bio: updates.bio,
    sports: updates.sports,
    skill_level: updates.skillLevel,
    availability: updates.availability,
    avatar_url: updates.avatar,
    instagram: updates.instagram,
    lat: updates.latitude,
    lng: updates.longitude,
    privacy_fuzz_location: updates.privacyFuzzLocation,
    role: updates.role,
    onboarded: updates.onboarded,
  };

  // Remove undefined
  Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

  const { error } = await supabase.from('profiles').upsert({ id: user.id, ...dbUpdates });
  return { error };
}

// Haversine distance helper (returns distance in km)
export function calculateHaversineDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | undefined {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return undefined;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Fetch total onboarded users count from profiles table (excluding incomplete registrations)
export async function fetchTotalOnboardedUsers(): Promise<number> {
  if (!supabase) return 0;
  try {
    // 1. Query users who explicitly have onboarded flag set to true
    const { count: explicitCount, error: countErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .or('onboarded.eq.true,onboarded.eq."true"');
    
    if (!countErr && typeof explicitCount === 'number' && explicitCount > 0) {
      return explicitCount;
    }

    // 2. Fallback: filter profiles to count only those who actually completed onboarding (selected sports & city)
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarded, sports, age, city');
    
    if (!error && data) {
      const onboardedCount = data.filter((p: any) => 
        p.onboarded === true || 
        p.onboarded === 'true' || 
        (p.city && p.sports && Array.isArray(p.sports) && p.sports.length > 0)
      ).length;
      return onboardedCount;
    }
  } catch {
    // fallback
  }
  return 0;
}

// Delete demo/mock public games data
export async function deleteDemoPublicGames(): Promise<{ success: boolean; deletedCount?: number }> {
  return wipeAllDemoData();
}

// Complete purge of all demo/mock data across tables
export async function wipeAllDemoData(): Promise<{ success: boolean; deletedCount?: number }> {
  if (!supabase) return { success: true, deletedCount: 0 };
  try {
    const { error: gError, count: gCount } = await supabase
      .from('games')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('communities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    return { success: !gError, deletedCount: gCount || 0 };
  } catch (e) {
    return { success: false };
  }
}

// ============ NEW: Community + Requirements support ============

export async function fetchUserCommunityMembership(communityId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function joinCommunity(communityId: string): Promise<boolean> {
  if (!supabase) return false;
  const user = await getCurrentUser();
  if (!user) return false;

  const { error } = await supabase.from('community_members').upsert({
    community_id: communityId,
    user_id: user.id,
    role: 'member'
  } as any, { onConflict: 'community_id,user_id' });

  return !error;
}

export async function fetchGamesForCommunity(communityId: string): Promise<Game[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey (*),
      participants:game_participants ( profiles (*) ),
      community:communities (*)
    `)
    .eq('community_id', communityId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchGamesForCommunity error', error);
    return [];
  }

  return (data || [])
    .filter((row: any) => row.host_id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && row.host?.name !== 'Demo User')
    .map((row: any) => {
      const parts = (row.participants || [])
        .map((p: any) => p?.profiles)
        .filter((prof: any) => prof && prof.id);
      const g = mapGameRow(row, row.host, parts);
      if (row.community?.name) g.communityName = row.community.name;
      return g;
    });
}

export async function fetchCommunities(): Promise<Community[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('communities').select('*');
    if (error || !data || data.length === 0) {
      return [];
    }
    return data
      .filter((row: any) => !row.name?.toLowerCase().includes('demo'))
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        district: row.district || 'Ernakulam',
        memberCount: row.member_count || 1,
        isPublic: row.is_public ?? true,
        latitude: row.lat || row.latitude || 10.0159,
        longitude: row.lng || row.longitude || 76.3419,
        creatorId: row.created_by,
      }));
  } catch (e) {
    return [];
  }
}

// Check whether a user profile meets a game's community requirements. Returns { canJoin: boolean, reasons: string[] }
export async function checkGameRequirements(game: Game, currentUser: AppUser | null): Promise<{ canJoin: boolean; reasons: string[] }> {
  const reasons: string[] = [];

  if (!game || !currentUser) {
    return { canJoin: false, reasons: ['Please log in first'] };
  }

  // Community membership requirement
  if (game.communityId && game.requiresMembership) {
    const isMember = await fetchUserCommunityMembership(game.communityId, currentUser.id);
    if (!isMember) {
      reasons.push(`You must be a member of ${game.communityName || 'the community'}`);
    }
  }

  // Age requirements
  const userAge = currentUser.age || 25;
  if (game.minAge && game.minAge > 0 && userAge < game.minAge) {
    reasons.push(`Minimum age is ${game.minAge} (you are ${userAge})`);
  }
  if (game.maxAge && game.maxAge > 0 && userAge > game.maxAge) {
    reasons.push(`Maximum age is ${game.maxAge} (you are ${userAge})`);
  }

  // Gender requirement
  if (game.requiredGender && game.requiredGender !== 'Any' && currentUser.gender) {
    if (game.requiredGender.toLowerCase() !== currentUser.gender.toLowerCase()) {
      reasons.push(`This event is for ${game.requiredGender} players only`);
    }
  }

  // Skill level (simple — community games may want at least the game skill)
  // We already have game.skillLevel; for strict we could compare but keep optional for now.

  return {
    canJoin: reasons.length === 0,
    reasons
  };
}

// Enhanced join that respects community requirements
export async function joinGame(gameId: string, game?: Game): Promise<{ success: boolean; message?: string }> {
  if (!supabase) return { success: false, message: 'Not connected' };

  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');

  // If a game object with requirements is passed in, validate first
  if (game) {
    const check = await checkGameRequirements(game, user);
    if (!check.canJoin) {
      return { success: false, message: check.reasons.join('. ') };
    }
  }

  const { error } = await supabase.from('game_participants').insert({
    game_id: gameId,
    user_id: user.id,
  } as any);

  if (error) {
    if (error.code === '23505') {
      return { success: true, message: 'Already joined' };
    }
    console.error('joinGame error:', error);
    return { success: false, message: 'Could not join' };
  }

  return { success: true };
}
