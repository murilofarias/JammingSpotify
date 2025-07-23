import type { Track } from '../lib/types';
import { AlbumCover } from './AlbumCover';

interface Props {
  track: Track;
  index?: number;
  action?: {
    label: string;
    onClick: () => void;
    tone?: 'add' | 'remove';
  };
  nowPlaying?: boolean;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Compact row used inside the playlist board and top-tracks list. Emphasizes
 * the track title and keeps meta in a monospace sidebar for that
 * developer-console aesthetic that pairs nicely with a Spotify clone.
 */
export function TrackRow({ track, index, action, nowPlaying }: Props): JSX.Element {
  return (
    <div
      className={[
        'group flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-colors',
        'hover:border-white/10 hover:bg-white/[0.04]',
        nowPlaying ? 'bg-spotify-green/10' : '',
      ].join(' ')}
    >
      {typeof index === 'number' && (
        <span className="mono w-6 shrink-0 text-right text-white/40">{index + 1}</span>
      )}
      <AlbumCover images={track.album.images} alt={track.name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white/95">{track.name}</div>
        <div className="truncate text-xs text-white/55">
          {track.artists.map((a) => a.name).join(', ')} · {track.album.name}
        </div>
      </div>
      <span className="mono hidden shrink-0 sm:inline">{formatDuration(track.durationMs)}</span>
      {action && (
        <button
          onClick={action.onClick}
          className={[
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition',
            action.tone === 'remove'
              ? 'border border-white/15 bg-white/5 text-white/80 hover:border-red-500/40 hover:text-red-400'
              : 'bg-spotify-green text-black hover:bg-[#1ed760]',
          ].join(' ')}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
