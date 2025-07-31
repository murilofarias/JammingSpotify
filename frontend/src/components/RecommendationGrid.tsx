import { useState } from 'react';
import type { Track } from '../lib/types';
import { usePlaylist } from '../store/playlist';
import { TrackCard } from './TrackCard';
import { SpotifyButton } from './SpotifyButton';

interface Props {
  tracks: Track[];
}

export function RecommendationGrid({ tracks }: Props): JSX.Element {
  const { addMany, has } = usePlaylist();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addAll = () => {
    const fresh = tracks.filter((t) => !has(t.id));
    addMany(fresh);
    setSelected(new Set());
  };
  const addSelected = () => {
    const fresh = tracks.filter((t) => selected.has(t.id) && !has(t.id));
    addMany(fresh);
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-white/60">
          {selected.size} selected
        </span>
        <SpotifyButton
          variant="ghost"
          onClick={addSelected}
          disabled={selected.size === 0}
        >
          Add selected
        </SpotifyButton>
        <SpotifyButton onClick={addAll} disabled={tracks.length === 0}>
          Add all
        </SpotifyButton>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tracks.map((t) => (
          <TrackCard
            key={t.id}
            track={t}
            selected={selected.has(t.id)}
            onToggle={() => toggle(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
