import { useState } from 'react';
import { ROLE_COLORS, INTERVAL_TO_ROLE } from '../../lib/constants';
import { FRET_DOTS, DOUBLE_FRET_DOTS } from '../../lib/fretboard';
import { playNote } from '../../lib/audioEngine';

const NUM_FRETS = 15;
const NUM_STRINGS = 6;
const FRET_WIDTH = 52;
const STRING_SPACING = 22;
const SIDE_PAD = 24;
const TOP_PAD = 28;
const BOTTOM_PAD = 28;
const DOT_RADIUS = 10;
const STRING_WIDTHS = [2.5, 2.2, 1.9, 1.5, 1.2, 1.0]; // low E thickest

const WIDTH = SIDE_PAD * 2 + FRET_WIDTH * NUM_FRETS;
const HEIGHT = TOP_PAD + STRING_SPACING * (NUM_STRINGS - 1) + BOTTOM_PAD;

// Open string MIDI numbers: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

function stringY(stringIdx) {
  return TOP_PAD + (NUM_STRINGS - 1 - stringIdx) * STRING_SPACING;
}

function fretX(fret) {
  return SIDE_PAD + fret * FRET_WIDTH;
}

function resolveColor(role) {
  const mapped = INTERVAL_TO_ROLE[role] || role;
  return ROLE_COLORS[mapped] || ROLE_COLORS.scale;
}

export default function Fretboard({ positions = [], showNoteNames = true, highlightRoot = true, displayMode = 'notes' }) {
  const [clickedIdx, setClickedIdx] = useState(null);

  function handleDotClick(pos, idx) {
    const midi = OPEN_MIDI[pos.string] + pos.fret;
    playNote(midi, 0.6);
    setClickedIdx(idx);
    setTimeout(() => setClickedIdx(null), 300);
  }

  function getDotLabel(pos) {
    if (displayMode === 'clean') return null;
    if (displayMode === 'intervals') return pos.role || '';
    return pos.note;
  }

  return (
    <div className="fretboard-container overflow-x-auto rounded-xl border border-white/[0.05] bg-[#08090e]">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: 'block' }}
      >
        {/* Defs for gradients and filters */}
        <defs>
          <linearGradient id="fb-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161828" />
            <stop offset="100%" stopColor="#0e1020" />
          </linearGradient>
          <linearGradient id="nut-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="inlay-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e3050" />
            <stop offset="100%" stopColor="#1a1c35" />
          </linearGradient>
        </defs>

        {/* Fretboard background */}
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#08090e" rx={8} />
        <rect x={SIDE_PAD} y={TOP_PAD - 5} width={FRET_WIDTH * NUM_FRETS} height={STRING_SPACING * (NUM_STRINGS - 1) + 10} fill="url(#fb-bg)" rx={3} />

        {/* Fret lines */}
        {Array.from({ length: NUM_FRETS + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={fretX(i)} y1={TOP_PAD - 5}
            x2={fretX(i)} y2={TOP_PAD + STRING_SPACING * (NUM_STRINGS - 1) + 5}
            stroke={i === 0 ? 'url(#nut-grad)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={i === 0 ? 7 : 1}
          />
        ))}

        {/* String lines — cool silver gradient */}
        {Array.from({ length: NUM_STRINGS }, (_, i) => {
          const brightness = 75 + i * 14;
          return (
            <line
              key={`string-${i}`}
              x1={SIDE_PAD} y1={stringY(i)}
              x2={SIDE_PAD + FRET_WIDTH * NUM_FRETS} y2={stringY(i)}
              stroke={`rgb(${brightness - 5},${brightness - 5},${brightness + 10})`}
              strokeWidth={STRING_WIDTHS[i]}
            />
          );
        })}

        {/* Fret position markers (inlays) */}
        {FRET_DOTS.map(f => (
          <circle
            key={`dot-${f}`}
            cx={fretX(f) - FRET_WIDTH / 2}
            cy={TOP_PAD + STRING_SPACING * (NUM_STRINGS - 1) / 2}
            r={3.5}
            fill="url(#inlay-grad)"
            opacity={0.5}
          />
        ))}
        {DOUBLE_FRET_DOTS.map(f => (
          <g key={`double-${f}`}>
            <circle cx={fretX(f) - FRET_WIDTH / 2} cy={stringY(1) + STRING_SPACING * 0.5} r={3.5} fill="url(#inlay-grad)" opacity={0.5} />
            <circle cx={fretX(f) - FRET_WIDTH / 2} cy={stringY(4) - STRING_SPACING * 0.5} r={3.5} fill="url(#inlay-grad)" opacity={0.5} />
          </g>
        ))}

        {/* Fret numbers */}
        {[3, 5, 7, 9, 12, 15].map(f => f <= NUM_FRETS && (
          <text
            key={`fnum-${f}`}
            x={fretX(f) - FRET_WIDTH / 2}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.18)"
            fontFamily="'Space Mono', 'JetBrains Mono', monospace"
            fontWeight="500"
          >{f}</text>
        ))}

        {/* String labels (left side) */}
        {['E', 'A', 'D', 'G', 'B', 'e'].map((name, i) => (
          <text
            key={`slabel-${i}`}
            x={SIDE_PAD - 12}
            y={stringY(i) + 4}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.18)"
            fontFamily="'Space Mono', 'JetBrains Mono', monospace"
            fontWeight="500"
          >{name}</text>
        ))}

        {/* Note dots */}
        {positions.map((pos, idx) => {
          const cx = fretX(pos.fret) - (pos.fret === 0 ? 0 : FRET_WIDTH / 2) + (pos.fret === 0 ? -DOT_RADIUS * 0.6 : 0);
          const cy = stringY(pos.string);
          const color = resolveColor(pos.role);
          const isRoot = pos.isRoot || pos.role === 'root' || pos.role === '1P';
          const isClicked = clickedIdx === idx;
          const label = getDotLabel(pos);

          return (
            <g
              key={idx}
              onClick={() => handleDotClick(pos, idx)}
              style={{
                cursor: 'pointer',
                transform: isClicked ? 'scale(1.35)' : 'scale(1)',
                transformOrigin: `${cx}px ${cy}px`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Glow behind root notes */}
              {isRoot && highlightRoot && (
                <>
                  <circle cx={cx} cy={cy} r={DOT_RADIUS + 5} fill={color} opacity={0.12} />
                  <circle cx={cx} cy={cy} r={DOT_RADIUS + 3} fill="none" stroke={color} strokeWidth={1.5} opacity={0.45} />
                </>
              )}
              {/* Main dot */}
              <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={color} opacity={0.9} filter={isClicked ? 'url(#dot-glow)' : undefined} />
              {/* Inner highlight for depth */}
              <circle cx={cx} cy={cy - 2} r={DOT_RADIUS * 0.5} fill="rgba(255,255,255,0.12)" />
              {label && (
                <text
                  x={cx} y={cy + 4}
                  textAnchor="middle"
                  fontSize={displayMode === 'intervals' ? '7' : '8'}
                  fill="#000"
                  fontWeight="700"
                  fontFamily="'Space Mono', 'JetBrains Mono', monospace"
                  style={{ pointerEvents: 'none' }}
                >{label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
