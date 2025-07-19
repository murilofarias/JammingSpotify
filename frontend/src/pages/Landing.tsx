import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { SpotifyButton } from '../components/SpotifyButton';

const FEATURES = [
  {
    icon: '◉',
    title: 'Search & build',
    body: 'Search millions of tracks and drop them into your playlist instantly.',
  },
  {
    icon: '⟳',
    title: 'Vibe fingerprint',
    body:
      'We average the audio features of your playlist and label it in three words — chill, hype, focus, dreamy, driving, groovy…',
  },
  {
    icon: '⌁',
    title: 'Smart recommendations',
    body: 'Seeded by your playlist’s top tracks using Spotify’s recommendation engine.',
  },
  {
    icon: '⎇',
    title: 'Save to Spotify',
    body: 'One click and it lands in your account. No manual copying, no friction.',
  },
];

export function Landing(): JSX.Element {
  const { data: status } = useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api.authStatus(),
    staleTime: 60_000,
  });

  const onConnect = async () => {
    const res = await api.login();
    if (res.mode === 'live' && res.authUrl) {
      window.location.href = res.authUrl;
    } else if (res.mode === 'fixture' && res.redirectTo) {
      window.location.href = res.redirectTo;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="pill mb-5">
            <span className="h-2 w-2 rounded-full bg-spotify-green" />
            Portfolio project · 2026
          </span>
          <h1 className="heading text-4xl leading-tight sm:text-5xl md:text-6xl">
            Build a <span className="text-spotify-green">Spotify playlist</span>
            <br className="hidden sm:block" /> from your vibe.
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/65 sm:text-lg">
            Search tracks, shape a playlist, watch its mood fingerprint emerge in real
            time, and push the whole thing to your Spotify account with a single click.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <SpotifyButton onClick={onConnect}>
              {status?.fixtureMode ? 'Try the demo →' : 'Connect Spotify →'}
            </SpotifyButton>
            <Link to="/app" className="btn-ghost">
              Open the builder
            </Link>
          </div>
          {status?.fixtureMode && (
            <p className="mono mt-4">
              fixture mode is on — no Spotify account required
            </p>
          )}
        </div>

        <GlassCard className="relative overflow-hidden !p-0">
          <div className="bg-mesh-radial p-6">
            <div className="mono mb-3 text-white/50">now playing · preview</div>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, #1db954 0%, #8b5cf6 60%, #06b6d4 100%)',
                }}
              />
              <div>
                <div className="text-lg font-semibold">Chromatic Kids</div>
                <div className="text-sm text-white/60">Parallax</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ['energy', '82%'],
                ['valence', '79%'],
                ['tempo', '126 BPM'],
              ].map(([k, v]) => (
                <div key={k} className="glass !p-3">
                  <div className="text-[10px] uppercase tracking-wider text-white/45">
                    {k}
                  </div>
                  <div className="mono mt-1 text-white">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-spotify-green/20 px-3 py-1 text-xs text-spotify-green">
                hype
              </span>
              <span className="rounded-full bg-accent-purple/20 px-3 py-1 text-xs text-accent-purple">
                groovy
              </span>
              <span className="rounded-full bg-accent-cyan/20 px-3 py-1 text-xs text-accent-cyan">
                uplifting
              </span>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <GlassCard key={f.title} hoverable>
            <div className="text-2xl text-spotify-green">{f.icon}</div>
            <div className="mt-3 text-base font-semibold">{f.title}</div>
            <p className="mt-1 text-sm text-white/60">{f.body}</p>
          </GlassCard>
        ))}
      </section>
    </div>
  );
}
