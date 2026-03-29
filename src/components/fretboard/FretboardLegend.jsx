import { ROLE_COLORS, INTERVAL_TO_ROLE } from '../../lib/constants';

// items: [{ role: 'root', label: 'Root (C)' }, ...]
export default function FretboardLegend({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map(({ role, label }) => {
        const mapped = INTERVAL_TO_ROLE[role] || role;
        const color = ROLE_COLORS[mapped] || ROLE_COLORS.scale;
        return (
          <div key={role} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color, opacity: 0.9 }}
            />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
