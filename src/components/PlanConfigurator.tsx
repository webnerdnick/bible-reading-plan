"use client";

import { TRACKS } from "@/data/reading-plan";
import type { PlanConfig, TrackId } from "@/lib/types";
import PrintButton from "./PrintButton";

interface PlanConfiguratorProps {
  config: PlanConfig;
  onChange: (config: PlanConfig) => void;
}

export default function PlanConfigurator({
  config,
  onChange,
}: PlanConfiguratorProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + "T00:00:00");
    if (!isNaN(date.getTime())) {
      onChange({ ...config, startDate: date });
    }
  };

  const handlePaceChange = (pace: "1year" | "2year") => {
    onChange({ ...config, pace });
  };

  const handleTrackToggle = (trackId: TrackId) => {
    const current = config.tracks;
    if (current.includes(trackId)) {
      // Don't allow removing the last track
      if (current.length <= 1) return;
      onChange({ ...config, tracks: current.filter((t) => t !== trackId) });
    } else {
      onChange({ ...config, tracks: [...current, trackId] });
    }
  };

  const formatDateValue = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="no-print bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Customize Your Plan
        </h2>
      </div>

      {/* Start Date */}
      <div>
        <label
          htmlFor="start-date"
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={formatDateValue(config.startDate)}
          onChange={handleStartDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Pace */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Reading Pace
        </label>
        <div className="flex gap-2">
          {(["1year", "2year"] as const).map((pace) => (
            <button
              key={pace}
              onClick={() => handlePaceChange(pace)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                config.pace === pace
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {pace === "1year" ? "1 Year" : "2 Years"}
            </button>
          ))}
        </div>
      </div>

      {/* Track Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Reading Tracks
        </label>
        <div className="space-y-2">
          {TRACKS.map((track) => {
            const isSelected = config.tracks.includes(track.id);
            return (
              <button
                key={track.id}
                onClick={() => handleTrackToggle(track.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? `${track.bgColor} ${track.color} border-2 ${track.borderColor}`
                    : "bg-gray-50 text-gray-400 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                    isSelected
                      ? `${track.borderColor}`
                      : "border-gray-300"
                  }`}
                  style={isSelected ? { backgroundColor: track.printColor } : {}}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <div>
                  <div>{track.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Print Button */}
      <div className="pt-2">
        <PrintButton />
      </div>
    </div>
  );
}
