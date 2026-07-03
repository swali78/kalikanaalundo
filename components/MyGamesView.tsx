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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717] dark:text-white">
            My Scheduled Matches ({myGames.length})
          </h2>
          <p className="text-sm text-[#71717A] mt-1">
            Keep track of upcoming games you&apos;re hosting or participating in.
          </p>
        </div>

        <button onClick={onOpenHostModal} className="primary-btn !py-2.5 !px-5 text-sm">
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
                className="game-card p-5 space-y-4 flex flex-col justify-between hover:border-[#22C55E]/50 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1.5">
                      <span>{getSportEmoji(game.sport)}</span>
                      <span>{game.sport}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isHost ? "bg-[#3B82F6]/15 text-[#3B82F6]" : "bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#71717A]"
                    }`}>
                      {isHost ? "👑 You Host" : "✅ Joined"}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#171717] dark:text-white group-hover:text-[#22C55E] transition-colors">
                    {game.venue}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#71717A]" />
                    <span>{game.district}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E4E4E7]/60 dark:border-[#262626] text-xs font-semibold text-[#171717] dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{game.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{game.time} ({game.duration}m)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChat(game);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#22C55E]/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open Team Chat</span>
                  </button>
                  <button
                    onClick={(e) => openDirections(e, game)}
                    title="Get Directions"
                    className="p-2.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] hover:bg-[#E4E4E7] text-[#171717] dark:text-white transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-[#3B82F6]" />
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
