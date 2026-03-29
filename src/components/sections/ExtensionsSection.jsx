import { useState, useMemo } from 'react';
import { getMajorScale, getChordNotes, EXTENSION_TYPES } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const DESCRIPTIONS = {
  maj9:  'Lush, bright. The 9th adds color above the maj7. Classic jazz.',
  m9:    'Rich, emotional. Stacks beautifully for ballads and neo-soul.',
  '9':   'Tension + color. The core jazz-funk chord.',
  '11':  'Open and modal. Works well in minor contexts.',
  maj13: 'The "everything" chord. Full diatonic harmony collapsed into one.',
  '13':  'Dominant with maximum color. Resolves powerfully to the I.',
};

export default function ExtensionsSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedExt, setSelectedExt] = useState(0);

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const ext = EXTENSION_TYPES[selectedExt];

  const notes = useMemo(() => {
    const chord = getChordNotes(scale[0], ext.symbol);
    return chord.length ? chord : [];
  }, [scale, ext]);

  const positions = useMemo(() => {
    if (!notes.length) return [];
    const roleMap = buildRoleMap(notes, ext.intervals);
    return getNotesOnFretboard(notes, roleMap);
  }, [notes, ext]);

  const ROLE_LABELS = {
    '1P':'Root','3M':'Maj 3','3m':'Min 3','5P':'5th',
    '7M':'Maj 7','7m':'Min 7','9M':'9th','11P':'11th','13M':'13th'
  };

  const legendItems = ext.intervals.slice(0, notes.length).map((iv, i) => ({
    role: iv,
    label: `${ROLE_LABELS[iv] || iv}${notes[i] ? ` (${notes[i]})` : ''}`,
  }));

  return (
    <SectionLayout
      title="Extensions"
      description="9ths, 11ths, 13ths — color tones stacked above the 7th chord."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Extension type selector */}
        <div className="flex gap-2 flex-wrap">
          {EXTENSION_TYPES.map((e, i) => (
            <button
              key={i}
              onClick={() => setSelectedExt(i)}
              className={`px-4 py-2 rounded-lg font-bold transition-all border ${
                selectedExt === i
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                  : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
              }`}
            >
              {scale[0]}{e.symbol}
            </button>
          ))}
        </div>

        {/* Info card */}
        <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{scale[0]}{ext.symbol}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">{DESCRIPTIONS[ext.symbol]}</p>
            </div>
            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
              {notes.map((n, i) => {
                const label = ROLE_LABELS[ext.intervals[i]];
                const isExt = ['9th','11th','13th'].includes(label);
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-violet-500 text-white' : isExt ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/[0.07] text-slate-200'
                    }`}>{n}</div>
                    <span className="text-xs text-slate-600 mt-0.5">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
          <Fretboard positions={positions} displayMode={displayMode} />
          <FretboardLegend items={legendItems} />
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Extensions are "color" — use them sparingly at first</li>
            <li>• Arpeggiate from root to highest extension tone — hear each layer</li>
            <li>• On dominant chords, the b9 and #11 create strong tension</li>
            <li>• Drop extensions: voice the 9th below the 5th for easier grips</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
