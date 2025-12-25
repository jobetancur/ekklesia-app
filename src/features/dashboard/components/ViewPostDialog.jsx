import React from 'react';
import { X, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ViewPostDialog({ post, isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = React.useState(null);

  if (!isOpen || !post) return null;

  const handleContentClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target.src);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Botón Cerrar (Escritorio) */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors hidden md:block"
      >
        <X size={24} />
      </button>

      <div className="bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Cabecera Móvil / Control */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <span className="text-sm font-bold text-brand-text truncate pr-4">{post.title}</span>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          {/* Portada en el Modal */}
          {post.cover_image_url && (
            <div 
              className="w-full h-64 md:h-96 relative cursor-pointer"
              onClick={() => setSelectedImage(post.cover_image_url)}
            >
              <img 
                src={post.cover_image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                {post.site_id ? (
                  <span className="bg-brand-orange text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded mb-3 inline-block">
                    Sede
                  </span>
                ) : (
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded mb-3 inline-block">
                    Global
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-lg">
                  {post.title}
                </h1>
              </div>
            </div>
          )}

          <article className="p-6 md:p-10 max-w-3xl mx-auto text-left">
            {!post.cover_image_url && (
               <div className="mb-8 border-b border-gray-100 pb-8 text-left">
                 <div className="flex gap-2 items-center mb-4">
                    {post.site_id ? (
                      <span className="bg-brand-orange/10 text-brand-orange text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">Sede</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">Global</span>
                    )}
                 </div>
                 <h1 className="text-3xl md:text-5xl font-black text-brand-text leading-tight mb-4">
                   {post.title}
                 </h1>
               </div>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm text-brand-text-light mb-10 pb-6 border-b border-gray-100">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-brand-orange-50 text-brand-orange flex items-center justify-center font-bold text-xs">
                    {post.author?.first_name?.[0] || 'A'}
                 </div>
                 <span className="font-medium text-brand-text">
                   {post.author?.first_name} {post.author?.last_name || ''}
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar size={16} className="text-brand-orange" />
                 <span>{post.published_at ? format(new Date(post.published_at), "d 'de' MMMM, yyyy", { locale: es }) : 'Borrador'}</span>
               </div>
            </div>

            {/* Contenido HTML con detector de clicks en imgs */}
            <div 
              onClick={handleContentClick}
              className="prose prose-lg md:prose-xl max-w-none 
                prose-p:text-brand-text-secondary prose-p:leading-relaxed
                prose-headings:text-brand-text prose-headings:font-bold
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:cursor-pointer hover:prose-img:opacity-90 transition-all
                prose-blockquote:border-l-brand-orange prose-blockquote:bg-brand-orange/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                prose-a:text-brand-orange hover:prose-a:text-brand-orange-dark transition-colors"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </div>

      {/* Lightbox for Images within Dialog */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
