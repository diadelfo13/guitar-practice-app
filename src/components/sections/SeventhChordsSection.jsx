import { useState, useMemo } from 'react';
import { getMajorScale, getDiatonicChords, SEVENTH_TYPES } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const QUALITY_DESCRIPTIONS = {
  maj7:   'Major 7th — the "smooth jazz" chord. Root, major 3rd, perfect 5th, major 7th.',
  m7:     'Minor 7th — soulful and rich. Root, minor 3rd, perfect 5th, minor 7th.',
  '7':    'Dominant 7th — tension that wants to resolve. Root, major 3rd, perfect 5th, minor 7th.',
  m7b5:   'Half-Diminished (ø7) — tense, mysterious. Root, minor 3rd, diminished 5th, minor 7th.',
  dim7:   'Diminished 7th — maximum tension. All minor thirds stacked.',
  mM7:    'Minor-Major 7th — dark but dreamy. Minor chord with a major 7th.',
};

export default function SeventhChordsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedDegree, setSelectedDegree] = useState(0);

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const diatonicSevenths = useMemo(() => getDiatonicChords(selectedKey, 'seventh'), [selectedKey]);

  const activeChord = diatonicSevenths[selectedDegree];

  const intervals = useMemo(() => {
    const type = SEVENTH_TYPES.find(t => t.symbol === activeChord?.quality);
    return type?.intervals || ['1P','3M','5P','7M'];
  }, [activeChord]);

  const positions = useMemo(() => {
    if (!activeChord?.notes?.length) return [];
    const roleMap = buildRoleMap(activeChord.notes, intervals);
    return getNotesOnFretboard(activeChord.notes, roleMap);
  }, [activeChord, intervals]);

  const ROLE_LABELS = { '1P':'Root','3M':'Maj 3rd','3m':'Min 3rd','5P':'5th','5d':'b5','7M':'Maj 7','7m':'Min 7','7d':'bb7' };

  const legendItems = intervals.map((iv, i) => ({
    role: iv,
    label: `${ROLE_LABELS[iv] || iv} (${activeChord?.notes?.[i] || ''})`,
  }));

  return (
    <SectionLayout
      title="7th Chords"
      description="Diatonic seventh chords — the backbone of jazz and extended harmony."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Degree selector */}
        <div className="flex gap-2 flex-wrap">
          {diatonicSevenths.map((ch, i) => (
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
              <span className="font-bold text-sm text-white">{ch.root}</span>
              <span className="text-xs text-slate-500">{ch.quality}</span>
            </button>
          ))}
        </div>

        {activeChord && (
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl font-bold text-white">{activeChord.root}{activeChord.quality}</span>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {QUALITY_DESCRIPTIONS[activeChord.quality] || ''}
                </p>
              </div>
              <div className="flex gap-1.5">
                {activeChord.notes.map((n, i) => (
                  <div key={i} className={`flex flex-col items-center`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                    }`}>{n}</div>
                    <span className="text-xs text-slate-600 mt-0.5">{['R','3','5','7'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full Neck</h3>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        {/* All 7ths reference */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">All Diatonic 7th Chords</h3>
          <div className="grid grid-cols-7 gap-1">
            {diatonicSevenths.map((ch, i) => (
              <div key={i} className="bg-slate-900/40 rounded p-2 text-center border border-white/[0.05]">
                <div className="text-xs text-slate-600">{ch.roman}</div>
                <div className="text-xs font-bold text-slate-300">{ch.root}</div>
                <div className="text-xs text-violet-400/70">{ch.quality}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Play each chord tone one at a time — hear the color of each interval</li>
            <li>• Solo over the drone using only the chord tones (arpeggiate)</li>
            <li>• Focus on the 3rd and 7th — they define the chord quality most</li>
            <li>• Play ii-V-I in this key: {scale[1]}m7 → {scale[4]}7 → {scale[0]}maj7</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
