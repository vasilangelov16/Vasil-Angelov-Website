import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import REPERTOIRE_SONGS from "@band-songs";
import BandApp from "@/pages/BandApp";

const REPERTOIRE = REPERTOIRE_SONGS as Array<{
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  tempo?: string;
  genre?: string;
  lyrics?: string;
}>;

const AUTH_STORAGE_KEY = "band-app-auth";
const STATE_STORAGE_KEY = "band-app-state";

describe("BandApp now playing reliability", () => {
  beforeEach(() => {
    localStorage.removeItem(STATE_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        role: "singer",
        timestamp: Date.now(),
      })
    );
    localStorage.setItem(
      STATE_STORAGE_KEY,
      JSON.stringify({
        currentSong: REPERTOIRE[0],
        setlist: REPERTOIRE,
        lastUpdate: Date.now(),
      })
    );
  });

  it("shows clickable compact now-playing card in singer setlist view", async () => {
    render(<BandApp />);

    await waitFor(() => {
      expect(screen.getByTitle("Tap to scroll to song in list")).toBeInTheDocument();
    });
  });

  it("keeps singer in setlist mode when compact now-playing is tapped", async () => {
    render(<BandApp />);

    const nowPlaying = await screen.findByTitle("Tap to scroll to song in list");
    fireEvent.click(nowPlaying);

    expect(
      screen.getByRole("button", {
        name: /switch to lyrics view/i,
      })
    ).toBeInTheDocument();
  });
});

