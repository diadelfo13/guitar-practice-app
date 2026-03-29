import { Note } from 'tonal';

export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
export const NUM_FRETS = 15;

const NOTE_CHROMAS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Normalize a note name to its sharp equivalent for lookup
function toChroma(noteName) {
  const stripped = noteName.replace(/\d/, '');
  const midi = Note.midi(noteName.includes(/\d/) ? noteName : noteName + '4');
  if (midi === null) return stripped;
  return NOTE_CHROMAS[midi % 12];
}

// Normalize pitch class (no octave) to sharp equivalent
export function normalizePc(pc) {
  // Handle flats: Bb->A#, Db->C#, etc.
  const enharmonics = { Bb:'A#', Db:'C#', Eb:'D#', Fb:'E', Gb:'F#', Ab:'G#', Cb:'B' };
  return enharmonics[pc] ?? pc;
}

/**
 * Returns all fretboard positions where notes in noteSet appear.
 * noteSet: array of pitch classes (e.g. ['C','E','G'])
 * roleMap: { 'C': 'root', 'E': 'major3', ... }
 * Returns: [{ string, fret, note, role, isRoot }]
 *   string: 0 = low E (string 6 in guitar numbering)
 *   fret:   0-14
 */
export function getNotesOnFretboard(noteSet, roleMap = {}) {
  const positions = [];
  // Normalize the set to sharp equivalents
  const normalizedSet = new Set(noteSet.map(n => normalizePc(n.replace(/\d/, ''))));
  const normalizedRoleMap = {};
  Object.entries(roleMap).forEach(([k, v]) => {
    normalizedRoleMap[normalizePc(k.replace(/\d/, ''))] = v;
  });

  STANDARD_TUNING.forEach((openNote, stringIdx) => {
    const openMidi = Note.midi(openNote);
    for (let fret = 0; fret <= NUM_FRETS; fret++) {
      const midi = openMidi + fret;
      const chroma = midi % 12;
      const pc = NOTE_CHROMAS[chroma];
      if (normalizedSet.has(pc)) {
        const role = normalizedRoleMap[pc] || 'scale';
        positions.push({
          string: stringIdx,
          fret,
          note: pc,
          role,
          isRoot: role === 'root' || role === '1P',
        });
      }
    }
  });

  return positions;
}

// Map scale notes to roles using interval labels
// notes: ['C','E','G','B'], intervals: ['1P','3M','5P','7M']
export function buildRoleMap(notes, intervals) {
  const map = {};
  notes.forEach((note, i) => {
    const pc = normalizePc(note.replace(/\d/, ''));
    map[pc] = intervals?.[i] || 'scale';
  });
  return map;
}

// Fret marker dots (standard guitar position markers)
export const FRET_DOTS = [3, 5, 7, 9];
export const DOUBLE_FRET_DOTS = [12];
