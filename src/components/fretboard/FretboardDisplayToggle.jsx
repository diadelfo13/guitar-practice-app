export default function FretboardDisplayToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 mb-2">
      {[
        { id: 'notes',     label: 'Notes' },
        { id: 'intervals', label: 'Intervals' },
        { id: 'clean',     label: 'Clean' },
      ].map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-3 py-1 text-xs rounded-md font-medium border transition-colors ${
            value === m.id
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
              : 'bg-white/[0.04] text-slate-500 border-white/[0.05] hover:text-slate-300 hover:border-white/[0.08]'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
