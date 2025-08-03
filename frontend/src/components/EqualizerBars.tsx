/**
 * Three CSS-animated vertical bars that mimic a playing-audio indicator.
 * Pure presentational — no state, no props aside from dimensions.
 */
export function EqualizerBars({
  size = 'md',
  color = 'bg-spotify-green',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}): JSX.Element {
  const dim = { sm: 'h-3 w-[2px] gap-[2px]', md: 'h-4 w-[3px] gap-[3px]', lg: 'h-6 w-[4px] gap-[4px]' }[size];
  return (
    <div
      className={`flex items-end ${dim}`}
      aria-label="Playing indicator"
      role="img"
    >
      <span className={`origin-bottom ${color} h-full w-full rounded animate-eq-1`} />
      <span className={`origin-bottom ${color} h-full w-full rounded animate-eq-2`} />
      <span className={`origin-bottom ${color} h-full w-full rounded animate-eq-3`} />
    </div>
  );
}
