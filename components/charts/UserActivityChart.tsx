import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface UserActivityChartProps {
  data: ChartData[];
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-sm" title={`${item.name}: ${item.value} préstamos`}>
                    <div className="w-24 sm:w-32 text-right truncate text-brand-text-secondary font-medium">{item.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                            className="bg-brand-primary h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold transition-all duration-500 ease-out"
                            style={{ width: `${(item.value / maxValue) * 100}%`}}
                        >
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
            {data.length === 0 && <p className="text-center text-gray-500 py-4">No hay datos de actividad para mostrar.</p>}
        </div>
    );
};