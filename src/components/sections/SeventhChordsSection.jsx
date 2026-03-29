import { useState, useMemo } from 'react';
import { getMajorScale, getDiatonicChords, getChordNotes, SEVENTH_TYPES } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const SEVENTH_OPTIONS = [
  { symbol: 'maj7',  label: 'Major 7th',       intervals: ['1P','3M','5P','7M'] },
  { symbol: 'm7',    label: 'Minor 7th',       intervals: ['1P','3m','5P','7m'] },
  { symbol: '7',     label: 'Dominant 7th',     intervals: ['1P','3M','5P','7m'] },
  { symbol: 'm7b5',  label: 'Half-Dim',         intervals: ['1P','3m','5d','7m'] },
  { symbol: 'dim7',  label: 'Diminished 7th',   intervals: ['1P','3m','5d','7d'] },
  { symbol: 'mM7',   label: 'Minor-Maj 7th',    intervals: ['1P','3m','5P','7M'] },
];

const QUALITY_DESCRIPTIONS = {
  maj7:   'Smooth and dreamy. The "jazz standard" major chord. Root, major 3rd, perfect 5th, major 7th.',
  m7:     'Soulful and rich. Works beautifully in R&B, neo-soul, jazz. Root, minor 3rd, perfect 5th, minor 7th.',
  '7':    'Built-in tension that wants to resolve. The dominant chord. Root, major 3rd, perfect 5th, minor 7th.',
  m7b5:   'Mysterious and tense. The ii chord in minor keys. Root, minor 3rd, diminished 5th, minor 7th.',
  dim7:   'Maximum tension. All notes are a minor 3rd apart — fully symmetrical.',
  mM7:    'Dark but dreamy. A minor chord topped with a major 7th. Rare but beautiful.',
};

export default function SeventhChordsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedDegree, setSelectedDegree] = useState(0);
  const [typeOverride, setTypeOverride] = useState(null);

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const diatonicSevenths = useMemo(() => getDiatonicChords(selectedKey, 'seventh'), [selectedKey]);

  const diatonicChord = diatonicSevenths[selectedDegree];
  const root = diatonicChord?.root || selectedKey;

  // Active type
  const activeType = typeOverride || diatonicChord?.quality || 'maj7';
  const typeDef = SEVENTH_OPTIONS.find(t => t.symbol === activeType) || SEVENTH_OPTIONS[0];

  // Get chord notes
  const chordNotes = useMemo(() => {
    return getChordNotes(root, activeType);
  }, [root, activeType]);

  const positions = useMemo(() => {
    if (!chordNotes.length) return [];
    const roleMap = buildRoleMap(chordNotes, typeDef.intervals);
    return getNotesOnFretboard(chordNotes, roleMap);
  }, [chordNotes, typeDef]);

  const chordName = `${root}${activeType}`;
  const isDiatonic = activeType === diatonicChord?.quality;

  const ROLE_LABELS = { '1P':'Root','3M':'Maj 3rd','3m':'Min 3rd','5P':'5th','5d':'♭5','5A':'♯5','7M':'Maj 7th','7m':'Min 7th','7d':'dim 7th' };

  const legendItems = typeDef.intervals.slice(0, chordNotes.length).map((iv, i) => ({
    role: iv,
    label: `${ROLE_LABELS[iv] || iv} (${chordNotes[i] || ''})`,
  }));

  return (
    <SectionLayout
      title="7th Chords"
      description="Four-note chords that add richness and color. Pick a root, then switch between types."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Root note selector */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Root Note</h3>
          <div className="flex gap-2 flex-wrap">
            {diatonicSevenths.map((ch, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDegree(i); setTypeOverride(null); }}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all border ${
                  selectedDegree === i
                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                }`}
              >
                <span className="text-xs text-slate-500">{ch.roman}</span>
                <span className="font-bold text-sm">{ch.root}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 7th chord type selector */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">7th Chord Type</h3>
          <div className="flex gap-2 flex-wrap">
            {SEVENTH_OPTIONS.map((type) => {
              const isActive = activeType === type.symbol;
              const isDiatonicType = diatonicChord?.quality === type.symbol;
              return (
                <button
                  key={type.symbol}
                  onClick={() => setTypeOverride(type.symbol === diatonicChord?.quality ? null : type.symbol)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                  }`}
                >
                  {type.label}
                  {isDiatonicType && (
                    <span className="ml-1.5 text-xs text-slate-600">(in key)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active chord info */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{chordName}</span>
                <span className="text-sm text-slate-500">{typeDef.label}</span>
                {isDiatonic && (
                  <span className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-md border border-violet-500/25">
                    In key
                  </span>
                )}
                {!isDiatonic && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Outside key
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {QUALITY_DESCRIPTIONS[activeType] || ''}
              </p>
            </div>
            <div className="flex gap-1.5">
              {chordNotes.map((n, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                  }`}>{n}</div>
                  <span className="text-xs text-slate-600 mt-0.5">{['R','3','5','7'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fretboard */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {chordName} — Full Neck
          </h3>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        {/* All diatonic 7ths reference */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All 7th Chords in {selectedKey} Major</h3>
          <div className="grid grid-cols-7 gap-1">
            {diatonicSevenths.map((ch, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDegree(i); setTypeOverride(null); }}
                className={`rounded-lg p-2 text-center border transition-all cursor-pointer ${
                  selectedDegree === i && isDiatonic
                    ? 'bg-violet-500/15 border-violet-500/30'
                    : 'bg-slate-900/40 border-white/[0.05] hover:border-white/[0.08]'
                }`}
              >
                <div className="text-xs text-slate-600">{ch.roman}</div>
                <div className="text-xs font-bold text-slate-300">{ch.root}</div>
                <div className="text-xs text-violet-400/70">{ch.quality}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Try switching between Maj7 and m7 on the same root — hear the mood change</li>
            <li>• The 3rd and 7th define the chord quality most — focus on those notes</li>
            <li>• Play ii-V-I in this key: {scale[1]}m7 → {scale[4]}7 → {scale[0]}maj7</li>
            <li>• Click notes on the fretboard to hear each chord tone</li>
            <li>• Compare Dominant 7th with Major 7th — only one note difference!</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
