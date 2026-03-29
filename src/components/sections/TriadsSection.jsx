import { useState, useMemo } from 'react';
import { getMajorScale, getDiatonicChords, getChordNotes, TRIAD_TYPES } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const TRIAD_OPTIONS = [
  { symbol: 'M',   label: 'Major',      intervals: ['1P','3M','5P'], color: 'violet' },
  { symbol: 'm',   label: 'Minor',      intervals: ['1P','3m','5P'], color: 'blue' },
  { symbol: 'dim', label: 'Diminished', intervals: ['1P','3m','5d'], color: 'rose' },
  { symbol: 'aug', label: 'Augmented',  intervals: ['1P','3M','5A'], color: 'amber' },
  { symbol: 'sus2', label: 'Sus2',      intervals: ['1P','2M','5P'], color: 'teal' },
  { symbol: 'sus4', label: 'Sus4',      intervals: ['1P','4P','5P'], color: 'emerald' },
];

export default function TriadsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedDegree, setSelectedDegree] = useState(0);
  const [typeOverride, setTypeOverride] = useState(null); // null = use diatonic quality

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const diatonicTriads = useMemo(() => getDiatonicChords(selectedKey, 'triad'), [selectedKey]);

  const diatonicChord = diatonicTriads[selectedDegree];
  const root = diatonicChord?.root || selectedKey;

  // Determine which triad type to show
  const activeType = typeOverride || diatonicChord?.quality || 'M';
  const triadDef = TRIAD_OPTIONS.find(t => t.symbol === activeType) || TRIAD_OPTIONS[0];

  // Get the actual chord notes for the selected root + type
  const chordNotes = useMemo(() => {
    const suffix = activeType === 'M' ? '' : activeType;
    return getChordNotes(root, suffix);
  }, [root, activeType]);

  const positions = useMemo(() => {
    if (!chordNotes.length) return [];
    const roleMap = buildRoleMap(chordNotes, triadDef.intervals);
    return getNotesOnFretboard(chordNotes, roleMap);
  }, [chordNotes, triadDef]);

  // Build display name
  const chordName = useMemo(() => {
    if (activeType === 'M') return root;
    if (activeType === 'm') return `${root}m`;
    if (activeType === 'dim') return `${root}°`;
    if (activeType === 'aug') return `${root}+`;
    if (activeType === 'sus2') return `${root}sus2`;
    if (activeType === 'sus4') return `${root}sus4`;
    return `${root}${activeType}`;
  }, [root, activeType]);

  const legendItems = useMemo(() => {
    const items = [{ role: '1P', label: `Root (${root})` }];
    if (triadDef.intervals.includes('2M')) items.push({ role: '2M', label: 'Major 2nd' });
    if (triadDef.intervals.includes('3M')) items.push({ role: '3M', label: 'Major 3rd' });
    if (triadDef.intervals.includes('3m')) items.push({ role: '3m', label: 'Minor 3rd' });
    if (triadDef.intervals.includes('4P')) items.push({ role: '4P', label: 'Perfect 4th' });
    if (triadDef.intervals.includes('5P')) items.push({ role: '5P', label: 'Perfect 5th' });
    if (triadDef.intervals.includes('5d')) items.push({ role: '5d', label: 'Diminished 5th' });
    if (triadDef.intervals.includes('5A')) items.push({ role: '5A', label: 'Augmented 5th' });
    return items;
  }, [root, triadDef]);

  const isDiatonic = activeType === diatonicChord?.quality;

  return (
    <SectionLayout
      title="Triads"
      description="Explore triad shapes across the fretboard. Pick a root note, then switch between chord types."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Root note selector (from diatonic degrees) */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Root Note</h3>
          <div className="flex gap-2 flex-wrap">
            {diatonicTriads.map((ch, i) => (
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

        {/* Triad type selector */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Triad Type</h3>
          <div className="flex gap-2 flex-wrap">
            {TRIAD_OPTIONS.map((type) => {
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{chordName}</span>
                <span className="text-sm text-slate-500">{triadDef.label}</span>
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
              <p className="text-xs text-slate-500 mt-1">
                Formula: {triadDef.intervals.map(iv => {
                  const labels = { '1P': 'R', '2M': '2', '3M': '3', '3m': '♭3', '4P': '4', '5P': '5', '5d': '♭5', '5A': '♯5' };
                  return labels[iv] || iv;
                }).join(' – ')}
              </p>
            </div>
            <div className="flex gap-2">
              {chordNotes.map((n, i) => (
                <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                }`}>{n}</div>
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

        {/* All diatonic triads reference */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All Chords in {selectedKey} Major</h3>
          <div className="grid grid-cols-7 gap-1">
            {diatonicTriads.map((ch, i) => (
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
                <div className="text-xs font-bold text-slate-300">
                  {ch.root}{ch.quality === 'm' ? 'm' : ch.quality === 'dim' ? '°' : ''}
                </div>
                <div className="text-xs text-slate-600">{ch.notes.join('-')}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Try switching between Major and Minor on the same root — hear the mood change</li>
            <li>• The "in key" badge means this chord naturally belongs to the key</li>
            <li>• Click notes on the fretboard to hear each chord tone</li>
            <li>• Compare Diminished and Augmented to hear tension vs. brightness</li>
            <li>• Try Sus2 and Sus4 — they sound "open" because they have no major or minor 3rd</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
