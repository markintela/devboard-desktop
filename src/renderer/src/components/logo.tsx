export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <rect
        x="53"
        y="53"
        width="150"
        height="150"
        rx="38"
        transform="rotate(45 128 128)"
        fill="#7B5CFA"
      />
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="61.1" y1="97.2" x2="61.1" y2="158.8" />
        <path d="M61.1,97.2 A29,29 0 0 1 61.1,158.8" />
        <line x1="102.5" y1="136.8" x2="143.8" y2="136.8" />
        <path d="M140,152.4 A22,22 0 1 1 145.7,131.1" />
        <path d="M158.8,114.8 L176.4,158.8 L194,114.8" />
      </g>
    </svg>
  );
}
