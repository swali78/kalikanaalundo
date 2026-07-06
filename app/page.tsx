"use client";

import React, { useState, useEffect, useCallback } from "react";
import { View, User, Game, Community, Sport, SkillLevel, District } from "@/lib/types";
import {
  getCurrentUser,
  fetchGames,
  fetchCommunities,
  fetchTotalOnboardedUsers,
  joinGame,
  deleteDemoPublicGames,
  wipeAllDemoData,
  updateProfile,
} from "@/lib/supabase/api";
import Navbar from "@/components/Navbar";
import DiscoverView from "@/components/DiscoverView";
import PlayersNearbyView from "@/components/PlayersNearbyView";
import MyGamesView from "@/components/MyGamesView";
import CommunitiesView from "@/components/CommunitiesView";
import ProfileView from "@/components/ProfileView";
import OnboardingModal from "@/components/OnboardingModal";
import LoginModal from "@/components/LoginModal";
import HostGameModal from "@/components/HostGameModal";
import PlayNowModal from "@/components/PlayNowModal";
import QuickMatchModal from "@/components/QuickMatchModal";
import ChatModal from "@/components/ChatModal";
import CommunityDetailModal from "@/components/CommunityDetailModal";
import ProfileUpdatePrompt from "@/components/ProfileUpdatePrompt";
import PlayerEmote from "@/components/ui/PlayerEmote";
import { Sparkles, Trash2, ShieldCheck, MapPin, RefreshCw, Trophy, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<View>("discover");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [onboardedCount, setOnboardedCount] = useState<number>(1248);
  const [loading, setLoading] = useState<boolean>(true);

  // GPS state
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);

  // Modal states
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showHostModal, setShowHostModal] = useState<boolean>(false);
  const [showPlayNowModal, setShowPlayNowModal] = useState<boolean>(false);
  const [showQuickMatchModal, setShowQuickMatchModal] = useState<boolean>(false);
  const [activeChatGame, setActiveChatGame] = useState<Game | null>(null);
  const [activeCommunityDetail, setActiveCommunityDetail] = useState<Community | null>(null);

  const [showProfileUpdatePrompt, setShowProfileUpdatePrompt] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [user, gamesList, commsList, count] = await Promise.all([
        getCurrentUser(),
        fetchGames(),
        fetchCommunities(),
        fetchTotalOnboardedUsers(),
      ]);

      setCurrentUser(user);
      if (user?.latitude && user?.longitude) {
        setUserLat(user.latitude);
        setUserLng(user.longitude);
        setIsGpsActive(true);
      }

      setGames(gamesList || []);
      setCommunities(commsList || []);
      if (count > 0) setOnboardedCount(count);

      const isLocallyOnboarded = typeof window !== 'undefined' && (
        localStorage.getItem(`onboarded_${user?.id}`) === 'true' || 
        localStorage.getItem('onboarded_any') === 'true'
      );

      // Think logically: Only trigger onboarding if the account was created recently (within last 10 minutes).
      // If an already created account re-logs in, never show player onboarding!
      const isNewAccount = user?.createdAt ? (Date.now() - new Date(user.createdAt).getTime() < 10 * 60 * 1000) : false;

      if (user && !user.onboarded && !isLocallyOnboarded && isNewAccount) {
        setShowOnboarding(true);
      } else if (user && !localStorage.getItem('profile_update_shown')) {
        // One-time profile update prompt for existing users
        setShowProfileUpdatePrompt(true);
      }
    } catch (err) {
      console.warn("Error loading initial data:", err);
      setGames([]);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleGps = () => {
    if (isGpsActive) {
      setIsGpsActive(false);
      setUserLat(undefined);
      setUserLng(undefined);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setIsGpsActive(true);
        if (currentUser) {
          updateProfile({ latitude: lat, longitude: lng, privacyFuzzLocation: true });
        }
      },
      (err) => {
        alert("GPS permission denied or timed out. Continuing with district approximate coordinates.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleJoinGame = async (gameId: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    const targetGame = games.find((g) => g.id === gameId);
    if (!targetGame) return;

    // Local optimistic update
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId && !g.players.some((p) => p.id === currentUser.id)) {
          return {
            ...g,
            currentPlayers: Math.min(g.maxPlayers, g.currentPlayers + 1),
            players: [...g.players, currentUser],
          };
        }
        return g;
      })
    );

    // Call API
    const res = await joinGame(gameId, targetGame);
    if (!res.success && res.message && res.message !== "Already joined") {
      alert(res.message);
    } else {
      // Auto open chat upon joining to coordinate
      setActiveChatGame(targetGame);
    }
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    age: number;
    district: District;
    city: string;
    skillLevel: SkillLevel;
    sports: Sport[];
    instagram?: string;
    privacyFuzzLocation?: boolean;
    latitude?: number;
    longitude?: number;
    role?: 'player' | 'admin';
  }) => {
    const updatedUser: User = {
      id: currentUser?.id || `user-${Date.now()}`,
      name: data.name,
      age: data.age,
      district: data.district,
      city: data.city,
      skillLevel: data.skillLevel,
      sports: data.sports,
      instagram: data.instagram,
      privacyFuzzLocation: data.privacyFuzzLocation,
      latitude: data.latitude,
      longitude: data.longitude,
      role: data.role,
      avatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=22C55E&color=fff`,
      availability: ["Evening", "Weekends"],
      rating: 5.0,
      gamesPlayed: 1,
      verified: true,
      onboarded: true,
    };

    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarded_${updatedUser.id}`, 'true');
      localStorage.setItem('onboarded_any', 'true');
      localStorage.setItem('profile_update_shown', 'true');
    }
    if (data.latitude && data.longitude) {
      setUserLat(data.latitude);
      setUserLng(data.longitude);
      setIsGpsActive(true);
    }
    setOnboardedCount((prev) => prev + 1);
    setShowOnboarding(false);

    // Always save profile to backend when onboarding completes
    await updateProfile(updatedUser);

    // Automatically join them to the first game chat as welcomed by system bot!
    if (games.length > 0) {
      setActiveChatGame(games[0]);
    }
  };

  const handleDemoLogin = (name: string) => {
    const demoUser: User = {
      id: `demo-${Date.now()}`,
      name,
      age: 25,
      city: "Kochi",
      district: "Ernakulam",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22C55E&color=fff`,
      sports: ["Badminton", "Football", "Pickleball"],
      skillLevel: "Intermediate",
      availability: ["Evening", "Weekends"],
      rating: 4.9,
      gamesPlayed: 14,
      verified: true,
      instagram: "kerala_smash",
      latitude: 10.0159,
      longitude: 76.3419,
      privacyFuzzLocation: true,
      onboarded: true,
    };
    setCurrentUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarded_${demoUser.id}`, 'true');
      localStorage.setItem('onboarded_any', 'true');
      localStorage.setItem('profile_update_shown', 'true');
    }
    setUserLat(demoUser.latitude);
    setUserLng(demoUser.longitude);
    setIsGpsActive(true);
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#171717] dark:text-[#FAFAFA] selection:bg-[#22C55E] selection:text-white transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setShowLogin(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onboardedCount={onboardedCount}
        isGpsActive={isGpsActive}
        onToggleGps={handleToggleGps}
        onOpenQuickMatch={() => setShowQuickMatchModal(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 ${currentUser ? 'pb-24 md:pb-6' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#1f2e35] shadow-2xl border-2 border-[#E5E5E5] dark:border-[#37464F] p-2 flex items-center justify-center overflow-hidden animate-bounce">
                <img src="/logo.png" alt="kalikkanaalundo.com" className="w-full h-full object-contain animate-spin-slow" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#58CC02] border-2 border-white dark:border-[#131F24] flex items-center justify-center">
                <span className="text-white text-[10px] font-black animate-pulse">⚡</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <span className="text-base font-black tracking-tight text-[#131F24] dark:text-white block animate-pulse">
                കളിക്കാനാളട്ടുണ്ടോ?
              </span>
              <span className="text-xs font-bold text-[#778B96]">Loading Kerala Turf Network...</span>
            </div>
          </div>
        ) : !currentUser ? (
          /* ================= DUOLINGO-STYLE UNAUTHENTICATED HERO ================= */
          <div className="space-y-12 py-6 sm:py-10 fade-in max-w-6xl mx-auto">
            {/* Split Hero Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[65vh]">
              {/* Left Column: Interactive Mascot & Sports Badges */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center py-4 space-y-6">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 text-xs font-black uppercase tracking-widest text-[#58CC02]">
                  <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                    <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
                  </div>
                  <span>KERALA'S #1 TURF SPORTS NETWORK</span>
                </div>

                {/* Large Interactive Mascot */}
                <div className="flex justify-center">
                  <PlayerEmote state="playing" size="xl" message="കളിക്കാനാളട്ടുണ്ടോ? Let's jump onto the turf!" />
                </div>

                {/* Sports & Location Badges */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#131F24] border-2 border-b-4 border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#58CC02]">
                    <span>🏸 BADMINTON</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#131F24] border-2 border-b-4 border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#1CB0F6]">
                    <span>⚽ FOOTBALL 5V5</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#131F24] border-2 border-b-4 border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#FF4B4B]">
                    <span>📍 ERNAKULAM TURF</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#131F24] border-2 border-b-4 border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#FFC800]">
                    <span>🏏 CRICKET BOX</span>
                  </div>
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-[#A5A5A5] text-center">
                  ✨ Tap Kittu the Mascot for fun emotes!
                </p>
              </div>

              {/* Right Column: Headline, CTA, & Stats */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left px-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171717] dark:text-white leading-[1.15]">
                  The free, fun, and <span className="text-[#58CC02] underline decoration-wavy decoration-[#58CC02]/40">real-time</span> way to find turf players!
                </h1>

                <p className="text-base sm:text-lg text-[#71717A] dark:text-[#A5A5A5] font-bold max-w-xl leading-relaxed">
                  Never miss a match because your squad was one player short. Discover verified athletes across Ernakulam, Kozhikode, and 12 more districts in real-time.
                </p>

                {/* Players Onboarded Counter */}
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#58CC02]/10 dark:bg-[#58CC02]/15 border-2 border-[#58CC02]/30">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#58CC02]/30 border-2 border-white dark:border-[#131F24] flex items-center justify-center text-xs font-black text-[#58CC02]">
                        {['👤','🏃','⚽'][i-1]}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black text-[#58CC02]">{onboardedCount.toLocaleString()}+</span>
                    <span className="text-xs font-bold text-[#71717A] dark:text-[#A5B2BA] block leading-tight">PLAYERS ONBOARDED</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full duo-btn-green text-base sm:text-lg !py-4 shadow-xl"
                  >
                    <span>GET STARTED 🚀</span>
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full duo-btn-outline text-base sm:text-lg !py-4"
                  >
                    <span>I ALREADY HAVE AN ACCOUNT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Counter Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] text-center space-y-1 shadow-lg hover:-translate-y-1 transition-all">
                <span className="text-2xl sm:text-3xl font-black text-[#FFC800]">14</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A5A5A5] block">Districts</span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] text-center space-y-1 shadow-lg hover:-translate-y-1 transition-all">
                <span className="text-2xl sm:text-3xl font-black text-[#58CC02]">{onboardedCount.toLocaleString()}+</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A5A5A5] block">Athletes</span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] text-center space-y-1 shadow-lg hover:-translate-y-1 transition-all">
                <span className="text-2xl sm:text-3xl font-black text-[#1CB0F6]">100%</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A5A5A5] block">Live DMs</span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] text-center space-y-1 shadow-lg hover:-translate-y-1 transition-all">
                <span className="text-2xl sm:text-3xl font-black text-[#FF4B4B]">20+</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A5A5A5] block">Sports</span>
              </div>
            </div>

            {/* Featured Sports Grid with Bat Theme */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] shadow-xl p-6 sm:p-10 bat-pattern">
              <div className="relative z-10">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#131F24] dark:text-white tracking-tight">
                    🏏 Play <span className="text-[#58CC02]">Every</span> Sport
                  </h2>
                  <p className="text-xs font-bold text-[#A5A5A5]">From cricket to dancing — find your squad</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                  {["Badminton","Football","Cricket","Volleyball","Basketball","Tennis","Pickleball","Running","Swimming","Yoga","Dancing","Boxing","Martial Arts","Gym","Chess","Kabaddi","Skating","Table Tennis","Cycling","Athletics"].map((sport) => (
                    <div key={sport} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#283941] border border-[#E5E5E5] dark:border-[#37464F] hover:bg-[#58CC02]/10 hover:border-[#58CC02]/30 transition-all group cursor-default">
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                        {(() => {
                          const emojis: Record<string,string> = {Badminton:'🏸',Football:'⚽',Cricket:'🏏',Volleyball:'🏐',Basketball:'🏀',Tennis:'🎾',Pickleball:'🏓','Table Tennis':'🏓',Running:'🏃',Cycling:'🚴',Swimming:'🏊',Yoga:'🧘',Dancing:'💃',Boxing:'🥊','Martial Arts':'🥋',Gym:'🏋️',Athletics:'🏃‍➡️',Skating:'⛸️',Chess:'♟️',Kabaddi:'🤼'};
                          return emojis[sport] || '🏅';
                        })()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-[#71717A] dark:text-[#A5B2BA] text-center leading-tight">{sport}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Why Athletes Love Us */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-[#131F24] dark:text-white tracking-tight">
                  Why Athletes Love <span className="text-[#58CC02]">kalikkanaalundo.com</span>
                </h2>
                <p className="text-xs font-bold text-[#A5A5A5]">Gamified networking, instant squad formation, strict location privacy</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛰️</div>
                  <h3 className="text-base font-black text-[#131F24] dark:text-white">Fuzzed GPS Privacy</h3>
                  <p className="text-xs font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">Find turf buddies within ~300m while keeping your exact address private.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF4B4B]/15 text-[#FF4B4B] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💬</div>
                  <h3 className="text-base font-black text-[#131F24] dark:text-white">One-Tap Instagram DM</h3>
                  <p className="text-xs font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">Skip friend requests. Connect instantly via IG handles to schedule matches.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛡️</div>
                  <h3 className="text-base font-black text-[#131F24] dark:text-white">Community Hubs</h3>
                  <p className="text-xs font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">Join local sports clubs, see member registries, and get match directions.</p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#58CC02] to-[#46A302] text-white text-center space-y-4 shadow-xl relative overflow-hidden border-b-[8px] border-[#388000]">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">Ready to jump onto the turf?</h3>
              <p className="text-sm sm:text-base font-bold text-emerald-100 max-w-lg mx-auto relative z-10">
                Join {onboardedCount.toLocaleString()}+ athletes across Kerala. Pure sports action!
              </p>
              <div className="pt-2 relative z-10">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-gray-100 text-[#58CC02] font-black text-base uppercase tracking-wider shadow-2xl border-b-[6px] border-[#E5E5E5] active:translate-y-1 active:border-b-0 transition-all inline-flex items-center gap-2"
                >
                  <span>SIGN IN TO KALIKKANAALUNDO.COM</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATED TABS ================= */
          <>
            {activeTab === "discover" && (
              <DiscoverView
                games={games}
                communities={communities}
                currentUser={currentUser}
                onJoinGame={handleJoinGame}
                onOpenChat={(game) => setActiveChatGame(game)}
                onOpenHostModal={() => setShowHostModal(true)}
                onOpenPlayNowModal={() => setShowPlayNowModal(true)}
                onOpenPlayers={() => setActiveTab("players")}
                onOpenQuickMatch={() => setShowQuickMatchModal(true)}
                userLat={userLat}
                userLng={userLng}
                isGpsActive={isGpsActive}
              />
            )}

            {activeTab === "players" && (
              <PlayersNearbyView
                currentUser={currentUser}
                userDistrict={currentUser.district || "Ernakulam"}
                userLat={userLat}
                userLng={userLng}
                isGpsActive={isGpsActive}
              />
            )}

            {activeTab === "my-games" && (
              <MyGamesView
                games={games}
                currentUser={currentUser}
                onOpenChat={(game) => setActiveChatGame(game)}
                onOpenHostModal={() => setShowHostModal(true)}
              />
            )}

            {activeTab === "communities" && (
              <CommunitiesView
                communities={communities}
                currentUser={currentUser}
                onSelectCommunity={(comm) => setActiveCommunityDetail(comm)}
              />
            )}

            {activeTab === "profile" && (
              <ProfileView
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                onLogout={() => {
                  setCurrentUser(null);
                  setActiveTab("discover");
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t border-[#E4E4E7] dark:border-[#262626] bg-white dark:bg-[#121212] py-6 mt-12 transition-colors ${currentUser ? 'pb-24 md:pb-6' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-[#71717A]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg overflow-hidden flex items-center justify-center bg-white dark:bg-[#1f2e35] border border-[#58CC02]/30 p-0.5">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <span>© 2026 kalikkanaalundo.com — Kerala's Sports Network</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/hafizswalih"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A5A5A5] hover:text-[#58CC02] transition-colors"
            >
              <span>build by</span>
              <span className="text-[#0A66C2]">in/swalih</span>
              <span>⚡</span>
            </a>
            <button
              onClick={loadData}
              className="flex items-center gap-1 hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        initialName={currentUser?.name}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          loadData();
          setShowLogin(false);
        }}
        onDemoLogin={handleDemoLogin}
      />

      <HostGameModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        onSuccess={() => {
          loadData();
          setShowHostModal(false);
        }}
        userLat={userLat}
        userLng={userLng}
      />

      <PlayNowModal
        isOpen={showPlayNowModal}
        onClose={() => setShowPlayNowModal(false)}
        onSuccess={() => {
          loadData();
          setShowPlayNowModal(false);
        }}
        userLat={userLat}
        userLng={userLng}
        userDistrict={currentUser?.district || "Ernakulam"}
      />

      <ProfileUpdatePrompt
        isOpen={showProfileUpdatePrompt}
        currentUser={currentUser}
        onClose={() => setShowProfileUpdatePrompt(false)}
        onComplete={(updated) => {
          setCurrentUser(updated);
          setShowProfileUpdatePrompt(false);
        }}
      />

      <ChatModal
        game={activeChatGame}
        currentUser={currentUser}
        onClose={() => setActiveChatGame(null)}
      />

      <CommunityDetailModal
        community={activeCommunityDetail}
        games={games}
        onClose={() => setActiveCommunityDetail(null)}
        onSelectGame={(g) => {
          setActiveCommunityDetail(null);
          setActiveChatGame(g);
        }}
        onHostInCommunity={(comm) => {
          setActiveCommunityDetail(null);
          setShowHostModal(true);
        }}
        currentUser={currentUser}
      />

      <QuickMatchModal
        isOpen={showQuickMatchModal}
        onClose={() => setShowQuickMatchModal(false)}
        games={games}
        currentUser={currentUser}
        userLat={userLat}
        userLng={userLng}
        userDistrict={currentUser?.district || "Ernakulam"}
        onJoinGame={handleJoinGame}
        onOpenChat={(game) => setActiveChatGame(game)}
        onOpenPlayNowModal={() => setShowPlayNowModal(true)}
      />
    </div>
  );
}
