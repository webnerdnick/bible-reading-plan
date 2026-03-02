"use client";

import type { GeneratedPlan } from "@/lib/types";
import MonthCard from "./MonthCard";
import TrackLegend from "./TrackLegend";

interface ReadingPlanGridProps {
  plan: GeneratedPlan;
}

export default function ReadingPlanGrid({ plan }: ReadingPlanGridProps) {
  const { config, months } = plan;
  const startLabel = months[0]?.label ?? "";
  const endLabel = months[months.length - 1]?.label ?? "";

  return (
    <div className="reading-plan-grid">
      {/* Print header - shown only in print */}
      <div className="hidden print:block mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bible Reading Plan
        </h1>
        <p className="text-sm text-gray-600 mb-3">
          {startLabel} &mdash; {endLabel} &bull;{" "}
          {config.pace === "1year" ? "One Year" : "Two Year"} Plan
        </p>
        <TrackLegend tracks={config.tracks} />
        <p className="text-xs text-gray-500 mt-2">
          25 readings per month &bull; Check off each reading as you complete it
        </p>
      </div>

      {/* Screen header */}
      <div className="print:hidden mb-6 text-center">
        <TrackLegend tracks={config.tracks} />
      </div>

      {/* Month grid */}
      <div className="space-y-6 print:space-y-0 print:grid print:grid-cols-2 print:gap-x-3 print:gap-y-2">
        {months.map((month) => (
          <MonthCard
            key={month.monthIndex}
            month={month}
            tracks={config.tracks}
          />
        ))}
      </div>
    </div>
  );
}
