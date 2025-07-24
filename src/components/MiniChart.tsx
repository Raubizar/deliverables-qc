interface BarChartProps {
  missing: number;
  total: number;
}

export const MiniBarChart = ({ missing, total }: BarChartProps) => {
  const percentage = total > 0 ? (missing / total) * 100 : 0;
  
  return (
    <div className="w-16 h-6 bg-muted rounded-sm overflow-hidden">
      <div 
        className="h-full bg-destructive rounded-sm apple-transition"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

interface DoughnutChartProps {
  percentage: number;
}

export const MiniDoughnut = ({ percentage }: DoughnutChartProps) => {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--accent))"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="apple-transition"
      />
    </svg>
  );
};

interface SparkBarProps {
  data: number[];
}

export const SparkBar = ({ data }: SparkBarProps) => {
  const width = 80;
  const height = 14;
  const barWidth = width / data.length;
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <svg width={width} height={height} className="rounded-sm">
      {data.map((value, index) => {
        const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
        const barHeight = Math.max(2, height * normalizedValue);
        const y = height - barHeight;
        
        // Color transition from grey to green
        const greyAmount = (1 - normalizedValue) * 100;
        const greenAmount = normalizedValue * 100;
        const color = `hsl(120, ${greenAmount}%, ${50 + greyAmount * 0.3}%)`;
        
        return (
          <rect
            key={index}
            x={index * barWidth}
            y={y}
            width={barWidth - 0.5}
            height={barHeight}
            fill={color}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
};