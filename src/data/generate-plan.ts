import { BOOK_MAP, type BibleBook } from "./bible-metadata";
import { PARAGRAPH_BREAKS } from "./paragraph-breaks";

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

// Get all paragraph start verses for a given book and chapter.
// Always includes verse 1 and the verse after the last verse (for end-of-chapter boundary).
function getParagraphStarts(bookKey: string, chapter: number): number[] {
  const breaks = PARAGRAPH_BREAKS[bookKey]?.[chapter] ?? [];
  return [1, ...breaks];
}

// Find the nearest paragraph boundary at or before the given verse in a chapter.
// Returns the verse number that starts the paragraph containing `verse`.
function snapToParagraphStart(bookKey: string, chapter: number, verse: number): number {
  const starts = getParagraphStarts(bookKey, chapter);
  let best = 1;
  for (const s of starts) {
    if (s <= verse) best = s;
    else break;
  }
  return best;
}

// Find the nearest paragraph END at or after the given verse.
// A paragraph ends at the verse just before the next paragraph starts, or at end of chapter.
function snapToParagraphEnd(bookKey: string, chapter: number, verse: number): number {
  const book = BOOK_MAP[bookKey];
  const chapterVerseCount = book.verseCounts[chapter - 1];
  const starts = getParagraphStarts(bookKey, chapter);

  for (let i = 0; i < starts.length; i++) {
    const nextStart = i + 1 < starts.length ? starts[i + 1] : chapterVerseCount + 1;
    if (verse < nextStart) {
      return nextStart - 1; // end of this paragraph
    }
  }
  return chapterVerseCount;
}

// Given a raw split index into the verse list, find the best paragraph-aligned
// split point. Returns the adjusted index (the LAST verse of the reading).
function findBestSplitPoint(
  allVerses: VersePos[],
  rawEndIdx: number,
  minIdx: number,
): number {
  if (rawEndIdx >= allVerses.length - 1) return allVerses.length - 1;

  const endVerse = allVerses[rawEndIdx];
  const book = BOOK_MAP[endVerse.bookKey];
  const chapterEnd = book.verseCounts[endVerse.chapter - 1];

  // Option 1: snap forward to end of current paragraph
  const paraEnd = snapToParagraphEnd(endVerse.bookKey, endVerse.chapter, endVerse.verse);

  // Option 2: snap backward to end of previous paragraph (verse before current paragraph start)
  const currentParaStart = snapToParagraphStart(endVerse.bookKey, endVerse.chapter, endVerse.verse);
  const paraBackEnd = currentParaStart > 1 ? currentParaStart - 1 : null;

  // Option 3: snap to end of chapter
  // Option 4: snap to end of previous chapter

  // Calculate candidate indices
  const candidates: number[] = [];

  // Forward snap: end of current paragraph
  if (paraEnd === chapterEnd) {
    // Snapping to chapter end
    const idx = findVerseIndex(allVerses, endVerse.bookKey, endVerse.chapter, chapterEnd, rawEndIdx);
    if (idx !== null && idx >= minIdx) candidates.push(idx);
  } else {
    const idx = findVerseIndex(allVerses, endVerse.bookKey, endVerse.chapter, paraEnd, rawEndIdx);
    if (idx !== null && idx >= minIdx) candidates.push(idx);
  }

  // Backward snap: end of previous paragraph
  if (paraBackEnd !== null) {
    const idx = findVerseIndex(allVerses, endVerse.bookKey, endVerse.chapter, paraBackEnd, rawEndIdx);
    if (idx !== null && idx >= minIdx) candidates.push(idx);
  }

  // Also consider snapping to end of previous chapter if we're near the start of a chapter
  if (endVerse.verse <= 3 && rawEndIdx > 0) {
    // Find the last verse of the previous chapter
    const prevIdx = rawEndIdx - endVerse.verse; // roughly
    if (prevIdx >= minIdx && prevIdx < allVerses.length) {
      const prev = allVerses[prevIdx];
      if (prev.verse === BOOK_MAP[prev.bookKey].verseCounts[prev.chapter - 1]) {
        candidates.push(prevIdx);
      }
    }
  }

  if (candidates.length === 0) return rawEndIdx;

  // Pick the candidate closest to the raw split point
  let bestIdx = rawEndIdx;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = Math.abs(c - rawEndIdx);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = c;
    }
  }

  return bestIdx;
}

function findVerseIndex(
  allVerses: VersePos[],
  bookKey: string,
  chapter: number,
  verse: number,
  nearIdx: number,
): number | null {
  // Search near the hint index for efficiency
  const searchRadius = 100;
  const start = Math.max(0, nearIdx - searchRadius);
  const end = Math.min(allVerses.length, nearIdx + searchRadius);

  for (let i = start; i < end; i++) {
    const v = allVerses[i];
    if (v.bookKey === bookKey && v.chapter === chapter && v.verse === verse) {
      return i;
    }
  }
  return null;
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
  let currentStartIdx = 0;

  for (let i = 0; i < TOTAL_READINGS; i++) {
    const isLastReading = i === TOTAL_READINGS - 1;

    let endIdx: number;
    if (isLastReading) {
      endIdx = total - 1;
    } else {
      const rawEndIdx = Math.round((i + 1) * versesPerReading) - 1;
      endIdx = findBestSplitPoint(allVerses, Math.min(rawEndIdx, total - 1), currentStartIdx);
    }

    const start = allVerses[currentStartIdx];
    const end = allVerses[endIdx];

    if (start.bookKey === end.bookKey) {
      readings.push(formatRef(BOOK_MAP[start.bookKey], start.chapter, start.verse, end.chapter, end.verse));
    } else {
      // Spans two books - format as two references
      const startBook = BOOK_MAP[start.bookKey];
      const endBook = BOOK_MAP[end.bookKey];
      const ref1 = formatRef(startBook, start.chapter, start.verse, startBook.chapters, startBook.verseCounts[startBook.chapters - 1]);
      const ref2 = formatRef(endBook, 1, 1, end.chapter, end.verse);
      readings.push(`${ref1}; ${ref2}`);
    }

    currentStartIdx = endIdx + 1;
  }

  return readings;
}
