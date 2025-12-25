import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Wallet, Edit2, Loader2, Save, X, Trash2, AlertTriangle } from 'lucide-react';
import { useFinancialAccounts, useFinancialResourceMutations, checkEntityUsage } from '../hooks/useFinancialResources';

export default function FinancialAccountsManager({ siteId, organizationId }) {
  const { data: accounts, isLoading } = useFinancialAccounts(siteId);
  const { 
    createAccount, 
    updateAccount, 
    deleteAccount,
    isCreatingAccount, 
    isUpdatingAccount,
    isDeletingAccount 
  } = useFinancialResourceMutations(siteId, organizationId);
  
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { id, name, type: 'warning' | 'blocked', count: 0 }

  // Form for creating/editing account
  const  AccountForm = ({ defaultValues, onCancel, isEdit = false }) => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues
    });

    const onSubmit = async (data) => {
      try {
        if (!siteId || !organizationId) {
            alert("Error: Faltan datos de la sede u organización. Por favor espera a que cargue o recarga la página.");
            return;
        }
        if (isEdit) {
            await updateAccount({ id: defaultValues.id, ...data });
            setEditingId(null);
        } else {
            await createAccount(data);
            setIsCreating(false);
            reset();
        }
      } catch (error) {
        console.error('Failed to save account', error);
        alert('Error al guardar: ' + error.message);
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
              disabled={isCreatingAccount || isUpdatingAccount}
              className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-900 flex items-center justify-center whitespace-nowrap"
            >
              {isCreatingAccount || isUpdatingAccount ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span className="ml-2">Guardar</span>
            </button>
             <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </form>
    );
  };

  const handleDeleteClick = async (account) => {
    try {
        const count = await checkEntityUsage('account', account.id);
        if (count > 0) {
            setDeleteConfirmation({
                id: account.id,
                name: account.name,
                type: 'blocked',
                count
            });
        } else {
            setDeleteConfirmation({
                id: account.id,
                name: account.name,
                type: 'warning',
                count: 0
            });
        }
    } catch (error) {
        console.error("Error checking usage", error);
    }
  };

  const confirmDelete = async () => {
      if (deleteConfirmation?.id) {
          try {
              await deleteAccount(deleteConfirmation.id);
              setDeleteConfirmation(null);
          } catch (e) {
              console.error("Error deleting", e);
          }
      }
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

      {isCreating && <AccountForm onCancel={() => setIsCreating(false)} />}
      
      {/* Delete Confirmation Modal/Alert */}
      {deleteConfirmation && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${deleteConfirmation.type === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                      <h4 className={`text-sm font-bold ${deleteConfirmation.type === 'blocked' ? 'text-red-800' : 'text-yellow-800'}`}>
                          {deleteConfirmation.type === 'blocked' ? 'No se puede eliminar la cuenta' : '¿Eliminar cuenta?'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                          {deleteConfirmation.type === 'blocked' 
                            ? `La cuenta "${deleteConfirmation.name}" tiene ${deleteConfirmation.count} movimientos asociados. No se puede eliminar.`
                            : `¿Estás seguro de eliminar "${deleteConfirmation.name}"? Esta acción no se puede deshacer.`
                          }
                      </p>
                      <div className="mt-3 flex gap-2">
                          {deleteConfirmation.type === 'warning' && (
                              <button 
                                onClick={confirmDelete}
                                disabled={isDeletingAccount}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 flex items-center gap-2"
                              >
                                {isDeletingAccount && <Loader2 className="animate-spin" size={12} />}
                                Confirmar Eliminación
                              </button>
                          )}
                          <button 
                            onClick={() => setDeleteConfirmation(null)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

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
                  editingId === account.id ? (
                      <div key={account.id} className="p-2">
                          <AccountForm 
                            defaultValues={account} 
                            isEdit={true} 
                            onCancel={() => setEditingId(null)} 
                          />
                      </div>
                  ) : (
                    <div key={account.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{account.type === 'CASH' ? 'Efectivo' : 'Banco'}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => setEditingId(account.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(account)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                  )
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
