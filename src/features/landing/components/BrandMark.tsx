export function BrandMark({ className, size = 30 }: { className?: string; size?: number }) {
  const height = Math.round(size * (20 / 30));
  return (
    <svg width={size} height={height} viewBox="0 0 30 20" aria-hidden="true" className={className}>
      <circle cx="11" cy="10" r="8.5" fill="none" stroke="#f0b400" strokeWidth={2} />
      <circle cx="19" cy="10" r="8.5" fill="#f0b400" fillOpacity={0.18} stroke="#f0b400" strokeWidth={2} />
    </svg>
  );
}
