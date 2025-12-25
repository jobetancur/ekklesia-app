import React from 'react';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function FinanceSummaryCards({ data, isLoading }) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const { income, expenses, balance, incomeTrend, expensesTrend } = data.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Ingresos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-sm font-medium">Total Ingresos</p>
          {incomeTrend > 0 ? (
            <TrendingUp className="text-green-500" size={20} />
          ) : (
            <TrendingDown className="text-red-500" size={20} />
          )}
        </div>
        <h3 className="text-3xl font-bold text-green-600 mb-1">
          {formatCurrency(income)}
        </h3>
        <p className="text-xs text-gray-400">
          {incomeTrend > 0 ? '+' : ''}{incomeTrend}% respecto al mes anterior
        </p>
      </div>

      {/* Egresos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-sm font-medium">Total Egresos</p>
          {expensesTrend < 0 ? (
            <TrendingDown className="text-green-500" size={20} /> // Negative expense trend is good? Usually red arrow for expense amount, but context matters. Let's keep consistent with design.
          ) : (
             <TrendingUp className="text-red-500" size={20} />
          )}
        </div>
        <h3 className="text-3xl font-bold text-red-600 mb-1">
          {formatCurrency(expenses)}
        </h3>
        <p className="text-xs text-gray-400">
          {expensesTrend > 0 ? '+' : ''}{expensesTrend}% respecto al mes anterior
        </p>
      </div>

      {/* Balance */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gray-500 text-sm font-medium">Balance</p>
          <Scale className="text-brand-orange" size={20} />
        </div>
        <h3 className={`text-3xl font-bold mb-1 ${balance >= 0 ? 'text-brand-text' : 'text-red-600'}`}>
          {formatCurrency(balance)}
        </h3>
        <p className="text-xs text-gray-400">
          {balance >= 0 ? 'Balance positivo' : 'Balance negativo'}
        </p>
      </div>
    </div>
  );
}
