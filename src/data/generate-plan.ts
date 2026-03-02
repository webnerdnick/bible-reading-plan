import { BOOK_MAP, type BibleBook } from "./bible-metadata";

const TOTAL_READINGS = 300; // 25 days × 12 months

interface VersePos {
  bookKey: string;
  chapter: number; // 1-indexed
  verse: number; // 1-indexed
}

function buildVerseList(bookKeys: string[]): VersePos[] {
  const positions: VersePos[] = [];
  for (const key of bookKeys) {
    const book = BOOK_MAP[key];
    for (let ch = 1; ch <= book.chapters; ch++) {
      const verseCount = book.verseCounts[ch - 1];
      for (let v = 1; v <= verseCount; v++) {
        positions.push({ bookKey: key, chapter: ch, verse: v });
      }
    }
  }
  return positions;
}

function formatRef(book: BibleBook, startCh: number, startV: number, endCh: number, endV: number): string {
  const startFull = startV === 1;
  const endFull = endV === book.verseCounts[endCh - 1];

  if (startCh === endCh) {
    if (startFull && endFull) return `${book.abbrev} ${startCh}`;
    if (startFull) return `${book.abbrev} ${startCh}:1-${endV}`;
    return `${book.abbrev} ${startCh}:${startV}-${endV}`;
  }
  // Multi-chapter
  if (startFull && endFull) return `${book.abbrev} ${startCh}-${endCh}`;
  const s = startFull ? `${startCh}` : `${startCh}:${startV}`;
  const e = endFull ? `${endCh}` : `${endCh}:${endV}`;
  return `${book.abbrev} ${s}-${e}`;
}

export function generateTrackReadings(bookKeys: string[]): string[] {
  const allVerses = buildVerseList(bookKeys);
  const total = allVerses.length;
  const versesPerReading = total / TOTAL_READINGS;

  const readings: string[] = [];

  for (let i = 0; i < TOTAL_READINGS; i++) {
    const startIdx = Math.round(i * versesPerReading);
    const endIdx = Math.round((i + 1) * versesPerReading) - 1;

    const start = allVerses[Math.min(startIdx, total - 1)];
    const end = allVerses[Math.min(endIdx, total - 1)];

    if (start.bookKey === end.bookKey) {
      readings.push(formatRef(BOOK_MAP[start.bookKey], start.chapter, start.verse, end.chapter, end.verse));
    } else {
      // Spans two books - split at book boundary
      const startBook = BOOK_MAP[start.bookKey];
      const endBook = BOOK_MAP[end.bookKey];
      const ref1 = formatRef(startBook, start.chapter, start.verse, startBook.chapters, startBook.verseCounts[startBook.chapters - 1]);
      const ref2 = formatRef(endBook, 1, 1, end.chapter, end.verse);
      readings.push(`${ref1}; ${ref2}`);
    }
  }

  // Snap to chapter boundaries where reasonable
  return snapToChapterBoundaries(readings, bookKeys);
}

function snapToChapterBoundaries(readings: string[], bookKeys: string[]): string[] {
  // For simplicity in v1, just return the raw readings
  // The verse-based split already produces clean-ish boundaries
  return readings;
}
