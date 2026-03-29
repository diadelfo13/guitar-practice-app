import { useState, useMemo } from 'react';
import { getMinorScales } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const SCALE_TYPES = [
  {
    key: 'natural',
    label: 'Natural Minor',
    abbr: 'Natural',
    color: 'blue',
    intervals: ['1P','2M','3m','4P','5P','6m','7m'],
    description: 'The Aeolian mode. Dark, melancholic. The most common minor scale.',
    tips: 'b3, b6, b7 compared to major. Most natural-feeling minor scale.',
  },
  {
    key: 'harmonic',
    label: 'Harmonic Minor',
    abbr: 'Harmonic',
    color: 'purple',
    intervals: ['1P','2M','3m','4P','5P','6m','7M'],
    description: 'Natural minor with raised 7th. Creates a leading tone. Classical and Middle-Eastern flavor.',
    tips: 'The raised 7th (major 7th) creates the "exotic" augmented 2nd interval. Strong resolution to root.',
  },
  {
    key: 'melodic',
    label: 'Melodic Minor',
    abbr: 'Melodic',
    color: 'green',
    intervals: ['1P','2M','3m','4P','5P','6M','7M'],
    description: 'Natural minor with raised 6th AND 7th. Jazz\'s favorite minor scale. Ascending form.',
    tips: 'Only differs from major by the minor 3rd. Generates rich altered dominant chords.',
  },
];

const RAISED_DEGREES = {
  harmonic: [6], // raised 7th is index 6
  melodic:  [5, 6], // raised 6th and 7th are indices 5 and 6
  natural:  [],
};

export default function MinorScalesSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedScale, setSelectedScale] = useState('natural');
  const [compareMode, setCompareMode] = useState(false);

  const allScales = useMemo(() => getMinorScales(selectedKey), [selectedKey]);

  const scaleType = SCALE_TYPES.find(s => s.key === selectedScale);
  const notes = allScales[selectedScale] || [];

  const raisedDegrees = RAISED_DEGREES[selectedScale] || [];

  const positions = useMemo(() => {
    if (!notes.length) return [];
    const roleMap = buildRoleMap(notes, scaleType.intervals);
    // Mark raised degrees as 'characteristic'
    raisedDegrees.forEach(i => {
      if (notes[i]) roleMap[notes[i]] = 'characteristic';
    });
    return getNotesOnFretboard(notes, roleMap);
  }, [notes, scaleType, raisedDegrees]);

  const legendItems = [
    { role: 'root',           label: `Root (${notes[0] || ''})` },
    ...(raisedDegrees.length > 0 ? [{ role: 'characteristic', label: `Raised note (★)` }] : []),
    { role: 'scale',          label: 'Other notes' },
  ];

  return (
    <SectionLayout
      title="Minor Scales"
      description="Natural, Harmonic, and Melodic minor — three flavors of minor."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Scale type selector */}
        <div className="flex gap-2">
          {SCALE_TYPES.map(s => (
            <button
              key={s.key}
              onClick={() => setSelectedScale(s.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                selectedScale === s.key
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
              }`}
            >
              {s.abbr}
            </button>
          ))}
        </div>

        {/* Scale info */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] space-y-3">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedKey} {scaleType.label}</h3>
            <p className="text-sm text-slate-400 mt-1">{scaleType.description}</p>
          </div>

          {/* Notes */}
          <div className="flex gap-2 flex-wrap">
            {notes.map((note, i) => {
              const isRoot = i === 0;
              const isRaised = raisedDegrees.includes(i);
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold relative ${
                    isRoot   ? 'bg-violet-500 text-white' :
                    isRaised ? 'bg-amber-400 text-black ring-2 ring-amber-300' :
                    'bg-white/[0.07] text-slate-200'
                  }`}>
                    {note}
                    {isRaised && <span className="absolute -top-1 -right-1 text-xs">★</span>}
                  </div>
                  <span className="text-xs text-slate-600 mt-1">{scaleType.intervals[i]}</span>
                </div>
              );
            })}
          </div>

          {raisedDegrees.length > 0 && (
            <div className="text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-300">
              ★ {raisedDegrees.map(i => notes[i]).join(', ')} raised compared to natural minor — {scaleType.tips}
            </div>
          )}
        </div>

        {/* Comparison table */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Side-by-Side Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <td className="text-slate-600 p-1 pr-3">Degree</td>
                  {['1','2','♭3','4','5','6/♭6','7/♭7'].map((d,i) => (
                    <td key={i} className="text-slate-600 p-1 text-center w-10">{d}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCALE_TYPES.map(s => {
                  const scaleNotes = allScales[s.key] || [];
                  return (
                    <tr key={s.key} className={selectedScale === s.key ? 'bg-violet-500/5' : ''}>
                      <td className="text-slate-400 p-1 pr-3 font-medium whitespace-nowrap">{s.abbr}</td>
                      {scaleNotes.map((note, i) => {
                        const isRaised = RAISED_DEGREES[s.key].includes(i);
                        return (
                          <td key={i} className={`p-1 text-center font-mono font-bold ${
                            i === 0 ? 'text-violet-400' :
                            isRaised ? 'text-amber-400' :
                            'text-slate-300'
                          }`}>
                            {note}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fretboard */}
        <div>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Natural minor: default go-to for rock, pop, metal, folk</li>
            <li>• Harmonic minor: use over the V chord (dominant) in a minor key</li>
            <li>• Melodic minor: essential for jazz — generates altered scale patterns</li>
            <li>• Play all three back-to-back to hear the subtle differences</li>
            <li>• Focus on the ★ raised notes — they define each scale's character</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
