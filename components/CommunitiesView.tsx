"use client";

import React, { useState } from "react";
import { Community, User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import {
  Users, Shield, MapPin, Navigation, ArrowRight,
  Map as MapIcon, ExternalLink
} from "lucide-react";
import dynamic from "next/dynamic";

const CommunityMap = dynamic(() => import("./CommunityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-3xl bg-[#F4F4F5] dark:bg-[#121212] border border-[#E4E4E7] dark:border-[#262626] flex items-center justify-center animate-pulse">
      <p className="text-sm font-semibold text-[#71717A]">Loading map...</p>
    </div>
  ),
});

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
  const [showMap, setShowMap] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  const districts = ["All", "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur",
    "Malappuram", "Kollam", "Alappuzha", "Palakkad", "Kottayam", "Kannur"];

  const filteredCommunities = selectedDistrict === "All"
    ? communities
    : communities.filter((c) => c.district === selectedDistrict);

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
      {/* Header */}
      <div className="game-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#1CB0F6]/15 border-2 border-[#1CB0F6]/30 text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
              <Shield className="w-3.5 h-3.5" />
              <span>COMMUNITY HUBS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#131F24] dark:text-white">
              Local Sports <span className="text-[#1CB0F6]">Communities</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#778B96]">
              Join clubs, turfs, and sports leagues. Tap <strong>Route</strong> for directions!
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border-2 border-b-[4px] transition-all ${
                showMap
                  ? "bg-[#22C55E] text-white border-[#388000]"
                  : "bg-white dark:bg-[#1f2e35] text-[#131F24] dark:text-white border-[#E5E5E5] dark:border-[#37464F]"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{showMap ? "List" : "Map"}</span>
            </button>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white font-black text-xs py-2 px-3 rounded-xl border-2 border-[#CCCCCC] dark:border-[#1C2A30] focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showMap && filteredCommunities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#71717A]">{filteredCommunities.length} communities</span>
            <span className="text-[10px] text-[#71717A]">📍 Approximate hub locations</span>
          </div>
          <CommunityMap
            communities={filteredCommunities}
            onSelectCommunity={onSelectCommunity}
            onOpenDirections={openDirections}
          />
        </div>
      )}

      {filteredCommunities.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#F4F4F5] dark:bg-[#1F1F1F] flex items-center justify-center text-3xl mx-auto">🛡️</div>
          <h4 className="text-base font-bold text-[#171717] dark:text-white">No Communities Found</h4>
          <p className="text-xs text-[#71717A]">We are onboarding official sports clubs. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCommunities.map((comm) => (
            <div key={comm.id} onClick={() => onSelectCommunity?.(comm)}
              className="game-card p-5 space-y-3 flex flex-col justify-between hover:border-[#1CB0F6] transition-all group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1CB0F6]/15 border-2 border-b-3 border-[#1CB0F6]/30 flex items-center justify-center text-[#1CB0F6] font-black text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white border-2 border-b-2 border-[#CCCCCC] dark:border-[#1C2A30] flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#1CB0F6]" />
                    <span>{comm.memberCount}</span>
                  </span>
                </div>
                <h3 className="font-black text-base text-[#131F24] dark:text-white group-hover:text-[#1CB0F6] transition-colors">{comm.name}</h3>
                <p className="text-[11px] text-[#778B96] mt-0.5 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF4B4B]" />
                  <span>{comm.district}</span>
                </p>
                <p className="text-xs font-semibold text-[#778B96] mt-2 leading-relaxed line-clamp-2">
                  {comm.description || `Official sports community in ${comm.district}.`}
                </p>
              </div>

              <div className="pt-3 flex items-center gap-2 border-t-2 border-[#E5E5E5] dark:border-[#283941]">
                <button onClick={(e) => { e.stopPropagation(); onSelectCommunity?.(comm); }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-2 border-b-[4px] border-[#1899D6] active:translate-y-[2px] active:border-b-2 shadow-sm">
                  <span>EXPLORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => openDirections(e, comm)}
                  title="Open in Google Maps"
                  className="px-3.5 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white border-2 border-b-[4px] border-[#388000] active:translate-y-[2px] active:border-b-2 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">ROUTE</span>
                </button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  const query = encodeURIComponent(`${comm.name}, ${comm.district}, Kerala`);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                }}
                  title="View on Google Maps"
                  className="p-2.5 rounded-2xl bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all">
                  <ExternalLink className="w-4 h-4 text-[#1CB0F6]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
