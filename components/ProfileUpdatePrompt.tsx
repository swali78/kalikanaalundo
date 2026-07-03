"use client";

import React, { useState } from "react";
import { User, Sport, SkillLevel, District } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { updateProfile } from "@/lib/supabase/api";
import { MapPin, ShieldCheck, Check, Sparkles, X } from "lucide-react";

interface ProfileUpdatePromptProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onComplete: (updated: User) => void;
}

const AVAILABLE_SPORTS: Sport[] = [
  "Badminton", "Football", "Cricket", "Pickleball", "Volleyball",
  "Basketball", "Tennis", "Table Tennis", "Running", "Cycling",
  "Swimming", "Yoga", "Dancing", "Boxing", "Martial Arts",
  "Gym", "Athletics", "Skating", "Chess", "Kabaddi",
];

export default function ProfileUpdatePrompt({
  isOpen,
  currentUser,
  onClose,
  onComplete,
}: ProfileUpdatePromptProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [instagram, setInstagram] = useState(currentUser?.instagram || "");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(currentUser?.skillLevel || "Beginner");
  const [selectedSports, setSelectedSports] = useState<Sport[]>(currentUser?.sports || []);
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [gpsGranted, setGpsGranted] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !currentUser) return null;

  const toggleSport = (sport: Sport) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsGranted(true);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        alert("Location access denied.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let cleanInsta = instagram.trim().replace(/^@/, "");

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      instagram: cleanInsta || undefined,
      skillLevel,
      sports: selectedSports,
      bio: bio.trim(),
      latitude: coords.lat || currentUser.latitude,
      longitude: coords.lng || currentUser.longitude,
    };

    try {
      await updateProfile(updatedUser);
      localStorage.setItem('profile_update_shown', 'true');
      onComplete(updatedUser);
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('profile_update_shown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#121212] rounded-[2.5rem] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#2A373F] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-[#171717] dark:text-white">Update Your Player Profile</span>
            </div>
            <button type="button" onClick={handleSkip} className="text-xs font-bold text-[#71717A] hover:text-[#171717] dark:hover:text-white">
              Skip
            </button>
          </div>

          <p className="text-xs text-[#71717A] -mt-3">Keep your profile fresh so nearby players can find you!</p>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full font-medium" />
          </div>

          {/* Instagram */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 border border-pink-200 dark:border-pink-900/30">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1 flex items-center gap-1">
              <span className="text-pink-500">📸</span>
              <span>Instagram Handle</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-[#71717A]">@</span>
              <input
                type="text"
                placeholder="username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full !pl-8 font-medium"
              />
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1">Skill Level</label>
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className="w-full font-medium">
              <option value="Beginner">Beginner (Casual)</option>
              <option value="Intermediate">Intermediate (Regular)</option>
              <option value="Advanced">Advanced (Competitive)</option>
            </select>
          </div>

          {/* Sports */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1">Your Sports</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_SPORTS.map((sport) => {
                const active = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      active
                        ? "bg-[#58CC02] text-white border-[#388000]"
                        : "bg-[#E5E5E5] dark:bg-[#283941] text-[#71717A] border-transparent"
                    }`}
                  >
                    <span>{getSportEmoji(sport)} {sport}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1">Bio / Playing Style</label>
            <textarea
              rows={2}
              placeholder="Tell players about your style..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full font-medium"
            />
          </div>

          {/* GPS */}
          <div className="p-4 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/25">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#58CC02]" /> Enable GPS
              </span>
              {gpsGranted ? (
                <span className="text-xs font-bold text-[#58CC02] flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>
              ) : (
                <button type="button" onClick={handleRequestGps} disabled={gpsLoading}
                  className="text-xs font-bold text-[#1CB0F6] underline">
                  {gpsLoading ? "Detecting..." : "Grant Access"}
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#71717A]">Your location is fuzzed ~300m for privacy</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={handleSkip} className="secondary-btn !py-2.5 !px-5 text-xs flex-1">SKIP</button>
            <button type="submit" disabled={saving} className="primary-btn !py-2.5 !px-5 text-xs flex-1 shadow-lg">
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? "SAVING..." : "UPDATE PROFILE"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
