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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Community Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange("discover")}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-[#131F24] border-2 border-[#10B981]/30 p-1 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-extrabold tracking-tight text-lg sm:text-xl text-[#171717] dark:text-white leading-tight">
                kalikkanaalundo<span className="text-[#10B981]">.com</span>
              </span>
              <span className="text-[10px] text-[#71717A] font-semibold tracking-wider uppercase hidden md:inline">
                കളിക്കാനാളട്ടുണ്ടോ • Kerala Turf Network
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#059669] dark:text-[#10B981] text-xs font-semibold animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{onboardedCount.toLocaleString()} Players Onboarded</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
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
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-[#1F1F1F] text-[#171717] dark:text-white shadow-sm font-semibold border border-black/5 dark:border-white/10 text-[#10B981]"
                    : "text-[#71717A] hover:text-[#171717] dark:hover:text-white"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isGpsActive
                  ? "bg-[#22C55E]/15 border-[#22C55E]/30 text-[#16A34A] dark:text-[#22C55E]"
                  : "bg-black/5 dark:bg-white/5 border-transparent text-[#71717A] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isGpsActive ? "animate-bounce text-[#22C55E]" : ""}`} />
              <span className="hidden md:inline">
                {isGpsActive ? "GPS Active" : "Enable GPS"}
              </span>
              {isGpsActive && (
                <span title="Fuzzed for safety">
                  <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                </span>
              )}
            </button>
          )}

          {/* User Profile / Login Button */}
          {currentUser ? (
            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-2 p-1 sm:pr-3 rounded-full border transition-all ${
                activeTab === "profile"
                  ? "border-[#22C55E] bg-[#22C55E]/5"
                  : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#22C55E]"
              />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-[#171717] dark:text-white max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="primary-btn !py-2 !px-5 text-xs sm:text-sm shadow-md"
            >
              Join Now
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
