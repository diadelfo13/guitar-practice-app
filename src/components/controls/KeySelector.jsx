import { ALL_KEYS } from '../../lib/constants';

export default function KeySelector({ selectedKey, onKeyChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {ALL_KEYS.map(key => (
        <button
          key={key}
          onClick={() => onKeyChange(key)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 ${
            selectedKey === key
              ? 'bg-gradient-to-b from-violet-400 to-violet-500 text-white shadow-lg shadow-violet-500/25 scale-110 ring-1 ring-violet-400/30'
              : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-100 border border-white/[0.04] hover:border-white/[0.08]'
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
