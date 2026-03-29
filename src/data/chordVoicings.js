import { Note } from 'tonal';

// ── Voicing Templates ───────────────────────────────────────────────────────
// Each voicing: { name, strings: [lowE, A, D, G, B, highE], baseRoot }
//   number = fret to press, null = muted, 0 = open string
// Voicings are stored for a base root and transposed algorithmically.

const VOICING_TEMPLATES = {
  // ── MAJOR ──
  '': [
    { name: 'E shape', strings: [0, 2, 2, 1, 0, 0], baseRoot: 'E' },
    { name: 'A shape', strings: [null, 0, 2, 2, 2, 0], baseRoot: 'A' },
    { name: 'C shape', strings: [null, 3, 2, 0, 1, 0], baseRoot: 'C' },
    { name: 'D shape', strings: [null, null, 0, 2, 3, 2], baseRoot: 'D' },
    { name: 'G shape', strings: [3, 2, 0, 0, 0, 3], baseRoot: 'G' },
  ],
  // ── MINOR ──
  'm': [
    { name: 'Em shape', strings: [0, 2, 2, 0, 0, 0], baseRoot: 'E' },
    { name: 'Am shape', strings: [null, 0, 2, 2, 1, 0], baseRoot: 'A' },
    { name: 'Dm shape', strings: [null, null, 0, 2, 3, 1], baseRoot: 'D' },
  ],
  // ── DIMINISHED ──
  'dim': [
    { name: 'Root 5th str', strings: [null, null, 0, 1, 0, 1], baseRoot: 'D' },
    { name: 'Root 6th str', strings: [null, null, 1, 2, 1, 2], baseRoot: 'Eb' },
  ],
  // ── AUGMENTED ──
  'aug': [
    { name: 'E shape', strings: [null, null, 2, 1, 1, 0], baseRoot: 'D' },
    { name: 'Root 6th str', strings: [null, 0, 3, 2, 2, 1], baseRoot: 'A' },
  ],
  // ── SUS2 ──
  'sus2': [
    { name: 'A shape', strings: [null, 0, 2, 2, 0, 0], baseRoot: 'A' },
    { name: 'E shape', strings: [0, 2, 4, 4, 0, 0], baseRoot: 'E' },
    { name: 'D shape', strings: [null, null, 0, 2, 3, 0], baseRoot: 'D' },
  ],
  // ── SUS4 ──
  'sus4': [
    { name: 'E shape', strings: [0, 2, 2, 2, 0, 0], baseRoot: 'E' },
    { name: 'A shape', strings: [null, 0, 2, 2, 3, 0], baseRoot: 'A' },
    { name: 'D shape', strings: [null, null, 0, 2, 3, 3], baseRoot: 'D' },
  ],
  // ── MAJOR 7th ──
  'maj7': [
    { name: 'C shape', strings: [null, 3, 2, 0, 0, 0], baseRoot: 'C' },
    { name: 'A shape', strings: [null, 0, 2, 1, 2, 0], baseRoot: 'A' },
    { name: 'E shape', strings: [0, 2, 1, 1, 0, 0], baseRoot: 'E' },
    { name: 'D shape', strings: [null, null, 0, 2, 2, 2], baseRoot: 'D' },
  ],
  // ── MINOR 7th ──
  'm7': [
    { name: 'Em7 shape', strings: [0, 2, 0, 0, 0, 0], baseRoot: 'E' },
    { name: 'Am7 shape', strings: [null, 0, 2, 0, 1, 0], baseRoot: 'A' },
    { name: 'Dm7 shape', strings: [null, null, 0, 2, 1, 1], baseRoot: 'D' },
  ],
  // ── DOMINANT 7th ──
  '7': [
    { name: 'E7 shape', strings: [0, 2, 0, 1, 0, 0], baseRoot: 'E' },
    { name: 'A7 shape', strings: [null, 0, 2, 0, 2, 0], baseRoot: 'A' },
    { name: 'D7 shape', strings: [null, null, 0, 2, 1, 2], baseRoot: 'D' },
    { name: 'G7 shape', strings: [3, 2, 0, 0, 0, 1], baseRoot: 'G' },
  ],
  // ── HALF-DIMINISHED (m7b5) ──
  'm7b5': [
    { name: 'Root 5th str', strings: [null, null, 0, 1, 0, 1], baseRoot: 'D' },
    { name: 'Root 6th str', strings: [null, 0, 1, 2, 1, null], baseRoot: 'A' },
  ],
  // ── DIMINISHED 7th ──
  'dim7': [
    { name: 'Root 5th str', strings: [null, null, 0, 1, 0, 1], baseRoot: 'D' },
    { name: 'Root 6th str', strings: [null, 0, 1, 2, 0, 1], baseRoot: 'A' },
  ],
  // ── MINOR-MAJOR 7th ──
  'mM7': [
    { name: 'Am shape', strings: [null, 0, 2, 1, 1, 0], baseRoot: 'A' },
    { name: 'Em shape', strings: [0, 2, 1, 0, 0, 0], baseRoot: 'E' },
  ],
  // ── ADD9 ──
  'add9': [
    { name: 'C shape', strings: [null, 3, 2, 0, 3, 0], baseRoot: 'C' },
    { name: 'A shape', strings: [null, 0, 2, 4, 2, 0], baseRoot: 'A' },
  ],
  // ── MAJOR 9th ──
  'maj9': [
    { name: 'Root 5th str', strings: [null, 0, 2, 1, 2, 0], baseRoot: 'A' },
    { name: 'C shape', strings: [null, 3, 2, 0, 3, 0], baseRoot: 'C' },
  ],
  // ── MINOR 9th ──
  'm9': [
    { name: 'Am shape', strings: [null, 0, 2, 0, 1, 0], baseRoot: 'A' },
    { name: 'Root 6th str', strings: [0, 2, 0, 0, 0, 2], baseRoot: 'E' },
  ],
  // ── DOMINANT 9th ──
  '9': [
    { name: 'A shape', strings: [null, 0, 2, 1, 2, 0], baseRoot: 'A' },
    { name: 'E shape', strings: [0, 2, 0, 1, 0, 2], baseRoot: 'E' },
  ],
  // ── 6th ──
  '6': [
    { name: 'E6 shape', strings: [0, 2, 2, 1, 2, 0], baseRoot: 'E' },
    { name: 'C6 shape', strings: [null, 3, 2, 2, 1, 0], baseRoot: 'C' },
  ],
  // ── MINOR 6th ──
  'm6': [
    { name: 'Em6 shape', strings: [0, 2, 2, 0, 2, 0], baseRoot: 'E' },
    { name: 'Am6 shape', strings: [null, 0, 2, 2, 1, 2], baseRoot: 'A' },
  ],
  // ── POWER CHORD ──
  '5': [
    { name: 'Root 6th str', strings: [0, 2, 2, null, null, null], baseRoot: 'E' },
    { name: 'Root 5th str', strings: [null, 0, 2, 2, null, null], baseRoot: 'A' },
  ],
  // ── 7#9 (Hendrix) ──
  '7#9': [
    { name: 'E7#9 shape', strings: [0, 2, 0, 1, 3, null], baseRoot: 'E' },
  ],
  // ── 7b9 ──
  '7b9': [
    { name: 'A shape', strings: [null, 0, 2, 0, 2, 1], baseRoot: 'A' },
  ],
  // ── 7#5 ──
  '7#5': [
    { name: 'E shape', strings: [0, 2, 0, 1, 1, 0], baseRoot: 'E' },
  ],
  // ── 7b5 ──
  '7b5': [
    { name: 'A shape', strings: [null, 0, 1, 0, 2, 0], baseRoot: 'A' },
  ],
  // ── 11th ──
  '11': [
    { name: 'Root 5th str', strings: [null, 0, 0, 0, 0, 0], baseRoot: 'A' },
  ],
  // ── 13th ──
  '13': [
    { name: 'A shape', strings: [null, 0, 2, 0, 2, 2], baseRoot: 'A' },
  ],
  // ── Major 13th ──
  'maj13': [
    { name: 'Root 5th str', strings: [null, 0, 2, 1, 2, 2], baseRoot: 'A' },
  ],
};

// ── Semitone distance ────────────────────────────────────────────────────────
function semitoneDiff(from, to) {
  const fromMidi = Note.midi(from + '4');
  const toMidi = Note.midi(to + '4');
  if (fromMidi == null || toMidi == null) return 0;
  let diff = (toMidi - fromMidi) % 12;
  if (diff < 0) diff += 12;
  return diff;
}

// ── Transpose a single voicing template ──────────────────────────────────────
function transposeVoicing(template, offset) {
  const transposed = template.strings.map(fret => {
    if (fret === null) return null;
    return fret + offset;
  });

  // Compute baseFret (lowest pressed fret, ignoring open/muted)
  const pressed = transposed.filter(f => f !== null && f > 0);
  const minFret = pressed.length ? Math.min(...pressed) : 1;
  const maxFret = pressed.length ? Math.max(...pressed) : 1;
  const span = maxFret - minFret;

  // If span > 5, this voicing is unplayable at this transposition
  if (span > 5) return null;

  // baseFret: if all notes are within frets 0-4, show from nut (baseFret=1)
  // otherwise show from lowest pressed fret
  const baseFret = (maxFret <= 4) ? 1 : minFret;

  return {
    name: template.name,
    strings: transposed,
    baseFret,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getVoicingsForChord(root, symbol) {
  const templates = VOICING_TEMPLATES[symbol];
  if (!templates) return [];

  const voicings = [];
  for (const tpl of templates) {
    const offset = semitoneDiff(tpl.baseRoot, root);
    const voicing = transposeVoicing(tpl, offset);
    if (voicing) {
      voicings.push(voicing);
    }
  }
  return voicings;
}
