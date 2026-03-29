import KeySelector from '../controls/KeySelector';
import { SECTIONS } from '../../lib/constants';

export default function Header({ selectedKey, onKeyChange, currentSection, onSectionChange }) {
  const sectionLabel = SECTIONS.find(s => s.id === currentSection)?.label || '';

  return (
    <header className="bg-[#0e0f14]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 sm:px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-500 font-display">Guitar Practice</span>
              {sectionLabel && (
                <>
                  <span className="text-slate-700 text-[10px]">/</span>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-400">{sectionLabel}</span>
                </>
              )}
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
              Key of{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
                {selectedKey}
              </span>
            </h1>
          </div>
          {/* Mobile section selector */}
          {onSectionChange && (
            <select
              value={currentSection}
              onChange={e => onSectionChange(e.target.value)}
              className="sm:hidden bg-[#0e0f14] text-slate-300 text-xs rounded-lg border border-white/[0.07] px-2.5 py-1.5 focus:outline-none focus:border-violet-500/50"
            >
              {SECTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
              ))}
            </select>
          )}
        </div>
        <KeySelector selectedKey={selectedKey} onKeyChange={onKeyChange} />
      </div>
    </header>
  );
}
