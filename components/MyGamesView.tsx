"use client";

import React from "react";
import { Game, User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { Calendar, Clock, MapPin, MessageCircle, Navigation, Users, Trophy } from "lucide-react";

interface MyGamesViewProps {
  games: Game[];
  currentUser: User | null;
  onOpenChat: (game: Game) => void;
  onOpenHostModal: () => void;
}

export default function MyGamesView({
  games,
  currentUser,
  onOpenChat,
  onOpenHostModal,
}: MyGamesViewProps) {
  if (!currentUser) {
    return (
      <div className="glass-card p-12 text-center space-y-4 max-w-xl mx-auto my-8 fade-in">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center text-3xl mx-auto">
          🔐
        </div>
        <h3 className="text-xl font-bold text-[#171717] dark:text-white">
          Login Required for My Games
        </h3>
        <p className="text-sm text-[#71717A]">
          Please log in or create an account to view your scheduled matches, hosted games, and team chats.
        </p>
      </div>
    );
  }

  const myGames = games.filter(
    (g) => g.host.id === currentUser.id || g.players.some((p) => p.id === currentUser.id)
  );

  const openDirections = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    if (game.latitude && game.longitude && Math.abs(game.latitude - 10.0159) > 0.001) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${game.latitude},${game.longitude}`, "_blank");
    } else {
      const query = encodeURIComponent(`${game.venue}, ${game.district}, Kerala`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white">
            My Scheduled Matches ({myGames.length})
          </h2>
          <p className="text-sm text-[#71717A] mt-1">
            Keep track of upcoming games you&apos;re hosting or participating in.
          </p>
        </div>

        <button onClick={onOpenHostModal} className="primary-btn !py-2.5 !px-5 text-sm w-full sm:w-auto text-center">
          + Host Game
        </button>
      </div>

      {myGames.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F4F4F5] dark:bg-[#1F1F1F] flex items-center justify-center text-3xl mx-auto">
            🏸
          </div>
          <h4 className="text-lg font-bold text-[#171717] dark:text-white">
            No Active Games Yet
          </h4>
          <p className="text-sm text-[#71717A]">
            You haven&apos;t joined or hosted any upcoming matches. Discover nearby games or create your own!
          </p>
          <button onClick={onOpenHostModal} className="primary-btn mt-2 !py-2.5 !px-6 text-sm">
            Host Your First Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myGames.map((game) => {
            const isHost = game.host.id === currentUser.id;
            return (
              <div
                key={game.id}
                onClick={() => onOpenChat(game)}
                className="game-card p-6 space-y-4 flex flex-col justify-between hover:border-[#58CC02] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#58CC02]/15 text-[#58CC02] border-2 border-b-2 border-[#58CC02]/30 flex items-center gap-1.5 uppercase">
                      <span className="text-sm">{getSportEmoji(game.sport)}</span>
                      <span>{game.sport}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-b-2 uppercase tracking-wide flex items-center gap-1 ${
                      isHost ? "bg-[#FFC800]/20 text-[#FFC800] border-[#FFC800]/40 shadow-sm" : "bg-[#1CB0F6]/15 text-[#1CB0F6] border-[#1CB0F6]/30"
                    }`}>
                      {isHost ? (
                        <>
                          <Trophy className="w-3.5 h-3.5 text-[#FFC800]" />
                          <span>👑 YOU HOST</span>
                        </>
                      ) : (
                        <span>✅ JOINED SQUAD</span>
                      )}
                    </span>
                  </div>

                  <h3 className="font-black text-xl text-[#131F24] dark:text-white group-hover:text-[#58CC02] transition-colors tracking-tight">
                    {game.venue}
                  </h3>
                  <p className="text-xs text-[#778B96] dark:text-[#A5B2BA] mt-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4B4B]" />
                    <span>{game.district}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t-2 border-[#E5E5E5] dark:border-[#283941] text-xs font-extrabold text-[#131F24] dark:text-white uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#58CC02]" />
                      <span>{game.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#58CC02]" />
                      <span>{game.time} ({game.duration}M)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChat(game);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-2 border-b-[4px] border-[#388000] active:translate-y-[2px] active:border-b-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>OPEN TEAM CHAT</span>
                  </button>
                  <button
                    onClick={(e) => openDirections(e, game)}
                    title="Get Directions"
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-[#1f2e35] hover:bg-gray-50 dark:hover:bg-[#283941] text-[#131F24] dark:text-white border-2 border-b-[4px] border-[#E5E5E5] dark:border-[#37464F] active:translate-y-[2px] active:border-b-2 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-[#1CB0F6]" />
                    <span>ROUTE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
