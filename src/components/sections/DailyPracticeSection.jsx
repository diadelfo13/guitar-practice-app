import { useState, useMemo, useCallback } from 'react';
import { getMajorScale, getDiatonicChords, getModeNotes, getMinorScales, getPentatonicScales, MODE_DEFINITIONS } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import { CIRCLE_OF_FIFTHS } from '../../lib/constants';
import Fretboard from '../fretboard/Fretboard';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const STORAGE_KEY = 'guitar-practice-daily';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveDailyData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function getSuggestedKey() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return CIRCLE_OF_FIFTHS[dayOfYear % 12];
}

function getStreak() {
  const data = loadDailyData();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = data[key];
    if (entry && entry.completed && entry.completed.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// 7-day rotation: Mon=0 ... Sun=6
const DAY_INDEX = (new Date().getDay() + 6) % 7;

// ── Helper: build chord name list string ────────────────────────────────────
function chordListStr(key, type = 'triad') {
  const chords = getDiatonicChords(key, type);
  return chords.map(c => {
    const suffix = c.quality === 'M' ? '' : c.quality;
    return `${c.root}${suffix}`;
  }).join(' → ');
}

// ── DAILY PLANS ─────────────────────────────────────────────────────────────
// Each exercise has: name, minutes, steps[], tip, and optional getPositions(key)
// If getPositions is missing, the day's main fretboard is shown.

const DAILY_PLANS = [
  {
    day: 'Monday',
    theme: 'Basic Chords',
    icon: '△',
    section: 'triads',
    description: 'Learn to play chords cleanly and move between them smoothly.',
    exercises: [
      {
        name: 'Play all chords in the key',
        minutes: 3,
        steps: [
          'Start on the first chord of the key (e.g., C major if you\'re in the key of C)',
          'Play each chord going up — strum once per chord',
          'Then come back down to where you started',
          'Focus on making each chord ring out clearly before moving on',
        ],
        tip: 'The fretboard below shows you all the notes that belong to these chords. Don\'t worry about speed — clean changes matter more.',
        getPositions: (key) => {
          const scale = getMajorScale(key);
          const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
          return getNotesOnFretboard(scale, roleMap);
        },
      },
      {
        name: 'Learn chord shapes on the top 3 strings',
        minutes: 3,
        steps: [
          'Take the first chord of the key (e.g., C major)',
          'Play it using only the thinnest 3 strings (G, B, high E)',
          'Now try sliding the shape up the neck to find different voicings',
          'This gives you higher, brighter-sounding chord options',
        ],
        tip: 'These small shapes are great for playing alongside another guitarist — you stay out of each other\'s way!',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'triad');
          const notes = chords[0]?.notes || [];
          const roleMap = buildRoleMap(notes, ['1P','3M','5P']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Smooth chord changes: I → IV → V → I',
        minutes: 4,
        steps: [
          'Play the 1st chord, then the 4th chord, then the 5th chord, then back to the 1st',
          'For example in C: play C → F → G → C',
          'Try to keep your fingers as close to the strings as possible between changes',
          'Move only the fingers that need to move — keep common notes held down',
        ],
        tip: 'This is the most common chord progression in all of music! You\'ll hear it in pop, rock, blues, country — everywhere.',
        getPositions: (key) => {
          const scale = getMajorScale(key);
          const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
          return getNotesOnFretboard(scale, roleMap);
        },
      },
      {
        name: 'Pick through chord notes one at a time',
        minutes: 3,
        steps: [
          'Hold down a chord shape (start with the 1st chord of the key)',
          'Instead of strumming, pick each string individually from lowest to highest',
          'Then pick from highest to lowest',
          'Try this with each chord in the key — it builds finger strength and coordination',
        ],
        tip: 'This is called "arpeggiating" — it\'s how acoustic ballads and fingerpicking songs work.',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'triad');
          const notes = chords[0]?.notes || [];
          const roleMap = buildRoleMap(notes, ['1P','3M','5P']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Strum chords over a drone note',
        minutes: 4,
        steps: [
          'Turn on the drone (set it to the root note of your key)',
          'Slowly strum through each chord in the key',
          'Listen to how each chord sounds against the drone — some feel happy, some sad, some tense',
          'Pause on the chords you like and really listen to the "color"',
        ],
        tip: 'The drone lets you hear how each chord relates back to "home." This trains your ear without you even realizing it.',
      },
    ],
    getPositions: (key) => {
      const scale = getMajorScale(key);
      const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
      return getNotesOnFretboard(scale, roleMap);
    },
  },
  {
    day: 'Tuesday',
    theme: 'Richer Chords (7ths)',
    icon: '7',
    section: 'sevenths',
    description: 'Add a 4th note to your chords for a fuller, jazzier sound.',
    exercises: [
      {
        name: 'Play all 7th chords in the key',
        minutes: 3,
        steps: [
          '7th chords add one extra note on top of regular chords — they sound richer',
          'Start on the first 7th chord and play each one going up through the key',
          'If you don\'t know the shapes yet, check the Chord Library section',
          'Just getting familiar with how they sound is the goal today',
        ],
        tip: 'These are the chords you hear in jazz, R&B, and neo-soul. They add so much depth!',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'seventh');
          const notes = chords[0]?.notes || [];
          const roleMap = buildRoleMap(notes, ['1P','3M','5P','7M']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Resolve the "tense" chord',
        minutes: 3,
        steps: [
          'Find the 5th chord in the key and play it as a 7th chord (e.g., G7 in key of C)',
          'This chord has built-in tension — it wants to go somewhere',
          'Now play the 1st chord as a 7th chord (e.g., Cmaj7) — feel how it resolves',
          'Go back and forth: tense chord → resolved chord. Listen for the release.',
        ],
        tip: 'This "tension → release" pattern is the foundation of all Western music. Once you hear it, you\'ll notice it in every song.',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'seventh');
          const v7notes = chords[4]?.notes || [];
          const roleMap = buildRoleMap(v7notes, ['1P','3M','5P','7m']);
          return getNotesOnFretboard(v7notes, roleMap);
        },
      },
      {
        name: 'The classic jazz move (ii → V → I)',
        minutes: 5,
        steps: [
          'This is the most important chord progression in jazz — 3 chords that flow beautifully',
          'Play the 2nd chord as minor 7th (e.g., Dm7 in key of C)',
          'Then the 5th chord as dominant 7th (e.g., G7)',
          'Then land on the 1st chord as major 7th (e.g., Cmaj7)',
          'Repeat it until it feels natural: Dm7 → G7 → Cmaj7',
        ],
        tip: 'Try to find voicings where your hand barely moves between chords. The smoothest path is usually the best one.',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'seventh');
          const allNotes = [...new Set([...(chords[1]?.notes || []), ...(chords[4]?.notes || []), ...(chords[0]?.notes || [])])];
          const roleMap = {};
          allNotes.forEach(n => { roleMap[n] = 'scale'; });
          if (chords[0]?.notes?.[0]) roleMap[chords[0].notes[0]] = '1P';
          return getNotesOnFretboard(allNotes, roleMap);
        },
      },
      {
        name: 'Add color with 9th chords',
        minutes: 3,
        steps: [
          'A 9th chord is a 7th chord with one more note stacked on top — even richer',
          'Take any 7th chord you just played and try adding one more note (the 9th)',
          'Check the Chord Library for 9th chord shapes if needed',
          'Even just hearing the difference between the 7th and 9th version trains your ear',
        ],
        tip: 'You don\'t need to play all the strings! With bigger chords, it\'s common to skip the lowest note or two.',
        getPositions: (key) => {
          const scale = getMajorScale(key);
          const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
          return getNotesOnFretboard(scale, roleMap);
        },
      },
      {
        name: 'Solo using only chord notes',
        minutes: 4,
        steps: [
          'Turn on the drone set to the root note of your key',
          'Play only the notes that are in the first 7th chord (root, 3rd, 5th, 7th)',
          'Play them in any order, any rhythm — make a melody out of just these 4 notes',
          'Try it with other chords in the key too!',
        ],
        tip: 'This is how jazz musicians think — playing the "right" notes over each chord. You\'re already doing it!',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'seventh');
          const notes = chords[0]?.notes || [];
          const roleMap = buildRoleMap(notes, ['1P','3M','5P','7M']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
    ],
    getPositions: (key) => {
      const chords = getDiatonicChords(key, 'seventh');
      const notes = chords[0]?.notes || [];
      const roleMap = buildRoleMap(notes, ['1P','3M','5P','7M']);
      return getNotesOnFretboard(notes, roleMap);
    },
  },
  {
    day: 'Wednesday',
    theme: 'Intervals (Ear Training)',
    icon: '↕',
    section: 'intervals',
    description: 'Train your ear to recognize the distance between two notes.',
    exercises: [
      {
        name: 'Name that jump',
        minutes: 4,
        steps: [
          'Pick any note on the fretboard and play it',
          'Then pick a nearby note on the same or next string and play it',
          'Try to guess the distance between them before counting frets',
          'Count frets to check: 1 fret = half step, 2 frets = whole step, etc.',
        ],
        tip: 'Associate intervals with songs: a 5th sounds like the Star Wars theme, a 4th like "Here Comes the Bride."',
      },
      {
        name: 'Play 3rds up the scale',
        minutes: 4,
        steps: [
          'Play the 1st note of the scale, then skip to the 3rd note',
          'Then play the 2nd note, then the 4th note',
          'Continue this "skip one" pattern all the way up the scale',
          'This creates a beautiful flowing sound — great for melodies',
        ],
        tip: 'Try playing both notes at the same time (double stops) for a country or rock sound!',
        getPositions: (key) => {
          const scale = getMajorScale(key);
          const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
          return getNotesOnFretboard(scale, roleMap);
        },
      },
      {
        name: 'Play 6ths up the scale',
        minutes: 4,
        steps: [
          'Same idea as 3rds, but now skip 4 notes instead of 1',
          'Play the 1st and 6th notes together, then 2nd and 7th, etc.',
          'This creates sweet, harmonious double stops',
          'These shapes work great for intros, outros, and melodic fills',
        ],
        tip: '6ths are the interval you hear in songs like "Wish You Were Here" by Pink Floyd.',
      },
      {
        name: 'Find the tense intervals',
        minutes: 5,
        steps: [
          'The "tritone" is the most tense interval — it\'s 6 frets apart (half an octave)',
          'Find the tritone in your key: in C, it\'s B to F (or F to B)',
          'Play both notes — hear how restless it sounds?',
          'Now resolve it: move each note one fret apart (B→C, F→E). Hear the relief!',
        ],
        tip: 'The tritone is what makes the V chord want to resolve to the I chord. It\'s the engine of all chord progressions!',
      },
    ],
    getPositions: (key) => {
      const scale = getMajorScale(key);
      const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
      return getNotesOnFretboard(scale, roleMap);
    },
  },
  {
    day: 'Thursday',
    theme: 'Scale Flavors (Modes)',
    icon: '⬡',
    section: 'modes',
    description: 'Same notes, different starting points = completely different moods.',
    exercises: [
      {
        name: 'Play the soulful scale (Dorian)',
        minutes: 3,
        steps: [
          'Dorian is the scale that starts on the 2nd note of the major scale',
          'In the key of C, that means starting on D: D E F G A B C D',
          'Play it up and down — it sounds minor but with a slightly brighter feel',
          'Pay attention to the 6th note — that\'s what makes it sound "soulful" instead of just sad',
        ],
        tip: 'Dorian is all over funk, soul, and jazz. Think Santana or "So What" by Miles Davis.',
        getPositions: (key) => {
          const notes = getModeNotes(key, 'dorian');
          const mode = MODE_DEFINITIONS[1];
          const roleMap = buildRoleMap(notes, mode.intervals);
          if (mode.characteristicDegree !== null && notes[mode.characteristicDegree]) {
            roleMap[notes[mode.characteristicDegree]] = 'characteristic';
          }
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Play the bluesy/rock scale (Mixolydian)',
        minutes: 3,
        steps: [
          'Mixolydian starts on the 5th note of the major scale',
          'In key of C, start on G: G A B C D E F G',
          'It sounds like major, but with a slightly "cooler" feel',
          'The 7th note is one fret lower than in major — that\'s the blues flavor',
        ],
        tip: 'Mixolydian is the sound of classic rock. Think "Sweet Home Alabama" or any blues-rock jam.',
        getPositions: (key) => {
          const notes = getModeNotes(key, 'mixolydian');
          const mode = MODE_DEFINITIONS[4];
          const roleMap = buildRoleMap(notes, mode.intervals);
          if (mode.characteristicDegree !== null && notes[mode.characteristicDegree]) {
            roleMap[notes[mode.characteristicDegree]] = 'characteristic';
          }
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Compare the moods',
        minutes: 4,
        steps: [
          'Play the regular major scale (Ionian) up and down',
          'Now play Dorian (starting from the 2nd note) — hear the difference?',
          'Now play Mixolydian (starting from the 5th note)',
          'All three use the exact same notes but sound completely different!',
        ],
        tip: 'This is the magic of modes — by simply changing which note feels like "home," you change the entire mood.',
        getPositions: (key) => {
          const scale = getMajorScale(key);
          const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
          return getNotesOnFretboard(scale, roleMap);
        },
      },
      {
        name: 'Improvise in each mood',
        minutes: 5,
        steps: [
          'Turn on the drone set to the root note',
          'Improvise using Dorian for about 2 minutes — make it sound soulful',
          'Now switch: improvise using Mixolydian — make it sound bluesy/rocky',
          'Try ending your phrases on different notes to see which feel like "home"',
        ],
        tip: 'Don\'t overthink — just play and listen. Your ear will start to hear the difference naturally.',
      },
    ],
    getPositions: (key) => {
      const notes = getModeNotes(key, 'dorian');
      const mode = MODE_DEFINITIONS[1];
      const roleMap = buildRoleMap(notes, mode.intervals);
      if (mode.characteristicDegree !== null && notes[mode.characteristicDegree]) {
        roleMap[notes[mode.characteristicDegree]] = 'characteristic';
      }
      return getNotesOnFretboard(notes, roleMap);
    },
  },
  {
    day: 'Friday',
    theme: 'Minor Scales',
    icon: '♭',
    section: 'minor',
    description: 'Three flavors of minor — from sad to exotic to smooth.',
    exercises: [
      {
        name: 'Play the natural minor scale',
        minutes: 3,
        steps: [
          'The natural minor scale is your basic "sad" scale',
          'Play it up from the root note to the octave, then back down',
          'Every note should ring clearly — use a metronome if you can',
          'Try it in a few positions on the neck (not just one spot)',
        ],
        tip: 'This is the same as the Aeolian mode from yesterday — just a different name for the same thing!',
        getPositions: (key) => {
          const scales = getMinorScales(key);
          const notes = scales.natural || [];
          const roleMap = buildRoleMap(notes, ['1P','2M','3m','4P','5P','6m','7m']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Play the harmonic minor scale',
        minutes: 3,
        steps: [
          'Take the natural minor scale and raise the 7th note by one fret',
          'This creates a dramatic, almost "Egyptian" or "classical" sound',
          'Play it up and down — the gap between the 6th and 7th notes is what gives it that exotic feel',
          'Try bending into that raised 7th note for extra expression',
        ],
        tip: 'This is the scale that makes classical and flamenco music sound so dramatic. Also used heavily in metal!',
        getPositions: (key) => {
          const scales = getMinorScales(key);
          const notes = scales.harmonic || [];
          const roleMap = buildRoleMap(notes, ['1P','2M','3m','4P','5P','6m','7M']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Play the melodic minor scale',
        minutes: 3,
        steps: [
          'Take the natural minor and raise BOTH the 6th and 7th notes by one fret',
          'This creates a smooth, jazzy minor scale',
          'It\'s only one note different from the regular major scale (the 3rd is lowered)',
          'Play it ascending — hear how smooth and sophisticated it sounds',
        ],
        tip: 'Melodic minor is a jazz essential. It smooths out the awkward gap in harmonic minor.',
        getPositions: (key) => {
          const scales = getMinorScales(key);
          const notes = scales.melodic || [];
          const roleMap = buildRoleMap(notes, ['1P','2M','3m','4P','5P','6M','7M']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Compare all three side by side',
        minutes: 4,
        steps: [
          'Play natural minor from root to octave',
          'Immediately play harmonic minor from root to octave',
          'Immediately play melodic minor from root to octave',
          'Focus on notes 6 and 7 — those are the only ones that change between the three!',
        ],
        tip: 'Think of it like a dimmer switch: natural minor is darkest, melodic minor is brightest, harmonic is dramatic.',
      },
      {
        name: 'Improvise in minor',
        minutes: 5,
        steps: [
          'Turn on the drone set to the root note',
          'Start with natural minor — play something slow and moody',
          'Switch to harmonic minor — add some drama and tension',
          'Try melodic minor — make it smooth and jazzy',
          'Mix all three freely — there are no rules in improv!',
        ],
        tip: 'Many great solos mix these three minor sounds in the same phrase. Let your ear guide you.',
      },
    ],
    getPositions: (key) => {
      const scales = getMinorScales(key);
      const notes = scales.natural || [];
      const roleMap = buildRoleMap(notes, ['1P','2M','3m','4P','5P','6m','7m']);
      return getNotesOnFretboard(notes, roleMap);
    },
  },
  {
    day: 'Saturday',
    theme: 'Pentatonic & Blues',
    icon: '🎸',
    section: 'bonus',
    description: 'The 5-note scale that powers most guitar solos in rock, blues, and pop.',
    exercises: [
      {
        name: 'Learn the first box shape',
        minutes: 3,
        steps: [
          'The minor pentatonic "Box 1" is the most used solo shape on guitar',
          'It\'s a simple 2-notes-per-string pattern starting on the root note',
          'Play it slowly ascending, then descending',
          'This single shape is enough to solo over most rock and blues songs!',
        ],
        tip: 'Every rock guitarist uses this shape — from Hendrix to Slash. Learn it well and it\'ll serve you forever.',
        getPositions: (key) => {
          const pent = getPentatonicScales(key);
          const notes = pent.minor || [];
          const roleMap = buildRoleMap(notes, ['1P','3m','4P','5P','7m']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Connect Box 1 to Box 2',
        minutes: 3,
        steps: [
          'There are 5 pentatonic box shapes that cover the entire neck',
          'Once you know Box 1, learn Box 2 (it starts where Box 1 ends)',
          'Practice sliding from the last note of Box 1 into the first note of Box 2',
          'Find the notes they share — these are your "bridge" between positions',
        ],
        tip: 'Connecting boxes is how you break out of being stuck in one position. It opens up the whole neck!',
      },
      {
        name: 'Add the blues note',
        minutes: 3,
        steps: [
          'The "blues scale" is the pentatonic scale with one extra note added — the "blue note"',
          'It sits right between the 4th and 5th notes (one extra fret)',
          'Play the pentatonic scale but add this note — instant blues sound!',
          'Try bending into the blue note from the note below — that\'s a classic blues move',
        ],
        tip: 'The blue note is what makes B.B. King sound like B.B. King. It\'s the magic ingredient.',
        getPositions: (key) => {
          const pent = getPentatonicScales(key);
          const notes = pent.blues || [];
          const intervals = ['1P','3m','4P','4A','5P','7m'];
          const roleMap = buildRoleMap(notes, intervals);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Call and response',
        minutes: 4,
        steps: [
          'Play a short phrase (2-4 notes) — this is the "call"',
          'Now play a different phrase that "answers" it — this is the "response"',
          'The response should feel like a reply: maybe higher, maybe ending on a different note',
          'This is how you build musical conversations and create interesting solos',
        ],
        tip: 'Think of it like a conversation: question → answer. Listen to blues artists — they all do this!',
      },
      {
        name: 'Full neck freestyle',
        minutes: 5,
        steps: [
          'Turn on the drone and metronome (start with a slow tempo)',
          'Start in Box 1 and play a few phrases',
          'Slide up into Box 2, play some more',
          'Try to work your way up the entire neck and back down',
          'Don\'t worry about mistakes — this is about exploring!',
        ],
        tip: 'Speed comes from comfort. The more you explore the neck slowly, the faster you\'ll be able to navigate it later.',
      },
    ],
    getPositions: (key) => {
      const pent = getPentatonicScales(key);
      const notes = pent.blues || pent.minor || [];
      const intervals = notes.length === 6 ? ['1P','3m','4P','4A','5P','7m'] : ['1P','3m','4P','5P','7m'];
      const roleMap = buildRoleMap(notes, intervals);
      return getNotesOnFretboard(notes, roleMap);
    },
  },
  {
    day: 'Sunday',
    theme: 'Review & Jam',
    icon: '🎵',
    section: 'overview',
    description: 'Bring everything together — review the week and have fun!',
    exercises: [
      {
        name: 'Play the full major scale across the neck',
        minutes: 3,
        steps: [
          'Start on the lowest root note you can find and play the major scale going up',
          'Try to get all the way to the highest note you can reach',
          'Then come back down to where you started',
          'This helps you see the "big picture" of how notes connect across the neck',
        ],
        tip: 'Try to do this without looking at the fretboard diagram — then check yourself!',
      },
      {
        name: 'Play through all the chords',
        minutes: 4,
        steps: [
          'Play every 7th chord in the key, going from the 1st to the 7th',
          'Try to land on the root note clearly each time',
          'If you can, try different voicings (positions) for each chord',
          'This is like a warm-up review of Tuesday\'s lesson',
        ],
        tip: 'Knowing your chords by muscle memory means you can focus on making music instead of thinking about shapes.',
        getPositions: (key) => {
          const chords = getDiatonicChords(key, 'seventh');
          const notes = chords[0]?.notes || [];
          const roleMap = buildRoleMap(notes, ['1P','3M','5P','7M']);
          return getNotesOnFretboard(notes, roleMap);
        },
      },
      {
        name: 'Practice a chord progression',
        minutes: 5,
        steps: [
          'Pick one of these common progressions:',
          '  Option A: I → IV → V → I (rock/pop — e.g., C → F → G → C)',
          '  Option B: ii → V → I (jazz — e.g., Dm7 → G7 → Cmaj7)',
          '  Option C: I → V → vi → IV (pop ballad — e.g., C → G → Am → F)',
          'Play the chords in a loop, then try soloing over them using the scale',
        ],
        tip: 'Most popular songs use one of these three progressions. Master them and you can play thousands of songs!',
      },
      {
        name: 'Free jam session',
        minutes: 8,
        steps: [
          'Turn on the drone and set the metronome to a comfortable tempo',
          'Just play! Use anything you\'ve learned this week',
          'Mix scales, chords, single notes, bends — whatever feels good',
          'Try to "tell a story" with your playing: start quiet, build up, bring it back down',
          'This is YOUR time to be creative. No wrong notes, no rules!',
        ],
        tip: 'The best practice is the kind where you forget you\'re practicing. Have fun with it!',
      },
    ],
    getPositions: (key) => {
      const scale = getMajorScale(key);
      const roleMap = buildRoleMap(scale, ['1P','2M','3M','4P','5P','6M','7M']);
      return getNotesOnFretboard(scale, roleMap);
    },
  },
];

// ── Exercise Dropdown Card ──────────────────────────────────────────────────
function ExerciseCard({ exercise, idx, done, expanded, onToggleDone, onToggleExpand, selectedKey, dayGetPositions, displayMode }) {
  const positions = useMemo(() => {
    const getPos = exercise.getPositions || dayGetPositions;
    return getPos(selectedKey);
  }, [exercise, selectedKey, dayGetPositions]);

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${
      done
        ? 'bg-emerald-500/8 border-emerald-500/25'
        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
    }`}>
      {/* Collapsed header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggleExpand}>
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            done
              ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'border-zinc-600 hover:border-zinc-400'
          }`}
        >
          {done && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Title + duration */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-semibold ${done ? 'text-emerald-400 line-through opacity-70' : 'text-zinc-100'}`}>
            {exercise.name}
          </span>
        </div>

        {/* Duration badge */}
        <span className="text-xs text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-md flex-shrink-0">
          {exercise.minutes} min
        </span>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04]">
          {/* Steps */}
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">How to do it</h4>
            <ol className="space-y-2">
              {exercise.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="text-orange-400/70 font-bold text-xs mt-0.5 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tip */}
          {exercise.tip && (
            <div className="flex gap-2.5 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2.5">
              <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-amber-200/70 leading-relaxed">{exercise.tip}</p>
            </div>
          )}

          {/* Mini fretboard */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Reference Fretboard</h4>
            <div className="rounded-lg overflow-hidden border border-white/[0.04]">
              <Fretboard positions={positions} displayMode={displayMode} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function DailyPracticeSection({ selectedKey, sectionElapsed, currentSection, onSectionChange }) {
  const plan = DAILY_PLANS[DAY_INDEX];
  const suggestedKey = getSuggestedKey();
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Load completion state
  const [completedExercises, setCompletedExercises] = useState(() => {
    const data = loadDailyData();
    return data[todayStr()]?.completed || [];
  });

  const streak = useMemo(() => getStreak(), [completedExercises]);

  const toggleExercise = useCallback((idx) => {
    setCompletedExercises(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
      const data = loadDailyData();
      data[todayStr()] = { completed: next };
      saveDailyData(data);
      return next;
    });
  }, []);

  const handleDisplayMode = useCallback((mode) => {
    setDisplayMode(mode);
    localStorage.setItem('fretboard-display-mode', mode);
  }, []);

  const progress = plan.exercises.length > 0
    ? Math.round((completedExercises.length / plan.exercises.length) * 100)
    : 0;

  const totalMinutes = plan.exercises.reduce((sum, ex) => sum + ex.minutes, 0);

  return (
    <SectionLayout
      title="Daily Practice"
      description={`${plan.day} — ${plan.theme}`}
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Header card */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{plan.icon}</span>
                <h3 className="text-xl font-bold text-white">{plan.theme}</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
              <p className="text-xs text-slate-600 mt-2">~{totalMinutes} minutes total</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Suggested key</div>
              <div className="text-lg font-bold text-violet-400">{suggestedKey}</div>
              {streak > 0 && (
                <div className="mt-1 text-xs text-amber-400 font-medium">
                  {streak} day streak 🔥
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-slate-400 font-medium">{completedExercises.length}/{plan.exercises.length} exercises</span>
            </div>
            <div className="w-full h-2 bg-white/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Display mode toggle */}
        <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />

        {/* Exercise cards */}
        <div className="space-y-2">
          {plan.exercises.map((ex, idx) => (
            <ExerciseCard
              key={idx}
              exercise={ex}
              idx={idx}
              done={completedExercises.includes(idx)}
              expanded={expandedIdx === idx}
              onToggleDone={() => toggleExercise(idx)}
              onToggleExpand={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              selectedKey={selectedKey}
              dayGetPositions={plan.getPositions}
              displayMode={displayMode}
            />
          ))}
        </div>

        {/* Quick jump */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Jump to:</span>
          <button
            onClick={() => onSectionChange(plan.section)}
            className="px-3 py-1 text-xs rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 transition-colors"
          >
            {plan.theme} section
          </button>
        </div>

        {/* Week overview */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">This Week</h3>
          <div className="grid grid-cols-7 gap-1">
            {DAILY_PLANS.map((p, i) => {
              const d = new Date();
              d.setDate(d.getDate() - DAY_INDEX + i);
              const dateStr = d.toISOString().slice(0, 10);
              const data = loadDailyData();
              const dayCompleted = data[dateStr]?.completed?.length || 0;
              const isToday = i === DAY_INDEX;
              return (
                <div
                  key={i}
                  className={`rounded-lg p-2 text-center border transition-colors ${
                    isToday
                      ? 'bg-violet-500/15 border-violet-500/30'
                      : dayCompleted > 0
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-slate-900/40 border-white/[0.05]'
                  }`}
                >
                  <div className="text-xs text-slate-600">{p.day.slice(0, 3)}</div>
                  <div className={`text-sm mt-0.5 ${isToday ? 'text-violet-300 font-bold' : 'text-slate-400'}`}>
                    {p.icon}
                  </div>
                  {dayCompleted > 0 && !isToday && (
                    <div className="text-xs text-green-400 mt-0.5">✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
