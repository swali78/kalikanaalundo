"use client";

import React from "react";
import { Community, User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { Users, Shield, MapPin, Navigation, ArrowRight } from "lucide-react";

interface CommunitiesViewProps {
  communities: Community[];
  currentUser: User | null;
  onSelectCommunity?: (community: Community) => void;
}

export default function CommunitiesView({
  communities,
  currentUser,
  onSelectCommunity,
}: CommunitiesViewProps) {
  const openDirections = (e: React.MouseEvent, comm: Community) => {
    e.stopPropagation();
    let lat = comm.latitude || 10.0159;
    let lng = comm.longitude || 76.3419;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white">
          Local Sports Communities ({communities.length})
        </h2>
        <p className="text-sm text-[#71717A] mt-1">
          Join clubs, turfs, and sports leagues around your district to find regular playing partners.
        </p>
      </div>

      {communities.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F4F4F5] dark:bg-[#1F1F1F] flex items-center justify-center text-3xl mx-auto">
            🛡️
          </div>
          <h4 className="text-lg font-bold text-[#171717] dark:text-white">
            No Communities Found
          </h4>
          <p className="text-sm text-[#71717A]">
            We are currently onboarding official sports clubs in Kerala. Stay tuned!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => onSelectCommunity?.(comm)}
              className="game-card p-6 space-y-4 flex flex-col justify-between hover:border-[#3B82F6]/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6] font-bold text-xl shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#71717A] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{comm.memberCount} Members</span>
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#171717] dark:text-white group-hover:text-[#3B82F6] transition-colors">
                  {comm.name}
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-[#71717A]" />
                  <span>{comm.district}</span>
                </p>

                <p className="text-xs text-[#71717A] mt-3 leading-relaxed line-clamp-2">
                  {comm.description || `Official sports community for players in ${comm.district}. Join to participate in tournaments and casual weekend matches!`}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2 border-t border-[#E4E4E7]/60 dark:border-[#262626]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCommunity?.(comm);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#3B82F6]/20"
                >
                  <span>Explore Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => openDirections(e, comm)}
                  title="Get Directions"
                  className="p-2.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] hover:bg-[#E4E4E7] text-[#171717] dark:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Navigation className="w-4 h-4 text-[#3B82F6]" />
                  <span>Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
