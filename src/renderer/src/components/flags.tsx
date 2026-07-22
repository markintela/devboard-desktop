export function FlagBR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 15" className={className} aria-hidden="true">
      <rect width="20" height="15" fill="#009C3B" />
      <polygon points="10,2 18,7.5 10,13 2,7.5" fill="#FFDF00" />
      <circle cx="10" cy="7.5" r="3.2" fill="#002776" />
    </svg>
  );
}

export function FlagUS({ className }: { className?: string }) {
  const stripeHeight = 15 / 7;
  return (
    <svg viewBox="0 0 20 15" className={className} aria-hidden="true">
      <rect width="20" height="15" fill="#FFFFFF" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x="0"
          y={i * stripeHeight}
          width="20"
          height={stripeHeight}
          fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}
        />
      ))}
      <rect x="0" y="0" width="9" height={stripeHeight * 4} fill="#3C3B6E" />
    </svg>
  );
}

export function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 15" className={className} aria-hidden="true">
      <rect width="20" height="15" fill="#AA151B" />
      <rect y="3.75" width="20" height="7.5" fill="#F1BF00" />
    </svg>
  );
}
