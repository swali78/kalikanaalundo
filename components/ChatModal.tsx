"use client";

import React, { useState, useEffect, useRef } from "react";
import { Game, User, Message } from "@/lib/types";
import { fetchMessages, sendMessage } from "@/lib/supabase/api";
import { X, Send, ShieldAlert, Sparkles, MessageSquare, CheckCircle2 } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/InstagramIcon";

interface ChatModalProps {
  game: Game | null;
  currentUser: User | null;
  onClose: () => void;
}

export default function ChatModal({ game, currentUser, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!game) return;

    // Load messages or generate automatic welcome message if empty
    let isMounted = true;
    setLoading(true);

    fetchMessages(game.id)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Automatic welcome message logically injected for new players
          const autoWelcome: Message = {
            id: "auto-welcome-1",
            gameId: game.id,
            user: {
              id: "system-bot",
              name: "CIRCLE Welcome Bot 🤖",
              age: 1,
              city: game.district,
              district: game.district,
              avatar: "https://ui-avatars.com/api/?name=CIRCLE+Bot&background=22C55E&color=fff",
              sports: [],
              skillLevel: "Beginner",
              availability: [],
              rating: 5,
              gamesPlayed: 999,
              verified: true,
            },
            text: `🎉 Welcome to ${game.venue} chat! Please introduce yourself, confirm your equipment, and respect all players. Let's play! 🏸⚽`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages([autoWelcome]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [game]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!game) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const newMsgText = input.trim();
    setInput("");

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      gameId: game.id,
      user: currentUser,
      text: newMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, tempMsg]);

    const saved = await sendMessage(game.id, newMsgText);
    if (saved) {
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? saved : m)));
    }
  };

  const openInstagram = (handle?: string) => {
    if (!handle) return;
    const clean = handle.replace(/^@/, "");
    window.open(`https://instagram.com/${clean}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-modal w-full max-w-2xl h-[85vh] flex flex-col bg-white dark:bg-[#121212] relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4E4E7] dark:border-[#262626] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#18181B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E] font-bold text-lg shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#171717] dark:text-white flex items-center gap-2">
                <span>{game.venue}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]">
                  {game.sport}
                </span>
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5 font-medium">
                Hosted by {game.host.name} • {game.currentPlayers}/{game.maxPlayers} players
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E4E4E7] dark:hover:bg-[#262626] text-[#71717A] hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Players Quick-Access Bar (Instagram DMs) */}
        <div className="px-4 py-2.5 bg-[#F4F4F5] dark:bg-[#1F1F1F] border-b border-[#E4E4E7] dark:border-[#262626] flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider shrink-0">
            Players ({game.players.length + 1}):
          </span>

          {/* Host */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#121212] border border-[#E4E4E7] dark:border-[#262626] shrink-0 text-xs font-semibold">
            <span className="text-[#22C55E]">👑 {game.host.name}</span>
            {game.host.instagram && (
              <button
                onClick={() => openInstagram(game.host.instagram)}
                title={`DM @${game.host.instagram}`}
                className="text-pink-500 hover:scale-110 transition-transform"
              >
                <Instagram className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Participants */}
          {game.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#121212] border border-[#E4E4E7] dark:border-[#262626] shrink-0 text-xs font-medium text-[#171717] dark:text-white"
            >
              <span>{player.name}</span>
              {player.instagram && (
                <button
                  onClick={() => openInstagram(player.instagram)}
                  title={`DM @${player.instagram}`}
                  className="text-pink-500 hover:scale-110 transition-transform"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAFAFA]/50 dark:bg-[#0A0A0A]/50">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm font-semibold text-[#71717A] animate-pulse">
              Loading conversation...
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser && msg.user.id === currentUser.id;
              const isBot = msg.user.id === "system-bot";

              if (isBot) {
                return (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium flex items-start gap-2.5 my-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#16A34A] dark:text-[#22C55E] block mb-0.5">
                        {msg.user.name}
                      </span>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold text-[#171717] dark:text-white">
                      {msg.user.name}
                    </span>
                    {msg.user.instagram && (
                      <button
                        onClick={() => openInstagram(msg.user.instagram)}
                        className="text-[10px] text-pink-500 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <span>@{msg.user.instagram}</span>
                      </button>
                    )}
                    <span className="text-[10px] text-[#71717A]">{msg.timestamp}</span>
                  </div>

                  {/* High Contrast Message Bubbles */}
                  <div className={isMe ? "chat-bubble-me" : "chat-bubble-other"}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Message Input */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t border-[#E4E4E7] dark:border-[#262626] bg-white dark:bg-[#121212] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              currentUser
                ? `Message in ${game.venue} chat...`
                : "Please log in to participate in game chat"
            }
            disabled={!currentUser}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 !py-3 !px-4 !rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] font-medium text-sm focus:bg-white dark:focus:bg-[#121212] border-transparent focus:border-[#22C55E]"
          />

          <button
            type="submit"
            disabled={!currentUser || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#E4E4E7] dark:disabled:bg-[#262626] text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
