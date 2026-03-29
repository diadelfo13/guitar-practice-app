// Standard guitar tuning (low E to high E, index 0 = low E string 6)
export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

export const NUM_FRETS = 15;

export const ALL_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B',
  'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F',
];

export const ENHARMONIC_MAP = {
  'F#': 'Gb', 'Db': 'C#', 'Ab': 'G#', 'Eb': 'D#', 'Bb': 'A#',
};

// Frequencies in Hz for the 4th octave (drone base)
export const NOTE_FREQUENCIES = {
  C: 130.81, 'C#': 138.59, Db: 138.59,
  D: 146.83, 'D#': 155.56, Eb: 155.56,
  E: 164.81,
  F: 174.61, 'F#': 185.00, Gb: 185.00,
  G: 196.00, 'G#': 207.65, Ab: 207.65,
  A: 220.00, 'A#': 233.08, Bb: 233.08,
  B: 246.94,
};

// Colors for interval roles on the fretboard — ECHO palette
export const ROLE_COLORS = {
  root:      '#f43f5e', // rose — vibrant root
  minor2:    '#fb923c', // orange
  major2:    '#facc15', // yellow
  minor3:    '#4ade80', // green
  major3:    '#34d399', // emerald
  perfect4:  '#22d3ee', // cyan
  tritone:   '#a78bfa', // violet
  perfect5:  '#818cf8', // indigo-violet
  minor6:    '#6366f1', // indigo
  major6:    '#f472b6', // pink
  minor7:    '#fb7185', // rose-light
  major7:    '#c084fc', // purple
  octave:    '#f43f5e', // rose (same as root)
  scale:     '#7c8ba8', // cool slate (generic scale note)
  characteristic: '#fbbf24', // amber — highlighted mode characteristic note
};

export const INTERVAL_TO_ROLE = {
  '1P': 'root', '2m': 'minor2', '2M': 'major2',
  '3m': 'minor3', '3M': 'major3', '4P': 'perfect4',
  '4A': 'tritone', '5d': 'tritone', '5P': 'perfect5',
  '6m': 'minor6', '6M': 'major6', '7m': 'minor7',
  '7M': 'major7', '8P': 'octave',
};

export const CIRCLE_OF_FIFTHS = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];

export const SECTIONS = [
  { id: 'daily',      label: 'Daily Practice',  icon: '📅' },
  { id: 'overview',   label: 'Key Overview',    icon: '🎵' },
  { id: 'triads',     label: 'Triads',           icon: '△' },
  { id: 'sevenths',   label: '7th Chords',       icon: '7' },
  { id: 'extensions', label: 'Extensions',       icon: '9+' },
  { id: 'intervals',  label: 'Intervals',        icon: '↕' },
  { id: 'modes',      label: 'Major Modes',      icon: '⬡' },
  { id: 'minor',      label: 'Minor Scales',     icon: '♭' },
  { id: 'bonus',      label: 'More',             icon: '+' },
  { id: 'chords',     label: 'Chord Library',     icon: '📚' },
];
