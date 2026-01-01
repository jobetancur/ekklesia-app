import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTitheBatches, useTitheMutations } from '../hooks/useTitheBatch';
import { Plus, Loader2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function BatchList() {
  const navigate = useNavigate();
  // Get siteId from URL. Since this is rendered under /finanzas/sede/:siteId/diezmos, 
  // and Outlet context might not be propagated if strict nesting isn't used, 
  // we can use useParams directly as we are a child route.
  // Get siteId from URL
  const { siteId } = useParams(); 
  const { profile } = useAuth();
  
  const { data: batches, isLoading } = useTitheBatches(siteId);
  const { createBatch } = useTitheMutations();
  const { mutateAsync: createBatchAsync, isPending: isCreating } = createBatch;

  const handleCreate = async () => {
    if (!siteId || !profile) return;
    try {
      const newBatch = await createBatchAsync({
        site_id: siteId, 
        organization_id: profile.organization_id,
        created_by: profile.id,
        batch_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'DRAFT', 
        name: `Informe ${format(new Date(), 'dd/MM/yyyy')}`
      });
      // Navigate relative to current path
      navigate(`${newBatch.id}`); 
    } catch (error) {
        console.error("Failed to create batch", error);
      toast.error("Error al crear el informe");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      POSTED: "bg-green-100 text-green-800",
    };
    const label = {
      DRAFT: "Borrador",
      POSTED: "Contabilizado",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100"}`}>
        {label[status] || status}
      </span>
    );
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Informes de Diezmos</h2>
          <p className="text-muted-foreground text-gray-500">Administra los lotes de diezmos y ofrendas.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nuevo Informe
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Fecha</th>
              <th className="px-6 py-3 font-medium">Estado</th>
              <th className="px-6 py-3 font-medium text-right">Total</th>
              <th className="px-6 py-3 font-medium">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches?.map((batch) => (
              <tr 
                key={batch.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`${batch.id}`)}
              >
                <td className="px-6 py-4 font-medium max-w-xs truncate flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {batch.name || "Sin nombre"}
                </td>
                <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {batch.batch_date ? format(new Date(batch.batch_date + 'T00:00:00'), 'dd MMM yyyy', { locale: es }) : '-'}
                    </div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(batch.status)}</td>
                <td className="px-6 py-4 text-right font-mono font-medium">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(batch.total_amount || 0)}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs font-mono">{batch.id.slice(0, 8)}...</td>
              </tr>
            ))}
            {batches?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay informes creados aún.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
