"use client";

import React from "react";
import { View, User } from "@/lib/types";
import { Users, MapPin, ShieldCheck, Flame } from "lucide-react";

interface NavbarProps {
  activeTab: View;
  onTabChange: (tab: View) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenOnboarding: () => void;
  onboardedCount: number;
  isGpsActive?: boolean;
  onToggleGps?: () => void;
}

export default function Navbar({
  activeTab, onTabChange, currentUser, onOpenLogin,
  onOpenOnboarding, onboardedCount, isGpsActive = false, onToggleGps,
}: NavbarProps) {
  return (
    <header className="glass-navbar transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <button onClick={() => onTabChange("discover")} className="flex items-center gap-1.5 sm:gap-2.5 group focus:outline-none cursor-pointer shrink-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[3px] sm:border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] p-0.5 sm:p-1 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden xs:flex flex-col items-start">
            <span className="font-black tracking-tight text-sm sm:text-xl text-[#131F24] dark:text-white leading-tight">
              kalikkanaalundo<span className="text-[#58CC02]">.com</span>
            </span>
            <span className="text-[8px] sm:text-[10px] text-[#778B96] font-extrabold tracking-wider uppercase hidden sm:inline">
              കളിക്കാനാളട്ടുണ്ടോ • KERALA TURF NETWORK
            </span>
          </div>
        </button>

        {/* Players Onboarded Badge - original position */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#58CC02]/15 border-2 border-b-[3px] border-[#58CC02]/30 text-[#58CC02] text-xs font-black tracking-wide uppercase select-none whitespace-nowrap">
          <Flame className="w-4 h-4 fill-current text-[#FFC800] animate-bounce" />
          <span>{onboardedCount.toLocaleString()} PLAYERS ONBOARDED</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1.5 bg-white/50 dark:bg-[#1f2e35]/50 p-1 rounded-2xl sm:rounded-3xl border-2 border-[#E5E5E5] dark:border-[#37464F] overflow-x-auto">
          {[
            { id: "discover" as View, label: "Home", short: "Home" },
            { id: "players" as View, label: "Players", short: "Players" },
            { id: "my-games" as View, label: "My Games", short: "Games" },
            { id: "communities" as View, label: "Communities", short: "Hubs" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`px-2 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? "bg-[#1CB0F6] text-white border-2 border-b-[3px] sm:border-b-[4px] border-[#1899D6] shadow-sm active:translate-y-[2px] active:border-b-[1px]"
                    : "text-[#778B96] dark:text-[#A5B2BA] hover:text-[#131F24] dark:hover:text-white hover:bg-[#E5E5E5]/60 dark:hover:bg-[#283941]"
                }`}>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* GPS */}
          {currentUser && onToggleGps && (
            <button onClick={onToggleGps}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer select-none ${
                isGpsActive
                  ? "bg-[#58CC02]/15 border-b-[3px] sm:border-b-[4px] border-[#58CC02] text-[#58CC02]"
                  : "bg-white dark:bg-[#1f2e35] border-b-[3px] sm:border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] text-[#778B96] hover:bg-gray-50 dark:hover:bg-[#283941]"
              }`}>
              <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${isGpsActive ? "animate-bounce text-[#58CC02]" : ""}`} />
              <span className="hidden sm:inline">{isGpsActive ? "GPS" : "GPS"}</span>
              {isGpsActive && <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#58CC02]" />}
            </button>
          )}

          {/* User */}
          {currentUser ? (
            <button onClick={() => onTabChange("profile")}
              className={`flex items-center gap-1 sm:gap-2 p-1 sm:pr-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer select-none ${
                activeTab === "profile"
                  ? "border-b-[3px] sm:border-b-[4px] border-[#58CC02] bg-[#58CC02]/10"
                  : "border-b-[3px] sm:border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941]"
              }`}>
              <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-cover border-2 border-[#58CC02]" />
              <span className="hidden sm:inline text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#131F24] dark:text-white max-w-[80px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button onClick={onOpenLogin} className="primary-btn !py-1.5 !px-3 sm:!py-2.5 sm:!px-5 text-[10px] sm:text-xs shadow-md !rounded-xl sm:!rounded-2xl">
              JOIN
            </button>
          )}

          {/* Mobile onboarded count */}
          <div className="sm:hidden flex items-center gap-1 px-1.5 py-1 rounded-lg bg-[#58CC02]/15 border border-[#58CC02]/30 text-[#58CC02] text-[8px] font-black">
            <Flame className="w-2.5 h-2.5 fill-current text-[#FFC800]" />
            <span>{onboardedCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
