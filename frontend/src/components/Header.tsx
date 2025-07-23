import { useQuery } from '@tanstack/react-query';
import { NavLink, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { NowPlayingChip } from './NowPlayingChip';
import { SpotifyButton } from './SpotifyButton';

const NAV = [
  { to: '/app', label: 'Builder' },
  { to: '/vibe', label: 'Vibe' },
  { to: '/recs', label: 'Recommendations' },
  { to: '/me', label: 'Your Spotify' },
];

export function Header(): JSX.Element {
  const { data: status } = useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api.authStatus(),
    staleTime: 60_000,
  });
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.me(),
    enabled: status?.authenticated ?? false,
    retry: false,
  });

  const onConnect = async () => {
    const res = await api.login();
    if (res.mode === 'live' && res.authUrl) {
      window.location.href = res.authUrl;
    } else if (res.mode === 'fixture' && res.redirectTo) {
      window.location.href = res.redirectTo;
    }
  };

  const onLogout = async () => {
    await api.logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-spotify-green text-black"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.3 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-5.9-2-9.8-1.1a.7.7 0 1 1-.3-1.3c4.3-1 8-.6 10.9 1.2.3.2.4.6.2 1Zm1.2-2.7a.8.8 0 0 1-1.1.3c-3-1.8-7.5-2.4-11-1.3a.8.8 0 0 1-.5-1.5c4-1.2 9-.6 12.4 1.4.4.2.5.7.2 1.1Zm.1-2.8c-3.5-2.1-9.3-2.3-12.7-1.3a1 1 0 1 1-.6-1.9c3.9-1.2 10.3-.9 14.3 1.5a1 1 0 1 1-1 1.7Z" />
            </svg>
          </span>
          Jamming
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-1.5 text-sm transition',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                ].join(' ')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <NowPlayingChip />
          {status?.authenticated ? (
            <div className="flex items-center gap-2">
              {me?.images?.[0]?.url ? (
                <img
                  src={me.images[0].url}
                  alt={me.displayName}
                  className="h-8 w-8 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                  {me?.displayName?.slice(0, 1) ?? '?'}
                </div>
              )}
              <button
                onClick={onLogout}
                className="text-xs text-white/55 hover:text-white"
              >
                Log out
              </button>
              {status?.fixtureMode && (
                <span className="pill !border-accent-cyan/30 !text-accent-cyan">demo</span>
              )}
            </div>
          ) : (
            <SpotifyButton onClick={onConnect}>
              {status?.fixtureMode ? 'Try demo' : 'Connect Spotify'}
            </SpotifyButton>
          )}
        </div>
      </div>
    </header>
  );
}
