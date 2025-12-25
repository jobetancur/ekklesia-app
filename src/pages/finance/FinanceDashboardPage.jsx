import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, TrendingUp, TrendingDown, DollarSign, Loader2, Filter } from 'lucide-react';
import { useSites } from '@/features/sites/hooks/useSites';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMinisterialFinance } from '@/features/finance/hooks/useMinisterialFinance';
import { ROLES } from '@/types/roles';

export default function FinanceDashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Redirect site-specific roles to their site dashboard immediately
  if (profile?.role && [ROLES.SITE_ADMIN, ROLES.TREASURER].includes(profile.role) && profile.site_id) {
    return <Navigate to={`/finanzas/sede/${profile.site_id}`} replace />;
  }

  const { data: sites, isLoading: isLoadingSites } = useSites(profile?.organization_id);
  
  const { 
    stats, 
    isLoading: isLoadingFinance, 
    selectedSiteId, 
    setSelectedSiteId,
    dateRange
  } = useMinisterialFinance(profile?.organization_id);

  // Filter sites belonging to the organization
  const filteredSites = sites?.filter(s => s.organization_id === profile?.organization_id) || [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas Ministeriales</h1>
          <p className="text-gray-500">Vista Global y selección de sedes</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter size={18} className="text-gray-400 ml-2" />
          <select 
            value={selectedSiteId || ''} 
            onChange={(e) => setSelectedSiteId(e.target.value || null)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer pr-8"
          >
            <option value="">Todas las Sedes</option>
            {filteredSites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          {isLoadingFinance ? (
            <div className="animate-pulse flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="h-8 bg-gray-100 rounded w-2/3"></div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Ingresos {selectedSiteId ? 'Sede' : 'Globales'}</p>
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</h3>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> Mes actual
              </p>
            </div>
          )}
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          {isLoadingFinance ? (
            <div className="animate-pulse flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="h-8 bg-gray-100 rounded w-2/3"></div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Gastos {selectedSiteId ? 'Sede' : 'Globales'}</p>
              <h3 className="text-2xl font-bold text-red-600">{formatCurrency(stats.expenses)}</h3>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown size={12} className="mr-1" /> Mes actual
              </p>
            </div>
          )}
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          {isLoadingFinance ? (
            <div className="animate-pulse flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="h-8 bg-gray-100 rounded w-2/3"></div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Saldo Total</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.balance)}</h3>
              <p className="text-xs text-gray-400 mt-1">Disponible en cuentas</p>
            </div>
          )}
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <h2 className="text-xl font-semibold text-gray-900 pt-4">Sedes Disponibles</h2>
      
      {isLoadingSites ? (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-orange" size={32} />
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Building2 className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-gray-500">No se encontraron sedes vinculadas a tu organización.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
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
