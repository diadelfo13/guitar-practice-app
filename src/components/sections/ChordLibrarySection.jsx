import { useState, useMemo } from 'react';
import { Chord, Note, Interval } from 'tonal';
import { getNotesOnFretboard, buildRoleMap } from '../../lib/fretboard';
import Fretboard from '../fretboard/Fretboard';
import FretboardLegend from '../fretboard/FretboardLegend';
import FretboardDisplayToggle from '../fretboard/FretboardDisplayToggle';
import SectionLayout from '../layout/SectionLayout';

// ── Chord categories with symbols ─────────────────────────────────────────
const CHORD_CATEGORIES = [
  {
    id: 'triads',
    label: 'Triads',
    chords: [
      { symbol: '', label: 'Major', formula: '1 3 5' },
      { symbol: 'm', label: 'Minor', formula: '1 ♭3 5' },
      { symbol: 'dim', label: 'Diminished', formula: '1 ♭3 ♭5' },
      { symbol: 'aug', label: 'Augmented', formula: '1 3 ♯5' },
      { symbol: 'sus2', label: 'Suspended 2nd', formula: '1 2 5' },
      { symbol: 'sus4', label: 'Suspended 4th', formula: '1 4 5' },
    ],
  },
  {
    id: 'sevenths',
    label: '7th Chords',
    chords: [
      { symbol: 'maj7', label: 'Major 7th', formula: '1 3 5 7' },
      { symbol: 'm7', label: 'Minor 7th', formula: '1 ♭3 5 ♭7' },
      { symbol: '7', label: 'Dominant 7th', formula: '1 3 5 ♭7' },
      { symbol: 'm7b5', label: 'Half-Diminished', formula: '1 ♭3 ♭5 ♭7' },
      { symbol: 'dim7', label: 'Diminished 7th', formula: '1 ♭3 ♭5 ♭♭7' },
      { symbol: 'mM7', label: 'Minor-Major 7th', formula: '1 ♭3 5 7' },
    ],
  },
  {
    id: 'extensions',
    label: 'Extensions',
    chords: [
      { symbol: 'add9', label: 'Add 9', formula: '1 3 5 9' },
      { symbol: 'maj9', label: 'Major 9th', formula: '1 3 5 7 9' },
      { symbol: 'm9', label: 'Minor 9th', formula: '1 ♭3 5 ♭7 9' },
      { symbol: '9', label: 'Dominant 9th', formula: '1 3 5 ♭7 9' },
      { symbol: '11', label: '11th', formula: '1 ♭3 5 ♭7 9 11' },
      { symbol: '13', label: '13th', formula: '1 3 5 ♭7 9 13' },
      { symbol: 'maj13', label: 'Major 13th', formula: '1 3 5 7 9 13' },
    ],
  },
  {
    id: 'altered',
    label: 'Altered / Special',
    chords: [
      { symbol: '7#9', label: '7♯9 (Hendrix)', formula: '1 3 5 ♭7 ♯9' },
      { symbol: '7b9', label: '7♭9', formula: '1 3 5 ♭7 ♭9' },
      { symbol: '7#5', label: '7♯5 (Aug Dom)', formula: '1 3 ♯5 ♭7' },
      { symbol: '7b5', label: '7♭5', formula: '1 3 ♭5 ♭7' },
      { symbol: '6', label: 'Major 6th', formula: '1 3 5 6' },
      { symbol: 'm6', label: 'Minor 6th', formula: '1 ♭3 5 6' },
      { symbol: '5', label: 'Power Chord', formula: '1 5' },
    ],
  },
];

// Map interval strings from Tonal to our role system
const INTERVAL_ROLE_MAP = {
  '1P': '1P', '2M': '2M', '2m': '2m',
  '3M': '3M', '3m': '3m',
  '4P': '4P', '4A': '4A',
  '5P': '5P', '5d': '5d', '5A': '5A',
  '6M': '6M', '6m': '6m',
  '7M': '7M', '7m': '7m', '7d': '7d',
  '8P': '8P',
  '9M': '2M', '9m': '2m', '9A': '2M',  // extensions map to base interval colors
  '11P': '4P', '11A': '4A',
  '13M': '6M', '13m': '6m',
};

function getChordIntervals(root, symbol) {
  const chord = Chord.get(`${root}${symbol}`);
  return chord.intervals || [];
}

function getChordNotes(root, symbol) {
  const chord = Chord.get(`${root}${symbol}`);
  return chord.notes.length > 0 ? chord.notes : [];
}

function getIntervalLabel(interval) {
  const labels = {
    '1P': 'R', '2m': '♭9', '2M': '9', '3m': '♭3', '3M': '3',
    '4P': '11', '4A': '♯11', '5d': '♭5', '5P': '5', '5A': '♯5',
    '6m': '♭13', '6M': '13', '7d': '♭♭7', '7m': '♭7', '7M': '7',
    '8P': 'R',
    '9m': '♭9', '9M': '9', '9A': '♯9',
    '11P': '11', '11A': '♯11',
    '13m': '♭13', '13M': '13',
  };
  return labels[interval] || interval;
}

export default function ChordLibrarySection({ selectedKey, sectionElapsed, currentSection }) {
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('fretboard-display-mode') || 'notes');
  const handleDisplayMode = (m) => { setDisplayMode(m); localStorage.setItem('fretboard-display-mode', m); };
  const [selectedCategoryId, setSelectedCategoryId] = useState('triads');
  const [selectedChordIdx, setSelectedChordIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const category = CHORD_CATEGORIES.find(c => c.id === selectedCategoryId);
  const chordDef = category?.chords[selectedChordIdx] || category?.chords[0];

  // Get chord data from Tonal
  const chordData = useMemo(() => {
    if (!chordDef) return null;
    const notes = getChordNotes(selectedKey, chordDef.symbol);
    const intervals = getChordIntervals(selectedKey, chordDef.symbol);
    return { notes, intervals };
  }, [selectedKey, chordDef]);

  // Build fretboard positions
  const positions = useMemo(() => {
    if (!chordData?.notes?.length) return [];
    const roleMap = {};
    chordData.notes.forEach((note, i) => {
      const pc = note.replace(/\d/, '');
      roleMap[pc] = INTERVAL_ROLE_MAP[chordData.intervals[i]] || chordData.intervals[i] || 'scale';
    });
    return getNotesOnFretboard(chordData.notes, roleMap);
  }, [chordData]);

  // Legend items
  const legendItems = useMemo(() => {
    if (!chordData?.intervals?.length) return [];
    return chordData.intervals.map((iv, i) => ({
      role: INTERVAL_ROLE_MAP[iv] || iv,
      label: `${getIntervalLabel(iv)} (${chordData.notes[i]?.replace(/\d/, '') || ''})`,
    }));
  }, [chordData]);

  // Search / filter chords across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const results = [];
    CHORD_CATEGORIES.forEach(cat => {
      cat.chords.forEach((chord, idx) => {
        const fullName = `${selectedKey}${chord.symbol}`.toLowerCase();
        const label = chord.label.toLowerCase();
        if (fullName.includes(q) || label.includes(q) || chord.formula.toLowerCase().includes(q)) {
          results.push({ ...chord, categoryId: cat.id, categoryLabel: cat.label, idx });
        }
      });
    });
    return results;
  }, [searchQuery, selectedKey]);

  function selectChord(categoryId, idx) {
    setSelectedCategoryId(categoryId);
    setSelectedChordIdx(idx);
    setSearchQuery('');
  }

  // All chords in current key for the grid (quick reference)
  const allChordsInCategory = useMemo(() => {
    if (!category) return [];
    return category.chords.map(c => {
      const notes = getChordNotes(selectedKey, c.symbol);
      return { ...c, notes };
    });
  }, [category, selectedKey]);

  return (
    <SectionLayout
      title="Chord Library"
      description="Browse and explore chord voicings across the fretboard. Click any note to hear it."
      selectedKey={selectedKey}
      sectionElapsed={sectionElapsed}
      currentSection={currentSection}
    >
      <div className="space-y-5">
        {/* Search bar */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search chords (e.g. "minor 7th", "sus4", "${selectedKey}m")…`}
            className="w-full bg-slate-900/40 text-slate-200 text-sm rounded-lg border border-white/[0.05] px-4 py-2.5 focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
          />
        </div>

        {/* Search results */}
        {searchResults && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectChord(r.categoryId, r.idx)}
                    className="bg-slate-900/40 rounded-lg p-3 border border-white/[0.05] hover:border-violet-500/40 transition-colors text-left"
                  >
                    <div className="text-sm font-bold text-white">{selectedKey}{r.symbol}</div>
                    <div className="text-xs text-slate-500">{r.label}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{r.categoryLabel}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No chords match your search.</p>
            )}
          </div>
        )}

        {/* Category tabs */}
        {!searchResults && (
          <>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Category</h3>
              <div className="flex gap-2 flex-wrap">
                {CHORD_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(cat.id); setSelectedChordIdx(0); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08] hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord selector */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Chord Type</h3>
              <div className="flex gap-2 flex-wrap">
                {category?.chords.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedChordIdx(i)}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all border min-w-[60px] ${
                      selectedChordIdx === i
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.04] border-white/[0.05] text-slate-400 hover:border-white/[0.08]'
                    }`}
                  >
                    <span className="font-bold text-sm">{selectedKey}{ch.symbol || ''}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active chord info */}
            {chordDef && chordData && (
              <div className="glass-card rounded-xl p-4 border border-white/[0.05]">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {selectedKey}{chordDef.symbol}
                      </span>
                      <span className="text-sm text-slate-500">{chordDef.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-600">Formula:</span>
                      <span className="text-xs font-mono text-violet-300/80">{chordDef.formula}</span>
                    </div>
                    {chordData.intervals.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600">Intervals:</span>
                        <span className="text-xs font-mono text-slate-400">
                          {chordData.intervals.join(' – ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {chordData.notes.map((n, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/[0.07] text-slate-200'
                        }`}
                      >
                        {n.replace(/\d/, '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fretboard */}
            {positions.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Fretboard — {selectedKey}{chordDef?.symbol}
                </h3>
                <FretboardDisplayToggle value={displayMode} onChange={handleDisplayMode} />
                <Fretboard positions={positions} displayMode={displayMode} />
                <FretboardLegend items={legendItems} />
              </div>
            )}

            {/* All chords in category grid */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                All {category?.label} in {selectedKey}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {allChordsInCategory.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedChordIdx(i)}
                    className={`rounded-lg p-3 border text-left transition-all ${
                      selectedChordIdx === i
                        ? 'bg-violet-500/10 border-violet-500/30'
                        : 'bg-slate-900/40 border-white/[0.05] hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{selectedKey}{ch.symbol}</div>
                    <div className="text-xs text-slate-500">{ch.label}</div>
                    <div className="text-xs text-slate-600 mt-1 font-mono">{ch.formula}</div>
                    {ch.notes.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {ch.notes.map((n, j) => (
                          <span key={j} className={`text-xs px-1 py-0.5 rounded ${
                            j === 0 ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.05] text-slate-400'
                          }`}>
                            {n.replace(/\d/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick reference: common progressions */}
            <div className="glass-card rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-3">Common Progressions in {selectedKey}</h3>
              <div className="space-y-2">
                <ProgressionRow
                  label="I – IV – V – I"
                  chords={[`${selectedKey}`, getProgChord(selectedKey, 3), getProgChord(selectedKey, 4), `${selectedKey}`]}
                />
                <ProgressionRow
                  label="I – V – vi – IV"
                  chords={[`${selectedKey}`, getProgChord(selectedKey, 4), getProgChord(selectedKey, 5, 'm'), getProgChord(selectedKey, 3)]}
                />
                <ProgressionRow
                  label="ii – V – I"
                  chords={[getProgChord(selectedKey, 1, 'm7'), getProgChord(selectedKey, 4, '7'), `${selectedKey}maj7`]}
                />
                <ProgressionRow
                  label="I – vi – IV – V"
                  chords={[`${selectedKey}`, getProgChord(selectedKey, 5, 'm'), getProgChord(selectedKey, 3), getProgChord(selectedKey, 4)]}
                />
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/[0.05]">
              <h3 className="text-sm font-semibold text-violet-400 mb-2">Practice Tips</h3>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Click fretboard notes to hear each chord tone individually</li>
                <li>• Switch to Intervals mode to see how each note relates to the root</li>
                <li>• Try playing chord tones as arpeggios up and down the neck</li>
                <li>• Compare chords that differ by one note (e.g., major vs. sus4)</li>
                <li>• Use the drone on the root note while exploring voicings</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </SectionLayout>
  );
}

// Helper: get a chord root from scale degree
function getProgChord(key, degreeIdx, suffix = '') {
  const majorScaleNotes = getMajorScaleSimple(key);
  const root = majorScaleNotes[degreeIdx] || key;
  return `${root}${suffix}`;
}

// Simple major scale using Tonal
function getMajorScaleSimple(key) {
  const intervals = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];
  return intervals.map(iv => {
    const n = Note.transpose(`${key}4`, Interval.get(iv));
    return n ? n.replace(/\d/, '') : key;
  });
}

// Small sub-component for progression rows
function ProgressionRow({ label, chords }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-28 flex-shrink-0 font-mono">{label}</span>
      <div className="flex gap-1.5">
        {chords.map((ch, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded bg-white/[0.04] text-slate-300 border border-white/[0.05] font-medium">
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
