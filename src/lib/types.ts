export type TrackId = "gospels" | "epistles" | "wisdom" | "ot";

export interface Track {
  id: TrackId;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  printColor: string;
  books: string[];
}

export interface MonthPlan {
  monthIndex: number;
  label: string;
  readings: DayReading[];
}

export interface DayReading {
  dayOfMonth: number;
  tracks: Partial<Record<TrackId, string>>;
}

export interface PlanConfig {
  startDate: Date;
  pace: "1year" | "2year";
  tracks: TrackId[];
}

export interface GeneratedPlan {
  config: PlanConfig;
  months: MonthPlan[];
}
