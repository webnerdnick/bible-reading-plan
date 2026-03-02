"use client";

import { TRACK_MAP } from "@/data/reading-plan";
import type { MonthPlan, TrackId } from "@/lib/types";

interface MonthCardProps {
  month: MonthPlan;
  tracks: TrackId[];
}

const TRACK_HEADER_COLORS: Record<TrackId, string> = {
  gospels: "bg-blue-600 text-white",
  epistles: "bg-emerald-600 text-white",
  wisdom: "bg-amber-500 text-white",
  ot: "bg-rose-600 text-white",
};

const TRACK_CELL_COLORS: Record<TrackId, string> = {
  gospels: "border-l-blue-400",
  epistles: "border-l-emerald-400",
  wisdom: "border-l-amber-400",
  ot: "border-l-rose-400",
};

export default function MonthCard({ month, tracks }: MonthCardProps) {
  return (
    <div className="month-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:rounded-none print:border-gray-300">
      {/* Month header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 print:px-2 print:py-0.5">
        <h3 className="text-lg font-bold text-white tracking-wide print:text-[9pt]">
          {month.label}
        </h3>
      </div>

      {/* Reading table */}
      <table className="w-full reading-table">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="w-8 px-1.5 py-1.5 text-center text-xs font-semibold text-gray-500 uppercase print:py-1 print:text-[8pt]">
              Day
            </th>
            <th className="w-6 px-1 py-1.5 print:py-1" />
            {tracks.map((id) => (
              <th
                key={id}
                className={`px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wider print:py-1 print:text-[7pt] ${TRACK_HEADER_COLORS[id]}`}
              >
                {TRACK_MAP[id].shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.readings.map((day) => {
            const hasAnyReading = tracks.some((id) => day.tracks[id]);
            if (!hasAnyReading) return null;

            return (
              <tr
                key={day.dayOfMonth}
                className={`border-b border-gray-100 ${
                  day.dayOfMonth % 2 === 0 ? "bg-gray-50/50" : ""
                } hover:bg-gray-50 print:hover:bg-transparent`}
              >
                <td className="px-1.5 py-1 text-center text-sm font-medium text-gray-400 print:text-[8pt] print:py-0.5">
                  {day.dayOfMonth}
                </td>
                <td className="px-1 py-1 text-center print:py-0.5">
                  <span className="reading-checkbox inline-block w-3.5 h-3.5 border-[1.5px] border-gray-400 rounded-sm print:w-[10px] print:h-[10px]" />
                </td>
                {tracks.map((id) => (
                  <td
                    key={id}
                    className={`px-2 py-1 text-sm text-gray-700 border-l-[3px] ${TRACK_CELL_COLORS[id]} print:text-[8pt] print:py-0.5 print:px-1.5`}
                  >
                    {day.tracks[id] || ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
