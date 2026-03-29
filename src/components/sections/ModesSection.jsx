import { useState, useMemo } from 'react';
import { MODE_DEFINITIONS, getModeNotes, getMajorScale } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import { ROLE_COLORS } from '../../lib/constants';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

export default function ModesSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedMode, setSelectedMode] = useState(0);

  const mode = MODE_DEFINITIONS[selectedMode];

  const notes = useMemo(() => {
    return getModeNotes(selectedKey, mode.scaleType);
  }, [selectedKey, mode]);

  // Build role map, marking the characteristic note specially
  const positions = useMemo(() => {
    if (!notes.length) return [];
    const roleMap = buildRoleMap(notes, mode.intervals);
    // Override characteristic note color
    if (mode.characteristicDegree !== null && notes[mode.characteristicDegree]) {
      const charNote = notes[mode.characteristicDegree];
      roleMap[charNote] = 'characteristic';
    }
    return getNotesOnFretboard(notes, roleMap);
  }, [notes, mode]);

  const parentKey = useMemo(() => {
    // Find the parent major key: selectedKey is degree `mode.degree` of the parent
    const parentScale = getMajorScale(selectedKey); // not quite right — we need the parent
    // The parent key is found by going back `degree-1` steps on the circle
    // Simplest: use Tonal's Scale parent lookup
    return null; // skip for now, show relative info
  }, [selectedKey, mode]);

  const legendItems = useMemo(() => {
    const items = [{ role: 'root', label: `Root (${notes[0] || ''})` }];
    if (mode.characteristicDegree !== null && notes[mode.characteristicDegree]) {
      items.push({ role: 'characteristic', label: `Characteristic: ${notes[mode.characteristicDegree]} (${mode.intervals[mode.characteristicDegree]})` });
    }
    items.push({ role: 'scale', label: 'Other notes' });
    return items;
  }, [notes, mode]);

  return (
    <SectionLayout
      title="Major Modes"
      description="Each mode of the major scale, emphasizing its characteristic note."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Mode selector */}
        <div className="flex gap-2 flex-wrap">
          {MODE_DEFINITIONS.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMode(i)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${
                selectedMode === i
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
              }`}
            >
              <span className="block text-xs text-slate-600">{m.degree}</span>
              {m.name}
            </button>
          ))}
        </div>

        {/* Mode info */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05] space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedKey} {mode.name}
                {mode.alias && <span className="text-sm text-slate-500 ml-2">({mode.alias})</span>}
              </h3>
              <p className="text-sm text-violet-400 font-medium mt-0.5">{mode.character}</p>
              <p className="text-sm text-slate-400 mt-1">{mode.description}</p>
            </div>
          </div>

          {/* Scale notes with characteristic highlighted */}
          <div className="flex gap-2 flex-wrap">
            {notes.map((note, i) => {
              const isRoot = i === 0;
              const isChar = mode.characteristicDegree !== null && i === mode.characteristicDegree;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold relative ${
                    isRoot ? 'bg-violet-500 text-white' :
                    isChar ? 'bg-amber-400 text-black ring-2 ring-amber-300' :
                    'bg-white/[0.07] text-slate-200'
                  }`}>
                    {note}
                    {isChar && <span className="absolute -top-1 -right-1 text-xs">★</span>}
                  </div>
                  <span className="text-xs text-slate-600 mt-1">{mode.intervals[i]}</span>
                </div>
              );
            })}
          </div>

          {mode.characteristicDegree !== null && (
            <div className="flex items-center gap-2 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <span className="text-amber-400">★</span>
              <span className="text-amber-300 font-medium">Characteristic note: {notes[mode.characteristicDegree]}</span>
              <span className="text-slate-500">— {mode.tips}</span>
            </div>
          )}
        </div>

        {/* Intervals reference */}
        <div className="grid grid-cols-7 gap-1">
          {mode.intervals.map((iv, i) => (
            <div key={i} className={`rounded p-2 text-center border text-xs ${
              mode.characteristicDegree === i
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-900/40 border-white/[0.05] text-slate-500'
            }`}>
              <div className="font-mono">{iv}</div>
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full Neck</h3>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Start and end on the root — establish the tonal center</li>
            <li>• Bend to and from the characteristic note ★</li>
            <li>• Play the scale up, pause on the characteristic note, resolve to root</li>
            <li>• Compare: play the same root in Ionian, then switch to this mode</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
