import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { postsService } from '@/services/postsService';
import { ROLES } from '@/types/roles';
import PostList from './PostList';
import CreatePostDialog from './CreatePostDialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsWall() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      // userProfile debe tener organization_id y site_id
      const data = await postsService.fetchPosts({
        organizationId: profile.organization_id,
        siteId: profile.site_id 
      });
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error al cargar las noticias');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Determinar si puede crear posts
  const canCreatePosts = [ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.EKKLESIA_ADMIN].includes(profile?.role);
  const isSuperAdmin = [ROLES.SUPER_ADMIN, ROLES.EKKLESIA_ADMIN].includes(profile?.role);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Muro de Noticias</h2>
          <p className="text-gray-500 mt-1">Mantente informado de las últimas novedades de tu sede y la organización.</p>
        </div>
        
        {canCreatePosts && (
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-light text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow transition-all"
          >
            <Plus size={20} />
            Nueva Noticia
          </button>
        )}
      </div>

      {/* Posts Grid */}
      <PostList posts={posts} isLoading={isLoading} />

      {/* Create Dialog */}
      {canCreatePosts && (
        <CreatePostDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          onPostCreated={fetchPosts}
          userProfile={profile}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}
