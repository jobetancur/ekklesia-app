import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const postsService = {
  /**
   * Obtiene los posts visibles para una organización y sede.
   * Si siteId es null, trae globales y de todas las sedes (visión de admin global/multisede idealmente, 
   * pero según requerimiento: "Los roles locales ven sus noticias, el SUPER_ADMIN... visible para todas o una particular").
   * Ajuste: 
   * - Si soy SITE_ADMIN de Sede A: veo globales (site_id is null) Y site_id = Sede A.
   * - Si soy SUPER_ADMIN: podría querer ver todo, o filtrar. Por defecto traemos todo lo que "aplica" al contexto.
   */
  async fetchPosts({ organizationId, siteId }) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, first_name, last_name, avatar_url)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (siteId) {
      // Logic: Traer posts donde site_id sea NULL (Global) O site_id sea el mío.
      query = query.or(`site_id.is.null,site_id.eq.${siteId}`);
    } 
    // Si no hay siteId (ej. Super Admin viendo todo el dashboard global), 
    // quizás queramos ver todo. O quizás solo las globales. 
    // Asumiremos que si no se pasa siteId, se ven todas las de la org (globales y de sedes).
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Crea un nuevo post
   */
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Sube una imagen a Firebase Storage en la carpeta images/
   */
  async uploadPostImage(file) {
    // Validar tipo de archivo si es necesario
    const fileExtension = file.name.split('.').pop();
    const fileName = `images/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }
};
