"use client";

import React, { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase/api";
import { X, Mail, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import PlayerEmote, { EmoteState } from "@/components/ui/PlayerEmote";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDemoLogin?: (name: string) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onDemoLogin,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoName, setDemoName] = useState("Swalih M.");

  if (!isOpen) return null;

  // Determine dynamic emote state and speech bubble message based on user interaction
  const getEmoteState = (): { state: EmoteState; message: string } => {
    if (sent) {
      return { state: "cheering", message: "Woohoo! Check your email inbox!" };
    }
    if (loading) {
      return { state: "playing", message: "Connecting to turf servers..." };
    }
    if (email.length > 0) {
      return { state: "curious", message: "Ooh, entering your login link..." };
    }
    return { state: "default", message: "കളിക്കാനാളട്ടുണ്ടോ? Sign in to jump in!" };
  };

  const { state: emoteState, message: emoteMsg } = getEmoteState();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);
    if (error) {
      alert(typeof error === "string" ? error : error.message || "Login failed");
    } else {
      setSent(true);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setLoading(false);
      alert(typeof error === "string" ? error : error?.message || "Google login failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md fade-in overflow-y-auto">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#131F24] rounded-[2.5rem] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#2A373F] shadow-2xl relative my-8 transition-all">
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#2A373F] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1f2e35] p-0.5 border border-[#58CC02]/30 flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/logo.png" alt="kalikkanaalundo.com logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#58CC02] bg-[#58CC02]/15 px-3 py-1 rounded-full">
              KALIKKANAALUNDO.COM
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#E5E5E5] dark:bg-[#2A373F] hover:bg-[#D4D4D4] dark:hover:bg-[#37464F] text-[#71717A] dark:text-[#A5A5A5] flex items-center justify-center transition-all cursor-pointer font-bold"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamified Player Emote Mascot Header */}
        <div className="flex flex-col items-center justify-center py-2">
          <PlayerEmote state={emoteState} size="md" message={emoteMsg} />
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-5 fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#58CC02]/20 text-[#58CC02] text-3xl border-2 border-[#58CC02]">
              ✉️
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-2xl text-[#171717] dark:text-white tracking-tight">
                Magic Link On The Way!
              </h4>
              <p className="text-sm font-semibold text-[#71717A] dark:text-[#A5A5A5] max-w-xs mx-auto leading-relaxed">
                We sent an instant login link to <strong className="text-[#58CC02]">{email}</strong>. Click it from your phone or PC to enter the turf!
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full duo-btn-green text-base mt-4"
            >
              <span>Got It, Let's Go! 🚀</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-[#171717] dark:text-white tracking-tight">
                Enter The Athlete Portal
              </h3>
              <p className="text-xs font-bold text-[#71717A] dark:text-[#A5A5A5]">
                Connect with Kerala's real-time sports network
              </p>
            </div>

            {/* Google Chunky Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full duo-btn-outline !py-3.5 !text-sm flex items-center justify-center gap-3 font-black tracking-wider"
            >
              <span className="text-lg">🌐</span>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-0.5 bg-[#E5E5E5] dark:bg-[#2A373F] flex-1" />
              <span className="text-[11px] font-black text-[#A5A5A5] uppercase tracking-widest px-1">
                OR EMAIL LINK
              </span>
              <div className="h-0.5 bg-[#E5E5E5] dark:bg-[#2A373F] flex-1" />
            </div>

            {/* Email Magic Link Chunky Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#71717A] dark:text-[#A5A5A5]">
                  YOUR EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-[#A5A5A5]" />
                  <input
                    type="email"
                    required
                    placeholder="player@kalikkanaalundo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full !pl-12 !py-3.5 !rounded-2xl !border-2 !border-b-4 !border-[#E5E5E5] dark:!border-[#37464F] !bg-white dark:!bg-[#1f2e35] !text-[#171717] dark:!text-white font-bold text-sm focus:!border-[#58CC02] focus:!border-b-[#388000] focus:!outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className={`w-full ${loading || !email.trim() ? "duo-btn-slate opacity-60 cursor-not-allowed" : "duo-btn-green"} !py-4 text-sm font-black tracking-wider flex items-center justify-center gap-2`}
              >
                <span>{loading ? "SENDING LINK..." : "SEND MAGIC LINK ⚡"}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-[11px] font-bold text-[#71717A] dark:text-[#778B96] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#58CC02]" />
                <span>Zero passwords to remember. 100% passwordless security.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
