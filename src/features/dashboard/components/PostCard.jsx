import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Calendar, X, ArrowRight } from 'lucide-react';
import ViewPostDialog from './ViewPostDialog';

export default function PostCard({ post }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Función para limpiar HTML y obtener solo texto para el preview
  const getExcerpt = (html, limit = 150) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <>
      <div 
        onClick={() => setIsViewOpen(true)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer"
      >
        {/* Imagen de Portada con altura fija */}
        <div className="relative h-48 w-full overflow-hidden shrink-0">
          {post.cover_image_url ? (
            <img 
              src={post.cover_image_url} 
              alt={post.title} 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-brand-orange/5 flex items-center justify-center">
              <div className="text-brand-orange/20 font-black text-4xl uppercase tracking-tighter select-none rotate-12">
                Ekklesia
              </div>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            {post.site_id ? (
              <span className="bg-brand-orange text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm">
                Sede
              </span>
            ) : (
               <span className="bg-brand-text text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm">
                Global
              </span>
            )}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          {/* Metadatos simplificados */}
          <div className="flex items-center gap-3 text-[11px] text-brand-text-light mb-3 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-brand-orange" />
              {post.published_at ? format(new Date(post.published_at), "d MMM", { locale: es }) : 'Borrador'}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <User size={12} className="text-brand-orange" />
              {post.author?.first_name || 'Admin'}
            </span>
          </div>

          {/* Título con line-clamp para uniformidad */}
          <h3 className="text-lg font-bold text-brand-text mb-3 leading-snug group-hover:text-brand-orange transition-colors line-clamp-2 min-h-[3.5rem]">
            {post.title}
          </h3>

          {/* Extracto de texto sin HTML para la tarjeta */}
          <p className="text-brand-text-secondary text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
            {getExcerpt(post.content)}
          </p>

          {/* Acción final */}
          <div className="mt-auto flex items-center justify-between text-brand-orange group/btn">
            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              Leer Noticia
              <ArrowRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Lectura */}
      <ViewPostDialog 
        post={post} 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
      />

      {/* Visor de Imágenes (Mantener para cuando se da click a una imagen dentro del modal si se desea, 
          aunque ViewPostDialog ya tiene su propio diseño. Por ahora lo removemos de aquí para simplificar 
          ya que el modal completo es la prioridad del usuario) */}
    </>
  );
}
