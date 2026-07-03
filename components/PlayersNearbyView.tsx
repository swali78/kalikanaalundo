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
      <div className="game-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 text-xs font-black uppercase tracking-wider text-[#58CC02]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DISTRICT PLAYER MATCHING • കളിക്കാനാളട്ടുണ്ടോ</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#131F24] dark:text-white">
              Like-Minded Players in <span className="text-[#58CC02] underline decoration-wavy decoration-[#58CC02]/40">{activeDistrict}</span>
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#778B96] dark:text-[#A5B2BA] leading-relaxed">
              Connect with fellow athletes and turf enthusiasts in your area. Check out their sports profile and drop them an instant DM to schedule a match!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch md:self-auto bg-white dark:bg-[#1f2e35] p-2.5 rounded-2xl border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-[#778B96] dark:text-[#A5B2BA] px-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#FF4B4B]" />
              <span>DISTRICT:</span>
            </div>
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white font-black text-xs sm:text-sm py-2 px-3 rounded-xl border-2 border-[#CCCCCC] dark:border-[#1C2A30] focus:outline-none cursor-pointer transition-all uppercase"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-[#1f2e35] text-[#131F24] dark:text-white">
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
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border-2 select-none cursor-pointer ${
                isActive
                  ? "bg-[#58CC02] text-white border-b-[4px] border-[#388000] shadow-md scale-105"
                  : "bg-white dark:bg-[#1f2e35] text-[#778B96] dark:text-[#A5B2BA] hover:text-[#131F24] dark:hover:text-white border-b-[4px] border-[#E5E5E5] dark:border-[#37464F]"
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
                className="game-card p-6 space-y-4 flex flex-col justify-between hover:border-[#58CC02] transition-all relative overflow-hidden group"
              >
                {hasSharedSport && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-[#58CC02]/15 border-2 border-b-2 border-[#58CC02]/30 text-[#58CC02] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SPORT MATCH</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <img
                    src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=58CC02&color=fff`}
                    alt={player.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-b-4 border-[#58CC02]/40 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-black text-xl text-[#131F24] dark:text-white group-hover:text-[#58CC02] transition-colors flex items-center gap-1.5 tracking-tight">
                      <span>{player.name}</span>
                      {player.verified && <span title="Verified Athlete" className="text-[#58CC02]">✓</span>}
                    </h3>
                    <p className="text-xs text-[#778B96] dark:text-[#A5B2BA] flex items-center gap-1 mt-0.5 font-bold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                      <span>{player.city || player.district}, KERALA</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#E5E5E5] dark:bg-[#283941] text-[11px] font-black uppercase text-[#131F24] dark:text-white border border-[#CCCCCC] dark:border-[#1C2A30]">
                        AGE: {player.age || "20+"}
                      </span>
                      {player.skillLevel && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#1CB0F6]/15 text-[#1CB0F6] text-[11px] font-black uppercase border border-[#1CB0F6]/30">
                          {player.skillLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sports Badges */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA]">
                    SPORTS PLAYED
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(player.sports || ["Badminton", "Football"]).map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white text-xs font-black uppercase tracking-wide border-2 border-b-2 border-[#CCCCCC] dark:border-[#1C2A30] flex items-center gap-1.5"
                      >
                        <span>{getSportEmoji(s)}</span>
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t-2 border-[#E5E5E5] dark:border-[#283941] flex items-center justify-between gap-3">
                  {player.instagram ? (
                    <a
                      href={`https://instagram.com/${player.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all border-2 border-b-[4px] border-[#833ab4] active:translate-y-[2px] active:border-b-2 select-none"
                    >
                      <InstagramIcon className="w-4 h-4 fill-current" />
                      <span>DM @{player.instagram.replace("@", "")}</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 rounded-2xl bg-[#E5E5E5] dark:bg-[#283941] text-[#778B96] dark:text-[#A5B2BA] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-b-[4px] border-[#CCCCCC] dark:border-[#1C2A30] cursor-not-allowed select-none"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>NO IG HANDLE</span>
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
