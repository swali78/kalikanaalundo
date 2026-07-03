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
      <div className="glass-modal w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#121212] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] dark:border-[#262626] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] font-bold text-lg">
              🚀
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#171717] dark:text-white">
                Host a New Game
              </h3>
              <p className="text-xs text-[#71717A]">
                Create a public session & bring players together
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    sport === s ? "active font-bold" : ""
                  }`}
                >
                  <span>{getSportEmoji(s)}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-3 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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
            className="w-full primary-btn flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#22C55E]/20"
          >
            {loading ? (
              <span>Creating Game...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Game</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
