import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = "md", label, showLabel = true }: ScoreGaugeProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreStroke = (value: number) => {
    if (value >= 80) return "#22c55e"; // green-500
    if (value >= 50) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const dimensions = {
    sm: { size: 40, stroke: 3, fontSize: "text-sm font-bold" },
    md: { size: 80, stroke: 5, fontSize: "text-2xl font-bold" },
    lg: { size: 120, stroke: 6, fontSize: "text-4xl font-bold" },
    xl: { size: 160, stroke: 8, fontSize: "text-6xl font-black" },
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
            stroke="#e2e8f0" // slate-200
            strokeWidth={stroke}
            fill="transparent"
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
