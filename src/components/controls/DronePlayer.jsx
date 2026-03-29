import { useDrone } from '../../hooks/useDrone';

const WAVEFORMS = [
  { value: 'sawtooth', label: 'Saw' },
  { value: 'sine',     label: 'Sine' },
  { value: 'square',   label: 'Sqr' },
  { value: 'triangle', label: 'Tri' },
];

const DRONE_MODES = [
  { value: 'root',        label: 'Root' },
  { value: 'root+5th',    label: 'R+5' },
  { value: 'root+octave', label: 'R+8' },
  { value: 'full',        label: 'Full' },
];

export default function DronePlayer({ selectedKey }) {
  const { isPlaying, toggle, waveform, setWaveform, volume, setVolume, droneMode, setDroneMode, start } = useDrone();

  const handleToggle = () => toggle(selectedKey);

  const handleWaveform = (w) => {
    setWaveform(w);
    if (isPlaying) { start(selectedKey); }
  };

  const handleDroneMode = (m) => {
    setDroneMode(m);
    if (isPlaying) { start(selectedKey); }
  };

  return (
    <div className="rounded-xl p-3.5 space-y-3 border border-white/[0.05] bg-[#0e0f14]/80">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] font-display">Drone</span>
        <span className={`text-xs font-bold transition-colors font-mono ${isPlaying ? 'text-cyan-400' : 'text-slate-600'}`}>{selectedKey}</span>
      </div>

      {/* Start/Stop */}
      <button
        onClick={handleToggle}
        className={`w-full py-2 rounded-lg font-semibold text-xs transition-all ${
          isPlaying
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-600'
            : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] border border-white/[0.04]'
        }`}
      >
        {isPlaying ? '■ Stop Drone' : '♫ Start Drone'}
      </button>

      {/* Drone interval */}
      <div className="flex gap-1">
        {DRONE_MODES.map(m => (
          <button
            key={m.value}
            onClick={() => handleDroneMode(m.value)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all ${
              droneMode === m.value
                ? 'bg-cyan-500/[0.12] text-cyan-300 border border-cyan-500/25'
                : 'bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Waveform */}
      <div className="flex gap-1">
        {WAVEFORMS.map(w => (
          <button
            key={w.value}
            onClick={() => handleWaveform(w.value)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all ${
              waveform === w.value
                ? 'bg-cyan-500/[0.12] text-cyan-300 border border-cyan-500/25'
                : 'bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-600 font-medium">Vol</span>
        <input
          type="range" min="0" max="1" step="0.05" value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 accent-cyan"
        />
        <span className="text-[10px] text-slate-600 w-7 text-right font-mono">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
