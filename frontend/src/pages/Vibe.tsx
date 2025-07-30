import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AudioFeatures } from '../lib/types';
import { GlassCard } from '../components/GlassCard';
import { RadarChart } from '../components/RadarChart';
import { VibeLabel } from '../components/VibeLabel';
import { usePlaylist } from '../store/playlist';

function sparkline(values: number[]): string {
  // Build a simple SVG polyline path normalized to [0, 1].
  if (values.length === 0) return '';
  const w = 80;
  const h = 24;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => `${i * step},${h - Math.max(0, Math.min(1, v)) * h}`);
  return pts.join(' ');
}

export function Vibe(): JSX.Element {
  const tracks = usePlaylist((s) => s.tracks);
  const ids = tracks.map((t) => t.id);

  const featuresQuery = useQuery({
    queryKey: ['audio-features', ids.join(',')],
    queryFn: () => api.audioFeatures(ids),
    enabled: ids.length > 0,
  });

  const features: AudioFeatures[] = featuresQuery.data?.features ?? [];

  const vibeQuery = useQuery({
    queryKey: ['vibe', ids.join(',')],
    queryFn: () => api.vibe(features),
    enabled: features.length > 0,
  });

  if (tracks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="heading text-2xl">No playlist yet</h1>
        <p className="mt-2 text-white/55">
          Head over to the Builder and add a few tracks, then come back.
        </p>
      </div>
    );
  }

  if (featuresQuery.isLoading || vibeQuery.isLoading || !vibeQuery.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="glass animate-pulse p-8">Loading vibe…</div>
      </div>
    );
  }

  const vibe = vibeQuery.data;
  const tempos = features.map((f) => f.tempo);
  const minTempo = tempos.length ? Math.round(Math.min(...tempos)) : 0;
  const maxTempo = tempos.length ? Math.round(Math.max(...tempos)) : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_1fr]">
      <GlassCard>
        <h1 className="heading text-2xl">{vibe.mood}</h1>
        <p className="mono mt-1 text-white/50">Vibe fingerprint</p>
        <div className="mt-5">
          <VibeLabel vibe={vibe} />
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3">
          <Stat label="Tempo" value={`${minTempo}–${maxTempo} BPM`} />
          <Stat label="Energy" value={`${Math.round(vibe.averages.energy * 100)}%`} />
          <Stat label="Valence" value={`${Math.round(vibe.averages.valence * 100)}%`} />
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="heading text-xl">Audio features</h2>
        <p className="mono mt-1 text-white/50">averaged across {features.length} tracks</p>
        <div className="mt-4">
          <RadarChart averages={vibe.averages} />
        </div>
      </GlassCard>

      <GlassCard className="md:col-span-2">
        <h2 className="heading text-xl">Per-track breakdown</h2>
        <div className="mt-4 divide-y divide-white/5">
          {tracks.map((t) => {
            const f = features.find((x) => x.id === t.id);
            if (!f) return null;
            const vals = [f.danceability, f.energy, f.valence, f.acousticness, f.instrumentalness];
            return (
              <div key={t.id} className="flex items-center gap-4 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.name}</div>
                  <div className="truncate text-xs text-white/50">
                    {t.artists.map((a) => a.name).join(', ')}
                  </div>
                </div>
                <svg
                  width={80}
                  height={24}
                  viewBox="0 0 80 24"
                  className="text-spotify-green"
                >
                  <polyline
                    points={sparkline(vals)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  />
                </svg>
                <span className="mono w-24 text-right text-white/60">{Math.round(f.tempo)} BPM</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="glass !p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="mono mt-1 text-white">{value}</div>
    </div>
  );
}
