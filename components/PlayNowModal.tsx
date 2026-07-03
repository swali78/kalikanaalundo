"use client";

import React, { useState } from "react";
import { Sport, District } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { createGame } from "@/lib/supabase/api";
import { X, Zap, MapPin, Sparkles, Check } from "lucide-react";

interface PlayNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userLat?: number;
  userLng?: number;
  userDistrict?: District;
}

const SPORTS: Sport[] = [
  "Badminton",
  "Football",
  "Cricket",
  "Pickleball",
  "Volleyball",
  "Basketball",
  "Tennis",
];

export default function PlayNowModal({
  isOpen,
  onClose,
  onSuccess,
  userLat,
  userLng,
  userDistrict = "Ernakulam",
}: PlayNowModalProps) {
  const [sport, setSport] = useState<Sport>("Badminton");
  const [radiusKm, setRadiusKm] = useState(5);
  const [venueHint, setVenueHint] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create an immediate "Play Now" broadcast game
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      const dateStr = now.toISOString().split("T")[0];

      const res = await createGame({
        sport,
        venue: venueHint.trim() || `⚡ Play Now (${sport} near ${userDistrict})`,
        district: userDistrict,
        date: dateStr,
        time: timeStr,
        duration: 60,
        skillLevel: "Beginner",
        maxPlayers: 4,
        description: `⚡ INSTANT BROADCAST: Looking for players within ${radiusKm} km to play right now! Send DM on Instagram or chat below.`,
        entryFee: 0,
        beginnerFriendly: true,
        latitude: userLat || 10.0159 + (Math.random() - 0.5) * 0.03,
        longitude: userLng || 76.3419 + (Math.random() - 0.5) * 0.03,
      });

      if (res) {
        onSuccess();
        onClose();
      } else {
        alert("Please log in to broadcast!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-modal w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#1f2e35] rounded-[2rem] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5] dark:border-[#283941] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#58CC02] border-2 border-b-4 border-[#388000] flex items-center justify-center text-white font-black text-xl shadow-md">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#131F24] dark:text-white tracking-tight">
                Broadcast &quot;Play Now&quot;
              </h3>
              <p className="text-xs font-bold text-[#778B96] dark:text-[#A5B2BA]">
                Alert nearby players looking for a match right now
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#E5E5E5] dark:hover:bg-[#283941] text-[#778B96] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1.5">
              SELECT SPORT
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 border-b-2 flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                    sport === s
                      ? "bg-[#58CC02] text-white border-[#388000] scale-105 shadow-sm"
                      : "bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white border-[#CCCCCC] dark:border-[#1C2A30]"
                  }`}
                >
                  <span>{getSportEmoji(s)}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#58CC02]" />
              <span>BROADCAST RADIUS (KM)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 20].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => setRadiusKm(rad)}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase border-2 border-b-[4px] transition-all select-none cursor-pointer ${
                    radiusKm === rad
                      ? "bg-[#58CC02] text-white border-[#388000] shadow-md active:translate-y-[2px] active:border-b-2"
                      : "bg-white dark:bg-[#283941] border-[#E5E5E5] dark:border-[#1C2A30] text-[#778B96] dark:text-[#A5B2BA]"
                  }`}
                >
                  {rad} KM
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1.5">
              TURF / AREA HINT (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Kakkanad Metro / Decathlon"
              value={venueHint}
              onChange={(e) => setVenueHint(e.target.value)}
              className="w-full font-bold text-sm !rounded-2xl !border-2 !border-b-4 !border-[#E5E5E5] dark:!border-[#37464F] !bg-white dark:!bg-[#283941] !py-3"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/25 text-xs font-bold text-[#58CC02] leading-relaxed">
            ⚡ <strong className="font-black">HOW IT WORKS:</strong> Your broadcast card will appear at the top of the Discover feed with your Instagram DM link so players can jump in immediately!
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full duo-btn-green !py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-xl cursor-pointer select-none"
          >
            {loading ? (
              <span>BROADCASTING...</span>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current animate-bounce" />
                <span>LAUNCH BROADCAST ⚡</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
