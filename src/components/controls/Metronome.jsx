import { useMetronome } from '../../hooks/useMetronome';

const SUBDIVISIONS = [
  { value: 1, label: '♩' },
  { value: 2, label: '♪♪' },
  { value: 4, label: '16ths' },
];

export default function Metronome() {
  const { bpm, setBpm, isPlaying, toggle, tap, subdivision, setSubdivision, flash, accentFlash } = useMetronome();

  return (
    <div className={`rounded-xl p-3.5 space-y-3 border transition-all duration-200 ${
      accentFlash
        ? 'metronome-accent-flash bg-[#131520]/80 border-white/[0.05]'
        : flash
        ? 'metronome-sub-flash bg-[#131520]/80 border-white/[0.05]'
        : 'bg-[#0e0f14]/80 border-white/[0.05]'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] font-display">Metronome</span>
        <div
          className={`w-2 h-2 rounded-full transition-all duration-75 ${
            accentFlash ? 'bg-violet-400 shadow-sm shadow-violet-400/50' : flash ? 'bg-slate-400' : 'bg-slate-700'
          }`}
        />
      </div>

      {/* BPM display */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setBpm(bpm - 1)}
          className="w-7 h-7 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 text-sm font-bold flex items-center justify-center transition-all border border-white/[0.04]"
        >−</button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-bold text-white tabular-nums tracking-tight font-mono">{bpm}</span>
          <span className="text-[10px] text-slate-600 ml-1 font-medium">BPM</span>
        </div>
        <button
          onClick={() => setBpm(bpm + 1)}
          className="w-7 h-7 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 text-sm font-bold flex items-center justify-center transition-all border border-white/[0.04]"
        >+</button>
      </div>

      {/* BPM slider */}
      <input
        type="range" min="20" max="300" value={bpm}
        onChange={e => setBpm(Number(e.target.value))}
        className="w-full accent-violet"
      />

      {/* Controls row */}
      <div className="flex gap-1.5">
        <button
          onClick={toggle}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${
            isPlaying
              ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20 hover:bg-violet-600'
              : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] border border-white/[0.04]'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Start'}
        </button>
        <button
          onClick={tap}
          className="flex-1 py-2 rounded-lg bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 text-xs font-semibold transition-all border border-white/[0.04]"
        >
          Tap
        </button>
      </div>

      {/* Subdivision */}
      <div className="flex gap-1">
        {SUBDIVISIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setSubdivision(s.value)}
            className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
              subdivision === s.value
                ? 'bg-violet-500/[0.12] text-violet-300 border border-violet-500/25'
                : 'bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
