import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = "md", label, showLabel = true }: ScoreGaugeProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-score-good";
    if (value >= 50) return "text-score-average";
    return "text-score-poor";
  };

  const getScoreStroke = (value: number) => {
    if (value >= 80) return "var(--score-good, #22c55e)";
    if (value >= 50) return "var(--score-average, #eab308)";
    return "var(--score-poor, #ef4444)";
  };

  const dimensions = {
    sm: { size: 48, stroke: 4, fontSize: "text-sm" },
    md: { size: 80, stroke: 6, fontSize: "text-xl" },
    lg: { size: 120, stroke: 8, fontSize: "text-3xl" },
    xl: { size: 160, stroke: 10, fontSize: "text-5xl" },
  };

  const { size: dim, stroke, fontSize } = dimensions[size];
  const radius = (dim - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Background Circle */}
        <svg width={dim} height={dim} className="transform -rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-muted"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={getScoreStroke(score)}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold ${fontSize} ${getScoreColor(score)}`}>
          {Math.round(score)}
        </div>
      </div>
      {showLabel && label && (
        <span className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      )}
    </div>
  );
}
