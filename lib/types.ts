export type Sport = 
  | 'Badminton' | 'Football' | 'Cricket' | 'Volleyball' | 'Basketball' 
  | 'Tennis' | 'Pickleball' | 'Table Tennis' | 'Running' | 'Cycling'
  | 'Swimming' | 'Yoga' | 'Dancing' | 'Boxing' | 'Martial Arts'
  | 'Gym' | 'Athletics' | 'Skating' | 'Chess' | 'Kabaddi';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type District = 
  | 'Ernakulam' | 'Thiruvananthapuram' | 'Kozhikode' | 'Thrissur' 
  | 'Alappuzha' | 'Kollam' | 'Kottayam' | 'Palakkad' | 'Malappuram' | 'Kannur';

export interface User {
  id: string;
  name: string;
  // Optional: legacy profiles may genuinely lack these — never fabricate
  // defaults (fake "Kochi"/"25" made every player look identical).
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  city?: string;
  district?: District;
  avatar: string;
  bio?: string;
  sports: Sport[];
  skillLevel: SkillLevel;
  availability: ('Morning' | 'Evening' | 'Weekends')[];
  rating: number;
  gamesPlayed: number;
  verified: boolean;
  // New for map + real profiles
  latitude?: number;
  longitude?: number;
  instagram?: string;
  privacyFuzzLocation?: boolean;
  role?: 'player' | 'admin';
  onboarded?: boolean;
  distance?: number;
  createdAt?: string;
}

export interface Game {
  id: string;
  sport: Sport;
  host: User;
  venue: string;
  district: District;
  date: string; // ISO date
  time: string; // HH:MM
  duration: number; // minutes
  skillLevel: SkillLevel;
  maxPlayers: number;
  currentPlayers: number;
  players: User[];
  description?: string;
  entryFee?: number;
  isPublic: boolean;
  beginnerFriendly: boolean;
  equipmentRequired?: string;
  distance?: number; // km from user
  latitude?: number;
  longitude?: number;

  // Community game support
  communityId?: string;
  communityName?: string;
  requiresMembership?: boolean;
  minAge?: number;
  maxAge?: number;
  requiredGender?: string; // 'Male' | 'Female' | 'Any'
  approvalRequired?: boolean;
  registrationNotes?: string;
}

export interface Community {
  id: string;
  name: string;
  sport?: Sport;
  district: District;
  memberCount: number;
  description: string;
  image?: string;
  isPublic?: boolean;
  latitude?: number;
  longitude?: number;
  creatorId?: string;
  members?: User[];
}

export interface Message {
  id: string;
  gameId?: string;
  userId?: string;
  userName?: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface Rating {
  id: string;
  gameId: string;
  ratedUserId: string;
  raterUserId: string;
  friendly: number;
  skill: number;
  punctuality: number;
  sportsmanship: number;
  wouldPlayAgain: boolean;
  overall: number;
  comment?: string;
}

export type View = 'landing' | 'login' | 'onboarding' | 'dashboard' | 'discover' | 'my-games' | 'communities' | 'profile' | 'players';
