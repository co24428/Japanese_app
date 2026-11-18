/**
 * A circular progress indicator, e.g. "1 of 2 lessons done" on the Learn page.
 * Pure SVG: works in server components.
 */
interface Props {
  /** 0 to 1. */
  value: number;
  size?: number;
  stroke?: number;
  /** Colour of the filled part; defaults to the theme's "good" green. */
  color?: string;
  children?: React.ReactNode;
  label: string;
}

export function ProgressRing({ value, size = 52, stroke = 5, color = "var(--good)", children, label }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
