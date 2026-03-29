import { useState, useCallback } from 'react';
import Metronome from '../controls/Metronome';
import DronePlayer from '../controls/DronePlayer';
import { metronome } from '../../lib/audioEngine';

const TEMPO_LOG_KEY = 'guitar-practice-tempo-log';

function loadTempoLog() {
  try { return JSON.parse(localStorage.getItem(TEMPO_LOG_KEY)) || []; } catch { return []; }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SectionLayout({ title, description, selectedKey, children, sectionElapsed = 0, currentSection = '' }) {
  const [tempoLog, setTempoLog] = useState(loadTempoLog);

  const logTempo = useCallback(() => {
    const entry = {
      section: currentSection,
      bpm: metronome.bpm,
      key: selectedKey,
      timestamp: Date.now(),
    };
    const log = loadTempoLog();
    log.unshift(entry);
    const trimmed = log.slice(0, 50);
    localStorage.setItem(TEMPO_LOG_KEY, JSON.stringify(trimmed));
    setTempoLog(trimmed);
  }, [currentSection, selectedKey]);

  const recentLogs = tempoLog.filter(e => e.section === currentSection).slice(0, 3);

  return (
    <div className="flex gap-0 flex-1 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 section-enter section-scroll">
        {title && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight font-display">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>}
          </div>
        )}
        {children}
      </div>

      {/* Controls panel */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 py-4 px-3.5 gap-3.5 overflow-y-auto border-l border-white/[0.05] bg-[#0e0f14]/40 backdrop-blur-sm">
        {/* Session timer */}
        <div className="text-center py-3 px-3 rounded-xl bg-[#0e0f14]/80 border border-white/[0.05]">
          <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em] font-display">Session</div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1 tracking-tight font-mono">{formatTime(sectionElapsed)}</div>
        </div>

        <Metronome />
        <DronePlayer selectedKey={selectedKey} />

        {/* Tempo log */}
        <div className="space-y-2">
          <button
            onClick={logTempo}
            className="w-full py-2.5 rounded-xl bg-[#131520]/80 text-slate-400 hover:text-slate-200 hover:bg-[#191b28] text-xs font-semibold transition-all border border-white/[0.04] hover:border-white/[0.07]"
          >
            Log Tempo ({metronome.bpm} BPM)
          </button>
          {recentLogs.length > 0 && (
            <div className="space-y-1 px-1">
              {recentLogs.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span>{entry.bpm} BPM</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
