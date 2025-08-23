import { useEffect, useState } from 'react';

interface Props {
  onSubmit: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

/**
 * Debounced search bar. 250ms feels responsive without firing on every
 * keystroke when the user types quickly.
 */
export function SearchBar({ onSubmit, initialValue = '', placeholder }: Props): JSX.Element {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const h = setTimeout(() => {
      if (value.trim().length >= 2) onSubmit(value.trim());
    }, 250);
    return () => clearTimeout(h);
  }, [value, onSubmit]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length >= 1) onSubmit(value.trim());
      }}
      className="relative"
      role="search"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        className="input !pl-11"
        placeholder={placeholder ?? 'Search for a song, artist, or album'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search"
      />
    </form>
  );
}
