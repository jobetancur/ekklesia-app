import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { User, Lock, Save, Loader2, AlertCircle } from 'lucide-react';

// Schema for Profile Data
const profileSchema = z.object({
  first_name: z.string().min(2, 'El nombre es muy corto'),
  last_name: z.string().min(2, 'El apellido es muy corto'),
  phone: z.string().optional(),
  document_id: z.string().optional(),
});

// Schema for Password Change
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Debes confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile Form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
    }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      // Optionally reload window or re-fetch profile if context doesn't auto-update (it usually doesn't unless we manually update state)
      // For now, we assume the user might need to refresh or we could expose a refresher from AuthContext, but let's keep it simple.
      // A full page reload is a crude but effective way to sync context if needed, but Supabase realtime might not be set up.
      // Ideally AuthProvider should expose a setProfile or refetch. 
      // I'll leave it as is, the DB is updated.
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setPasswordLoading(true);
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      
      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, data.newPassword);
      
      toast.success('Contraseña actualizada correctamente');
      resetPasswordForm();
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         toast.error('La contraseña actual es incorrecta');
      } else {
         toast.error('Error al cambiar la contraseña: ' + error.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!profile) return <div>Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500">Administra tu información personal y seguridad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Update Profile Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            </div>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    {...registerProfile('first_name')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  {profileErrors.first_name && <p className="text-sm text-red-500 mt-1">{profileErrors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    {...registerProfile('last_name')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  {profileErrors.last_name && <p className="text-sm text-red-500 mt-1">{profileErrors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    {...registerProfile('phone')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  {profileErrors.phone && <p className="text-sm text-red-500 mt-1">{profileErrors.phone.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        {...registerProfile('email')}
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        readOnly
                        title="Contacta al administrador para cambiar tu email"
                    />
                     {profileErrors.email && <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

        </div>

         {/* Change Password Section */}
         <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
            </div>
            
             <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                   {passwordErrors.currentPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    {...registerPassword('newPassword')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                   {passwordErrors.newPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                   {passwordErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
                </div>

                {/* Password Requirements Hint */}
                <div className="bg-orange-50 p-3 rounded-lg flex gap-2 items-start text-xs text-orange-700">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                    <p>La contraseña debe tener al menos 6 caracteres.</p>
                </div>

                <div className="pt-2">
                    <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                    {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : "Actualizar Contraseña"}
                    </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
