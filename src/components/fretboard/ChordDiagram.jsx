import { useState } from 'react';
import { playNote } from '../../lib/audioEngine';

// Open string MIDI: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

const STRINGS = 6;
const FRETS_SHOWN = 5;
const STR_SPACING = 16;
const FRET_SPACING = 22;
const LEFT_PAD = 24;
const TOP_PAD = 22;
const DOT_R = 5.5;

const WIDTH = LEFT_PAD + STR_SPACING * (STRINGS - 1) + 18;
const HEIGHT = TOP_PAD + FRET_SPACING * FRETS_SHOWN + 12;

export default function ChordDiagram({ name, strings = [], baseFret = 1 }) {
  const [strumming, setStrumming] = useState(false);

  const isNut = baseFret === 1;

  function stringX(s) {
    return LEFT_PAD + s * STR_SPACING;
  }

  function fretY(f) {
    // f=0 is the top line (nut or baseFret), f=1 is first fret space, etc.
    return TOP_PAD + f * FRET_SPACING;
  }

  function handleStrum() {
    setStrumming(true);
    setTimeout(() => setStrumming(false), 400);

    const played = [];
    strings.forEach((fret, i) => {
      if (fret === null) return;
      played.push({ midi: OPEN_MIDI[i] + fret, delay: played.length * 30 });
    });

    played.forEach(({ midi, delay }) => {
      setTimeout(() => playNote(midi, 0.8), delay);
    });
  }

  return (
    <div
      className={`flex flex-col items-center cursor-pointer group transition-all ${
        strumming ? 'scale-105' : ''
      }`}
      onClick={handleStrum}
      title={`Click to hear ${name}`}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* Top indicators: x = muted, o = open */}
        {strings.map((fret, i) => {
          if (fret === null) {
            return (
              <text
                key={`ind-${i}`}
                x={stringX(i)}
                y={TOP_PAD - 9}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="rgba(255,255,255,0.35)"
                fontFamily="'Inter', sans-serif"
              >×</text>
            );
          }
          if (fret === 0 || (isNut && fret === 0)) {
            return (
              <circle
                key={`ind-${i}`}
                cx={stringX(i)}
                cy={TOP_PAD - 11}
                r={3.5}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
              />
            );
          }
          return null;
        })}

        {/* Nut or position indicator */}
        {isNut ? (
          <rect
            x={LEFT_PAD - 2}
            y={TOP_PAD - 2}
            width={STR_SPACING * (STRINGS - 1) + 4}
            height={4}
            rx={1}
            fill="rgba(167,139,250,0.7)"
          />
        ) : (
          <text
            x={LEFT_PAD - 14}
            y={fretY(1) - FRET_SPACING / 2 + 4}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.4)"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
          >{baseFret}fr</text>
        )}

        {/* Fret lines */}
        {Array.from({ length: FRETS_SHOWN + 1 }, (_, f) => (
          <line
            key={`fret-${f}`}
            x1={LEFT_PAD}
            y1={fretY(f)}
            x2={LEFT_PAD + STR_SPACING * (STRINGS - 1)}
            y2={fretY(f)}
            stroke={f === 0 && !isNut ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={f === 0 && !isNut ? 1.5 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: STRINGS }, (_, s) => (
          <line
            key={`str-${s}`}
            x1={stringX(s)}
            y1={fretY(0)}
            x2={stringX(s)}
            y2={fretY(FRETS_SHOWN)}
            stroke={`rgba(255,255,255,${0.1 + s * 0.03})`}
            strokeWidth={1.8 - s * 0.15}
          />
        ))}

        {/* Finger dots */}
        {strings.map((fret, i) => {
          if (fret === null || fret === 0) return null;

          // Position relative to baseFret
          const relFret = fret - baseFret + 1;
          if (relFret < 1 || relFret > FRETS_SHOWN) return null;

          const cx = stringX(i);
          const cy = fretY(relFret) - FRET_SPACING / 2;

          // Root note detection (first non-null string from bass side)
          const firstPlayed = strings.findIndex(f => f !== null);
          const isRoot = i === firstPlayed;

          return (
            <g key={`dot-${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r={DOT_R}
                fill={isRoot ? '#f43f5e' : '#a78bfa'}
                opacity={0.9}
              />
              {/* Subtle inner highlight */}
              <circle
                cx={cx}
                cy={cy - 1.5}
                r={DOT_R * 0.4}
                fill="rgba(255,255,255,0.15)"
              />
            </g>
          );
        })}

        {/* Barre indicator — if multiple strings share the same fret and it's the baseFret */}
        {(() => {
          if (baseFret <= 1) return null;
          const barredStrings = strings
            .map((f, i) => ({ fret: f, idx: i }))
            .filter(s => s.fret === baseFret);
          if (barredStrings.length >= 2) {
            const first = barredStrings[0].idx;
            const last = barredStrings[barredStrings.length - 1].idx;
            const cy = fretY(1) - FRET_SPACING / 2;
            return (
              <rect
                x={stringX(first) - DOT_R}
                y={cy - DOT_R + 1}
                width={stringX(last) - stringX(first) + DOT_R * 2}
                height={DOT_R * 2 - 2}
                rx={DOT_R - 1}
                fill="rgba(167,139,250,0.5)"
              />
            );
          }
          return null;
        })()}
      </svg>

      {/* Label */}
      <span className={`text-xs font-medium mt-0.5 transition-colors ${
        strumming ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300'
      }`}>
        {name}
      </span>
    </div>
  );
}
