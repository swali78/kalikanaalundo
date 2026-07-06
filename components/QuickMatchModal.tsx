"use client";

import React, { useState, useEffect } from "react";
import { Game, Sport, User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { fetchNearbyPlayers } from "@/lib/supabase/api";
import { Zap, MapPin, Users, Calendar, Clock, ArrowRight, Sparkles, Flame, X, RefreshCw } from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";

interface QuickMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  currentUser: User | null;
  userLat?: number;
  userLng?: number;
  userDistrict?: string;
  onJoinGame: (gameId: string) => void;
  onOpenChat: (game: Game) => void;
  onOpenPlayNowModal?: () => void;
}

const SPORTS_LIST: Sport[] = [
  "Badminton", "Football", "Cricket", "Volleyball",
  "Basketball", "Tennis", "Pickleball", "Table Tennis",
  "Running", "Cycling", "Swimming", "Chess"
];

const DISTRICTS_LIST: string[] = [
  "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur",
  "Malappuram", "Kollam", "Alappuzha", "Palakkad", "Kottayam",
  "Kannur", "Idukki", "Pathanamthitta", "Wayanad", "Kasaragod"
];

export default function QuickMatchModal({
  isOpen,
  onClose,
  games,
  currentUser,
  userLat,
  userLng,
  userDistrict = "Ernakulam",
  onJoinGame,
  onOpenChat,
  onOpenPlayNowModal
}: QuickMatchModalProps) {
  const [selectedSport, setSelectedSport] = useState<Sport>("Badminton");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(userDistrict || "Ernakulam");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  
  const [matchedGames, setMatchedGames] = useState<Game[]>([]);
  const [matchedPlayers, setMatchedPlayers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (currentUser?.sports && currentUser.sports.length > 0) {
        setSelectedSport(currentUser.sports[0]);
      }
      if (userDistrict) {
        setSelectedDistrict(userDistrict);
      }
      setHasScanned(false);
      setIsScanning(false);
    }
  }, [isOpen, currentUser, userDistrict]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setIsScanning(true);
    setHasScanned(false);

    // Filter games locally
    const filteredG = games.filter((g) => {
      const sportMatch = g.sport === selectedSport;
      const distMatch = g.district.toLowerCase() === selectedDistrict.toLowerCase();
      const hasSlots = g.currentPlayers < g.maxPlayers;
      const notJoined = !currentUser || (g.host.id !== currentUser.id && !g.players.some(p => p.id === currentUser.id));
      return sportMatch && distMatch && hasSlots && notJoined;
    });

    // Fetch players from supabase
    const players = currentUser 
      ? await fetchNearbyPlayers(currentUser.id, selectedDistrict, [selectedSport], userLat, userLng, true)
      : [];
    
    const filteredP = players.filter(p => (p.sports || []).includes(selectedSport));

    // Simulate radar scan delay for exciting UX
    setTimeout(() => {
      setMatchedGames(filteredG);
      setMatchedPlayers(filteredP);
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md fade-in animate-in">
      <div className="glass-modal w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#1f2e35] rounded-[2rem] border-2 border-b-[8px] border-[#E5E5E5] dark:border-[#37464F] relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#E5E5E5] dark:border-[#283941] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#388000] border-2 border-b-4 border-[#2D6600] flex items-center justify-center text-white font-black text-2xl shadow-md">
              <Zap className="w-6 h-6 fill-current animate-bounce text-[#FFC800]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#58CC02]/15 border border-[#58CC02]/30 text-[10px] font-black uppercase tracking-wider text-[#58CC02] mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>AI SMART MATCHMAKING</span>
              </div>
              <h3 className="font-black text-xl text-[#131F24] dark:text-white tracking-tight">
                Quick Match Finder
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F4F5] dark:bg-[#283941] border-2 border-b-4 border-[#E4E4E7] dark:border-[#1C2A30] flex items-center justify-center text-[#71717A] hover:text-[#131F24] dark:hover:text-white active:translate-y-[2px] active:border-b-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Scanned State or Configuration */}
        {!isScanning && !hasScanned && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/20 space-y-1 text-center">
              <h4 className="font-extrabold text-sm text-[#131F24] dark:text-white flex items-center justify-center gap-1.5">
                <span>🎯</span>
                <span>Instant Partner & Game Locator</span>
              </h4>
              <p className="text-xs text-[#778B96] dark:text-[#A5B2BA] font-medium">
                Pick your sport and district below to let our radar scan for active turf games and online players around you.
              </p>
            </div>

            {/* Sport Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] flex items-center gap-1.5">
                <span>Select Sport</span>
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {SPORTS_LIST.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSelectedSport(sp)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 flex items-center gap-1.5 select-none cursor-pointer ${
                      selectedSport === sp
                        ? "bg-[#58CC02] text-white border-b-[4px] border-[#388000] shadow-md scale-105"
                        : "bg-[#F4F4F5] dark:bg-[#283941] text-[#778B96] hover:text-[#131F24] dark:hover:text-white border-b-[4px] border-[#E5E5E5] dark:border-[#1C2A30]"
                    }`}
                  >
                    <span>{getSportEmoji(sp)}</span>
                    <span>{sp}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* District Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#778B96] dark:text-[#A5B2BA] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                <span>Select District</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#F4F4F5] dark:bg-[#283941] text-[#131F24] dark:text-white font-black text-sm py-3.5 px-4 rounded-2xl border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#1C2A30] focus:outline-none focus:border-[#58CC02] cursor-pointer transition-all"
              >
                {DISTRICTS_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Start Scan Button */}
            <button
              onClick={handleStartScan}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#58CC02] via-[#46A302] to-[#388000] hover:opacity-95 text-white font-black text-base uppercase tracking-wider shadow-lg border-2 border-b-[6px] border-[#2D6600] active:translate-y-[3px] active:border-b-[2px] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current text-[#FFC800] animate-pulse" />
              <span>START INSTANT SCAN</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scanning State */}
        {isScanning && (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#58CC02]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#58CC02] animate-spin" />
              <div className="w-14 h-14 rounded-2xl bg-[#58CC02] border-2 border-b-4 border-[#388000] flex items-center justify-center text-2xl shadow-lg relative z-10">
                {getSportEmoji(selectedSport)}
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-lg text-[#131F24] dark:text-white animate-pulse">
                Scanning {selectedDistrict.toUpperCase()} Network...
              </h4>
              <p className="text-xs font-bold text-[#778B96] dark:text-[#A5B2BA]">
                Locating active {selectedSport} games & online players within radius
              </p>
            </div>
          </div>
        )}

        {/* Scanned Results State */}
        {hasScanned && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between bg-[#F4F4F5] dark:bg-[#283941] p-3 rounded-2xl border border-[#E5E5E5] dark:border-[#1C2A30]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSportEmoji(selectedSport)}</span>
                <span className="font-black text-xs uppercase text-[#131F24] dark:text-white">
                  {selectedSport} IN {selectedDistrict.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleStartScan}
                className="text-xs font-black text-[#58CC02] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rescan</span>
              </button>
            </div>

            {/* Game Matches */}
            {matchedGames.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#58CC02]">
                  <Flame className="w-4 h-4 fill-current text-[#FFC800]" />
                  <span>🎯 LIVE GAME MATCH ({matchedGames.length})</span>
                </div>
                {matchedGames.slice(0, 2).map((game) => (
                  <div key={game.id} className="p-4 rounded-2xl bg-white dark:bg-[#283941] border-2 border-b-4 border-[#58CC02] shadow-md space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-[#58CC02] text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                      INSTANT JOIN
                    </div>
                    <div>
                      <h4 className="font-black text-base text-[#131F24] dark:text-white flex items-center gap-1.5">
                        <span>{getSportEmoji(game.sport)}</span>
                        <span className="truncate">{game.venue}</span>
                      </h4>
                      <p className="text-xs font-bold text-[#778B96] flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1CB0F6]" />
                          {game.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#FFC800]" />
                          {game.time}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#37464F]">
                      <span className="text-xs font-black text-[#778B96]">
                        👥 {game.currentPlayers}/{game.maxPlayers} Players
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenChat(game);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#F4F4F5] dark:bg-[#1f2e35] text-[#131F24] dark:text-white font-extrabold text-xs border border-[#CCCCCC] dark:border-[#37464F] hover:opacity-80"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => {
                            onJoinGame(game.id);
                            onClose();
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-xs uppercase border-b-2 border-[#388000] shadow-sm"
                        >
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Player Matches */}
            {matchedPlayers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
                  <Users className="w-4 h-4" />
                  <span>🤝 COMPATIBLE PLAYERS NEARBY ({matchedPlayers.length})</span>
                </div>
                {matchedPlayers.slice(0, 2).map((player) => (
                  <div key={player.id} className="p-4 rounded-2xl bg-white dark:bg-[#283941] border-2 border-[#E5E5E5] dark:border-[#37464F] flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-b-4 border-[#1CB0F6]/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-[#131F24] dark:text-white truncate flex items-center gap-1">
                          {player.name}
                          {player.verified && <span className="text-[#58CC02] text-xs">✓</span>}
                        </h4>
                        <p className="text-[11px] font-bold text-[#778B96] truncate">
                          📍 {player.city || player.district} • {player.skillLevel}
                        </p>
                      </div>
                    </div>
                    <div>
                      {player.instagram ? (
                        <a
                          href={`https://instagram.com/${player.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 fill-current" />
                          <span>DM</span>
                        </a>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-xl bg-[#F4F4F5] dark:bg-[#1f2e35] text-[#778B96] text-[10px] font-black">
                          Active Now
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Matches Found / Fallback to Broadcast */}
            {matchedGames.length === 0 && matchedPlayers.length === 0 && (
              <div className="p-6 rounded-3xl bg-[#F4F4F5] dark:bg-[#283941] border-2 border-[#E4E4E7] dark:border-[#1C2A30] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FFC800]/20 text-[#FFC800] flex items-center justify-center text-3xl mx-auto border border-[#FFC800]/40 animate-bounce">
                  ⚡
                </div>
                <div>
                  <h4 className="font-black text-base text-[#131F24] dark:text-white">
                    No immediate match in {selectedDistrict} right now!
                  </h4>
                  <p className="text-xs font-bold text-[#778B96] dark:text-[#A5B2BA] mt-1 max-w-sm mx-auto">
                    Be the matchmaker! Broadcast an instant &quot;Play Now&quot; alert so matching players nearby get notified immediately.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenPlayNowModal?.();
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-xs uppercase tracking-wider border-2 border-b-[5px] border-[#388000] shadow-md active:translate-y-[2px] active:border-b-[2px] transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-current text-[#FFC800]" />
                  <span>BROADCAST PLAY NOW ALERT</span>
                </button>
              </div>
            )}

            {/* Try Different Search Button */}
            <button
              onClick={() => setIsScanning(false)}
              className="w-full py-3 rounded-2xl bg-[#E5E5E5] dark:bg-[#283941] hover:opacity-80 text-[#131F24] dark:text-white font-black text-xs uppercase tracking-wider transition-all"
            >
              Change Sport or District
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
