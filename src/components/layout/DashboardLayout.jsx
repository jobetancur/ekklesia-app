import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Finanzas', to: '/finanzas' },
  { label: 'Miembros', to: '/miembros' },
];

export default function DashboardLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Simplificado por ahora) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-brand-text">Ekklesia</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-orange/10 text-brand-orange'
                    : 'text-brand-text-secondary hover:bg-gray-50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold">
              {profile?.first_name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.first_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.role || 'Miembro'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 md:hidden">
          <span className="font-bold text-lg">Ekklesia</span>
          <button className="p-2">Menu</button>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
