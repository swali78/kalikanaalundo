"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { fetchNearbyPlayers } from "@/lib/supabase/api";
import { getSportEmoji } from "@/lib/mockData";
import { MapPin, Users, Sparkles, Trophy, Filter, MessageCircle, ExternalLink } from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";

interface PlayersNearbyViewProps {
  currentUser: User | null;
  userDistrict: string;
}

export default function PlayersNearbyView({
  currentUser,
  userDistrict,
}: PlayersNearbyViewProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [activeDistrict, setActiveDistrict] = useState<string>(userDistrict || "Ernakulam");

  const districts = [
    "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur",
    "Malappuram", "Kollam", "Alappuzha", "Palakkad", "Kottayam",
    "Kannur", "Idukki", "Pathanamthitta", "Wayanad", "Kasaragod"
  ];

  const sportsList = [
    "All", "Badminton", "Football", "Cricket", "Volleyball",
    "Basketball", "Tennis", "Pickleball", "Table Tennis", "Running", "Cycling"
  ];

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
    return (p.sports || []).includes(selectedSport as any);
  });

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
    <div className="space-y-8 fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#121212] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-xs font-bold uppercase tracking-wider text-[#10B981]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>District Player Matching • കളിക്കാനാളട്ടുണ്ടോ</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-white">
              Like-Minded Players in <span className="text-[#10B981] underline decoration-wavy decoration-[#10B981]/40">{activeDistrict}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#71717A] leading-relaxed">
              Connect with fellow athletes and turf enthusiasts in your area. Check out their sports profile and drop them an instant DM to schedule a match!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch md:self-auto bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#71717A] px-2">
              <MapPin className="w-4 h-4 text-[#10B981]" />
              <span>District:</span>
            </div>
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="bg-white dark:bg-[#1f1f1f] hover:bg-black/5 dark:hover:bg-white/10 text-[#171717] dark:text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-xl border border-black/10 dark:border-white/20 focus:outline-none cursor-pointer transition-all"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-[#121212] text-[#171717] dark:text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sport Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {sportsList.map((sport) => {
          const isActive = selectedSport === sport;
          return (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25 scale-105"
                  : "bg-white dark:bg-[#1A1A1A] text-[#71717A] hover:text-[#171717] dark:hover:text-white border border-black/5 dark:border-white/10"
              }`}
            >
              {sport !== "All" && <span>{getSportEmoji(sport as any)}</span>}
              <span>{sport}</span>
            </button>
          );
        })}
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10" />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-3xl mx-auto">
            👥
          </div>
          <h3 className="text-xl font-bold text-[#171717] dark:text-white">
            No players found in {activeDistrict} for this filter
          </h3>
          <p className="text-sm text-[#71717A] max-w-md mx-auto">
            Be the pioneer in your district! Invite your turf buddies or try switching the district dropdown above to explore neighboring regions.
          </p>
          <button
            onClick={() => setSelectedSport("All")}
            className="primary-btn !py-2.5 !px-6 text-xs mt-2"
          >
            Show All Sports
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
            const hasSharedSport = (player.sports || []).some((s) =>
              (currentUser.sports || []).includes(s)
            );

            return (
              <div
                key={player.id}
                className="group relative rounded-3xl bg-white dark:bg-[#141414] border border-black/5 dark:border-white/10 p-6 shadow-md hover:shadow-2xl hover:border-[#10B981]/50 transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden"
              >
                {hasSharedSport && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Match</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <img
                    src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=10B981&color=fff`}
                    alt={player.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#10B981]/30 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-extrabold text-lg text-[#171717] dark:text-white group-hover:text-[#10B981] transition-colors flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {player.verified && <span title="Verified Athlete">✓</span>}
                    </h3>
                    <p className="text-xs text-[#71717A] flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{player.city || player.district}, Kerala</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[11px] font-bold text-[#71717A] dark:text-gray-300">
                        Age: {player.age || "20+"}
                      </span>
                      {player.skillLevel && (
                        <span className="px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold">
                          {player.skillLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sports Badges */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A]">
                    Sports Played
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(player.sports || ["Badminton", "Football"]).map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#10B981]/15 text-[#171717] dark:text-white hover:text-[#10B981] text-xs font-bold border border-black/5 dark:border-white/5 transition-colors flex items-center gap-1"
                      >
                        <span>{getSportEmoji(s)}</span>
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
                  {player.instagram ? (
                    <a
                      href={`https://instagram.com/${player.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <InstagramIcon className="w-4 h-4 fill-current" />
                      <span>DM @{player.instagram.replace("@", "")}</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-black/5 dark:bg-white/5 text-[#71717A] font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>No Instagram Handle</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
