import type { VibeResult } from '../lib/types';

export function VibeLabel({ vibe }: { vibe: VibeResult }): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {vibe.tags.map((tag, i) => (
          <span
            key={tag + i}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium',
              i === 0 ? 'bg-spotify-green/20 text-spotify-green' : '',
              i === 1 ? 'bg-accent-purple/20 text-accent-purple' : '',
              i === 2 ? 'bg-accent-cyan/20 text-accent-cyan' : '',
            ].join(' ')}
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-white/70">{vibe.explanation}</p>
    </div>
  );
}
