import type { TimeRange } from '../lib/types';

interface Props {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 weeks' },
  { value: 'medium_term', label: 'Last 6 months' },
  { value: 'long_term', label: 'All time' },
];

export function TimeRangeToggle({ value, onChange }: Props): JSX.Element {
  return (
    <div
      role="tablist"
      className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-medium transition',
              active
                ? 'bg-white text-ink-900'
                : 'text-white/60 hover:text-white/90',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
