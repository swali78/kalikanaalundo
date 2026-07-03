"use client";

import React, { useState, useEffect } from "react";
import { User, Sport } from "@/lib/types";
import { fetchNearbyPlayers } from "@/lib/supabase/api";
import { getSportEmoji } from "@/lib/mockData";
import dynamic from "next/dynamic";
import {
  MapPin, Users, Sparkles, Filter, MessageCircle,
  Map as MapIcon, List as ListIcon, Navigation
} from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";

const PlayersMap = dynamic(() => import("./PlayersMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-3xl bg-[#F4F4F5] dark:bg-[#121212] border border-[#E4E4E7] dark:border-[#262626] flex items-center justify-center gap-2 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-lg animate-bounce">🗺️</div>
      <p className="text-sm font-semibold text-[#71717A]">Loading player map...</p>
    </div>
  ),
});

interface PlayersNearbyViewProps {
  currentUser: User | null;
  userDistrict: string;
}

const districts = [
  "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur",
  "Malappuram", "Kollam", "Alappuzha", "Palakkad", "Kottayam",
  "Kannur", "Idukki", "Pathanamthitta", "Wayanad", "Kasaragod"
];

const sportsList: (Sport | "All")[] = [
  "All", "Badminton", "Football", "Cricket", "Volleyball",
  "Basketball", "Tennis", "Pickleball", "Table Tennis",
  "Running", "Cycling", "Swimming", "Yoga", "Dancing",
  "Boxing", "Martial Arts", "Gym", "Athletics", "Skating",
  "Chess", "Kabaddi"
];

export default function PlayersNearbyView({
  currentUser,
  userDistrict,
}: PlayersNearbyViewProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<Sport | "All">("All");
  const [activeDistrict, setActiveDistrict] = useState<string>(userDistrict || "Ernakulam");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    async function loadPlayers() {
      if (!currentUser) {
        setPlayers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await fetchNearbyPlayers(
        currentUser.id,
        activeDistrict,
        currentUser.sports || []
      );
      setPlayers(data);
      setLoading(false);
    }
    loadPlayers();
  }, [currentUser, activeDistrict]);

  const filteredPlayers = players.filter((p) => {
    if (selectedSport === "All") return true;
    return (p.sports || []).includes(selectedSport);
  });

  const openDirections = (e: React.MouseEvent, player: User) => {
    e.stopPropagation();
    if (player.latitude && player.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${player.latitude},${player.longitude}`, "_blank");
    } else {
      const query = encodeURIComponent(`${player.city || player.district}, Kerala`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-16 px-4 bg-white/5 dark:bg-black/20 rounded-3xl border border-white/10 backdrop-blur-md max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-3xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-3xl mx-auto mb-4 border border-[#10B981]/30">
          🔐
        </div>
        <h3 className="text-2xl font-extrabold text-[#171717] dark:text-white mb-2">
          Sign In to Discover Nearby Players
        </h3>
        <p className="text-sm text-[#71717A] max-w-md mx-auto mb-6">
          Log in to view like-minded sports enthusiasts in your district and connect via instant Instagram DMs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="game-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 text-xs font-black uppercase tracking-wider text-[#58CC02]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLAYERS IN {activeDistrict.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#131F24] dark:text-white">
              District Players <span className="text-[#58CC02]">Nearby</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex items-center bg-[#F4F4F5] dark:bg-[#1F1F1F] p-1 rounded-2xl border border-[#E4E4E7] dark:border-[#262626]">
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
                <span>Map</span>
              </button>
            </div>
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white font-black text-xs py-2 px-3 rounded-xl border-2 border-[#CCCCCC] dark:border-[#1C2A30] focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sportsList.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 flex items-center gap-1.5 select-none cursor-pointer ${
              selectedSport === sport
                ? "bg-[#58CC02] text-white border-b-[4px] border-[#388000] shadow-md"
                : "bg-white dark:bg-[#1f2e35] text-[#778B96] hover:text-[#131F24] dark:hover:text-white border-b-[4px] border-[#E5E5E5] dark:border-[#37464F]"
            }`}
          >
            {sport !== "All" && <span>{getSportEmoji(sport as Sport)}</span>}
            <span>{sport === "All" ? "ALL" : sport.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Map View */}
      {viewMode === "map" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#71717A]">
              {filteredPlayers.length} players in {activeDistrict}
            </span>
            <span className="text-[10px] text-[#71717A]">📍 Approximate locations</span>
          </div>
          <PlayersMap
            players={filteredPlayers}
            currentUser={currentUser}
            userLat={currentUser.latitude}
            userLng={currentUser.longitude}
          />
        </div>
      ) : (
        <>
          {/* List View Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#71717A]">
              {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
            </span>
            {filteredPlayers.length > 0 && (
              <button
                onClick={() => setViewMode("map")}
                className="text-xs font-bold text-[#22C55E] flex items-center gap-1 hover:underline"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            )}
          </div>

          {/* Players Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-black/5 dark:bg-white/5" />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-3xl mx-auto">👥</div>
              <h3 className="text-lg font-bold text-[#171717] dark:text-white">No players in {activeDistrict}</h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">Try a different district or sport filter</p>
              <button onClick={() => setSelectedSport("All")} className="primary-btn !py-2 !px-5 text-xs mt-2 !inline-flex">Show All Sports</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlayers.map((player) => {
                const hasSharedSport = (player.sports || []).some((s) =>
                  (currentUser.sports || []).includes(s)
                );
                return (
                  <div key={player.id} className="game-card p-5 space-y-3 flex flex-col justify-between hover:border-[#58CC02] transition-all relative overflow-hidden group">
                    {hasSharedSport && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#58CC02]/15 border-2 border-b-2 border-[#58CC02]/30 text-[#58CC02] text-[10px] font-black flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>MATCH</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-b-4 border-[#58CC02]/40 shadow-md group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-black text-base text-[#131F24] dark:text-white truncate flex items-center gap-1">
                          {player.name}
                          {player.verified && <span className="text-[#58CC02] text-xs">✓</span>}
                        </h3>
                        <p className="text-[11px] text-[#778B96] font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF4B4B]" />
                          <span className="truncate">{player.city || player.district}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-[#E5E5E5] dark:bg-[#283941] text-[10px] font-black">AGE {player.age || "20+"}</span>
                          {player.skillLevel && (
                            <span className="px-2 py-0.5 rounded-lg bg-[#1CB0F6]/15 text-[#1CB0F6] text-[10px] font-black">{player.skillLevel}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(player.sports || []).slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-lg bg-[#E5E5E5] dark:bg-[#283941] text-[10px] font-black flex items-center gap-1">
                          <span>{getSportEmoji(s)}</span>
                          <span>{s}</span>
                        </span>
                      ))}
                      {(player.sports || []).length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#E5E5E5] dark:bg-[#283941] text-[10px] font-black">+{player.sports.length - 4}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t-2 border-[#E5E5E5] dark:border-[#283941]">
                      {player.instagram ? (
                        <a
                          href={`https://instagram.com/${player.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm border-2 border-b-[4px] border-[#833ab4] active:translate-y-[2px] active:border-b-2 transition-all"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 fill-current" />
                          <span>DM</span>
                        </a>
                      ) : (
                        <span className="flex-1 py-2.5 px-3 rounded-2xl bg-[#E5E5E5] dark:bg-[#283941] text-[#778B96] text-xs font-black text-center">NO IG</span>
                      )}
                      <button
                        onClick={(e) => openDirections(e, player)}
                        title="Directions"
                        className="p-2.5 rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] text-white border-2 border-b-[4px] border-[#1899D6] active:translate-y-[2px] active:border-b-2 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
