import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import REPERTOIRE_SONGS from "@band-songs";
import { BandProvider, useBandState } from "@/context/BandContext";

vi.mock("@/hooks/useBandWebSocket", () => ({
  useBandWebSocket: () => ({
    sendUpdate: vi.fn(),
    isConnected: false,
    isOffline: true,
  }),
  hasWebSocket: () => false,
}));

const REPERTOIRE = REPERTOIRE_SONGS as Array<{ id: string }>;
const STORAGE_KEY = "band-app-state";
const CURRENT_SONG_ID_KEY = "band-app-current-song-id";

function Harness() {
  const { state, setCurrentSong, reorderSetlistWithSuggestions } = useBandState();
  const first = state.setlist[0];
  const second = state.setlist[1];
  const third = state.setlist[2];

  return (
    <div>
      <button type="button" onClick={() => setCurrentSong(first)}>
        Select first
      </button>
      <button
        type="button"
        onClick={() => reorderSetlistWithSuggestions([second.id, third.id], first)}
      >
        Reorder suggestions
      </button>
      <div data-testid="current-id">{state.currentSong?.id ?? "none"}</div>
    </div>
  );
}

describe("BandContext reliability invariants", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SONG_ID_KEY);
  });

  it("keeps currentSong selected after AI reorder", async () => {
    render(
      <BandProvider authRole="singer">
        <Harness />
      </BandProvider>
    );

    fireEvent.click(screen.getByText("Select first"));
    const selectedId = screen.getByTestId("current-id").textContent;
    expect(selectedId).not.toBe("none");

    fireEvent.click(screen.getByText("Reorder suggestions"));

    await waitFor(() => {
      expect(screen.getByTestId("current-id").textContent).toBe(selectedId);
    });
  });

  it("restores currentSong from saved current-song id", async () => {
    const restoreId = REPERTOIRE[5]?.id ?? REPERTOIRE[0].id;
    localStorage.setItem(CURRENT_SONG_ID_KEY, restoreId);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentSong: null,
        setlist: REPERTOIRE,
        lastUpdate: Date.now(),
      })
    );

    render(
      <BandProvider authRole="singer">
        <Harness />
      </BandProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-id").textContent).toBe(restoreId);
    });
  });
});

