import { SECTIONS } from '../../lib/constants';

export default function Sidebar({ currentSection, onSectionChange }) {
  return (
    <nav className="hidden sm:flex flex-col w-52 flex-shrink-0 bg-[#0e0f14]/60 backdrop-blur-sm border-r border-white/[0.05] py-3 px-2.5 overflow-y-auto gap-0.5">
      {SECTIONS.map(s => {
        const isActive = currentSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all duration-200 group ${
              isActive
                ? 'bg-violet-500/[0.1] text-violet-300 shadow-sm shadow-violet-500/5'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className={`text-base leading-none w-5 text-center transition-transform duration-200 ${
              isActive ? 'scale-110' : 'group-hover:scale-105'
            }`}>{s.icon}</span>
            <span className="truncate">{s.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
