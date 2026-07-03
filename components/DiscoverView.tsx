"use client";

import React, { useState, useMemo } from "react";
import { Game, Sport, User, Community } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { calculateHaversineDistance } from "@/lib/supabase/api";
import MapViewer from "./MapViewer";
import {
  MapPin,
  Search,
  Filter,
  MessageCircle,
  Navigation,
  UserPlus,
  Check,
  Zap,
  Calendar,
  Clock,
  Users,
  Map as MapIcon,
  List as ListIcon,
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
}

const SPORTS_FILTER: (Sport | "All")[] = [
  "All",
  "Badminton",
  "Football",
  "Cricket",
  "Pickleball",
  "Volleyball",
  "Basketball",
  "Tennis",
  "Running",
];

export default function DiscoverView({
  games,
  communities,
  currentUser,
  onJoinGame,
  onOpenChat,
  onOpenHostModal,
  onOpenPlayNowModal,
  userLat,
  userLng,
  isGpsActive = false,
}: DiscoverViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSport, setSelectedSport] = useState<Sport | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | "all">("all");

  // Calculate distances and filter
  const filteredGames = useMemo(() => {
    return games
      .map((g) => {
        // compute distance if user coordinates present
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
        // Sport filter
        if (selectedSport !== "All" && g.sport !== selectedSport) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchVenue = g.venue.toLowerCase().includes(q);
          const matchDistrict = g.district.toLowerCase().includes(q);
          const matchHost = g.host.name.toLowerCase().includes(q);
          const matchSport = g.sport.toLowerCase().includes(q);
          if (!matchVenue && !matchDistrict && !matchHost && !matchSport) return false;
        }

        // GPS radius filter
        if (maxDistanceKm !== "all" && g.distance !== undefined) {
          if (g.distance > maxDistanceKm) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort closest first if distance is known
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [games, selectedSport, searchQuery, maxDistanceKm, userLat, userLng]);

  const openInstagram = (e: React.MouseEvent, handle?: string) => {
    e.stopPropagation();
    if (!handle) return;
    const clean = handle.replace(/^@/, "");
    window.open(`https://instagram.com/${clean}`, "_blank");
  };

  const openDirections = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    let lat = game.latitude || 10.0159;
    let lng = game.longitude || 76.3419;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const isPlayerJoined = (game: Game) => {
    if (!currentUser) return false;
    return (
      game.host.id === currentUser.id ||
      game.players.some((p) => p.id === currentUser.id)
    );
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      {/* Hero Banner with Play Now Broadcast & Host Actions */}
      <div className="rounded-3xl bg-white dark:bg-[#121212] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Real-Time Local Sports Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-white">
              Find Games. Match Instantly.
            </h1>
            <p className="text-sm sm:text-base text-[#71717A] leading-relaxed">
              Discover public games around you, check distance in real time, and connect with players via instant DM or team chat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenPlayNowModal || onOpenHostModal}
              className="play-now py-3.5 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Broadcast &quot;Play Now&quot;</span>
            </button>
            <button
              onClick={onOpenHostModal}
              className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[#171717] dark:text-white font-bold py-3.5 px-6 rounded-3xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Host a Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search venue, district, sport, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full !pl-10 !py-2.5 font-medium bg-[#F4F4F5] dark:bg-[#1F1F1F] border-transparent focus:border-[#22C55E]"
            />
          </div>

          {/* Distance Radius Filter (when GPS active) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
            <span className="text-xs font-semibold text-[#71717A] whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Radius:</span>
            </span>
            {[
              { label: "All", val: "all" as const },
              { label: "< 5 km", val: 5 },
              { label: "< 10 km", val: 10 },
              { label: "< 25 km", val: 25 },
            ].map((rad) => (
              <button
                key={rad.label}
                onClick={() => setMaxDistanceKm(rad.val)}
                className={`filter-chip !py-1 !px-3 text-xs font-semibold ${
                  maxDistanceKm === rad.val ? "active" : ""
                }`}
              >
                {rad.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (List vs Map) */}
          <div className="flex items-center bg-[#F4F4F5] dark:bg-[#1F1F1F] p-1 rounded-2xl border border-[#E4E4E7] dark:border-[#262626] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#121212] text-[#171717] dark:text-white shadow-sm"
                  : "text-[#71717A] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-[#22C55E] text-white shadow-sm"
                  : "text-[#71717A] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Sports filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {SPORTS_FILTER.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`sport-chip !py-1 !px-3.5 text-xs font-bold whitespace-nowrap ${
                selectedSport === sport ? "active" : ""
              }`}
            >
              {sport !== "All" && <span>{getSportEmoji(sport)}</span>}
              <span>{sport}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "map" ? (
        <div className="space-y-4 fade-in">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-bold text-[#171717] dark:text-white">
              Showing {filteredGames.length} games on interactive map
            </span>
            <span className="text-xs text-[#71717A]">
              Click marker for instant join & navigation directions
            </span>
          </div>
          <MapViewer
            games={filteredGames}
            communities={communities}
            userLat={userLat}
            userLng={userLng}
            onSelectGame={onOpenChat}
          />
        </div>
      ) : (
        <div className="space-y-4 fade-in">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-[#171717] dark:text-white">
              Nearby Games ({filteredGames.length})
            </h3>
            {isGpsActive && (
              <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 animate-bounce" />
                <span>Sorted by shortest distance</span>
              </span>
            )}
          </div>

          {filteredGames.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F4F4F5] dark:bg-[#1F1F1F] flex items-center justify-center text-3xl mx-auto">
                🔍
              </div>
              <h4 className="text-lg font-bold text-[#171717] dark:text-white">
                No Games Found Matching Your Criteria
              </h4>
              <p className="text-sm text-[#71717A] max-w-md mx-auto">
                Try widening your distance radius, searching for a different district, or be the first to host a game!
              </p>
              <button onClick={onOpenHostModal} className="primary-btn mt-2 !py-2.5 !px-6 text-sm">
                Host a Game Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game) => {
                const joined = isPlayerJoined(game);
                const isFull = game.currentPlayers >= game.maxPlayers;
                const percentFull = Math.min(100, Math.round((game.currentPlayers / game.maxPlayers) * 100));

                return (
                  <div
                    key={game.id}
                    onClick={() => onOpenChat(game)}
                    className="game-card p-5 space-y-4 flex flex-col justify-between hover:border-[#22C55E]/50 transition-all group"
                  >
                    <div>
                      {/* Top Row: Sport Emoji Badge & Distance */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1.5">
                            <span className="text-sm">{getSportEmoji(game.sport)}</span>
                            <span>{game.sport}</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#71717A]">
                            {game.skillLevel}
                          </span>
                        </div>

                        {game.distance !== undefined && (
                          <span className="text-xs font-bold text-[#16A34A] dark:text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{game.distance} km away</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Venue */}
                      <h3 className="font-bold text-lg text-[#171717] dark:text-white group-hover:text-[#22C55E] transition-colors line-clamp-1">
                        {game.venue}
                      </h3>
                      <p className="text-xs text-[#71717A] mt-0.5 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#71717A]" />
                        <span>{game.district}</span>
                        {game.communityName && (
                          <span className="ml-1 text-[#3B82F6] font-semibold">
                            • {game.communityName}
                          </span>
                        )}
                      </p>

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E4E4E7]/60 dark:border-[#262626] text-xs font-semibold text-[#171717] dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>{game.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>{game.time} ({game.duration}m)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Host & Instagram Handle */}
                      <div className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={game.host.avatar}
                            alt={game.host.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#171717] dark:text-white block truncate">
                              {game.host.name}
                            </span>
                            <span className="text-[10px] text-[#71717A] block">Host</span>
                          </div>
                        </div>

                        {game.host.instagram ? (
                          <button
                            onClick={(e) => openInstagram(e, game.host.instagram)}
                            title={`DM @${game.host.instagram} on Instagram`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-[11px] font-bold shadow-sm hover:opacity-95 transition-opacity shrink-0"
                          >
                            <Instagram className="w-3 h-3" />
                            <span>@{game.host.instagram}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#71717A] font-medium">In-app chat</span>
                        )}
                      </div>

                      {/* Players Progress Bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1 text-[#71717A]">
                            <Users className="w-3.5 h-3.5" />
                            <span>Players</span>
                          </span>
                          <span className={isFull ? "text-[#EF4444]" : "text-[#171717] dark:text-white"}>
                            {game.currentPlayers} / {game.maxPlayers} {isFull && "(Full)"}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E4E4E7] dark:bg-[#262626] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? "bg-[#EF4444]" : "bg-[#22C55E]"
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinGame(game.id);
                          }}
                          disabled={isFull && !joined}
                          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            joined
                              ? "bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30"
                              : isFull
                              ? "bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#71717A] cursor-not-allowed"
                              : "bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md shadow-[#22C55E]/20"
                          }`}
                        >
                          {joined ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Joined</span>
                            </>
                          ) : isFull ? (
                            <span>Game Full</span>
                          ) : (
                            <span>Join Game</span>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChat(game);
                          }}
                          title="Open Game Chat"
                          className="p-2.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] hover:bg-[#E4E4E7] dark:hover:bg-[#262626] text-[#171717] dark:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                        </button>

                        <button
                          onClick={(e) => openDirections(e, game)}
                          title="Get Navigation Directions"
                          className="p-2.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] hover:bg-[#E4E4E7] dark:hover:bg-[#262626] text-[#171717] dark:text-white transition-colors"
                        >
                          <Navigation className="w-4 h-4 text-[#3B82F6]" />
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
