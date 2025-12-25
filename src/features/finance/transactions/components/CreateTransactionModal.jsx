import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Calendar } from 'lucide-react';
import { transactionSchema } from '../schemas/transactionSchema';
import { useTransactions } from '../hooks/useTransactions';
import { useFinancialAccounts, useCategories } from '../../hooks/useFinancialResources';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function CreateTransactionModal({ isOpen, onClose, siteId, organizationId, initialData = null }) {
  const isEditing = Boolean(initialData);
  const { profile } = useAuth();

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category_id: '',
      account_id: '',
      site_id: siteId,
    },
  });

  // Watch type to filter categories
  const type = useWatch({ control, name: 'type' });

  // Load resources
  const { data: accounts, isLoading: isLoadingAccounts } = useFinancialAccounts(siteId);
  const { data: allCategories, isLoading: isLoadingCategories } = useCategories(null, siteId);

  // Filter categories based on selected type
  const categories = allCategories?.filter(c => c.type === type) || [];

  const { createTransaction, updateTransaction } = useTransactions({ siteId });

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          type: initialData.type,
          date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
          amount: initialData.amount,
          description: initialData.description,
          category_id: initialData.category_id,
          account_id: initialData.account_id || '', // Handle potential nulls
          site_id: siteId,
        });
      } else {
        reset({
          type: 'INCOME',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          category_id: '',
          account_id: '',
          site_id: siteId,
        });
      }
    }
  }, [isOpen, initialData, reset, siteId]);

  const onSubmit = async (data) => {
    try {
      // Validation: Check funds for expenses
      if (data.type === 'EXPENSE') {
        const selectedAccount = accounts?.find(a => a.id === data.account_id);
        const amount = parseFloat(data.amount);
        const currentBalance = selectedAccount?.balance || 0;

        if (amount > currentBalance) {
          toast.error('Saldo insuficiente', {
            description: `La cuenta "${selectedAccount?.name}" solo tiene ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(currentBalance)}. No es posible realizar este egreso.`,
            duration: 5000,
          });
          return; // Stop submission
        }
      }

      if (isEditing) {
        await updateTransaction({ 
          id: initialData.id, 
          ...data,
          updated_by: profile?.id 
        });
      } else {
        await createTransaction({ 
          ...data, 
          site_id: siteId, 
          organization_id: organizationId,
          created_by: profile?.id 
        });
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Log detailed error for debugging
      if (error.message) console.error('Error message:', error.message);
      if (error.details) console.error('Error details:', error.details);
      if (error.hint) console.error('Error hint:', error.hint);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar movimiento' : 'Agregar movimiento'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Row 1: Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm font-medium"
              >
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Egreso</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</label>
              <div className="relative">
                <input
                  {...register('date')}
                  type="date"
                  className="w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
                />
              </div>
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Descripción</label>
            <input
              {...register('description')}
              type="text"
              placeholder="Ej: Ofrenda dominical"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Row 2: Amount & Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-medium">$</span>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm font-medium"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cuenta</label>
              <select
                {...register('account_id')}
                disabled={isLoadingAccounts}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm disabled:opacity-50"
              >
                <option value="">Selecciona cuenta...</option>
                {accounts?.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors.account_id && <p className="text-xs text-red-500">{errors.account_id.message}</p>}
            </div>
          </div>

          {/* Row 3: Site (Readonly) & Category */}
          <div className="grid grid-cols-2 gap-4">
             {/* Site Field is hidden logically but maybe shown for clarity? User context is already Site. We can skip or show readonly. */}
             {/* Let's use the space for Category and "Type of Income/Expense" if needed, but Category covers it. */}
             
             <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {type === 'INCOME' ? 'Tipo de Ingreso' : 'Tipo de Egreso'} (Categoría)
              </label>
              <select
                {...register('category_id')}
                disabled={isLoadingCategories}
                 className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm disabled:opacity-50"
              >
                <option value="">Selecciona categoría...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
