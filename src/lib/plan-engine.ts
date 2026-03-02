import type { PlanConfig, GeneratedPlan, MonthPlan, DayReading, TrackId } from "./types";
import { getTrackReadings } from "@/data/reading-plan";

const DAYS_PER_MONTH = 25;
const MONTHS_PER_YEAR = 12;

function getMonthLabel(startDate: Date, monthOffset: number): string {
  const date = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function generatePlan(config: PlanConfig): GeneratedPlan {
  const { startDate, pace, tracks } = config;
  const totalMonths = pace === "1year" ? MONTHS_PER_YEAR : MONTHS_PER_YEAR * 2;

  // Get base readings for each selected track (300 entries each)
  const trackReadings: Partial<Record<TrackId, string[]>> = {};
  for (const trackId of tracks) {
    trackReadings[trackId] = getTrackReadings(trackId);
  }

  const months: MonthPlan[] = [];

  for (let m = 0; m < totalMonths; m++) {
    const label = getMonthLabel(startDate, m);
    const readings: DayReading[] = [];

    for (let d = 0; d < DAYS_PER_MONTH; d++) {
      const dayTracks: Partial<Record<TrackId, string>> = {};

      for (const trackId of tracks) {
        const allReadings = trackReadings[trackId]!;

        if (pace === "1year") {
          // 300 readings across 12 months × 25 days
          const idx = m * DAYS_PER_MONTH + d;
          if (idx < allReadings.length) {
            dayTracks[trackId] = allReadings[idx];
          }
        } else {
          // 2-year: 300 readings spread across 24 months × 25 days = 600 slots
          // Each reading appears every other day effectively
          // Simpler: 300 readings / 24 months = 12.5 readings per month
          const readingsPerMonth = allReadings.length / totalMonths;
          const idx = Math.floor(m * readingsPerMonth + d * (readingsPerMonth / DAYS_PER_MONTH));
          if (idx < allReadings.length && d < Math.ceil(readingsPerMonth)) {
            dayTracks[trackId] = allReadings[idx];
          }
        }
      }

      readings.push({
        dayOfMonth: d + 1,
        tracks: dayTracks,
      });
    }

    months.push({
      monthIndex: m,
      label,
      readings,
    });
  }

  return { config, months };
}
