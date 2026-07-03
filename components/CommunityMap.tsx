"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Community } from "@/lib/types";
import { Navigation, Users } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const communityIcon = (name: string) => {
  return L.divIcon({
    className: "community-icon",
    html: `<div class="bg-[#1CB0F6] text-white w-10 h-10 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-lg hover:scale-110 transition-transform">🛡️</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

interface CommunityMapProps {
  communities: Community[];
  onSelectCommunity?: (comm: Community) => void;
  onOpenDirections: (e: React.MouseEvent, comm: Community) => void;
}

function RecenterMap({ communities }: { communities: Community[] }) {
  const map = useMap();
  useEffect(() => {
    if (communities.length > 0) {
      const valid = communities.filter(c => c.latitude && c.longitude);
      if (valid.length > 0) {
        const avgLat = valid.reduce((s, c) => s + (c.latitude || 0), 0) / valid.length;
        const avgLng = valid.reduce((s, c) => s + (c.longitude || 0), 0) / valid.length;
        map.setView([avgLat, avgLng], 11, { animate: true });
      }
    }
  }, [communities, map]);
  return null;
}

export default function CommunityMap({ communities, onSelectCommunity, onOpenDirections }: CommunityMapProps) {
  return (
    <div className="w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden shadow-card border border-[#E4E4E7] dark:border-[#262626] relative z-10">
      <MapContainer
        center={[10.0159, 76.3419]}
        zoom={10}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap communities={communities} />

        {communities.map((comm) => {
          if (!comm.latitude || !comm.longitude) return null;
          return (
            <Marker key={comm.id} position={[comm.latitude, comm.longitude]} icon={communityIcon(comm.name)}>
              <Popup>
                <div className="p-1.5 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <p className="text-sm font-bold text-[#171717]">{comm.name}</p>
                      <p className="text-[10px] text-[#71717A]">{comm.district} • {comm.memberCount} members</p>
                    </div>
                  </div>
                  {comm.description && (
                    <p className="text-xs text-[#71717A] line-clamp-2">{comm.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onSelectCommunity?.(comm)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#1CB0F6] text-white text-xs font-bold hover:bg-[#1899D6] transition-colors"
                    >
                      View Hub
                    </button>
                    <button
                      onClick={(e) => onOpenDirections(e, comm)}
                      className="py-1.5 px-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-xs font-semibold flex items-center gap-1 transition-colors"
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
