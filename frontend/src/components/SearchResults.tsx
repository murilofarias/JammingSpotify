import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Track } from '../lib/types';
import { usePlaylist } from '../store/playlist';
import { TrackCard } from './TrackCard';

interface Props {
  query: string;
}

export function SearchResults({ query }: Props): JSX.Element {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search(query, 24),
    enabled: query.trim().length > 0,
  });

  const { add, has } = usePlaylist();

  if (!query) {
    return (
      <div className="glass grid min-h-[300px] place-items-center p-8 text-center text-white/50">
        <div>
          <p className="text-base text-white/70">Start typing to find tracks.</p>
          <p className="mt-1 text-xs">Try “neon”, “rain”, or your favorite artist.</p>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass aspect-[3/4] animate-pulse p-3" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="glass p-6 text-sm text-red-300">
        Couldn’t search: {(error as Error).message}
      </div>
    );
  }

  const tracks = data?.tracks ?? [];
  if (tracks.length === 0) {
    return (
      <div className="glass p-6 text-center text-sm text-white/60">
        No tracks matched “{query}”.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tracks.map((t: Track) => (
        <TrackCard
          key={t.id}
          track={t}
          action={{
            label: has(t.id) ? 'Added' : 'Add',
            onClick: () => add(t),
            disabled: has(t.id),
          }}
        />
      ))}
    </div>
  );
}
