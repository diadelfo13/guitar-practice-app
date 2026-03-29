import { useState, useMemo, useCallback } from 'react';
import { Note } from 'tonal';
import { getMajorScale, getPentatonicScales, getDiatonicChords, getChordNotes } from '../../lib/musicTheory';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import { playNote } from '../../lib/audioEngine';
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
  { name: 'I–IV–V–I (Rock/Pop)',    degrees: [0, 3, 4, 0] },
  { name: 'I–V–vi–IV (Pop)',        degrees: [0, 4, 5, 3] },
  { name: 'I–vi–IV–V (50s)',        degrees: [0, 5, 3, 4] },
  { name: 'ii–V–I (Jazz)',          degrees: [1, 4, 0] },
  { name: 'I–IV–I–V (Blues)',       degrees: [0, 3, 0, 4] },
  { name: 'vi–IV–I–V (Minor feel)', degrees: [5, 3, 0, 4] },
];

// CAGED shape definitions: fret ranges per shape (relative to root position)
const CAGED_SHAPES = [
  { name: 'C', description: 'Open C shape — uses middle/upper strings. Root on 5th string.', rootString: 1, baseFretOffset: -3 },
  { name: 'A', description: 'Open A shape — classic barre chord form. Root on 5th string.', rootString: 1, baseFretOffset: 0 },
  { name: 'G', description: 'Open G shape — wide stretch. Root on 6th string.', rootString: 0, baseFretOffset: -2 },
  { name: 'E', description: 'Open E shape — most common barre. Root on 6th string.', rootString: 0, baseFretOffset: 0 },
  { name: 'D', description: 'Open D shape — upper register. Root on 4th string.', rootString: 2, baseFretOffset: 0 },
];

// Arpeggio types
const ARPEGGIO_TYPES = [
  { symbol: '',     label: 'Major',       intervals: ['1P','3M','5P'] },
  { symbol: 'm',    label: 'Minor',       intervals: ['1P','3m','5P'] },
  { symbol: 'maj7', label: 'Major 7th',   intervals: ['1P','3M','5P','7M'] },
  { symbol: 'm7',   label: 'Minor 7th',   intervals: ['1P','3m','5P','7m'] },
  { symbol: '7',    label: 'Dominant 7th', intervals: ['1P','3M','5P','7m'] },
  { symbol: 'dim',  label: 'Diminished',  intervals: ['1P','3m','5d'] },
];

export default function BonusSection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [subSection, setSubSection] = useState('pentatonic');
  const [pentatonicType, setPentatonicType] = useState('minor');
  const [selectedProg, setSelectedProg] = useState(0);
  const [progDegree, setProgDegree] = useState(0);
  const [isPlayingProg, setIsPlayingProg] = useState(false);
  const [selectedCaged, setSelectedCaged] = useState(0);
  const [selectedArpType, setSelectedArpType] = useState(0);

  const scale = useMemo(() => getMajorScale(selectedKey), [selectedKey]);
  const pentatonics = useMemo(() => getPentatonicScales(selectedKey), [selectedKey]);
  const diatonicChords = useMemo(() => getDiatonicChords(selectedKey, 'triad'), [selectedKey]);

  // ── PENTATONIC ────────────────────────────────────────────────────────────
  const pentatonicNotes = pentatonics[pentatonicType] || [];
  const pentatonicIntervals = pentatonicType === 'minor'
    ? ['1P','3m','4P','5P','7m']
    : pentatonicType === 'major'
    ? ['1P','2M','3M','5P','6M']
    : ['1P','3m','4P','4A','5P','7m'];

  const pentatonicPositions = useMemo(() => {
    if (!pentatonicNotes.length) return [];
    const roleMap = buildRoleMap(pentatonicNotes, pentatonicIntervals);
    return getNotesOnFretboard(pentatonicNotes, roleMap);
  }, [pentatonicNotes, pentatonicIntervals]);

  // ── PROGRESSIONS ──────────────────────────────────────────────────────────
  const prog = PROGRESSIONS[selectedProg];
  const progChords = prog.degrees.map(d => diatonicChords[d]);
  const activeProgChord = progChords[progDegree];
  const progPositions = useMemo(() => {
    if (!activeProgChord?.notes?.length) return [];
    const roleMap = buildRoleMap(activeProgChord.notes, ['1P','3M','5P']);
    return getNotesOnFretboard(activeProgChord.notes, roleMap);
  }, [activeProgChord]);

  const playProgression = useCallback(() => {
    if (isPlayingProg) return;
    setIsPlayingProg(true);
    const beatDuration = 600; // ms per chord

    progChords.forEach((chord, i) => {
      setTimeout(() => {
        setProgDegree(i);
        if (chord?.notes?.[0]) {
          const midi = Note.midi(chord.notes[0] + '3');
          if (midi) {
            playNote(midi, 0.5);
            // Add 5th for fuller sound
            const fifth = Note.midi(chord.notes[2] + '3');
            if (fifth) setTimeout(() => playNote(fifth, 0.4), 20);
          }
        }
      }, i * beatDuration);
    });

    setTimeout(() => {
      setIsPlayingProg(false);
    }, progChords.length * beatDuration);
  }, [progChords, isPlayingProg]);

  // ── CAGED ─────────────────────────────────────────────────────────────────
  const cagedPositions = useMemo(() => {
    const chordNotes = getChordNotes(selectedKey, '');
    if (!chordNotes.length) return [];
    const roleMap = buildRoleMap(chordNotes, ['1P','3M','5P']);
    return getNotesOnFretboard(chordNotes, roleMap);
  }, [selectedKey]);

  // ── ARPEGGIOS ─────────────────────────────────────────────────────────────
  const arpType = ARPEGGIO_TYPES[selectedArpType];
  const arpNotes = useMemo(() => {
    const suffix = arpType.symbol;
    return getChordNotes(selectedKey, suffix);
  }, [selectedKey, arpType]);

  const arpPositions = useMemo(() => {
    if (!arpNotes.length) return [];
    const roleMap = buildRoleMap(arpNotes, arpType.intervals);
    return getNotesOnFretboard(arpNotes, roleMap);
  }, [arpNotes, arpType]);

  const arpLegendItems = useMemo(() => {
    const LABELS = { '1P':'Root','3M':'Major 3rd','3m':'Minor 3rd','5P':'Perfect 5th','5d':'Dim 5th','7M':'Major 7th','7m':'Minor 7th' };
    return arpType.intervals.slice(0, arpNotes.length).map((iv, i) => ({
      role: iv,
      label: `${LABELS[iv] || iv} (${arpNotes[i] || ''})`,
    }));
  }, [arpType, arpNotes]);

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

        {/* ── PENTATONIC ─────────────────────────────────────────────── */}
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
                {pentatonicType === 'blues' && 'Minor pentatonic + blues note (♭5/♯4). The essential blues scale.'}
              </p>
            </div>

            <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
            <Fretboard positions={pentatonicPositions} displayMode={displayMode} />
            <FretboardLegend items={[{ role: 'root', label: `Root (${pentatonicNotes[0]})` }, { role: 'scale', label: 'Scale notes' }]} />

            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">Box Patterns</h3>
              <p className="text-sm text-slate-400">There are 5 pentatonic box positions. Each root position (red dot) is a starting point for a different box. Learn one box fully, then connect it to the adjacent one.</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>• Box 1: starts at low E root</li>
                <li>• Box 2: starts 3 frets higher on the A string</li>
                <li>• Connect boxes by finding shared notes at position seams</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── PROGRESSIONS ───────────────────────────────────────────── */}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">{prog.name}</h3>
                <button
                  onClick={playProgression}
                  disabled={isPlayingProg}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                    isPlayingProg
                      ? 'bg-violet-500/30 border-violet-500/50 text-violet-200 cursor-wait'
                      : 'bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25'
                  }`}
                >
                  {isPlayingProg ? '🔊 Playing...' : '▶ Play Progression'}
                </button>
              </div>
              <div className="flex gap-2">
                {progChords.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setProgDegree(i)}
                    className={`flex-1 py-3 rounded-lg text-center border transition-all ${
                      progDegree === i
                        ? 'bg-violet-500 text-white border-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                        : 'bg-white/[0.07] text-slate-300 border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="font-bold">{ch?.root}{ch?.quality === 'm' ? 'm' : ch?.quality === 'dim' ? '°' : ''}</div>
                    <div className="text-xs opacity-70">{ch?.roman}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">Click each chord to see it, or press Play to hear the progression.</p>
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

        {/* ── CAGED ──────────────────────────────────────────────────── */}
        {subSection === 'caged' && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white mb-2">The CAGED System</h3>
              <p className="text-sm text-slate-400 mb-3">
                Every major chord on guitar can be viewed through 5 open chord shapes: C, A, G, E, D.
                These 5 shapes tile the entire neck, repeating at the 12th fret.
              </p>
              <div className="flex gap-2">
                {CAGED_SHAPES.map((shape, i) => (
                  <button
                    key={shape.name}
                    onClick={() => setSelectedCaged(i)}
                    className={`flex-1 py-3 rounded-lg text-center border transition-all ${
                      selectedCaged === i
                        ? 'bg-violet-500 text-white border-violet-600'
                        : 'bg-white/[0.07] border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="text-2xl font-bold">{shape.name}</div>
                    <div className="text-xs opacity-70">shape</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
              <p className="text-sm text-slate-400">
                <span className="text-violet-400 font-semibold">{CAGED_SHAPES[selectedCaged].name} shape</span> — {CAGED_SHAPES[selectedCaged].description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {selectedKey} Major — All Chord Tones
              </h3>
              <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
              <Fretboard positions={cagedPositions} displayMode={displayMode} />
              <FretboardLegend items={[
                { role: '1P', label: `Root (${selectedKey})` },
                { role: '3M', label: 'Major 3rd' },
                { role: '5P', label: 'Perfect 5th' },
              ]} />
            </div>

            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">How to Use CAGED</h3>
              <ol className="space-y-1 text-sm text-slate-400">
                <li>1. Find the root notes (red dots) on the fretboard above</li>
                <li>2. Each cluster of R-3-5 around a root is one CAGED shape</li>
                <li>3. Start with the E and A shapes — they're the most common barre forms</li>
                <li>4. Play each shape's arpeggio: Root → 3rd → 5th → 3rd → Root</li>
                <li>5. Connect adjacent shapes by finding the shared notes between them</li>
              </ol>
            </div>
          </div>
        )}

        {/* ── ARPEGGIOS ──────────────────────────────────────────────── */}
        {subSection === 'arpeggios' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Arpeggio Type</h3>
              <div className="flex gap-2 flex-wrap">
                {ARPEGGIO_TYPES.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedArpType(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      selectedArpType === i
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                    }`}
                  >
                    {selectedKey}{a.symbol || ''} {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.05]">
              <h3 className="font-bold text-white mb-1">{selectedKey}{arpType.symbol} Arpeggio</h3>
              <p className="text-sm text-slate-400">
                An arpeggio is a chord played one note at a time. These are the notes of a {arpType.label.toLowerCase()} chord — play them in sequence up and down the neck.
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {arpNotes.map((n, i) => (
                  <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-violet-500 text-white' : 'bg-white/[0.07] text-slate-200'
                  }`}>{n}</div>
                ))}
              </div>
            </div>

            <div>
              <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
              <Fretboard positions={arpPositions} displayMode={displayMode} />
              <FretboardLegend items={arpLegendItems} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Root Position', desc: 'Root → 3rd → 5th → [7th] ascending on adjacent strings' },
                { type: '3-note-per-string', desc: 'Sweep across strings, 3 notes each — great for speed' },
                { type: 'Single string', desc: 'All notes on one string — builds neck awareness' },
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
                <li>• Click the notes on the fretboard to hear each arpeggio tone</li>
                <li>• Play the arpeggio over the drone — every note should sound "right"</li>
                <li>• Try different arpeggio types on the same root — hear how the mood changes</li>
                <li>• When soloing, targeting chord tones (especially 3rd and 7th) makes your lines sound strong</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
