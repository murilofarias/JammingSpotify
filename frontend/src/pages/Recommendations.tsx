import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { RecommendationGrid } from '../components/RecommendationGrid';
import { usePlaylist } from '../store/playlist';

export function Recommendations(): JSX.Element {
  const tracks = usePlaylist((s) => s.tracks);
  const seeds = tracks.slice(0, 5).map((t) => t.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations', seeds.join(',')],
    queryFn: () => api.recommendations(seeds, 20),
    enabled: seeds.length > 0,
  });

  if (tracks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="heading text-2xl">Add a few tracks first</h1>
        <p className="mt-2 text-white/55">
          Recommendations are seeded by your current playlist. Head to{' '}
          <Link to="/app" className="text-spotify-green hover:underline">
            the builder
          </Link>{' '}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="heading text-2xl sm:text-3xl">Recommendations</h1>
        <p className="mt-1 text-sm text-white/55">
          Seeded by your playlist’s top {seeds.length} tracks. Tap add, or select
          several and bulk-add.
        </p>
      </header>

      {isLoading && (
        <div className="glass animate-pulse p-8">Finding tracks you might like…</div>
      )}
      {isError && (
        <div className="glass p-6 text-red-300">Couldn’t load recommendations.</div>
      )}
      {data && <RecommendationGrid tracks={data.tracks} />}
    </div>
  );
}
