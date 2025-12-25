import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/utils/format';

const COLORS = ['#48bb78', '#9f7aea', '#ecc94b', '#f56565', '#ed64a6', '#4299e1', '#a0aec0'];

export default function CategoryBreakdownChart({ title, data, isLoading }) {
  if (isLoading || !data) {
    return <div className="h-80 bg-gray-50 rounded-xl animate-pulse" />;
  }

  // Filter out zero values to avoid ugly empty segments
  const activeData = data.filter(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={80} // Donut style
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value) => formatCurrency(value)}
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Optional: List breakdown below if needed, but Legend covers it usually */}
    </div>
  );
}
