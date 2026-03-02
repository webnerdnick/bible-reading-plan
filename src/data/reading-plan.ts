import type { Track, TrackId } from "@/lib/types";
import { generateTrackReadings } from "./generate-plan";

export const TRACKS: Track[] = [
  {
    id: "gospels",
    name: "Gospels & Acts",
    shortName: "Gospels",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    printColor: "#2563eb",
    books: ["matthew", "mark", "luke", "john", "acts"],
  },
  {
    id: "epistles",
    name: "Epistles & Revelation",
    shortName: "Epistles",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    printColor: "#059669",
    books: ["romans", "1corinthians", "2corinthians", "galatians", "ephesians", "philippians", "colossians", "1thessalonians", "2thessalonians", "1timothy", "2timothy", "titus", "philemon", "hebrews", "james", "1peter", "2peter", "1john", "2john", "3john", "jude", "revelation"],
  },
  {
    id: "wisdom",
    name: "Wisdom Literature",
    shortName: "Wisdom",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    printColor: "#d97706",
    books: ["job", "psalms", "proverbs", "ecclesiastes", "songofsolomon"],
  },
  {
    id: "ot",
    name: "Old Testament History & Prophets",
    shortName: "OT",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-400",
    printColor: "#e11d48",
    books: [
      "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
      "joshua", "judges", "ruth", "1samuel", "2samuel",
      "1kings", "2kings", "1chronicles", "2chronicles",
      "ezra", "nehemiah", "esther",
      "isaiah", "jeremiah", "lamentations",
      "ezekiel", "daniel",
      "hosea", "joel", "amos", "obadiah", "jonah",
      "micah", "nahum", "habakkuk", "zephaniah", "haggai",
      "zechariah", "malachi",
    ],
  },
];

export const TRACK_MAP: Record<TrackId, Track> = Object.fromEntries(
  TRACKS.map((t) => [t.id, t])
) as Record<TrackId, Track>;

// Pre-generate all track readings (300 per track)
// These are computed once at module load time
const _cache: Partial<Record<TrackId, string[]>> = {};

export function getTrackReadings(trackId: TrackId): string[] {
  if (!_cache[trackId]) {
    const track = TRACK_MAP[trackId];
    _cache[trackId] = generateTrackReadings(track.books);
  }
  return _cache[trackId]!;
}
