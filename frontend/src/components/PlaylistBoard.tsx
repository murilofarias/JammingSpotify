import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { usePlaylist } from '../store/playlist';
import { TrackRow } from './TrackRow';
import { SpotifyButton } from './SpotifyButton';

export function PlaylistBoard(): JSX.Element {
  const { name, tracks, setName, remove, clear } = usePlaylist();
  const [toast, setToast] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (tracks.length === 0) throw new Error('Add at least one track');
      return api.createPlaylist({
        name,
        description: `Built with Jamming — ${tracks.length} tracks`,
        trackIds: tracks.map((t) => t.id),
      });
    },
    onSuccess: (result) => {
      setToast(`Saved ${result.saved} tracks to Spotify`);
      setTimeout(() => setToast(null), 4000);
    },
    onError: (err: Error) => {
      setToast(err.message);
      setTimeout(() => setToast(null), 4000);
    },
  });

  const totalMs = tracks.reduce((acc, t) => acc + t.durationMs, 0);
  const totalMin = Math.round(totalMs / 60000);

  return (
    <section className="glass flex h-full min-h-[500px] flex-col p-5">
      <header className="mb-4 flex items-center gap-3">
        <input
          className="input !py-2 !text-lg !font-semibold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Playlist name"
        />
      </header>

      <div className="mb-3 flex items-center justify-between text-xs text-white/55">
        <span>
          <span className="mono">{tracks.length}</span> tracks · <span className="mono">{totalMin}</span> min
        </span>
        <button
          className="text-white/45 transition hover:text-white/80"
          onClick={() => clear()}
          disabled={tracks.length === 0}
        >
          clear
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {tracks.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-white/45">
            <div>
              <p className="mb-2 text-base text-white/65">Your playlist is empty.</p>
              <p>Search for tracks on the left and tap Add.</p>
            </div>
          </div>
        ) : (
          tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              index={i}
              track={t}
              action={{
                label: 'Remove',
                tone: 'remove',
                onClick: () => remove(t.id),
              }}
            />
          ))
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="text-xs text-white/55">
          {toast ? <span className="text-spotify-green">{toast}</span> : 'Ready when you are.'}
        </div>
        <SpotifyButton
          onClick={() => save.mutate()}
          disabled={save.isPending || tracks.length === 0}
        >
          {save.isPending ? 'Saving…' : 'Save to Spotify'}
        </SpotifyButton>
      </footer>
    </section>
  );
}
