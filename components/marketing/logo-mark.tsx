/**
 * The Classical system's mark: a line-drawn open book with a small circular
 * passport-stamp seal. Stroke only, never filled — brand sheet: "Don't fill
 * the book or the seal with color, the line is the mark." Renders in
 * currentColor so callers set the color with a text-* class.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M32 16 C24 13 14 14 8 18 L8 46 C14 42 24 41 32 44" />
      <path d="M32 16 C40 13 50 14 56 18 L56 46 C50 42 40 41 32 44" />
      <line x1="32" y1="16" x2="32" y2="44" />
      <g transform="translate(47,13) rotate(-12)">
        <circle r="8" strokeWidth={1.8} />
        <path d="M-3.5 0 L-1 2.8 L4 -3.2" strokeWidth={1.8} />
      </g>
    </svg>
  )
}
