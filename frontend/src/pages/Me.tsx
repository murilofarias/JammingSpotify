import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { TimeRange } from '../lib/types';
import { AlbumCover } from '../components/AlbumCover';
import { EqualizerBars } from '../components/EqualizerBars';
import { GlassCard } from '../components/GlassCard';
import { TimeRangeToggle } from '../components/TimeRangeToggle';
import { TrackRow } from '../components/TrackRow';
import { usePlaylist } from '../store/playlist';

export function Me(): JSX.Element {
  const [range, setRange] = useState<TimeRange>('medium_term');
  const [tab, setTab] = useState<'tracks' | 'artists'>('tracks');

  const cp = useQuery({ queryKey: ['cp'], queryFn: () => api.currentlyPlaying(), refetchInterval: 15_000 });
  const topTracks = useQuery({
    queryKey: ['top-tracks', range],
    queryFn: () => api.topTracks(range),
  });
  const topArtists = useQuery({
    queryKey: ['top-artists', range],
    queryFn: () => api.topArtists(range),
  });

  const { add, has } = usePlaylist();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading text-2xl sm:text-3xl">Your Spotify</h1>
          <p className="mt-1 text-sm text-white/55">
            What you listen to, what’s playing, what’s trending for you.
          </p>
        </div>
        <TimeRangeToggle value={range} onChange={setRange} />
      </header>

      {cp.data?.track && cp.data.isPlaying && (
        <GlassCard className="relative mb-6 overflow-hidden !p-0">
          <div
            aria-hidden
            className="absolute inset-0 scale-110 blur-2xl opacity-50"
            style={{
              backgroundImage: `url(${cp.data.track.album.images[0]?.url ?? ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative flex items-center gap-4 bg-ink-900/60 p-5 backdrop-blur-sm">
            <AlbumCover images={cp.data.track.album.images} alt={cp.data.track.name} size={96} />
            <div className="min-w-0 flex-1">
              <div className="mono text-spotify-green">now playing</div>
              <div className="truncate text-xl font-semibold">{cp.data.track.name}</div>
              <div className="truncate text-sm text-white/65">
                {cp.data.track.artists.map((a) => a.name).join(', ')} · {cp.data.track.album.name}
              </div>
            </div>
            <EqualizerBars size="lg" />
          </div>
        </GlassCard>
      )}

      <div className="mb-4 flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(['tracks', 'artists'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition',
              tab === t ? 'bg-white text-ink-900' : 'text-white/60 hover:text-white/90',
            ].join(' ')}
          >
            Top {t}
          </button>
        ))}
      </div>

      {tab === 'tracks' ? (
        <GlassCard>
          {topTracks.isLoading && <p className="text-white/55">Loading…</p>}
          {topTracks.data && (
            <div className="space-y-1">
              {topTracks.data.tracks.map((t, i) => (
                <TrackRow
                  key={t.id}
                  index={i}
                  track={t}
                  action={{
                    label: has(t.id) ? 'Added' : 'Add',
                    onClick: () => add(t),
                  }}
                />
              ))}
            </div>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {topArtists.data?.artists.map((a) => (
            <GlassCard key={a.id} hoverable className="flex flex-col items-center text-center">
              {a.images[0] && (
                <img
                  src={a.images[0].url}
                  alt={a.name}
                  className="h-28 w-28 rounded-full object-cover ring-1 ring-white/10"
                />
              )}
              <div className="mt-3 font-semibold">{a.name}</div>
              <div className="mono mt-1 text-white/55">
                {a.followers.toLocaleString()} followers
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {a.genres.slice(0, 2).map((g) => (
                  <span key={g} className="pill !text-[10px]">
                    {g}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
