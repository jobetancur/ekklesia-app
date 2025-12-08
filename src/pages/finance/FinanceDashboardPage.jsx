import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { useSites } from '@/features/sites/hooks/useSites';

export default function FinanceDashboardPage() {
  const navigate = useNavigate();
  const { data: sites, isLoading, error } = useSites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas Ministeriales</h1>
        <p className="text-gray-500">Vista Global y selección de sedes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Ingresos Globales</p>
            <h3 className="text-2xl font-bold text-green-600">$12,500.00</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> +15% vs mes ant.
            </p>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Gastos Globales</p>
            <h3 className="text-2xl font-bold text-red-600">$4,200.00</h3>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingDown size={12} className="mr-1" /> +5% vs mes ant.
            </p>
          </div>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
             <p className="text-sm font-medium text-gray-500 mb-1">Saldo Total</p>
            <h3 className="text-2xl font-bold text-gray-900">$8,300.00</h3>
            <p className="text-xs text-gray-400 mt-1">Disponible en cuentas</p>
          </div>
           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <h2 className="text-xl font-semibold text-gray-900 pt-4">Sedes Disponibles</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-orange" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            Error al cargar las sedes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites?.map((site) => (
            <button
                key={site.id}
                onClick={() => navigate(`/finanzas/sede/${site.id}`)}
                className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-orange/30 transition-all text-left flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <Building2 size={24} />
                </div>
                <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors">{site.name}</h3>
                <p className="text-sm text-gray-500">{site.city || site.location || 'Ubicación no registrada'}</p>
                </div>
            </button>
            ))}
        </div>
      )}
    </div>
  );
}
