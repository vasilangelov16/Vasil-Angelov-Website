import { memo, useMemo } from "react";

const SECTION_LABEL_REGEX = /^\[.+\]$/;

export function formatLyricsWithHighlights(lyrics: string): React.ReactNode[] {
  return lyrics.split("\n").map((line, i) => {
    const isLabel = SECTION_LABEL_REGEX.test(line.trim());
    if (isLabel) {
      return (
        <span
          key={i}
          className="inline-block mt-4 mb-2 px-3 py-1 rounded-lg bg-amber-200/90 text-amber-950 font-bold text-xs sm:text-sm uppercase tracking-wider first:mt-0"
        >
          {line.trim()}
        </span>
      );
    }
    return (
      <span key={i} className="block">
        {line || "\u00A0"}
      </span>
    );
  });
}

/** Memoized lyrics content – avoids re-parsing on every render */
export const MemoizedLyricsContent = memo(({ lyrics, songId }: { lyrics: string; songId: string }) => {
  const content = useMemo(() => formatLyricsWithHighlights(lyrics), [lyrics, songId]);
  return <>{content}</>;
});
MemoizedLyricsContent.displayName = "MemoizedLyricsContent";
