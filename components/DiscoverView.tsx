"use client";

import React, { useState, useMemo } from "react";
import { Game, Sport, User, Community } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { calculateHaversineDistance } from "@/lib/supabase/api";
import MapViewer from "./MapViewer";
import {
  MapPin, Search, MessageCircle, Navigation, UserPlus,
  Check, Zap, Calendar, Clock, Users,
  Map as MapIcon, List as ListIcon, Sparkles, TrendingUp
} from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/InstagramIcon";

interface DiscoverViewProps {
  games: Game[];
  communities: Community[];
  currentUser: User | null;
  onJoinGame: (gameId: string) => void;
  onOpenChat: (game: Game) => void;
  onOpenHostModal: () => void;
  onOpenPlayNowModal?: () => void;
  userLat?: number;
  userLng?: number;
  isGpsActive?: boolean;
  onOpenPlayers?: () => void;
}

const SPORTS_FILTER: (Sport | "All")[] = [
  "All", "Badminton", "Football", "Cricket", "Volleyball",
  "Basketball", "Tennis", "Pickleball", "Table Tennis",
  "Running", "Cycling", "Swimming", "Yoga", "Dancing",
  "Boxing", "Martial Arts", "Gym", "Athletics", "Skating",
  "Chess", "Kabaddi"
];

export default function DiscoverView({
  games, communities, currentUser, onJoinGame, onOpenChat,
  onOpenHostModal, onOpenPlayNowModal, onOpenPlayers, userLat, userLng, isGpsActive = false,
}: DiscoverViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSport, setSelectedSport] = useState<Sport | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | "all">("all");

  const filteredGames = useMemo(() => {
    return games
      .map((g) => {
        let dist = g.distance;
        if (userLat !== undefined && userLng !== undefined) {
          let gLat = g.latitude;
          let gLng = g.longitude;
          if (!gLat || !gLng) {
            const hash = g.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            gLat = 10.0159 + ((hash % 20) - 10) * 0.005;
            gLng = 76.3419 + (((hash * 3) % 20) - 10) * 0.005;
          }
          dist = calculateHaversineDistance(userLat, userLng, gLat, gLng);
        }
        return { ...g, distance: dist };
      })
      .filter((g) => {
        if (selectedSport !== "All" && g.sport !== selectedSport) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!g.venue.toLowerCase().includes(q) &&
              !g.district.toLowerCase().includes(q) &&
              !g.host.name.toLowerCase().includes(q) &&
              !g.sport.toLowerCase().includes(q)) return false;
        }
        if (maxDistanceKm !== "all" && g.distance !== undefined && g.distance > maxDistanceKm) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
        return 0;
      });
  }, [games, selectedSport, searchQuery, maxDistanceKm, userLat, userLng]);

  const openInstagram = (e: React.MouseEvent, handle?: string) => {
    e.stopPropagation();
    if (!handle) return;
    window.open(`https://instagram.com/${handle.replace(/^@/, "")}`, "_blank");
  };

  const openDirections = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    if (game.latitude && game.longitude && Math.abs(game.latitude - 10.0159) > 0.001) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${game.latitude},${game.longitude}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${game.venue}, ${game.district}, Kerala`)}`, "_blank");
    }
  };

  const isPlayerJoined = (game: Game) => {
    if (!currentUser) return false;
    return game.host.id === currentUser.id || game.players.some((p) => p.id === currentUser.id);
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenPlayNowModal || onOpenHostModal}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#46A302] text-white border-2 border-b-[5px] border-[#388000] hover:-translate-y-1 transition-all text-center space-y-1 shadow-lg"
        >
          <Zap className="w-5 h-5 mx-auto fill-current" />
          <span className="text-[10px] font-black block uppercase tracking-wider">Quick Play</span>
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`p-4 rounded-2xl border-2 border-b-[5px] text-center space-y-1 transition-all hover:-translate-y-1 shadow-sm ${
            viewMode === "map"
              ? "bg-[#1CB0F6] text-white border-[#1899D6]"
              : "bg-white dark:bg-[#1f2e35] text-[#131F24] dark:text-white border-[#E5E5E5] dark:border-[#37464F]"
          }`}
        >
          <MapIcon className="w-5 h-5 mx-auto" />
          <span className="text-[10px] font-black block uppercase tracking-wider">Nearby Games</span>
        </button>
        <button
          onClick={() => onOpenPlayers?.()}
          className="p-4 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] hover:-translate-y-1 transition-all text-center space-y-1 shadow-sm cursor-pointer"
        >
          <Users className="w-5 h-5 mx-auto text-[#FFC800]" />
          <span className="text-[10px] font-black block uppercase tracking-wider text-[#71717A] group-hover:text-[#131F24] dark:group-hover:text-white">Nearby Players</span>
        </button>
        <button
          onClick={() => onOpenPlayers?.()}
          className="p-4 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[5px] border-[#E5E5E5] dark:border-[#37464F] hover:-translate-y-1 transition-all text-center space-y-1 shadow-sm cursor-pointer"
        >
          <TrendingUp className="w-5 h-5 mx-auto text-[#FF4B4B]" />
          <span className="text-[10px] font-black block uppercase tracking-wider text-[#71717A] group-hover:text-[#131F24] dark:group-hover:text-white">New Players</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="game-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 text-xs font-black uppercase tracking-wider text-[#58CC02]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>REAL-TIME SPORTS NETWORK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#131F24] dark:text-white">
              Find Games. Match <span className="text-[#58CC02]">Instantly</span>.
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#778B96] leading-relaxed">
              Discover games around you, check distance, and connect via DM or chat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button onClick={onOpenPlayNowModal || onOpenHostModal} className="duo-btn-green !py-3 !px-5 text-xs flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>PLAY NOW</span>
            </button>
            <button onClick={onOpenHostModal} className="py-3 px-5 rounded-2xl bg-white dark:bg-[#1f2e35] text-[#131F24] dark:text-white font-black text-xs uppercase tracking-wider border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-1.5 shadow-sm">
              <UserPlus className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>HOST</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search venue, sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full !pl-9 !py-2.5 text-sm font-medium bg-[#F4F4F5] dark:bg-[#1F1F1F] border-transparent focus:border-[#22C55E]"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0">
            <span className="text-[10px] font-bold text-[#71717A] whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#22C55E]" />
              <span>Radius:</span>
            </span>
            {[{ label: "All", val: "all" as const }, { label: "5 km", val: 5 }, { label: "10 km", val: 10 }, { label: "25 km", val: 25 }].map((rad) => (
              <button key={rad.label} onClick={() => setMaxDistanceKm(rad.val)}
                className={`filter-chip !py-1 !px-2.5 text-[10px] font-bold ${maxDistanceKm === rad.val ? "active" : ""}`}>
                {rad.label}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-[#F4F4F5] dark:bg-[#1F1F1F] p-1 rounded-2xl border border-[#E4E4E7] dark:border-[#262626] shrink-0 self-start sm:self-auto">
            <button onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                viewMode === "list" ? "bg-white dark:bg-[#121212] text-[#171717] dark:text-white shadow-sm" : "text-[#71717A] hover:text-[#171717]"
              }`}>
              <ListIcon className="w-3.5 h-3.5" /><span>List</span>
            </button>
            <button onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                viewMode === "map" ? "bg-[#22C55E] text-white shadow-sm" : "text-[#71717A] hover:text-[#171717]"
              }`}>
              <MapIcon className="w-3.5 h-3.5" /><span>Map View</span>
            </button>
          </div>
        </div>

        {/* Sports filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[10px] font-bold text-[#71717A] whitespace-nowrap mr-1">Sports:</span>
          {SPORTS_FILTER.map((sport) => (
            <button key={sport} onClick={() => setSelectedSport(sport)}
              className={`sport-chip !py-1 !px-2.5 text-[10px] font-bold whitespace-nowrap ${selectedSport === sport ? "active" : ""}`}>
              {sport !== "All" && <span className="text-xs">{getSportEmoji(sport as Sport)}</span>}
              <span>{sport === "All" ? "ALL" : sport}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" ? (
        <div className="space-y-3 fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-[#171717] dark:text-white">
              🗺️ {filteredGames.length} games on map
            </span>
            <span className="text-[10px] text-[#71717A]">Click marker for details & directions</span>
          </div>
          <div className="relative">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#131F24]/90 backdrop-blur-sm shadow-lg border border-[#E5E5E5] dark:border-[#37464F] text-xs font-bold text-[#58CC02] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                <span>{filteredGames.length} GAMES</span>
              </div>
            </div>
            <MapViewer
              games={filteredGames}
              communities={communities}
              userLat={userLat}
              userLng={userLng}
              onSelectGame={onOpenChat}
            />
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-[#71717A]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#22C55E] border border-white" /> Game</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#3B82F6] border border-white" /> Community</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white" /> You</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[#171717] dark:text-white">
              Games ({filteredGames.length})
            </h3>
            <button onClick={() => setViewMode("map")}
              className="text-xs font-bold text-[#22C55E] flex items-center gap-1 hover:underline">
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          {filteredGames.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F4F4F5] dark:bg-[#1F1F1F] flex items-center justify-center text-3xl mx-auto">🔍</div>
              <h4 className="text-base font-bold text-[#171717] dark:text-white">No Games Found</h4>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">Try widening your radius or host a game!</p>
              <button onClick={onOpenHostModal} className="primary-btn !py-2 !px-5 text-xs mt-2 !inline-flex">Host a Game</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => {
                const joined = isPlayerJoined(game);
                const isFull = game.currentPlayers >= game.maxPlayers;
                const percentFull = Math.min(100, Math.round((game.currentPlayers / game.maxPlayers) * 100));
                return (
                  <div key={game.id} onClick={() => onOpenChat(game)}
                    className="game-card p-4 space-y-3 flex flex-col justify-between hover:border-[#22C55E]/50 transition-all group">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#16A34A] flex items-center gap-1">
                            <span className="text-xs">{getSportEmoji(game.sport)}</span>
                            <span>{game.sport}</span>
                          </span>
                          <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#71717A]">{game.skillLevel}</span>
                        </div>
                        {game.distance !== undefined && (
                          <span className="text-[10px] font-bold text-[#16A34A] bg-[#22C55E]/10 px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{game.distance} km</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#171717] dark:text-white group-hover:text-[#22C55E] transition-colors line-clamp-1">{game.venue}</h3>
                      <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">
                        <MapPin className="w-2.5 h-2.5 inline" /> {game.district}
                        {game.communityName && <span className="ml-1 text-[#3B82F6] font-semibold"> • {game.communityName}</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E4E4E7]/60 dark:border-[#262626] text-[10px] font-semibold text-[#171717] dark:text-white">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#22C55E]" />{game.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#22C55E]" />{game.time}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-[#F4F4F5] dark:bg-[#1F1F1F] mb-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img src={game.host.avatar} alt={game.host.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <span className="text-[10px] font-bold text-[#171717] dark:text-white truncate">{game.host.name}</span>
                        </div>
                        {game.host.instagram ? (
                          <button onClick={(e) => openInstagram(e, game.host.instagram)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-[10px] font-bold shrink-0">
                            <Instagram className="w-2.5 h-2.5" /><span>@{game.host.instagram}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#71717A]">Chat</span>
                        )}
                      </div>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
                          <span className="flex items-center gap-1 text-[#778B96]"><Users className="w-3 h-3 text-[#58CC02]" />Players</span>
                          <span className={isFull ? "text-[#FF4B4B]" : "text-[#131F24] dark:text-white"}>
                            {game.currentPlayers}/{game.maxPlayers}{isFull && " • FULL"}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#E5E5E5] dark:bg-[#283941] p-0.5 border-2 border-[#CCCCCC] dark:border-[#1C2A30] overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isFull ? "bg-[#FF4B4B]" : "bg-[#58CC02]"}`} style={{ width: `${percentFull}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); onJoinGame(game.id); }}
                          disabled={isFull && !joined}
                          className={`flex-1 py-2.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border-2 transition-all ${
                            joined ? "bg-[#58CC02]/15 text-[#58CC02] border-b-[3px] border-[#58CC02]"
                              : isFull ? "bg-[#E5E5E5] text-[#778B96] border-b-[3px] border-[#CCCCCC] cursor-not-allowed"
                              : "bg-[#58CC02] hover:bg-[#46A302] text-white border-b-[3px] border-[#388000] active:translate-y-[2px] active:border-b-0 shadow-sm"
                          }`}>
                          {joined ? <><Check className="w-3 h-3" /><span>JOINED</span></> : isFull ? <span>FULL</span> : <span>JOIN</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onOpenChat(game); }}
                          className="p-2.5 rounded-2xl bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941] border-2 border-b-[3px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-0 transition-all">
                          <MessageCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                        </button>
                        <button onClick={(e) => openDirections(e, game)}
                          className="p-2.5 rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] text-white border-2 border-b-[3px] border-[#1899D6] active:translate-y-[2px] active:border-b-0 transition-all">
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
