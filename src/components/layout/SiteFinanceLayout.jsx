import React from 'react';
import { Outlet, NavLink, useParams, Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, ArrowRightLeft, Settings, FileText, BarChart3, Wallet } from 'lucide-react';
import { useSites } from '@/features/sites/hooks/useSites';
import AccountBalancesModal from '@/features/finance/components/AccountBalancesModal';

export default function SiteFinanceLayout() {
  const { siteId } = useParams();
  const { data: sites } = useSites();
  const [isBalancesModalOpen, setIsBalancesModalOpen] = React.useState(false);
  
  const currentSite = sites?.find(s => s.id === siteId);

  return (
    <div className="space-y-6">
      {/* Site Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/finanzas" 
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentSite ? currentSite.name : 'Cargando sede...'}
            </h1>
            <button
              onClick={() => setIsBalancesModalOpen(true)}
              className="p-1.5 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5 border border-transparent hover:border-brand-orange/20 rounded-lg transition-all flex items-center gap-2 group"
              title="Ver saldos de cuentas"
            >
              <Wallet size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Saldos</span>
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Gestión financiera local
          </p>
        </div>
      </div>

      <AccountBalancesModal 
        isOpen={isBalancesModalOpen} 
        onClose={() => setIsBalancesModalOpen(false)} 
        siteId={siteId}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <NavLink
            to={`/finanzas/sede/${siteId}/cuentas-por-pagar`}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>Semáforo (Cuentas por Pagar)</span>
          </NavLink>

          <NavLink
            to={`/finanzas/sede/${siteId}/movimientos`}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            <ArrowRightLeft size={18} />
            <span>Movimientos</span>
          </NavLink>
          
          <NavLink
            to={`/finanzas/sede/${siteId}/diezmos`}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            <FileText size={18} />
            <span>Informes de Diezmadores</span>
          </NavLink>

          <NavLink
            to={`/finanzas/sede/${siteId}/informes`}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            <BarChart3 size={18} />
            <span>Informes Contables</span>
          </NavLink>

          <NavLink
            to={`/finanzas/sede/${siteId}/configuracion`}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            <Settings size={18} />
            <span>Configuración</span>
          </NavLink>
        </nav>
      </div>

      {/* Content Area */}
      <div>
        <Outlet context={{ siteId, organizationId: currentSite?.organization_id }} />
      </div>
    </div>
  );
}
