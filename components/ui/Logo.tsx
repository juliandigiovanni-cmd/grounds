import { BRAND_NAME } from "@/lib/brand";

interface Props {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
}

export function Logo({ variant = "dark", size = "md", showMark = true }: Props) {
  const color = variant === "dark" ? "#1A0A00" : "#F5F0E8";
  const accentColor = "#C8972A";

  const sizes = {
    sm: { height: 24, fontSize: 16, markSize: 16 },
    md: { height: 32, fontSize: 22, markSize: 20 },
    lg: { height: 48, fontSize: 32, markSize: 28 },
  };

  const { height, fontSize, markSize } = sizes[size];

  return (
    <svg
      height={height}
      viewBox={`0 0 ${showMark ? fontSize * 5.5 + markSize + 8 : fontSize * 5.5} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={BRAND_NAME}
      role="img"
    >
      {showMark && (
        <g transform={`translate(0, ${(height - markSize) / 2})`}>
          {/* Coffee cup mark */}
          <rect x="2" y="3" width={markSize - 6} height={markSize - 5} rx="2" fill={accentColor} />
          <path d={`M${markSize - 4} 5 Q${markSize + 1} 7 ${markSize - 4} 9`} stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="4" y={markSize - 4} width={markSize - 10} height="2" rx="1" fill={accentColor} opacity="0.6" />
          <path d={`M5 3 Q${(markSize - 6) / 2 + 2} 0 ${markSize - 5} 3`} stroke={accentColor} strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      )}
      <text
        x={showMark ? markSize + 8 : 0}
        y={height * 0.75}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={fontSize}
        fontWeight="700"
        fill={color}
        letterSpacing="-0.5"
      >
        {BRAND_NAME}
      </text>
    </svg>
  );
}
