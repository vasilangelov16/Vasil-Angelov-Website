import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ReactSwitch from "react-switch";
import { cn } from "@/lib/utils";
import {
  APPLE_SPRING,
  APPLE_TAP,
  APPLE_EASE,
  DEFAULT_METRONOME_BPM,
  METRONOME_PULSE_MS,
} from "@/band/constants";

export const VisualMetronome = memo(
  ({
    bpm,
    songId,
    enabled,
    onEnabledChange,
  }: {
    bpm: number;
    songId: string | null;
    enabled: boolean;
    onEnabledChange: (v: boolean) => void;
  }) => {
    const [beatCount, setBeatCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
      setBeatCount(0);
      if (!enabled) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      const clampedBpm = Math.max(40, Math.min(240, bpm));
      const intervalMs = 60000 / clampedBpm;
      intervalRef.current = setInterval(() => {
        setBeatCount((c) => c + 1);
      }, intervalMs);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [enabled, bpm, songId]);

    const clampedBpm = Math.max(40, Math.min(240, bpm));
    const beatInBar = beatCount % 4;
    const isDownbeat = beatInBar === 0;

    return (
      <div
        role="region"
        aria-label={`Metronome ${enabled ? "on" : "off"}, ${clampedBpm} BPM`}
        className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-out"
      >
        <div
          className={cn(
            "flex items-center gap-4 sm:gap-5 flex-1 min-w-0 transition-opacity duration-300",
            !enabled && "opacity-40"
          )}
        >
          <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            {enabled ? (
              <>
                {!reducedMotion && (
                  <motion.div
                    key={`ring-${beatCount}`}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0 rounded-full border-2 border-red-600 will-change-transform"
                  />
                )}
                <motion.div
                  key={beatCount}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{
                    scale: reducedMotion ? [1, 1, 1] : isDownbeat ? [1, 1.3, 1] : [1, 1.12, 1],
                    opacity: reducedMotion ? [1, 0.85, 1] : [1, 1, 1],
                  }}
                  transition={{
                    duration: METRONOME_PULSE_MS / 1000,
                    times: [0, 0.25, 1],
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    !reducedMotion && "will-change-transform",
                    isDownbeat
                      ? "bg-red-600 shadow-[0_0_16px_rgba(220,38,38,0.45)]"
                      : "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.35)]"
                  )}
                />
              </>
            ) : (
              <div className="absolute inset-0 rounded-full bg-gray-200/50" />
            )}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Metronome
            </p>
            <p className="text-lg sm:text-xl font-bold tabular-nums tracking-tight text-gray-900">
              {clampedBpm} <span className="text-sm font-medium text-gray-500">BPM</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 min-h-[44px] min-w-[44px] justify-end flex-shrink-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">
            {enabled ? "On" : "Off"}
          </span>
          <ReactSwitch
            checked={enabled}
            onChange={onEnabledChange}
            onColor="#dc2626"
            offColor="#e5e7eb"
            onHandleColor="#ffffff"
            offHandleColor="#ffffff"
            handleDiameter={24}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            activeBoxShadow="0 0 2px 3px rgba(220, 38, 38, 0.2)"
            height={28}
            width={48}
            className="react-switch"
            aria-label="Toggle metronome"
          />
        </div>
      </div>
    );
  }
);
VisualMetronome.displayName = "VisualMetronome";
