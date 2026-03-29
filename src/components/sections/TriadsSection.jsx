import { useState, useMemo } from 'react';
import { getMajorScale, getDiatonicChords, getChordNotes, TRIAD_TYPES } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

export default function TriadsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedDegree, setSelectedDegree] = useState(0); // 0-6 index
  const [selectedType, setSelectedType] = useState(null); // null = diatonic, or override

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const diatonicTriads = useMemo(() => getDiatonicChords(selectedKey, 'triad'), [selectedKey]);

  const activeChord = diatonicTriads[selectedDegree];

  const triadIntervals = useMemo(() => {
    const type = TRIAD_TYPES.find(t => t.symbol === activeChord?.quality) || TRIAD_TYPES[0];
    return type.intervals;
  }, [activeChord]);

  const positions = useMemo(() => {
    if (!activeChord) return [];
    const notes = activeChord.notes;
    const roleMap = buildRoleMap(notes, triadIntervals);
    return getNotesOnFretboard(notes, roleMap);
  }, [activeChord, triadIntervals]);

  const legendItems = [
    { role: 'root', label: `Root (${activeChord?.root})` },
    { role: '3M',   label: 'Major 3rd' },
    { role: '3m',   label: 'Minor 3rd' },
    { role: '5P',   label: 'Perfect 5th' },
    { role: '5d',   label: 'Diminished 5th' },
  ].filter(i => {
    const r = i.role;
    if (!activeChord) return false;
    if (r === 'root') return true;
    if (r === '3M' && activeChord.quality === 'M') return true;
    if (r === '3m' && (activeChord.quality === 'm' || activeChord.quality === 'dim')) return true;
    if (r === '5P' && activeChord.quality !== 'dim') return true;
    if (r === '5d' && activeChord.quality === 'dim') return true;
    return false;
  });

  return (
    <SectionLayout
      title="Triads"
      description="Diatonic triads in the key. Select a degree to see the chord across the neck."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Degree selector */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Chord Degree</h3>
          <div className="flex gap-2 flex-wrap">
            {diatonicTriads.map((ch, i) => (
              <button
                key={i}
                onClick={() => setSelectedDegree(i)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all border ${
                  selectedDegree === i
                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                }`}
              >
                <span className="text-xs text-slate-500">{ch.roman}</span>
                <span className="font-bold text-sm">{ch.root}{ch.quality === 'm' ? 'm' : ch.quality === 'dim' ? '°' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active chord info */}
        {activeChord && (
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-white">
                  {activeChord.root}{activeChord.quality === 'm' ? 'm' : activeChord.quality === 'dim' ? '°' : ''}
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  ({['I','II','III','IV','V','VI','VII'][selectedDegree]} chord)
                </span>
              </div>
              <div className="flex gap-2">
                {activeChord.notes.map((n, i) => (
                  <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                  }`}>{n}</div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {['Tonic','Supertonic','Mediant','Subdominant','Dominant','Submediant','Leading Tone'][selectedDegree]} —{' '}
              {['major','minor','minor','major','major','minor','diminished'][selectedDegree]} triad
            </p>
          </div>
        )}

        {/* Fretboard */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full Neck</h3>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        {/* All diatonic triads reference */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All Diatonic Triads</h3>
          <div className="grid grid-cols-7 gap-1">
            {diatonicTriads.map((ch, i) => (
              <div key={i} className="bg-slate-900/40 rounded p-2 text-center border border-white/[0.05]">
                <div className="text-xs text-slate-600">{ch.roman}</div>
                <div className="text-xs font-bold text-slate-300">
                  {ch.root}{ch.quality === 'm' ? 'm' : ch.quality === 'dim' ? '°' : ''}
                </div>
                <div className="text-xs text-slate-600">{ch.notes.join('-')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Play each triad in root position, 1st inversion, 2nd inversion</li>
            <li>• Connect triads across the neck horizontally (same strings)</li>
            <li>• Land on the root each time — feel the resolution</li>
            <li>• Try playing the triad, then soloing over the drone with just those 3 notes</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
