import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Wallet, Edit2, Loader2, Save, X } from 'lucide-react';
import { useFinancialAccounts, useFinancialResourceMutations } from '../hooks/useFinancialResources';

export default function FinancialAccountsManager({ siteId }) {
  const { data: accounts, isLoading } = useFinancialAccounts(siteId);
  const { createAccount, updateAccount, isCreatingAccount, isUpdatingAccount } = useFinancialResourceMutations(siteId);
  
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form for creating new account
  const CreateForm = () => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
      try {
        await createAccount(data);
        setIsCreating(false);
        reset();
      } catch (error) {
        console.error('Failed to create account', error);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            {...register('name', { required: true })}
            placeholder="Nombre (ej: Caja Menor)"
            className="flex-[2] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            autoFocus
          />
          <select
            {...register('type')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="CASH">Efectivo / Caja</option>
            <option value="BANK">Banco</option>
          </select>
          <div className="flex gap-2 min-w-fit">
             <button
              type="submit"
              disabled={isCreatingAccount}
              className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-900 flex items-center justify-center whitespace-nowrap"
            >
              {isCreatingAccount ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span className="ml-2">Guardar</span>
            </button>
             <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wallet size={20} className="text-gray-400" />
          Cuentas Financieras
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="text-sm font-medium text-brand-orange hover:text-brand-orange-dark flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={16} /> Nueva Cuenta
        </button>
      </div>

      {isCreating && <CreateForm />}

      {isLoading ? (
        <div className="text-center py-8 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" />Cargando cuentas...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {accounts?.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                    No hay cuentas configuradas para esta sede.
                </div>
            ) : (
                accounts?.map(account => (
                <div key={account.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{account.type === 'CASH' ? 'Efectivo' : 'Banco'}</p>
                    </div>
                    {/* Add edit button logic later if needed, for now just list */}
                    <div className="text-sm font-mono text-gray-600">
                        {/* Balance could be shown here if we want */}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
