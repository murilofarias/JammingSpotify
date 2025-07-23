import type { Track } from '../lib/types';
import { AlbumCover } from './AlbumCover';

interface Props {
  track: Track;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  selected?: boolean;
  onToggle?: () => void;
}

function formatArtists(track: Track): string {
  return track.artists.map((a) => a.name).join(', ');
}

/**
 * Square-ratio card used on search results and recommendation grids.
 * Optional action button and optional "select" checkbox (used by the
 * recommendations bulk-add flow).
 */
export function TrackCard({ track, action, selected, onToggle }: Props): JSX.Element {
  return (
    <div className="glass glass-hover group relative flex flex-col gap-3 p-3 animate-fade-up">
      <AlbumCover
        images={track.album.images}
        alt={`${track.album.name} cover`}
        size={256}
        className="!w-full !h-auto"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white/95" title={track.name}>
          {track.name}
        </div>
        <div className="truncate text-xs text-white/60" title={formatArtists(track)}>
          {formatArtists(track)}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between">
        {onToggle ? (
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={Boolean(selected)}
              onChange={onToggle}
              className="h-4 w-4 rounded border-white/30 bg-transparent accent-spotify-green"
            />
            select
          </label>
        ) : (
          <span className="mono">{Math.round(track.popularity)}/100</span>
        )}
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className="rounded-full bg-spotify-green/90 px-3 py-1 text-xs font-semibold text-black transition hover:bg-spotify-green disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
