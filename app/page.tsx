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
import ChatModal from "@/components/ChatModal";
import CommunityDetailModal from "@/components/CommunityDetailModal";
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
  const [activeChatGame, setActiveChatGame] = useState<Game | null>(null);
  const [activeCommunityDetail, setActiveCommunityDetail] = useState<Community | null>(null);

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
      setOnboardedCount(count);
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
    };

    setCurrentUser(updatedUser);
    if (data.latitude && data.longitude) {
      setUserLat(data.latitude);
      setUserLng(data.longitude);
      setIsGpsActive(true);
    }
    setOnboardedCount((prev) => prev + 1);
    setShowOnboarding(false);

    // Save to backend if logged in
    if (currentUser) {
      await updateProfile(updatedUser);
    }

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
    };
    setCurrentUser(demoUser);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#10B981]/20 flex items-center justify-center text-3xl font-bold text-[#10B981] animate-bounce border border-[#10B981]/30">
              K
            </div>
            <p className="text-sm font-semibold text-[#71717A] animate-pulse">
              Connecting to kalikkanaalundo.com Live Network...
            </p>
          </div>
        ) : !currentUser ? (
          /* ================= DUOLINGO-STYLE UNAUTHENTICATED HERO & PORTAL ================= */
          <div className="space-y-16 py-8 sm:py-12 fade-in max-w-6xl mx-auto">
            {/* Split Hero Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
              {/* Left Column: Interactive Mascot & Organized Standard Sports Grid */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center py-6 space-y-6">
                {/* Central Mascot */}
                <div className="flex justify-center">
                  <PlayerEmote state="playing" size="xl" message="കളിക്കാനാളട്ടുണ്ടോ? Let's jump onto the turf!" />
                </div>

                {/* Organized Standard Sports & Location Badges */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-2">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#58CC02]">
                    <span>🏸 BADMINTON</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#1CB0F6]">
                    <span>⚽ FOOTBALL 5V5</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#FF4B4B]">
                    <span>📍 ERNAKULAM TURF</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm text-xs font-black text-[#FFC800]">
                    <span>🏏 CRICKET BOX</span>
                  </div>
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-[#A5A5A5] text-center">
                  ✨ Tap Kittu the Mascot for fun emotes!
                </p>
              </div>

              {/* Right Column: Headline & Duolingo Chunky Actions */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left px-2 sm:px-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 text-xs font-black uppercase tracking-widest text-[#58CC02]">
                  <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                    <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
                  </div>
                  <span>KERALA'S #1 TURF SPORTS NETWORK</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#131F24] dark:text-white leading-[1.15]">
                  The free, fun, and <span className="text-[#58CC02] underline decoration-wavy decoration-[#58CC02]/40">real-time</span> way to find turf players!
                </h1>

                <p className="text-base sm:text-lg text-[#778B96] dark:text-[#A5A5A5] font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Never miss a match because your squad was one player short. Discover verified athletes across Ernakulam, Kozhikode, and 12 more districts in real-time.
                </p>

                {/* Chunky Stacked Action Buttons */}
                <div className="space-y-4 pt-2 max-w-md mx-auto lg:mx-0">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full duo-btn-green text-base sm:text-lg !py-4 shadow-xl"
                  >
                    <span>GET STARTED 🚀</span>
                  </button>

                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full duo-btn-outline text-base sm:text-lg !py-4 shadow-xl"
                  >
                    <span>I ALREADY HAVE AN ACCOUNT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Duolingo-Style Streak & Stats Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] flex items-center gap-4 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-[#FFC800]/20 text-[#FFC800] flex items-center justify-center text-3xl font-black">
                  🔥
                </div>
                <div>
                  <div className="text-2xl font-black text-[#131F24] dark:text-white">14 Districts</div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#A5A5A5]">Kerala Wide Coverage</div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] flex items-center gap-4 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/20 text-[#58CC02] flex items-center justify-center text-3xl font-black">
                  ⚡
                </div>
                <div>
                  <div className="text-2xl font-black text-[#131F24] dark:text-white">100% Live DMs</div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#A5A5A5]">Direct Instagram Sync</div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[6px] border-[#E5E5E5] dark:border-[#37464F] flex items-center gap-4 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6]/20 text-[#1CB0F6] flex items-center justify-center text-3xl font-black">
                  🏆
                </div>
                <div>
                  <div className="text-2xl font-black text-[#131F24] dark:text-white">{onboardedCount.toLocaleString()}+</div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#A5A5A5]">Active Athletes</div>
                </div>
              </div>
            </div>

            {/* Why Athletes Choose Us (Chunky Cards Grid) */}
            <div className="space-y-8 pt-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-[#131F24] dark:text-white tracking-tight">
                  Why Athletes Love <span className="text-[#58CC02]">kalikkanaalundo.com</span>
                </h2>
                <p className="text-sm font-bold text-[#A5A5A5] max-w-md mx-auto">
                  Gamified networking, instant squad formation, and strict location privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] shadow-xl space-y-4 hover:-translate-y-1.5 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform font-black">
                    🛰️
                  </div>
                  <h3 className="text-xl font-black text-[#131F24] dark:text-white tracking-tight">
                    Real-Time Fuzzed GPS
                  </h3>
                  <p className="text-sm font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">
                    Toggle live location sharing to find turf buddies within ~300 meters while keeping your exact address 100% private and protected.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#58CC02]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>~300M FUZZED RADIUS</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] shadow-xl space-y-4 hover:-translate-y-1.5 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF4B4B]/15 text-[#FF4B4B] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform font-black">
                    💬
                  </div>
                  <h3 className="text-xl font-black text-[#131F24] dark:text-white tracking-tight">
                    One-Tap Instagram DMs
                  </h3>
                  <p className="text-sm font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">
                    Skip cumbersome friend requests. Connect instantly via integrated Instagram handles to schedule matches and assemble your squad.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#FF4B4B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DIRECT IG SYNC</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1f2e35] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] shadow-xl space-y-4 hover:-translate-y-1.5 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform font-black">
                    🛡️
                  </div>
                  <h3 className="text-xl font-black text-[#131F24] dark:text-white tracking-tight">
                    Role-Based Hub Privacy
                  </h3>
                  <p className="text-sm font-bold text-[#778B96] dark:text-[#A5A5A5] leading-relaxed">
                    Community creators gain access to full member registries and contact lists, while standard members stay protected with privacy-shielded counts.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#1CB0F6]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CREATOR ADMIN PORTAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Banner (Duolingo Gamified Style) */}
            <div className="p-10 sm:p-14 rounded-[3rem] bg-[#58CC02] text-white text-center space-y-6 shadow-xl relative overflow-hidden border-b-[8px] border-[#388000]">
              
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight relative z-10">
                Ready to jump onto the turf?
              </h3>
              <p className="text-base sm:text-lg font-bold text-emerald-100 max-w-xl mx-auto relative z-10">
                Join {onboardedCount.toLocaleString()}+ athletes across Kerala. No spam, no mock data — pure turf sports action!
              </p>
              <div className="pt-2 relative z-10">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-10 py-5 rounded-2xl bg-white hover:bg-gray-100 text-[#58CC02] font-black text-lg uppercase tracking-wider shadow-2xl border-b-[6px] border-[#E5E5E5] active:translate-y-1 active:border-b-0 transition-all inline-flex items-center gap-2"
                >
                  <span>SIGN IN TO KALIKKANAALUNDO.COM</span>
                  <ArrowRight className="w-6 h-6" />
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
                userLat={userLat}
                userLng={userLng}
                isGpsActive={isGpsActive}
              />
            )}

            {activeTab === "players" && (
              <PlayersNearbyView
                currentUser={currentUser}
                userDistrict={currentUser.district || "Ernakulam"}
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

      {/* Footer & Admin Cleanup Bar */}
      <footer className="border-t border-[#E4E4E7] dark:border-[#262626] bg-white dark:bg-[#121212] py-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#71717A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#22C55E] text-white flex items-center justify-center font-bold text-xs">
              C
            </div>
            <span>© 2026 kalikkanaalundo.com — Kerala's Real-Time Sports Network. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              Player Onboarding
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-1 hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
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
    </div>
  );
}
