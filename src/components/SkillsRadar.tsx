import type { Skills } from "@/types/github";

interface SkillsRadarProps {
  skills: Skills;
}

const SkillsRadar = ({ skills }: SkillsRadarProps) => {
  const skillLabels: Record<keyof Skills, string> = {
    frontend: "前端开发",
    backend: "后端开发",
    devops: "DevOps",
    algorithms: "算法能力",
    architecture: "架构设计",
    documentation: "文档规范",
  };

  const skillEntries = Object.entries(skills) as [keyof Skills, number][];
  const maxValue = 100;
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  // Calculate polygon points
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / skillEntries.length - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Generate polygon path
  const polygonPoints = skillEntries
    .map(([, value], index) => {
      const point = getPoint(index, value);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Generate grid lines
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-sm mx-auto">
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={skillEntries
              .map((_, index) => {
                const point = getPoint(index, level);
                return `${point.x},${point.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {skillEntries.map((_, index) => {
          const point = getPoint(index, maxValue);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon with gradient */}
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(185 80% 55%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280 70% 50%)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polygon
          points={polygonPoints}
          fill="url(#skillGradient)"
          fillOpacity="0.3"
          stroke="hsl(185 80% 55%)"
          strokeWidth="2"
          className="drop-shadow-lg"
        />

        {/* Data points */}
        {skillEntries.map(([, value], index) => {
          const point = getPoint(index, value);
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="hsl(185 80% 55%)"
              className="drop-shadow-lg"
            />
          );
        })}

        {/* Labels */}
        {skillEntries.map(([key, value], index) => {
          const labelPoint = getPoint(index, maxValue + 25);
          return (
            <g key={key}>
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-medium"
              >
                {skillLabels[key]}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-primary text-xs font-bold"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SkillsRadar;
