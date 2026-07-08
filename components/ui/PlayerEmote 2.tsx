"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Heart } from "lucide-react";

export type EmoteState = "default" | "curious" | "cheering" | "winking" | "playing" | "sad";

interface PlayerEmoteProps {
  state?: EmoteState;
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
  animate?: boolean;
}

export default function PlayerEmote({
  state = "default",
  size = "lg",
  message,
  className = "",
  animate = true,
}: PlayerEmoteProps) {
  const [hovered, setHovered] = useState(false);
  const [activeState, setActiveState] = useState<EmoteState>(state);

  useEffect(() => {
    setActiveState(state);
  }, [state]);

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64 sm:w-72 sm:h-72",
  };

  const bubbleTextSize = {
    sm: "text-xs px-2.5 py-1",
    md: "text-xs px-3 py-1.5",
    lg: "text-sm sm:text-base px-4 py-2 font-bold",
    xl: "text-base sm:text-lg px-5 py-2.5 font-extrabold",
  };

  // Toggle fun interactive states on click
  const handleClick = () => {
    const states: EmoteState[] = ["winking", "cheering", "playing", "default"];
    const next = states[(states.indexOf(activeState) + 1) % states.length];
    setActiveState(next);
  };

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech Bubble */}
      {message && (
        <div className="mb-3 z-20 transition-all duration-300">
          <div
            className={`relative rounded-2xl bg-white dark:bg-[#131F24] text-[#171717] dark:text-white border-2 border-b-4 border-[#E5E5E5] dark:border-[#37464F] shadow-md ${bubbleTextSize[size]} flex items-center gap-1.5 text-center`}
          >
            {activeState === "cheering" && <Sparkles className="w-4 h-4 text-[#58CC02]" />}
            <span>{message}</span>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white dark:border-t-[#131F24]" />
          </div>
        </div>
      )}

      {/* Mascot Container */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`${sizeClasses[size]} relative cursor-pointer transition-transform duration-300 ${
          animate ? "hover:scale-105 active:scale-95" : ""
        } flex items-center justify-center`}
        title="Click me for emote reaction!"
      >
        {/* Glowing aura for cheering/playing */}
        {(activeState === "cheering" || activeState === "playing") && (
          <div className="absolute inset-0 rounded-full bg-[#58CC02]/20 blur-xl animate-pulse -z-10" />
        )}

        {/* Custom SVG Sports Mascot: "Kittu the Turf Tiger / Athlete" */}
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xl overflow-visible"
        >
          {/* Background decorative elements */}
          {activeState === "cheering" && (
            <g className="animate-pulse">
              <circle cx="30" cy="40" r="6" fill="#FFC800" />
              <circle cx="170" cy="35" r="8" fill="#58CC02" />
              <path d="M160 80 L168 88 L160 96 Z" fill="#FF4B4B" />
              <path d="M40 90 L48 98 L40 106 Z" fill="#1CB0F6" />
            </g>
          )}

          {/* Body / Shirt (Emerald Green Duolingo style jersey) */}
          <path
            d="M50 140 C50 115 150 115 150 140 L160 185 C160 190 155 195 150 195 L50 195 C45 195 40 190 40 185 Z"
            fill="#58CC02"
            stroke="#388000"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Jersey Collar */}
          <path d="M85 130 L100 150 L115 130" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          {/* Jersey Number / Brand */}
          <text x="100" y="175" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="24">
            K
          </text>

          {/* Arms */}
          {activeState === "cheering" ? (
            // Arms up cheering
            <>
              <path d="M50 135 C30 110 20 80 30 70 C38 62 50 85 55 120" fill="#FFC288" stroke="#D99B66" strokeWidth="6" strokeLinecap="round" />
              <path d="M150 135 C170 110 180 80 170 70 C162 62 150 85 145 120" fill="#FFC288" stroke="#D99B66" strokeWidth="6" strokeLinecap="round" />
            </>
          ) : activeState === "playing" ? (
            // Right arm holding badminton racket / ball
            <>
              <path d="M50 140 C35 150 30 170 40 180" fill="none" stroke="#FFC288" strokeWidth="14" strokeLinecap="round" />
              <path d="M150 135 C175 120 185 90 175 80" fill="none" stroke="#FFC288" strokeWidth="14" strokeLinecap="round" />
              {/* Badminton Racket */}
              <ellipse cx="185" cy="50" rx="15" ry="20" fill="none" stroke="#FF4B4B" strokeWidth="5" />
              <line x1="185" y1="70" x2="175" y2="85" stroke="#333333" strokeWidth="5" />
            </>
          ) : (
            // Default resting arms
            <>
              <path d="M45 140 C30 155 35 180 45 185" fill="none" stroke="#FFC288" strokeWidth="14" strokeLinecap="round" />
              <path d="M155 140 C170 155 165 180 155 185" fill="none" stroke="#FFC288" strokeWidth="14" strokeLinecap="round" />
            </>
          )}

          {/* Head Shape (Sporty cute character) */}
          <ellipse
            cx="100"
            cy="85"
            rx="52"
            ry="48"
            fill="#FFC288"
            stroke="#D99B66"
            strokeWidth="6"
          />

          {/* Sporty Headband (Emerald Green with white stripe) */}
          <path
            d="M48 70 C48 55 152 55 152 70 L152 78 C152 85 48 85 48 78 Z"
            fill="#FF4B4B"
            stroke="#C92A2A"
            strokeWidth="4"
          />
          <path d="M50 74 C75 68 125 68 150 74" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="72" r="5" fill="#FFC800" />

          {/* Hair spikes / top */}
          <path d="M80 38 C85 20 95 25 100 35 C105 20 115 22 120 38" fill="#4A3018" stroke="#4A3018" strokeWidth="6" strokeLinecap="round" />

          {/* Eyes & Brows based on State */}
          {activeState === "curious" ? (
            // Curious wide eyes looking sideways / down at input
            <g>
              <ellipse cx="78" cy="92" rx="10" ry="12" fill="#FFFFFF" stroke="#333333" strokeWidth="3" />
              <circle cx="82" cy="95" r="5" fill="#171717" />
              <circle cx="84" cy="93" r="2" fill="#FFFFFF" />

              <ellipse cx="122" cy="92" rx="10" ry="12" fill="#FFFFFF" stroke="#333333" strokeWidth="3" />
              <circle cx="126" cy="95" r="5" fill="#171717" />
              <circle cx="128" cy="93" r="2" fill="#FFFFFF" />

              <path d="M68 76 L88 80" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
              <path d="M112 80 L132 76" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
            </g>
          ) : activeState === "winking" ? (
            // Winking left eye, open happy right eye
            <g>
              <path d="M68 92 C73 86 83 86 88 92" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
              
              <ellipse cx="122" cy="90" rx="9" ry="10" fill="#FFFFFF" stroke="#333333" strokeWidth="3" />
              <circle cx="122" cy="90" r="5" fill="#171717" />
              <circle cx="124" cy="88" r="2" fill="#FFFFFF" />

              <path d="M68 78 L88 76" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
              <path d="M112 76 L132 78" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
            </g>
          ) : activeState === "cheering" ? (
            // Starry / Sparkly eyes cheering!
            <g>
              <path d="M70 92 C75 82 85 82 90 92" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
              <path d="M110 92 C115 82 125 82 130 92" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
              <path d="M68 78 C75 72 85 72 90 78" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M110 78 C115 72 125 72 132 78" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          ) : activeState === "sad" ? (
            // Sad / crying eyes
            <g>
              <path d="M70 95 C75 90 85 90 90 95" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
              <path d="M110 95 C115 90 125 90 130 95" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
              <path d="M68 80 L88 84" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
              <path d="M132 80 L112 84" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
              <path d="M75 98 Q75 110 73 115" stroke="#1CB0F6" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Default happy eyes
            <g>
              <ellipse cx="78" cy="90" rx="9" ry="10" fill="#FFFFFF" stroke="#333333" strokeWidth="3" />
              <circle cx="80" cy="90" r="5" fill="#171717" />
              <circle cx="82" cy="88" r="2" fill="#FFFFFF" />

              <ellipse cx="122" cy="90" rx="9" ry="10" fill="#FFFFFF" stroke="#333333" strokeWidth="3" />
              <circle cx="120" cy="90" r="5" fill="#171717" />
              <circle cx="122" cy="88" r="2" fill="#FFFFFF" />

              <path d="M68 78 L88 76" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
              <path d="M112 76 L132 78" stroke="#4A3018" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {/* Cute Rosy Cheeks */}
          <ellipse cx="65" cy="105" rx="7" ry="4" fill="#FF8A8A" opacity="0.6" />
          <ellipse cx="135" cy="105" rx="7" ry="4" fill="#FF8A8A" opacity="0.6" />

          {/* Nose */}
          <path d="M98 96 Q100 102 103 98" stroke="#D99B66" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Mouth */}
          {activeState === "cheering" || activeState === "playing" ? (
            // Wide open happy mouth with tongue
            <g>
              <path d="M82 108 C82 125 118 125 118 108 Z" fill="#7A1D1D" stroke="#4A1010" strokeWidth="4" strokeLinejoin="round" />
              <path d="M90 115 Q100 122 110 115" fill="#FF6B6B" />
            </g>
          ) : activeState === "curious" ? (
            // Small round 'o' mouth
            <circle cx="100" cy="110" r="6" fill="#7A1D1D" stroke="#4A1010" strokeWidth="3" />
          ) : activeState === "winking" ? (
            // Cool smirk / smile
            <path d="M82 108 Q100 120 118 105" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
          ) : (
            // Warm friendly smile
            <path d="M84 108 Q100 118 116 108" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
          )}
        </svg>
      </div>

      {/* Emote status label on hover */}
      {hovered && (
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#71717A] mt-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
          {activeState} state • Tap to interact
        </span>
      )}
    </div>
  );
}
