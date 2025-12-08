import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { payableSchema } from '../schemas/payableSchema';
import { useCreatePayable } from '../hooks/useCreatePayable';

export default function CreatePayableModal({ isOpen, onClose, siteId }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(payableSchema),
    defaultValues: {
      title: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      description: '',
      site_id: siteId,
    },
  });

  const { mutateAsync: createPayable } = useCreatePayable();

  const onSubmit = async (data) => {
    try {
      await createPayable({ ...data, site_id: siteId });
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating payable:', error);
      // Here you might want to show a toast notification
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Nueva Cuenta por Pagar</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Concepto / Título</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
              placeholder="e.g. Factura de Luz"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">Vencimiento</label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
              />
              {errors.due_date && <p className="text-xs text-red-500">{errors.due_date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Descripción (Opcional)</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

           {/* Actions */}
           <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange/20 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
