"use client";

import React, { useState } from "react";
import { User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { updateProfile, signOut } from "@/lib/supabase/api";
import { MapPin, ShieldCheck, LogOut, Edit3, Check, Trophy, Sparkles } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/InstagramIcon";

interface ProfileViewProps {
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
}

export default function ProfileView({
  currentUser,
  onUpdateUser,
  onLogout,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [instagram, setInstagram] = useState(currentUser?.instagram || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [privacyFuzz, setPrivacyFuzz] = useState(currentUser?.privacyFuzzLocation ?? true);
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let cleanInsta = instagram.trim().replace(/^@/, "");
      await updateProfile({
        name: name.trim(),
        instagram: cleanInsta || undefined,
        bio: bio.trim(),
        privacyFuzzLocation: privacyFuzz,
      });

      onUpdateUser({
        ...currentUser,
        name: name.trim(),
        instagram: cleanInsta || undefined,
        bio: bio.trim(),
        privacyFuzzLocation: privacyFuzz,
      });
      setEditing(false);
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onLogout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 fade-in">
      <div className="game-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#E5E5E5] dark:border-[#283941]">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-b-4 border-[#58CC02]/50 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-[#131F24] dark:text-white tracking-tight">
                  {currentUser.name}
                </h2>
                {currentUser.verified && (
                  <span className="w-6 h-6 rounded-lg bg-[#58CC02] text-white flex items-center justify-center text-xs font-black border-b-2 border-[#388000]" title="Verified Player">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-[#778B96] dark:text-[#A5B2BA] flex items-center gap-1 mt-1 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                <span>{[currentUser.city, currentUser.district].filter(Boolean).join(", ") || "Location not set — update your profile"}</span>
              </p>
              {currentUser.instagram && (
                <a
                  href={`https://instagram.com/${currentUser.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-sm border-b-2 border-purple-700"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{currentUser.instagram}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 sm:flex-initial justify-center py-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-white dark:bg-[#1f2e35] text-[#131F24] dark:text-white border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all flex items-center gap-1.5 select-none cursor-pointer shadow-sm"
              >
              <Edit3 className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>EDIT PROFILE</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-2xl bg-[#FF4B4B]/15 text-[#FF4B4B] border-2 border-b-[4px] border-[#FF4B4B]/30 active:translate-y-[2px] active:border-b-2 transition-all hover:bg-[#FF4B4B]/20 select-none cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center py-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm">
            <span className="text-2xl font-black text-[#FFC800] block">
              {currentUser.rating || 4.8} ⭐
            </span>
            <span className="text-[10px] font-black text-[#778B96] uppercase tracking-wider">
              PLAYER RATING
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm">
            <span className="text-2xl font-black text-[#58CC02] block">
              {currentUser.gamesPlayed || 12} 🏆
            </span>
            <span className="text-[10px] font-black text-[#778B96] uppercase tracking-wider">
              MATCHES PLAYED
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1f2e35] border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] shadow-sm">
            <span className="text-2xl font-black text-[#1CB0F6] block">
              {currentUser.skillLevel}
            </span>
            <span className="text-[10px] font-black text-[#778B96] uppercase tracking-wider">
              SKILL LEVEL
            </span>
          </div>
        </div>

        {/* Sports */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-2">
            FAVORITE SPORTS
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentUser.sports.map((s) => (
              <span
                key={s}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-[#58CC02]/15 text-[#58CC02] border-2 border-b-2 border-[#58CC02]/30 flex items-center gap-1.5"
              >
                <span>{getSportEmoji(s)}</span>
                <span>{s}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t-2 border-[#E5E5E5] dark:border-[#283941] fade-in">
            <h4 className="font-black text-base text-[#131F24] dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Edit3 className="w-4 h-4 text-[#1CB0F6]" />
              <span>EDIT PROFILE & SOCIAL</span>
            </h4>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>INSTAGRAM HANDLE (FOR DMS)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-black text-[#778B96]">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full !pl-8 font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] mb-1">
                BIO / STATUS
              </label>
              <textarea
                rows={2}
                placeholder="Tell players about your playing style or equipment..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full font-bold text-sm"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#58CC02]" />
                  <span className="text-xs font-black text-[#131F24] dark:text-white uppercase tracking-wide">
                    GPS PRIVACY FUZZING (~300M)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={privacyFuzz}
                  onChange={(e) => setPrivacyFuzz(e.target.checked)}
                  className="w-5 h-5 accent-[#58CC02] rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] font-bold text-[#778B96] dark:text-[#A5B2BA]">
                When enabled, people see your approximate distance on the map without exposing your exact home address or coordinates.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="py-2.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider bg-white dark:bg-[#283941] text-[#131F24] dark:text-white border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all select-none cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="duo-btn-green !py-2.5 !px-6 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer select-none"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? "SAVING..." : "SAVE CHANGES"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
