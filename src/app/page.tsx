"use client";

import { useState, useMemo } from "react";
import PlanConfigurator from "@/components/PlanConfigurator";
import ReadingPlanGrid from "@/components/ReadingPlanGrid";
import { generatePlan } from "@/lib/plan-engine";
import type { PlanConfig, TrackId } from "@/lib/types";

const DEFAULT_CONFIG: PlanConfig = {
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  pace: "1year",
  tracks: ["gospels", "epistles", "wisdom", "ot"] as TrackId[],
};

export default function Home() {
  const [config, setConfig] = useState<PlanConfig>(DEFAULT_CONFIG);

  const plan = useMemo(() => generatePlan(config), [config]);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Screen layout */}
      <div className="no-print py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bible Reading Plan Generator
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Create a personalized Bible reading plan. Customize your start
              date, pace, and reading tracks, then print or save as PDF. This was created by <a href='https://www.hopebaptistclearfield.org/' target='_blank' rel='noopener noreferrer'>Hope Baptist Church of Clearfield, Pennsylvania</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 print:max-w-none print:px-0 print:pb-0">
        <div className="flex flex-col lg:flex-row gap-6 print:block">
          {/* Sidebar - Config */}
          <div className="no-print lg:w-72 lg:shrink-0 lg:sticky lg:top-4 lg:self-start">
            <PlanConfigurator config={config} onChange={setConfig} />
          </div>

          {/* Main content - Plan grid */}
          <div className="flex-1 min-w-0">
            <ReadingPlanGrid plan={plan} />
          </div>
        </div>
      </div>
    </div>
  );
}
