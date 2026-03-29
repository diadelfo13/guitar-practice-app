import { Scale, Chord, Note, Interval } from 'tonal';

// ── SCALES ──────────────────────────────────────────────────────────────────

export function getMajorScale(key) {
  return Scale.get(`${key} major`).notes;
}

export function getMinorScales(key) {
  return {
    natural:  Scale.get(`${key} minor`).notes,
    harmonic: Scale.get(`${key} harmonic minor`).notes,
    melodic:  Scale.get(`${key} melodic minor`).notes,
  };
}

// ── MODES ────────────────────────────────────────────────────────────────────

export const MODE_DEFINITIONS = [
  {
    name: 'Ionian', alias: 'Major', degree: 1, scaleType: 'major',
    intervals: ['1P','2M','3M','4P','5P','6M','7M'],
    characteristicDegree: null,
    description: 'The major scale. Bright, resolved, happy.',
    character: 'Happy / Resolved',
    tips: 'Focus on the major 3rd. Every note feels at home.',
  },
  {
    name: 'Dorian', degree: 2, scaleType: 'dorian',
    intervals: ['1P','2M','3m','4P','5P','6M','7m'],
    characteristicDegree: 5, // natural 6th (index 5) — distinguishes from natural minor
    description: 'Minor with a raised 6th. Jazzy, soulful.',
    character: 'Soulful / Jazzy',
    tips: 'Emphasize the natural 6th — it lifts the darkness of minor.',
  },
  {
    name: 'Phrygian', degree: 3, scaleType: 'phrygian',
    intervals: ['1P','2m','3m','4P','5P','6m','7m'],
    characteristicDegree: 1, // b2 (index 1) — the defining Spanish half-step
    description: 'Minor with a b2. Spanish/flamenco, dark, exotic.',
    character: 'Dark / Spanish',
    tips: 'Land on the b2 to feel the tension. Resolve back to root.',
  },
  {
    name: 'Lydian', degree: 4, scaleType: 'lydian',
    intervals: ['1P','2M','3M','4A','5P','6M','7M'],
    characteristicDegree: 3, // #4 (index 3) — the tritone above root
    description: 'Major with a #4. Dreamy, floating, ethereal.',
    character: 'Dreamy / Floating',
    tips: 'Linger on the #4 — that tritone above the root is the magic.',
  },
  {
    name: 'Mixolydian', degree: 5, scaleType: 'mixolydian',
    intervals: ['1P','2M','3M','4P','5P','6M','7m'],
    characteristicDegree: 6, // b7 (index 6)
    description: 'Major with a b7. Dominant, bluesy, rock.',
    character: 'Bluesy / Dominant',
    tips: 'Bend to the b7. This is the blues/rock bread and butter.',
  },
  {
    name: 'Aeolian', alias: 'Natural Minor', degree: 6, scaleType: 'minor',
    intervals: ['1P','2M','3m','4P','5P','6m','7m'],
    characteristicDegree: 5, // b6 (index 5) — vs Dorian
    description: 'Natural minor. Melancholic, dark, emotional.',
    character: 'Melancholic / Dark',
    tips: 'Compare the b6 to Dorian\'s natural 6. Feel the difference.',
  },
  {
    name: 'Locrian', degree: 7, scaleType: 'locrian',
    intervals: ['1P','2m','3m','4P','5d','6m','7m'],
    characteristicDegree: 4, // b5 (index 4) — the tritone
    description: 'Diminished flavor. b2 and b5 make it deeply unstable.',
    character: 'Unstable / Tense',
    tips: 'The b5 makes the tonic feel unresolved. Rare in practice — explore tension.',
  },
];

export function getModeNotes(key, scaleType) {
  return Scale.get(`${key} ${scaleType}`).notes;
}

// ── CHORDS ───────────────────────────────────────────────────────────────────

export const TRIAD_TYPES = [
  { symbol: 'M',   quality: 'major',      label: 'Major',      intervals: ['1P','3M','5P'] },
  { symbol: 'm',   quality: 'minor',      label: 'Minor',      intervals: ['1P','3m','5P'] },
  { symbol: 'dim', quality: 'diminished', label: 'Diminished', intervals: ['1P','3m','5d'] },
  { symbol: 'aug', quality: 'augmented',  label: 'Augmented',  intervals: ['1P','3M','5A'] },
];

export const SEVENTH_TYPES = [
  { symbol: 'maj7',  label: 'Major 7th',         intervals: ['1P','3M','5P','7M'] },
  { symbol: 'm7',    label: 'Minor 7th',          intervals: ['1P','3m','5P','7m'] },
  { symbol: '7',     label: 'Dominant 7th',       intervals: ['1P','3M','5P','7m'] },
  { symbol: 'm7b5',  label: 'Half-Diminished',    intervals: ['1P','3m','5d','7m'] },
  { symbol: 'dim7',  label: 'Diminished 7th',     intervals: ['1P','3m','5d','7d'] },
  { symbol: 'mM7',   label: 'Minor-Major 7th',    intervals: ['1P','3m','5P','7M'] },
];

export const EXTENSION_TYPES = [
  { symbol: 'maj9',  label: 'Major 9',    intervals: ['1P','3M','5P','7M','9M'] },
  { symbol: 'm9',    label: 'Minor 9',    intervals: ['1P','3m','5P','7m','9M'] },
  { symbol: '9',     label: 'Dominant 9', intervals: ['1P','3M','5P','7m','9M'] },
  { symbol: '11',    label: 'Minor 11',   intervals: ['1P','3m','5P','7m','9M','11P'] },
  { symbol: 'maj13', label: 'Major 13',   intervals: ['1P','3M','5P','7M','9M','13M'] },
  { symbol: '13',    label: 'Dominant 13',intervals: ['1P','3M','5P','7m','9M','13M'] },
];

export const INTERVAL_DEFINITIONS = [
  { semitones: 0,  name: 'Unison',      abbr: 'P1',  tonal: '1P', quality: 'perfect' },
  { semitones: 1,  name: 'Minor 2nd',   abbr: 'm2',  tonal: '2m', quality: 'dissonant' },
  { semitones: 2,  name: 'Major 2nd',   abbr: 'M2',  tonal: '2M', quality: 'step' },
  { semitones: 3,  name: 'Minor 3rd',   abbr: 'm3',  tonal: '3m', quality: 'consonant' },
  { semitones: 4,  name: 'Major 3rd',   abbr: 'M3',  tonal: '3M', quality: 'consonant' },
  { semitones: 5,  name: 'Perfect 4th', abbr: 'P4',  tonal: '4P', quality: 'perfect' },
  { semitones: 6,  name: 'Tritone',     abbr: 'TT',  tonal: '4A', quality: 'dissonant' },
  { semitones: 7,  name: 'Perfect 5th', abbr: 'P5',  tonal: '5P', quality: 'perfect' },
  { semitones: 8,  name: 'Minor 6th',   abbr: 'm6',  tonal: '6m', quality: 'consonant' },
  { semitones: 9,  name: 'Major 6th',   abbr: 'M6',  tonal: '6M', quality: 'consonant' },
  { semitones: 10, name: 'Minor 7th',   abbr: 'm7',  tonal: '7m', quality: 'dissonant' },
  { semitones: 11, name: 'Major 7th',   abbr: 'M7',  tonal: '7M', quality: 'dissonant' },
  { semitones: 12, name: 'Octave',      abbr: 'P8',  tonal: '8P', quality: 'perfect' },
];

export function getChordNotes(root, symbol) {
  const chord = Chord.get(`${root}${symbol}`);
  return chord.notes.length > 0 ? chord.notes : [];
}

const ROMAN_MAJOR = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_MINOR = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

const DIATONIC_QUALITIES = {
  triad:   ['M', 'm', 'm', 'M', 'M', 'm', 'dim'],
  seventh: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
};

export function getDiatonicChords(key, type = 'triad') {
  const scale = getMajorScale(key);
  const qualities = DIATONIC_QUALITIES[type] || DIATONIC_QUALITIES.triad;
  return scale.map((note, i) => {
    const q = qualities[i];
    const isMajor = q === 'M' || q === 'maj7' || q === '7';
    const roman = isMajor ? ROMAN_MAJOR[i] : ROMAN_MINOR[i];
    const suffix = q === 'M' ? '' : q === 'dim' ? '°' : q === 'm7b5' ? 'ø7' : q;
    return {
      root: note,
      degree: i + 1,
      roman: roman + (q === 'dim' ? '°' : q === 'maj7' ? 'Δ7' : q === '7' ? '7' : q === 'm7' ? 'm7' : q === 'm7b5' ? 'ø7' : ''),
      quality: q,
      notes: getChordNotes(note, q),
    };
  });
}

export function getIntervalNote(root, semitones) {
  return Note.transpose(root + '4', Interval.fromSemitones(semitones)).replace(/\d/, '');
}

// Build role map: { 'C': 'root', 'E': 'major3', 'G': 'perfect5' }
export function buildIntervalRoleMap(notes, intervals) {
  const map = {};
  notes.forEach((note, i) => {
    const pc = note.replace(/\d/, ''); // strip octave if present
    map[pc] = intervals[i] || 'scale';
  });
  return map;
}

// Pentatonic scales
export function getPentatonicScales(key) {
  return {
    major: Scale.get(`${key} major pentatonic`).notes,
    minor: Scale.get(`${key} minor pentatonic`).notes,
    blues: Scale.get(`${key} blues`).notes,
  };
}
