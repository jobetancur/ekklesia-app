import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '@/features/finance/transactions/hooks/useTransactions';
import CreateTransactionModal from '@/features/finance/transactions/components/CreateTransactionModal';

// Utility for formatting currency
const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

// Badge component for Types
function TypeBadge({ type }) {
  const isIncome = type === 'INCOME';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isIncome ? 'Ingreso' : 'Egreso'}
    </span>
  );
}

// Badge component for Accounts/Categories
function ResourceBadge({ name, colorClass = 'bg-gray-100 text-gray-800' }) {
    if (!name) return <span className="text-gray-400">-</span>;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {name}
        </span>
    );
}

export default function TransactionsPage() {
  const { siteId } = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions = [], isLoading, error } = useTransactions({ siteId });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Simple client-side filtering
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.financial_accounts?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.account_categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar movimiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
          />
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Agregar movimiento
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
             <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>
        ) : error ? (
            <div className="p-8 text-center text-red-500">Error al cargar movimientos.</div>
        ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-gray-50 text-gray-400 mb-4">
                    <Filter size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay movimientos</h3>
                <p className="text-gray-500 mt-1">No se encontraron transacciones para esta búsqueda.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-500">Fecha</th>
                    <th className="px-6 py-4 font-semibold text-gray-500">Tipo</th>
                    <th className="px-6 py-4 font-semibold text-gray-500">Descripción</th>
                    <th className="px-6 py-4 font-semibold text-gray-500">Monto</th>
                    <th className="px-6 py-4 font-semibold text-gray-500">Cuenta</th>
                    <th className="px-6 py-4 font-semibold text-gray-500">Categoría</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                        {t.date ? format(parseISO(t.date), 'yyyy-MM-dd') : '-'}
                    </td>
                    <td className="px-6 py-4">
                        <TypeBadge type={t.type} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {t.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700">
                        {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4">
                        <ResourceBadge name={t.financial_accounts?.name} colorClass="bg-blue-50 text-blue-700" />
                    </td>
                    <td className="px-6 py-4">
                         <ResourceBadge name={t.account_categories?.name} colorClass="bg-orange-50 text-orange-700" />
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(t)}
                          className="text-gray-400 hover:text-brand-orange transition-colors font-medium border border-gray-200 px-3 py-1 rounded-md text-xs hover:border-brand-orange"
                        >
                            Editar
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      <CreateTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        siteId={siteId} 
        initialData={editingTransaction}
      />
    </div>
  );
}
