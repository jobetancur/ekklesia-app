import React from 'react';
import { X, Wallet, RefreshCw } from 'lucide-react';
import { useFinancialAccounts } from '../hooks/useFinancialResources';

export default function AccountBalancesModal({ isOpen, onClose, siteId }) {
  const { data: accounts, isLoading, isError, refetch } = useFinancialAccounts(siteId);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
              <Wallet size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Saldos de Cuentas</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-all"
              title="Actualizar"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw size={24} className="animate-spin" />
              <p className="text-sm font-medium">Cargando saldos...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-red-500 font-medium">Error al cargar las cuentas</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 text-sm text-brand-orange hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : accounts?.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p>No hay cuentas configuradas para esta sede.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts?.map((account) => (
                <div 
                  key={account.id}
                  className="group p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-brand-orange/30 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        {account.type || 'Cuenta Local'}
                      </p>
                      <h3 className="font-bold text-gray-800 group-hover:text-brand-orange transition-colors">
                        {account.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${account.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatCurrency(account.balance || 0)}
                      </p>
                      {account.currency && (
                        <p className="text-[10px] font-bold text-gray-400">{account.currency}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
