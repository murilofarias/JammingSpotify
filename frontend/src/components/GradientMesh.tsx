/**
 * Decorative background mesh. The body already sets radial gradients, but this
 * component layers three additional blurred blobs for extra depth on hero
 * surfaces. Purely visual — no props, no state.
 */
export function GradientMesh(): JSX.Element {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-spotify-green/15 blur-3xl" />
      <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-accent-purple/15 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[30%] h-[520px] w-[520px] rounded-full bg-accent-cyan/10 blur-3xl" />
    </div>
  );
}
