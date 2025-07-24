import { useState } from 'react';
import { PlaylistBoard } from '../components/PlaylistBoard';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';

export function Builder(): JSX.Element {
  const [query, setQuery] = useState('');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="heading text-2xl sm:text-3xl">Builder</h1>
        <p className="mt-1 text-sm text-white/55">
          Search, curate, save. Your playlist is persisted locally until you hit
          save, so refreshes don’t nuke your work.
        </p>
      </header>

      <div className="mb-6">
        <SearchBar onSubmit={setQuery} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mono mb-3 text-white/50">search results</h2>
          <SearchResults query={query} />
        </section>
        <PlaylistBoard />
      </div>
    </div>
  );
}
