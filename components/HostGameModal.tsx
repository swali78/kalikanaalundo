"use client";

import React, { useState } from "react";
import { Sport, SkillLevel, District } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { createGame } from "@/lib/supabase/api";
import { X, Calendar, Clock, MapPin, Users, DollarSign, Sparkles, Check } from "lucide-react";

interface HostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userLat?: number;
  userLng?: number;
}

const SPORTS: Sport[] = [
  "Badminton",
  "Football",
  "Cricket",
  "Pickleball",
  "Volleyball",
  "Basketball",
  "Tennis",
  "Table Tennis",
  "Running",
  "Cycling",
];

const DISTRICTS: District[] = [
  "Ernakulam",
  "Thiruvananthapuram",
  "Kozhikode",
  "Thrissur",
  "Alappuzha",
  "Kollam",
  "Kottayam",
  "Palakkad",
  "Malappuram",
  "Kannur",
];

export default function HostGameModal({
  isOpen,
  onClose,
  onSuccess,
  userLat,
  userLng,
}: HostGameModalProps) {
  const [sport, setSport] = useState<Sport>("Badminton");
  const [venue, setVenue] = useState("");
  const [district, setDistrict] = useState<District>("Ernakulam");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(60);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [entryFee, setEntryFee] = useState(0);
  const [description, setDescription] = useState("");
  const [beginnerFriendly, setBeginnerFriendly] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue.trim()) return;

    setLoading(true);
    try {
      const res = await createGame({
        sport,
        venue: venue.trim(),
        district,
        date,
        time,
        duration: Number(duration),
        skillLevel,
        maxPlayers: Number(maxPlayers),
        description: description.trim() || undefined,
        entryFee: Number(entryFee) || 0,
        beginnerFriendly,
        latitude: userLat || 10.0159 + (Math.random() - 0.5) * 0.04,
        longitude: userLng || 76.3419 + (Math.random() - 0.5) * 0.04,
      });

      if (res) {
        onSuccess();
        onClose();
      } else {
        alert("Please log in to host a game!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to host game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-modal w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#1f2e35] rounded-[2rem] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] relative max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5] dark:border-[#283941] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#58CC02]/20 border-2 border-b-4 border-[#58CC02]/40 flex items-center justify-center text-[#58CC02] font-black text-xl">
              🚀
            </div>
            <div>
              <h3 className="font-black text-xl text-[#131F24] dark:text-white tracking-tight">
                Host a New Game
              </h3>
              <p className="text-xs font-bold text-[#778B96] dark:text-[#A5B2BA]">
                Create a public session & bring players together
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1.5">
              Select Sport
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`sport-chip !py-1.5 !px-3.5 text-xs font-black uppercase tracking-wide border-2 border-b-2 ${
                    sport === s ? "bg-[#58CC02] text-white border-[#388000] scale-105" : "bg-[#E5E5E5] dark:bg-[#283941] text-[#131F24] dark:text-white border-[#CCCCCC] dark:border-[#1C2A30]"
                  }`}
                >
                  <span>{getSportEmoji(s)}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as District)}
                className="w-full font-medium"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Venue / Turf Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. United Sports Turf"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full font-medium text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full font-medium text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full font-medium"
              >
                <option value={45}>45m</option>
                <option value={60}>1h</option>
                <option value={90}>1.5h</option>
                <option value={120}>2h</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                Max Players
              </label>
              <input
                type="number"
                min={2}
                max={30}
                required
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
              Entry Fee per person (₹)
            </label>
            <input
              type="number"
              min={0}
              placeholder="0 for Free"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              className="w-full font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
              Game Notes / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring non-marking shoes. We have 3 shuttlecocks ready."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F]">
            <span className="text-xs font-semibold text-[#171717] dark:text-white">
              Beginner Friendly?
            </span>
            <input
              type="checkbox"
              checked={beginnerFriendly}
              onChange={(e) => setBeginnerFriendly(e.target.checked)}
              className="w-4 h-4 accent-[#22C55E] rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full duo-btn-green !py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-xl cursor-pointer select-none"
          >
            {loading ? (
              <span>CREATING GAME...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>PUBLISH GAME 🚀</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
