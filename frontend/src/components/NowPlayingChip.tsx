import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AlbumCover } from './AlbumCover';
import { EqualizerBars } from './EqualizerBars';

/**
 * Small chip shown in the header when the user has something playing on
 * Spotify. Polls every ~15s so it doesn't beat up the rate limit but still
 * feels live.
 */
export function NowPlayingChip(): JSX.Element | null {
  const { data } = useQuery({
    queryKey: ['currently-playing'],
    queryFn: () => api.currentlyPlaying(),
    refetchInterval: 15_000,
    retry: false,
  });

  if (!data?.isPlaying || !data.track) return null;

  return (
    <div className="pill !px-2 !py-1.5">
      <AlbumCover images={data.track.album.images} alt={data.track.name} size={22} />
      <EqualizerBars size="sm" />
      <span className="max-w-[180px] truncate text-xs text-white/85">
        {data.track.name} · {data.track.artists[0]?.name}
      </span>
    </div>
  );
}
