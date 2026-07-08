"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { User } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { Navigation } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createPlayerIcon = (emoji: string) => {
  return L.divIcon({
    className: "custom-player-icon",
    html: `<div class="bg-[#58CC02] text-white w-8 h-8 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const currentUserIcon = L.divIcon({
  className: "current-user-icon",
  html: `<div class="bg-[#3B82F6] text-white w-10 h-10 rounded-full shadow-xl border-3 border-white flex items-center justify-center text-base">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

interface PlayersMapProps {
  players: User[];
  currentUser: User | null;
  userLat?: number;
  userLng?: number;
}

function RecenterMap({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function PlayersMap({ players, currentUser, userLat, userLng }: PlayersMapProps) {
  const centerLat = userLat || 10.0159;
  const centerLng = userLng || 76.3419;

  const openDirections = (lat: number, lng: number, name?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else if (name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`, "_blank");
    }
  };

  return (
    <div className="w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-card border border-[#E4E4E7] dark:border-[#262626] relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={userLat} lng={userLng} />

        {/* Current User Marker */}
        {currentUser?.latitude && currentUser?.longitude && (
          <Marker position={[currentUser.latitude, currentUser.longitude]} icon={currentUserIcon}>
            <Popup>
              <div className="p-1 text-center">
                <span className="text-xs font-bold text-[#3B82F6] block">You</span>
                <p className="text-xs text-[#71717A]">{currentUser.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Player Markers */}
        {players.map((player) => {
          if (!player.latitude || !player.longitude) return null;
          const mainSport = (player.sports || [])[0];
          const emoji = mainSport ? getSportEmoji(mainSport) : "👤";
          return (
            <Marker key={player.id} position={[player.latitude, player.longitude]} icon={createPlayerIcon(emoji)}>
              <Popup>
                <div className="p-1.5 space-y-1.5 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-xl object-cover border border-[#58CC02]" />
                    <div>
                      <p className="text-sm font-bold text-[#171717]">{player.name}</p>
                      <p className="text-[10px] text-[#71717A]">
                        {[player.district || player.city, player.age ? `${player.age} yrs` : null].filter(Boolean).join(" • ") || "Profile incomplete"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(player.sports || []).slice(0, 3).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-[#E5E5E5] text-[10px] font-bold">{getSportEmoji(s)} {s}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => openDirections(player.latitude!, player.longitude!, player.name)}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#1CB0F6] text-white text-xs font-bold hover:bg-[#1899D6] transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Route</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
