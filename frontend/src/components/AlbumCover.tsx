import type { SpotifyImage } from '../lib/types';

interface AlbumCoverProps {
  images: SpotifyImage[];
  alt: string;
  size?: number;
  className?: string;
}

/**
 * Picks the smallest image at-or-above the requested size to keep the DOM
 * lean while staying crisp on retina. Falls back to a solid dark tile when
 * Spotify returns no images (rare but does happen).
 */
export function AlbumCover({
  images,
  alt,
  size = 64,
  className = '',
}: AlbumCoverProps): JSX.Element {
  const sorted = [...images].sort(
    (a, b) => (a.width ?? 0) - (b.width ?? 0),
  );
  const pick = sorted.find((i) => (i.width ?? 0) >= size) ?? sorted[sorted.length - 1];

  return (
    <div
      className={[
        'relative aspect-square overflow-hidden rounded-lg bg-white/5 shadow-card ring-1 ring-white/10',
        className,
      ].join(' ')}
      style={{ width: size, height: size }}
    >
      {pick ? (
        <img
          src={pick.url}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-white/30">
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      )}
    </div>
  );
}
