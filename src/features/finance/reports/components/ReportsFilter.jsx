import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

export default function ReportsFilter({ dateRange, setDateRange, isLoading, onRefresh }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">Filtros</h3>
        </div>

        <div className="flex flex-1 items-center gap-4 w-full md:w-auto overflow-x-auto">
          {/* Site Selector could go here if we were in a global view, but we are in SiteFinanceLayout */}
          
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-400 uppercase font-bold">Desde</span>
            <input 
              type="date" 
              className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer"
              value={dateRange?.from?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-400 uppercase font-bold">Hasta</span>
            <input 
              type="date" 
              className="bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 cursor-pointer"
              value={dateRange?.to?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-text text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Aplicar
          </button>
          
          <button 
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
                // Determine logic for 'Limpiar' or reset defaults
            }}
          >
            Limpiar
          </button>
        </div>

      </div>
    </div>
  );
}
