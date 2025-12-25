import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { postsService } from '@/services/postsService';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { getSites } from '@/features/sites/services/sitesService';

export default function CreatePostDialog({ isOpen, onClose, onPostCreated, userProfile, isSuperAdmin }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [sites, setSites] = useState([]);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Load sites if Super Admin
  useEffect(() => {
    const loadSites = async () => {
      if (isSuperAdmin && isOpen) {
        try {
          const data = await getSites(userProfile.organization_id);
          setSites(data || []);
        } catch (error) {
          console.error("Error loading sites:", error);
        }
      }
    };
    loadSites();
  }, [isSuperAdmin, isOpen, userProfile?.organization_id]);

  // Register content manually for validation
  useEffect(() => {
    register("content", { required: "El contenido es requerido" });
  }, [register]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      setPreviewImage(URL.createObjectURL(file));
      setValue('coverImage', file); 
    }
  };
  
  const onEditorChange = (html) => {
    const isEmpty = html === '<p></p>' || html === '';
    setValue("content", isEmpty ? "" : html, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      let coverImageUrl = null;
      if (data.coverImage) {
        coverImageUrl = await postsService.uploadPostImage(data.coverImage);
      }

      const newPost = {
        organization_id: userProfile.organization_id,
        author_id: userProfile.id,
        title: data.title,
        content: data.content,
        slug: data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        status: data.status || 'DRAFT',
        site_id: (isSuperAdmin && data.siteId === 'GLOBAL') ? null : (data.siteId || userProfile.site_id),
        cover_image_url: coverImageUrl,
        published_at: data.status === 'PUBLISHED' ? new Date().toISOString() : null
      };

      await postsService.createPost(newPost);
      
      toast.success('Noticia creada exitosamente');
      onPostCreated();
      onClose();
      reset();
      setPreviewImage(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la noticia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-brand-text">Nueva Noticia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-text-secondary">Imagen de Portada</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-brand-orange-50 transition-colors cursor-pointer relative group">
               <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {previewImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                   <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2"><Upload size={16}/> Cambiar imagen</span>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-brand-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-brand-text">Sube una imagen</p>
                  <p className="text-xs text-brand-text-light mt-1">PNG, JPG, GIF hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-text-secondary">Título</label>
              <input 
                type="text" 
                {...register('title', { required: 'El título es requerido' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all"
                placeholder="Escribe un título atractivo"
              />
              {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
            </div>

            {/* Scope Selector (Only Super Admin) */}
            {isSuperAdmin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-brand-text-secondary">Alcance</label>
                <select 
                   {...register('siteId')}
                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all bg-white"
                >
                  <option value="GLOBAL">Global (Todas las sedes)</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                <p className="text-xs text-brand-text-light">Determina quién podrá ver esta noticia.</p>
              </div>
            )}
          </div>

          {/* Content - Rich Text Editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-text-secondary">Contenido</label>
            <div className="min-h-[250px]">
               <RichTextEditor 
                  onChange={onEditorChange}
                  placeholder="Escribe el cuerpo de la noticia..."
                />
            </div>
             {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
             <div className="flex items-center gap-3">
                <select 
                  {...register('status')}
                  className="text-sm bg-brand-bg-secondary border-none rounded-lg py-2 pl-3 pr-8 focus:ring-0 text-brand-text-secondary font-medium hover:bg-gray-100 cursor-pointer"
                >
                  <option value="PUBLISHED">Publicar ahora</option>
                  <option value="DRAFT">Guardar como borrador</option>
                </select>
             </div>
             
             <div className="flex items-center gap-3">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-secondary rounded-lg transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="px-6 py-2 text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-light rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center gap-2"
               >
                 {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                 {isSubmitting ? 'Guardando...' : 'Publicar Noticia'}
               </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
