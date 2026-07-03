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
  activeTab,
  onTabChange,
  currentUser,
  onOpenLogin,
  onOpenOnboarding,
  onboardedCount,
  isGpsActive = false,
  onToggleGps,
}: NavbarProps) {
  return (
    <header className="glass-navbar transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand & Community Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange("discover")}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] p-1 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black tracking-tight text-lg sm:text-xl text-[#131F24] dark:text-white leading-tight">
                kalikkanaalundo<span className="text-[#58CC02]">.com</span>
              </span>
              <span className="text-[10px] text-[#778B96] font-extrabold tracking-wider uppercase hidden md:inline">
                കളിക്കാനാളട്ടുണ്ടോ • KERALA TURF NETWORK
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#58CC02]/15 border-2 border-b-[3px] border-[#58CC02]/30 text-[#58CC02] text-xs font-black tracking-wide uppercase select-none">
            <Flame className="w-4 h-4 fill-current text-[#FFC800] animate-bounce" />
            <span>{onboardedCount.toLocaleString()} PLAYERS ONBOARDED</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-white/50 dark:bg-[#1f2e35]/50 p-1.5 rounded-3xl border-2 border-[#E5E5E5] dark:border-[#37464F]">
          {[
            { id: "discover" as View, label: "Discover" },
            { id: "players" as View, label: "Players Nearby" },
            { id: "my-games" as View, label: "My Games" },
            { id: "communities" as View, label: "Communities" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer select-none ${
                  isActive
                    ? "bg-[#1CB0F6] text-white border-2 border-b-[4px] border-[#1899D6] shadow-sm active:translate-y-[2px] active:border-b-2"
                    : "text-[#778B96] dark:text-[#A5B2BA] hover:text-[#131F24] dark:hover:text-white hover:bg-[#E5E5E5]/60 dark:hover:bg-[#283941]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User & GPS Action Area */}
        <div className="flex items-center gap-2.5">
          {/* GPS Status Indicator */}
          {currentUser && onToggleGps && (
            <button
              onClick={onToggleGps}
              title={
                isGpsActive
                  ? "Real-time GPS Active (Location Fuzzed ~300m for safety)"
                  : "Enable Real-time GPS to find nearby players"
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer select-none ${
                isGpsActive
                  ? "bg-[#58CC02]/15 border-b-[4px] border-[#58CC02] text-[#58CC02]"
                  : "bg-white dark:bg-[#1f2e35] border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] text-[#778B96] hover:bg-gray-50 dark:hover:bg-[#283941]"
              }`}
            >
              <MapPin className={`w-4 h-4 ${isGpsActive ? "animate-bounce text-[#58CC02]" : ""}`} />
              <span className="hidden md:inline">
                {isGpsActive ? "GPS ACTIVE" : "ENABLE GPS"}
              </span>
              {isGpsActive && (
                <span title="Fuzzed for safety">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#58CC02]" />
                </span>
              )}
            </button>
          )}

          {/* User Profile / Login Button */}
          {currentUser ? (
            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-2 p-1.5 sm:pr-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                activeTab === "profile"
                  ? "border-b-[4px] border-[#58CC02] bg-[#58CC02]/10"
                  : "border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941]"
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover border-2 border-[#58CC02]"
              />
              <span className="hidden sm:inline text-xs sm:text-sm font-black uppercase tracking-wider text-[#131F24] dark:text-white max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="primary-btn !py-2.5 !px-6 text-xs sm:text-sm shadow-md !rounded-2xl"
            >
              JOIN NOW
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
