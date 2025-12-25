import React from 'react';
import { formatCurrency, formatDate } from '@/utils/format';

export default function MovementsDetailTable({ movements, isLoading }) {
  if (isLoading) {
    return <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
        No hay movimientos en este periodo.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">Detalle de Movimientos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-200">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                  {/* Assuming date is string YYYY-MM-DD or Date object */}
                  {movement.date}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    movement.type === 'Ingreso' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {movement.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-800 font-medium">
                  {movement.description}
                </td>
                <td className="px-6 py-4 text-gray-500 capitalize">
                  {movement.category?.replace('_', ' ')}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${
                  movement.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(movement.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
