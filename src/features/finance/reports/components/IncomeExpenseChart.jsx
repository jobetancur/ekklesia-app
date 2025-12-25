import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/utils/format';

export default function IncomeExpenseChart({ data, isLoading }) {
  if (isLoading || !data) {
    return <div className="h-80 bg-gray-50 rounded-xl animate-pulse" />;
  }

  // Transform data for the simplified view shown in the mock image
  // The image shows just Total Income, Total Expense, Balance.
  // But usually a "Chart" implies trends over time. 
  // Let's implement the Trend view (Monthly) as it's more useful, 
  // and maybe a toggle for "Summary" view if needed later.
  // Actually, the image "Visualización Gráfica" shows 3 bars: Ingresos, Egresos, Balance. 
  // Let's replicate EXACTLY the image first.

  const summaryData = [
    { name: 'Ingresos', amount: data.summary.income, color: '#48bb78' },
    { name: 'Egresos', amount: data.summary.expenses, color: '#f56565' },
    { name: 'Balance', amount: data.summary.balance, color: '#4299e1' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Resumen Financiero</h3>
        {/* Placeholder for chart options if needed */}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={summaryData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={60}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#718096', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#718096', fontSize: 12 }} 
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#F7FAFC' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              formatter={(value) => [formatCurrency(value), 'Monto']}
            />
            {/* Legend is not strictly necessary for 3 distinct labeled bars but good for color reference */}
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="amount" name="Monto (COP)" radius={[4, 4, 0, 0]}>
              {summaryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
