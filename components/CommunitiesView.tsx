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
    if (comm.latitude && comm.longitude && Math.abs(comm.latitude - 10.0159) > 0.001) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${comm.latitude},${comm.longitude}`, "_blank");
    } else {
      const query = encodeURIComponent(`${comm.name}, ${comm.district}, Kerala`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
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
              className="game-card p-6 space-y-4 flex flex-col justify-between hover:border-[#1CB0F6] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6]/15 border-2 border-b-4 border-[#1CB0F6]/30 flex items-center justify-center text-[#1CB0F6] font-black text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white border-2 border-b-2 border-[#CCCCCC] dark:border-[#1C2A30] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1CB0F6]" />
                    <span>{comm.memberCount} MEMBERS</span>
                  </span>
                </div>

                <h3 className="font-black text-xl text-[#131F24] dark:text-white group-hover:text-[#1CB0F6] transition-colors tracking-tight">
                  {comm.name}
                </h3>
                <p className="text-xs text-[#778B96] dark:text-[#A5B2BA] mt-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                  <span>{comm.district}</span>
                </p>

                <p className="text-sm font-bold text-[#778B96] dark:text-[#A5B2BA] mt-3 leading-relaxed line-clamp-2">
                  {comm.description || `Official sports community for players in ${comm.district}. Join to participate in tournaments and casual weekend matches!`}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2.5 border-t-2 border-[#E5E5E5] dark:border-[#283941]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCommunity?.(comm);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-2 border-b-[4px] border-[#1899D6] active:translate-y-[2px] active:border-b-2 shadow-md"
                >
                  <span>EXPLORE HUB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => openDirections(e, comm)}
                  title="Get Directions"
                  className="px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941] text-[#131F24] dark:text-white border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-[#1CB0F6]" />
                  <span>ROUTE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
