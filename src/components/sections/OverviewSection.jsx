import { useState, useMemo } from 'react';
import { getMajorScale, getDiatonicChords } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

export default function OverviewSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const diatonicChords = useMemo(() => getDiatonicChords(selectedKey, 'seventh'), [selectedKey]);

  const intervals = ['1P','2M','3M','4P','5P','6M','7M'];
  const roleMap = useMemo(() => buildRoleMap(scale, intervals), [scale]);
  const positions = useMemo(() => getNotesOnFretboard(scale, roleMap), [scale, roleMap]);

  const legendItems = useMemo(() => [
    { role: 'root',     label: `Root (${scale[0]})` },
    { role: '3M',       label: `3rd (${scale[2]})` },
    { role: '5P',       label: `5th (${scale[4]})` },
    { role: 'scale',    label: 'Other scale tones' },
  ], [scale]);

  return (
    <SectionLayout
      title={`Key of ${selectedKey} Major`}
      description="All notes of the major scale across the full neck."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-6">
        {/* Scale notes */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Scale Notes</h3>
          <div className="flex gap-2 flex-wrap">
            {scale.map((note, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                }`}>
                  {note}
                </div>
                <span className="text-xs text-slate-600 mt-1">{['I','II','III','IV','V','VI','VII'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fretboard */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Full Neck Map</h3>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        {/* Diatonic chords */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Diatonic 7th Chords</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {diatonicChords.map((ch, i) => (
              <div key={i} className="bg-white/[0.04] rounded-lg p-2 text-center border border-white/[0.05]">
                <div className="text-xs text-slate-500">{ch.roman}</div>
                <div className="font-bold text-sm text-white mt-0.5">{ch.root}</div>
                <div className="text-xs text-slate-500">{ch.quality}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice tips */}
        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Flow</h3>
          <ol className="space-y-1 text-sm text-slate-400 list-none">
            {[
              'Start drone → feel the key center',
              'Sing or hum the root as you play',
              'Navigate to each section below',
              'Start slow — clarity over speed',
            ].map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-violet-500 font-bold">{i+1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SectionLayout>
  );
}
