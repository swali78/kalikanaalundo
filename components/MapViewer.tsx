"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Game, Community } from "@/lib/types";

// Dynamically import MapInner with SSR disabled to prevent Leaflet window errors
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] sm:h-[600px] rounded-3xl bg-[#F4F4F5] dark:bg-[#121212] border border-[#E4E4E7] dark:border-[#262626] flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-2xl animate-bounce">
        🗺️
      </div>
      <p className="text-sm font-semibold text-[#71717A]">
        Loading Interactive Map & Venue Locations...
      </p>
    </div>
  ),
});

interface MapViewerProps {
  games: Game[];
  communities?: Community[];
  userLat?: number;
  userLng?: number;
  onSelectGame?: (game: Game) => void;
  onSelectCommunity?: (comm: Community) => void;
}

export default function MapViewer(props: MapViewerProps) {
  return <MapInner {...props} />;
}
