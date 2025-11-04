import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface ToolStatusChartProps {
  data: ChartData[];
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444', '#4B5563'];

export const ToolStatusChart: React.FC<ToolStatusChartProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return <div className="text-center text-gray-500 py-10">No hay datos disponibles.</div>;
  }

  let cumulativePercent = 0;

  const segments = data.map((item, index) => {
    const percent = (item.value / total) * 100;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;

    return {
      ...item,
      percent: percent.toFixed(1),
      color: COLORS[index % COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-200" strokeWidth="3" fill="transparent" />
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx="18"
              cy="18"
              r="15.9155"
              className="stroke-current"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              style={{ color: segment.color }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-brand-text-primary">{total}</span>
          <span className="text-sm text-brand-text-secondary">Total</span>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ul className="space-y-2">
          {segments.map((segment, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></span>
                <span className="text-brand-text-primary">{segment.name}</span>
              </div>
              <span className="font-semibold text-brand-text-secondary">{segment.value} ({segment.percent}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};