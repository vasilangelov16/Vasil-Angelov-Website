import type { Song } from "@/context/BandContext";
import type { RepertoireCategory } from "@/band/types";
import { SETLIST_SCROLL_STORAGE_KEY, PAGE_SIZE } from "@/band/constants";

/** Normalize text for accent-insensitive search (e.g. "noc" matches "Noć") */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Apple-like smooth scroll: ease-out cubic, ~550ms */
export function animateScrollTo(container: HTMLElement, targetTop: number, durationMs = 550): void {
  const start = container.scrollTop;
  const distance = targetTop - start;
  if (Math.abs(distance) < 2) return;
  const startTime = performance.now();
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeOutCubic(progress);
    container.scrollTop = start + distance * eased;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function getSongCategory(song: Song): Exclude<RepertoireCategory, "all"> | null {
  const g = song.genre?.toLowerCase();
  if (g === "ex-yu") return "ex-yu";
  if (g === "makedonski") return "makedonski";
  if (g === "turbo") return "turbo";
  if (g === "extras") return "extras";
  if (g && g !== "ex-yu" && g !== "makedonski" && g !== "turbo" && g !== "extras") return "stranski";
  return null;
}

export function matchesCategory(song: Song, category: RepertoireCategory): boolean {
  const g = song.genre?.toLowerCase();
  switch (category) {
    case "all":
      return true;
    case "stranski":
      return g !== "ex-yu" && g !== "makedonski" && g !== "turbo" && g !== "extras";
    case "ex-yu":
      return g === "ex-yu";
    case "makedonski":
      return g === "makedonski";
    case "turbo":
      return g === "turbo";
    case "extras":
      return g === "extras";
    default:
      return true;
  }
}

export function readStoredScrollState(categoryFilter: RepertoireCategory): {
  scrollTop: number;
  visibleCount: number;
} | null {
  try {
    const saved = localStorage.getItem(SETLIST_SCROLL_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as {
      scrollTop?: number;
      visibleCount?: number;
      categoryFilter?: string;
    };
    if (parsed.categoryFilter !== categoryFilter) return null;
    const scrollTop = typeof parsed.scrollTop === "number" ? parsed.scrollTop : 0;
    const visibleCount =
      typeof parsed.visibleCount === "number" ? Math.max(PAGE_SIZE, parsed.visibleCount) : PAGE_SIZE;
    return scrollTop > 0 || visibleCount > PAGE_SIZE ? { scrollTop, visibleCount } : null;
  } catch {
    return null;
  }
}
