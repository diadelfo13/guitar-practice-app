import { useState, useMemo, useCallback } from 'react';
import { Note } from 'tonal';
import { INTERVAL_DEFINITIONS, getIntervalNote } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap, normalizePc } from '../../lib/fretboard';
import { ROLE_COLORS, INTERVAL_TO_ROLE } from '../../lib/constants';
import { playNote } from '../../lib/audioEngine';
import Fretboard from '../fretboard/Fretboard';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const QUALITY_COLORS = {
  perfect: 'text-cyan-400',
  consonant: 'text-emerald-400',
  dissonant: 'text-rose-400',
  step: 'text-amber-400',
};

const SOUND_CHARACTERS = {
  0:  'Same note. Unison. Stable.',
  1:  'Half step. Maximum tension.',
  2:  'Whole step. Melodic motion.',
  3:  'Minor 3rd. Minor chord foundation. Dark, soulful.',
  4:  'Major 3rd. Major chord foundation. Bright, happy.',
  5:  'Perfect 4th. Open and stable. Very common melodic interval.',
  6:  'Tritone. Maximum dissonance. Pulls in two directions.',
  7:  'Perfect 5th. Power chord. Open, strong, stable.',
  8:  'Minor 6th = inverted major 3rd. Warm, bittersweet.',
  9:  'Major 6th = inverted minor 3rd. Bright, sweet.',
  10: 'Minor 7th. Dominant feel. Wants to resolve down.',
  11: 'Major 7th. Half-step below octave. Dreamy tension.',
  12: 'Octave. Same note, different register. Resolved.',
};

export default function IntervalsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedInterval, setSelectedInterval] = useState(7); // default perfect 5th

  const iv = INTERVAL_DEFINITIONS[selectedInterval];
  const intervalNote = useMemo(() => getIntervalNote(selectedKey, iv.semitones), [selectedKey, iv]);

  const rootColor = ROLE_COLORS.root;
  const ivRole = INTERVAL_TO_ROLE[iv.tonal] || 'scale';
  const ivColor = ROLE_COLORS[ivRole] || ROLE_COLORS.scale;

  const positions = useMemo(() => {
    const notes = [selectedKey, intervalNote].filter(Boolean);
    const uniqueNotes = [...new Set(notes.map(n => normalizePc(n)))];
    const roleMap = {};
    roleMap[normalizePc(selectedKey)] = '1P';
    roleMap[normalizePc(intervalNote)] = iv.tonal;
    return getNotesOnFretboard(uniqueNotes, roleMap);
  }, [selectedKey, intervalNote, iv]);

  return (
    <SectionLayout
      title="Intervals"
      description="All 13 intervals from the root. Understanding intervals is the foundation of music theory."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Interval grid */}
        <div className="grid grid-cols-7 gap-1">
          {INTERVAL_DEFINITIONS.map((ivDef, i) => (
            <button
              key={i}
              onClick={() => setSelectedInterval(i)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all border ${
                selectedInterval === i
                  ? 'bg-violet-500/15 border-violet-500/40'
                  : 'bg-white/[0.04] border-white/[0.05] hover:border-white/[0.08]'
              }`}
            >
              <span className={`text-xs font-bold ${selectedInterval === i ? 'text-violet-300' : 'text-slate-400'}`}>
                {ivDef.abbr}
              </span>
              <span className="text-xs text-slate-600">{ivDef.semitones}st</span>
            </button>
          ))}
        </div>

        {/* Active interval info */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{iv.name}</span>
                <span className={`text-sm font-mono px-2 py-0.5 rounded bg-white/[0.07] ${QUALITY_COLORS[iv.quality]}`}>
                  {iv.abbr}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{SOUND_CHARACTERS[iv.semitones]}</p>
              <p className="text-xs text-slate-600 mt-1">{iv.semitones} semitone{iv.semitones !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: rootColor + 'cc' }}>
                  {selectedKey}
                </div>
                <span className="text-xs text-slate-600">Root</span>
              </div>
              <span className="text-slate-600 text-xl">→</span>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: ivColor + 'cc' }}>
                  {intervalNote}
                </div>
                <span className="text-xs text-slate-600">{iv.abbr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ear Training Controls */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => playNote(Note.midi(selectedKey + '4'), 0.6)}
            className="px-4 py-2 rounded-lg text-sm font-medium border bg-white/[0.04] border-white/[0.05] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all active:scale-95"
          >
            🔊 Play Root ({selectedKey})
          </button>
          <button
            onClick={() => playNote(Note.midi(intervalNote + '4'), 0.6)}
            className="px-4 py-2 rounded-lg text-sm font-medium border bg-white/[0.04] border-white/[0.05] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all active:scale-95"
          >
            🔊 Play {iv.abbr} ({intervalNote})
          </button>
          <button
            onClick={() => {
              playNote(Note.midi(selectedKey + '4'), 0.6);
              setTimeout(() => playNote(Note.midi(intervalNote + '4'), 0.6), 400);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium border bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25 transition-all active:scale-95"
          >
            🎵 Play Both (ascending)
          </button>
          <button
            onClick={() => {
              playNote(Note.midi(selectedKey + '4'), 0.6);
              playNote(Note.midi(intervalNote + '4'), 0.6);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium border bg-white/[0.04] border-white/[0.05] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all active:scale-95"
          >
            🎶 Play Together
          </button>
        </div>

        {/* Fretboard */}
        <div>
          <p className="text-xs text-slate-500 mb-2">
            Red = root ({selectedKey}) &nbsp;·&nbsp; Colored = {iv.name} ({intervalNote})
          </p>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Sing the interval: play root, sing the target note before playing it</li>
            <li>• Play intervals on a single string — feel the distance physically</li>
            <li>• Play same interval across all string pairs</li>
            <li>• Identify intervals in songs you know by ear</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
