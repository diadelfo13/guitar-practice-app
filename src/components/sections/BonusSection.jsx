import { useState, useMemo } from 'react';
import { getMajorScale, getPentatonicScales, getDiatonicChords } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

const SUB_SECTIONS = [
  { id: 'pentatonic',   label: 'Pentatonic' },
  { id: 'progressions', label: 'Progressions' },
  { id: 'caged',        label: 'CAGED' },
  { id: 'arpeggios',    label: 'Arpeggios' },
];

// Common chord progressions as degree arrays
const PROGRESSIONS = [
  { name: 'I-IV-V-I (Rock/Pop)',    degrees: [0, 3, 4, 0] },
  { name: 'I-V-vi-IV (Pop)',        degrees: [0, 4, 5, 3] },
  { name: 'I-vi-IV-V (50s)',        degrees: [0, 5, 3, 4] },
  { name: 'ii-V-I (Jazz)',          degrees: [1, 4, 0] },
  { name: 'I-IV-I-V (Blues)',       degrees: [0, 3, 0, 4] },
  { name: 'vi-IV-I-V (Minor feel)', degrees: [5, 3, 0, 4] },
];

export default function BonusSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [subSection, setSubSection] = useState('pentatonic');
  const [pentatonicType, setPentatonicType] = useState('minor');
  const [selectedProg, setSelectedProg] = useState(0);
  const [progDegree, setProgDegree] = useState(0);

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const pentatonics = useMemo(() => getPentatonicScales(selectedKey), [selectedKey]);
  const diatonicChords = useMemo(() => getDiatonicChords(selectedKey, 'triad'), [selectedKey]);

  // Pentatonic positions
  const pentatonicNotes = pentatonics[pentatonicType] || [];
  const pentatonicIntervals = pentatonicType === 'minor'
    ? ['1P','3m','4P','5P','7m']
    : pentatonicType === 'major'
    ? ['1P','2M','3M','5P','6M']
    : ['1P','3m','4P','4A','5P','7m']; // blues

  const pentatonicPositions = useMemo(() => {
    if (!pentatonicNotes.length) return [];
    const roleMap = buildRoleMap(pentatonicNotes, pentatonicIntervals);
    return getNotesOnFretboard(pentatonicNotes, roleMap);
  }, [pentatonicNotes, pentatonicIntervals]);

  // Progressions
  const prog = PROGRESSIONS[selectedProg];
  const progChords = prog.degrees.map(d => diatonicChords[d]);
  const activeProgChord = progChords[progDegree];
  const progPositions = useMemo(() => {
    if (!activeProgChord?.notes?.length) return [];
    const roleMap = buildRoleMap(activeProgChord.notes, ['1P','3M','5P']);
    return getNotesOnFretboard(activeProgChord.notes, roleMap);
  }, [activeProgChord]);

  return (
    <SectionLayout
      title="More Practice"
      description="Pentatonics, progressions, CAGED system, and arpeggios."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Sub-nav */}
        <div className="flex gap-2">
          {SUB_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSubSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                subSection === s.id
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* PENTATONIC */}
        {subSection === 'pentatonic' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['minor','major','blues'].map(t => (
                <button
                  key={t}
                  onClick={() => setPentatonicType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    pentatonicType === t
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white">{selectedKey} {pentatonicType.charAt(0).toUpperCase() + pentatonicType.slice(1)} Pentatonic</h3>
              <div className="flex gap-2 mt-3 flex-wrap">
                {pentatonicNotes.map((n, i) => (
                  <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                  }`}>{n}</div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {pentatonicType === 'minor' && 'Most used scale in rock, blues, pop solos. 5 notes = fewer "wrong" notes.'}
                {pentatonicType === 'major' && 'Country, folk, classic rock. Brighter than minor pentatonic.'}
                {pentatonicType === 'blues' && 'Minor pentatonic + blues note (b5/♯4). The essential blues scale.'}
              </p>
            </div>

            <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
            <Fretboard positions={pentatonicPositions} displayMode={displayMode} />
            <FretboardLegend items={[{ role: 'root', label: `Root (${pentatonicNotes[0]})` }, { role: 'scale', label: 'Scale notes' }]} />

            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">Box Patterns</h3>
              <p className="text-sm text-slate-400">There are 5 pentatonic box positions. Each root position (red dot) on this diagram is a starting point for a different box. Learn one box fully, then connect it to the adjacent one.</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>• Box 1: starts at low E root</li>
                <li>• Box 2: starts 3 frets higher on the A string</li>
                <li>• Connect boxes by finding shared notes at position seams</li>
              </ul>
            </div>
          </div>
        )}

        {/* PROGRESSIONS */}
        {subSection === 'progressions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {PROGRESSIONS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedProg(i); setProgDegree(0); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                    selectedProg === i
                      ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white mb-3">{prog.name}</h3>
              <div className="flex gap-2">
                {progChords.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setProgDegree(i)}
                    className={`flex-1 py-3 rounded-lg text-center border transition-all ${
                      progDegree === i
                        ? 'bg-violet-500 text-white border-violet-600'
                        : 'bg-white/[0.07] text-slate-300 border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-bold">{ch?.root}</div>
                    <div className="text-xs opacity-70">{ch?.roman}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">Click each chord to see it on the fretboard.</p>
            </div>

            {activeProgChord && (
              <>
                <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
                <Fretboard positions={progPositions} displayMode={displayMode} />
                <FretboardLegend items={[{ role: 'root', label: `Root (${activeProgChord.root})` }, { role: '3M', label: '3rd' }, { role: '5P', label: '5th' }]} />
              </>
            )}
          </div>
        )}

        {/* CAGED */}
        {subSection === 'caged' && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white mb-2">The CAGED System</h3>
              <p className="text-sm text-slate-400 mb-3">
                Every major chord on guitar can be viewed through 5 open chord shapes: C, A, G, E, D.
                These 5 shapes tile the entire neck, repeating at the 12th fret.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {['C','A','G','E','D'].map(shape => (
                  <div key={shape} className="bg-white/[0.07] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-violet-400">{shape}</div>
                    <div className="text-xs text-slate-500 mt-1">shape</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">How to Use CAGED</h3>
              <ol className="space-y-1 text-sm text-slate-400">
                <li>1. Find the C-shape of {selectedKey} major on the neck</li>
                <li>2. Move up to find the A-shape (same chord, higher position)</li>
                <li>3. Continue with G, E, D shapes up the neck</li>
                <li>4. Play each shape's arpeggio (root-3rd-5th-3rd-root)</li>
                <li>5. Connect each shape's pentatonic scale box</li>
              </ol>
            </div>
          </div>
        )}

        {/* ARPEGGIOS */}
        {subSection === 'arpeggios' && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white mb-2">Arpeggios</h3>
              <p className="text-sm text-slate-400">
                An arpeggio is a chord played one note at a time. Arpeggios connect scales to chords —
                they outline harmony while improvising.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Root Position', desc: 'Root → 3rd → 5th → [7th] ascending' },
                { type: '3-note-per-string', desc: 'Sweep across strings, 3 notes each' },
                { type: 'Single string', desc: 'All notes on one string — builds position awareness' },
                { type: 'Horizontal', desc: 'Move across the neck in one octave band' },
              ].map(a => (
                <div key={a.type} className="bg-slate-900/40 rounded-lg p-3 border border-white/[0.05]">
                  <div className="font-semibold text-sm text-slate-200">{a.type}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.desc}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">Arpeggio Tips</h3>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Start with {scale[0]}maj7 arpeggio: {scale[0]}-{scale[2]}-{scale[4]}-{scale[6]}</li>
                <li>• Play the arpeggio over the drone — each note sounds resolved</li>
                <li>• Target chord tones when transitioning between chords</li>
                <li>• Arpeggios over changes: land on the 3rd or 7th of each chord</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
