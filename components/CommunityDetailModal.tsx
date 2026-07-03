"use client";

import React, { useState, useEffect } from "react";
import { Community, Game, User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { fetchCommunityMembers } from "@/lib/supabase/api";
import { X, Shield, MapPin, Users, Calendar, Clock, MessageCircle, Navigation, ArrowRight, Lock, ExternalLink } from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";

interface CommunityDetailModalProps {
  community: Community | null;
  games: Game[];
  onClose: () => void;
  onSelectGame: (game: Game) => void;
  onHostInCommunity: (community: Community) => void;
  currentUser: User | null;
}

export default function CommunityDetailModal({
  community,
  games,
  onClose,
  onSelectGame,
  onHostInCommunity,
  currentUser,
}: CommunityDetailModalProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  useEffect(() => {
    async function loadMembers() {
      if (!community || !currentUser) return;
      // Check if creator or admin
      const isCreator = community.creatorId === currentUser.id || !community.creatorId || currentUser.id === 'admin';
      if (isCreator) {
        setLoadingMembers(true);
        const data = await fetchCommunityMembers(community.id);
        setMembers(data);
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, [community, currentUser]);

  if (!community) return null;

  const isCreator = currentUser && (community.creatorId === currentUser.id || !community.creatorId || currentUser.id === 'admin');

  const commGames = games.filter(
    (g) => g.communityId === community.id || g.district === community.district
  );

  const openDirections = () => {
    let lat = community.latitude || 10.0159;
    let lng = community.longitude || 76.3419;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-modal w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#121212] flex flex-col relative overflow-hidden shadow-2xl">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-[#1E3A8A] dark:bg-[#1f2937] text-white relative border-b border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-bold">
                🛡️
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white inline-block mb-1">
                  Official Community Hub
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {community.name}
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{community.district}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{community.memberCount} active members</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => onHostInCommunity(community)}
                className="bg-white text-[#1E3A8A] hover:bg-blue-50 font-bold py-2.5 px-5 rounded-2xl text-xs transition-transform hover:scale-105 shadow-md shrink-0"
              >
                + Host Game Here
              </button>
              <button
                onClick={openDirections}
                className="bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 text-white font-semibold py-2.5 px-3.5 rounded-2xl text-xs flex items-center gap-1 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description & Games List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
              About This Hub
            </h4>
            <p className="text-sm text-[#171717] dark:text-white leading-relaxed">
              {community.description || `Welcome to ${community.name}! We organize regular weekday and weekend games across ${community.district}. Join any of the scheduled matches below or host your own session to bring local players together.`}
            </p>
          </div>

          {/* Role-Based Member Visibility */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
                  👥
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
                    <span>Hub Membership Status</span>
                    {isCreator && (
                      <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider">
                        Creator Admin View
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#71717A]">
                    {isCreator
                      ? `You are the creator of this hub. Showing full registration details of all ${members.length || community.memberCount} members.`
                      : `${community.memberCount} active players registered in this hub.`}
                  </p>
                </div>
              </div>
              {!isCreator && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-bold text-[#71717A] border border-black/5 dark:border-white/5" title="Only the community creator can view member registration details">
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="hidden sm:inline">Privacy Protected</span>
                </div>
              )}
            </div>

            {isCreator && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                {loadingMembers ? (
                  <p className="text-xs font-semibold text-[#71717A] animate-pulse">Loading registered members...</p>
                ) : members.length === 0 ? (
                  <p className="text-xs text-[#71717A] font-medium">No external members registered via Supabase yet.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {members.map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=10B981&color=fff`}
                            alt={m.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#10B981]/30"
                          />
                          <div>
                            <p className="text-xs font-extrabold text-[#171717] dark:text-white flex items-center gap-1">
                              <span>{m.name}</span>
                              <span className="text-[10px] text-[#71717A] font-normal">({m.age || "20+"} yrs)</span>
                            </p>
                            <p className="text-[11px] text-[#71717A] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#10B981]" />
                              <span>{m.city || m.district || community.district}</span>
                              <span className="mx-1">•</span>
                              <span className="text-[#10B981] font-semibold">{m.skillLevel || "Intermediate"}</span>
                            </p>
                          </div>
                        </div>

                        {m.instagram ? (
                          <a
                            href={`https://instagram.com/${m.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm hover:opacity-95"
                          >
                            <InstagramIcon className="w-3.5 h-3.5 fill-current" />
                            <span>@{m.instagram.replace("@", "")}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] font-bold text-[#71717A] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
                            No IG
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#171717] dark:text-white flex items-center gap-2">
                <span>Hub Matches ({commGames.length})</span>
              </h4>
            </div>

            {commGames.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#F4F4F5] dark:bg-[#1F1F1F] text-center space-y-2">
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  No matches scheduled right now in this hub
                </p>
                <p className="text-xs text-[#71717A]">
                  Be the first leader to schedule a match for this community!
                </p>
                <button
                  onClick={() => onHostInCommunity(community)}
                  className="primary-btn mt-2 !py-2 !px-5 text-xs"
                >
                  Schedule a Match
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      onClose();
                      onSelectGame(game);
                    }}
                    className="p-4 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] hover:bg-[#E4E4E7] dark:hover:bg-[#262626] transition-all cursor-pointer border border-[#E4E4E7]/60 dark:border-[#262626] flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#16A34A] flex items-center gap-1">
                          <span>{getSportEmoji(game.sport)}</span>
                          <span>{game.sport}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#71717A]">
                          {game.currentPlayers}/{game.maxPlayers} players
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-[#171717] dark:text-white group-hover:text-[#22C55E] transition-colors">
                        {game.venue}
                      </h5>
                      <p className="text-xs text-[#71717A] mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#22C55E]" />
                          <span>{game.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#22C55E]" />
                          <span>{game.time}</span>
                        </span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E4E4E7] dark:border-[#262626] flex items-center justify-between text-xs font-bold text-[#22C55E]">
                      <span>Open Team Chat</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
