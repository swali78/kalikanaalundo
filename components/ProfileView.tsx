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
      <div className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E7] dark:border-[#262626]">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#22C55E] shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#171717] dark:text-white">
                  {currentUser.name}
                </h2>
                {currentUser.verified && (
                  <span className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-xs font-bold" title="Verified Player">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#71717A] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{currentUser.city}, {currentUser.district}</span>
              </p>
              {currentUser.instagram && (
                <a
                  href={`https://instagram.com/${currentUser.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-sm"
                >
                  <Instagram className="w-3 h-3" />
                  <span>@{currentUser.instagram}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="secondary-btn !py-2 !px-4 text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center py-2">
          <div className="p-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F]">
            <span className="text-2xl font-extrabold text-[#171717] dark:text-white block">
              {currentUser.rating || 4.8} ⭐
            </span>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
              Player Rating
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F]">
            <span className="text-2xl font-extrabold text-[#171717] dark:text-white block">
              {currentUser.gamesPlayed || 12} 🏆
            </span>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
              Matches Played
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F]">
            <span className="text-2xl font-extrabold text-[#171717] dark:text-white block">
              {currentUser.skillLevel}
            </span>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
              Skill Level
            </span>
          </div>
        </div>

        {/* Sports */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-2">
            Favorite Sports
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentUser.sports.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1.5"
              >
                <span>{getSportEmoji(s)}</span>
                <span>{s}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-[#E4E4E7] dark:border-[#262626] fade-in">
            <h4 className="font-bold text-base text-[#171717] dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#22C55E]" />
              <span>Edit Profile & Social Settings</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram Handle (for DMs)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-semibold text-[#71717A]">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full !pl-8 font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1">
                Bio / Status
              </label>
              <textarea
                rows={2}
                placeholder="Tell players about your playing style or equipment..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full font-medium text-sm"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-xs font-bold text-[#171717] dark:text-white">
                    GPS Privacy Location Fuzzing (~300m)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={privacyFuzz}
                  onChange={(e) => setPrivacyFuzz(e.target.checked)}
                  className="w-4 h-4 accent-[#22C55E] rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#71717A]">
                When enabled, people see your approximate distance on the map without exposing your exact home address or coordinates.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="secondary-btn !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="primary-btn !py-2 !px-6 text-xs flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
