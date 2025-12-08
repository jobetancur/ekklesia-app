import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Tag, Save, X, Loader2 } from 'lucide-react';
import { useCategories, useFinancialResourceMutations } from '../hooks/useFinancialResources';

export default function CategoriesManager({ siteId }) {
  // Pass null to fetch ALL categories (system + local)
  // TODO: Update useCategories to accept siteId filter if needed, 
  // or handle filtering in UI if the API returns mixed.
  // Assuming getCategories returns all for now.
  const { data: allCategories, isLoading } = useCategories();
  const { createCategory, isCreatingCategory } = useFinancialResourceMutations(siteId);

  const [isCreating, setIsCreating] = useState(false);

  // Filter categories by type for display
  // We can show two lists or one unified list with badges. Unified is simpler.
  // We should distinguish System Default vs Custom
  
  const CreateForm = () => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
      try {
        await createCategory(data);
        setIsCreating(false);
        reset();
      } catch (error) {
        console.error('Failed to create category', error);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            {...register('name', { required: true })}
            placeholder="Nombre (ej: Pro-Templo)"
            className="flex-[2] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
            autoFocus
          />
          <select
            {...register('type')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </select>
          <div className="flex gap-2 min-w-fit">
            <button
              type="submit"
              disabled={isCreatingCategory}
              className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-900 flex items-center justify-center whitespace-nowrap"
            >
              {isCreatingCategory ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
          <Tag size={20} className="text-gray-400" />
          Categorías de Movimientos
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="text-sm font-medium text-brand-orange hover:text-brand-orange-dark flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {isCreating && <CreateForm />}

      {isLoading ? (
         <div className="text-center py-8 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" />Cargando categorías...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
                {allCategories?.map(category => (
                    <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${category.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {category.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                                </span>
                                {category.is_system_default && (
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                        Sistema
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
