import { useEffect, useRef } from "react";
import { useBandState } from "@/context/BandContext";
import { useGigContext } from "@/context/GigContext";
import type { Song } from "@/context/BandContext";

/** Records songs displayed for >30s to the active gig's history. */
export function GigHistoryTracker() {
  const { state } = useBandState();
  const { recordSongPlayed, activeGigId } = useGigContext();
  const prevSongRef = useRef<Song | null>(null);
  const prevStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const { currentSong, currentSongStartTime } = state;

    if (currentSong) {
      const prevSong = prevSongRef.current;
      const prevStart = prevStartTimeRef.current;

      if (prevSong && prevSong.id !== currentSong.id && prevStart != null && activeGigId) {
        const duration = Date.now() - prevStart;
        if (duration >= 30_000) {
          recordSongPlayed(prevSong, duration);
        }
      }

      prevSongRef.current = currentSong;
      prevStartTimeRef.current = currentSongStartTime ?? Date.now();
    } else {
      if (prevSongRef.current && prevStartTimeRef.current != null && activeGigId) {
        const duration = Date.now() - prevStartTimeRef.current;
        if (duration >= 30_000) {
          recordSongPlayed(prevSongRef.current, duration);
        }
      }
      prevSongRef.current = null;
      prevStartTimeRef.current = null;
    }
  }, [state.currentSong?.id, state.currentSongStartTime, activeGigId, recordSongPlayed]);

  return null;
}
