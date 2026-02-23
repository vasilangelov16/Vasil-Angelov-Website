#!/usr/bin/env node
/**
 * Refactor songs: replace repeated identical [Chorus] blocks with [Chorus xN]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsPath = path.join(__dirname, '../server/data/songs.json');
const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

function parseSections(lyrics) {
  const sections = [];
  const regex = /\[([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[[^\]]+\]|$)/g;
  let m;
  while ((m = regex.exec(lyrics)) !== null) {
    sections.push({ label: m[1].trim(), content: m[2].trimEnd() });
  }
  return sections;
}

function serializeSections(sections) {
  return sections.map((s) => `[${s.label}]\n${s.content}`).join('\n\n');
}

function refactorLyrics(lyrics) {
  if (!lyrics || !lyrics.trim()) return lyrics;

  const sections = parseSections(lyrics);
  const result = [];
  let i = 0;

  while (i < sections.length) {
    const section = sections[i];
    const isChorus = /^Chorus(\s+x\d+)?$/i.test(section.label);

    if (isChorus) {
      let count = 1;
      const chorusContent = section.content;

      while (i + count < sections.length) {
        const next = sections[i + count];
        if (!/^Chorus(\s+x\d+)?$/i.test(next.label)) break;
        if (next.content !== chorusContent) break;
        count++;
      }

      result.push({
        label: count > 1 ? `Chorus x${count}` : section.label,
        content: chorusContent,
      });
      i += count;
    } else {
      result.push(section);
      i++;
    }
  }

  return serializeSections(result);
}

songs.forEach((song) => {
  if (song.lyrics) {
    song.lyrics = refactorLyrics(song.lyrics);
  }
});

fs.writeFileSync(songsPath, JSON.stringify(songs, null, 0), 'utf8');
console.log('Refactored', songs.filter((s) => s.lyrics).length, 'songs');
