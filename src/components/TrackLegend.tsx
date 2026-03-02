"use client";

import { TRACK_MAP } from "@/data/reading-plan";
import type { TrackId } from "@/lib/types";

interface TrackLegendProps {
  tracks: TrackId[];
}

export default function TrackLegend({ tracks }: TrackLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {tracks.map((id) => {
        const track = TRACK_MAP[id];
        return (
          <div key={id} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-sm ${track.borderColor} border-2`}
              style={{ backgroundColor: track.printColor }}
            />
            <span className="text-sm font-medium text-gray-700">
              {track.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
