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
      <div className="glass-modal w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#121212] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] dark:border-[#262626] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-lg shadow-md">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#171717] dark:text-white">
                Broadcast &quot;Play Now&quot;
              </h3>
              <p className="text-xs text-[#71717A]">
                Alert nearby players looking for a match right now
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E4E4E7] dark:hover:bg-[#262626] text-[#71717A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
              Select Sport
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`sport-chip !py-1 !px-3 text-xs ${
                    sport === s ? "active font-bold shadow-sm" : ""
                  }`}
                >
                  <span>{getSportEmoji(s)}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Broadcast Radius (km)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 20].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => setRadiusKm(rad)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    radiusKm === rad
                      ? "bg-[#22C55E] text-white border-[#22C55E] shadow-sm"
                      : "bg-[#F4F4F5] dark:bg-[#1F1F1F] border-transparent text-[#71717A]"
                  }`}
                >
                  {rad} km
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
              Turf / Area Hint (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Kakkanad Metro / Decathlon"
              value={venueHint}
              onChange={(e) => setVenueHint(e.target.value)}
              className="w-full font-medium text-sm"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-xs text-[#16A34A] dark:text-[#22C55E] leading-relaxed">
            ⚡ <strong>How it works:</strong> Your broadcast card will appear at the top of the Discover feed with your Instagram DM link so players can jump in immediately!
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full play-now py-3.5 px-6 font-bold text-sm flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span>Broadcasting...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current animate-bounce" />
                <span>Launch Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
