"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Game, Community } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { Navigation, Users, Trophy, ExternalLink, MapPin } from "lucide-react";
import { calculateHaversineDistance } from "@/lib/supabase/api";

// Fix standard Leaflet icons in webpack / Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom HTML icons for vibrant CIRCLE design
const createCustomIcon = (emoji: string, colorClass: string = "bg-[#22C55E]") => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="${colorClass} text-white w-9 h-9 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-base font-bold transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const userIcon = L.divIcon({
  className: "user-leaflet-icon",
  html: `<div class="bg-[#3B82F6] text-white w-10 h-10 rounded-full shadow-xl border-3 border-white flex items-center justify-center text-lg animate-bounce">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

interface MapInnerProps {
  games: Game[];
  communities?: Community[];
  userLat?: number;
  userLng?: number;
  onSelectGame?: (game: Game) => void;
  onSelectCommunity?: (comm: Community) => void;
}

// Helper to recenter map when coordinates change
function RecenterMap({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapInner({
  games,
  communities = [],
  userLat,
  userLng,
  onSelectGame,
  onSelectCommunity,
}: MapInnerProps) {
  // Default center: Kochi/Ernakulam or user coordinates
  const centerLat = userLat || 10.0159;
  const centerLng = userLng || 76.3419;

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="w-full h-[500px] sm:h-[600px] rounded-3xl overflow-hidden shadow-card border border-[#E4E4E7] dark:border-[#262626] relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap lat={userLat} lng={userLng} />

        {/* User Location Marker */}
        {userLat !== undefined && userLng !== undefined && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="p-1 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3B82F6] block">
                  Your Location
                </span>
                <p className="text-sm font-semibold text-[#171717] mt-0.5">
                  GPS Active & Approximate
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Game Markers */}
        {games.map((game) => {
          // Fallback coordinate generation around district center if game has no explicit lat/lng
          let lat = game.latitude;
          let lng = game.longitude;
          if (!lat || !lng) {
            // Pseudo-random deterministic offset based on game ID length/hash so markers don't overlap
            const hash = game.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const offsetLat = ((hash % 20) - 10) * 0.005;
            const offsetLng = (((hash * 3) % 20) - 10) * 0.005;
            lat = 10.0159 + offsetLat;
            lng = 76.3419 + offsetLng;
          }

          const dist = calculateHaversineDistance(userLat, userLng, lat, lng);
          const icon = createCustomIcon(getSportEmoji(game.sport), "bg-[#22C55E]");

          return (
            <Marker key={`game-${game.id}`} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup min-w-[240px]">
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#16A34A]">
                      {getSportEmoji(game.sport)} {game.sport}
                    </span>
                    {dist !== undefined && (
                      <span className="text-xs font-bold text-[#71717A]">
                        📍 {dist} km away
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#171717] leading-tight">
                      {game.venue}
                    </h4>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {game.date} at {game.time} ({game.skillLevel})
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 border-t border-[#E4E4E7]">
                    <button
                      onClick={() => onSelectGame?.(game)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#22C55E] text-white text-xs font-bold hover:bg-[#16A34A] transition-colors"
                    >
                      Join Game
                    </button>
                    <button
                      onClick={() => openDirections(lat!, lng!)}
                      title="Get Directions in Google Maps"
                      className="py-1.5 px-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#171717] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Route</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Community Markers */}
        {communities.map((comm) => {
          let lat = comm.latitude;
          let lng = comm.longitude;
          if (!lat || !lng) {
            const hash = comm.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            lat = 10.0159 + ((hash % 15) - 7) * 0.006;
            lng = 76.3419 + (((hash * 7) % 15) - 7) * 0.006;
          }

          const dist = calculateHaversineDistance(userLat, userLng, lat, lng);
          const icon = createCustomIcon("🛡️", "bg-[#3B82F6]");

          return (
            <Marker key={`comm-${comm.id}`} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup min-w-[240px]">
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#3B82F6]/15 text-[#3B82F6]">
                      Community Hub
                    </span>
                    {dist !== undefined && (
                      <span className="text-xs font-bold text-[#71717A]">
                        📍 {dist} km away
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#171717] leading-tight">
                      {comm.name}
                    </h4>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {comm.district} • {comm.memberCount} members
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 border-t border-[#E4E4E7]">
                    <button
                      onClick={() => onSelectCommunity?.(comm)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-colors"
                    >
                      View Hub
                    </button>
                    <button
                      onClick={() => openDirections(lat!, lng!)}
                      title="Get Directions in Google Maps"
                      className="py-1.5 px-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#171717] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Route</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
