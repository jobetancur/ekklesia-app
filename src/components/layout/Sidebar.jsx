import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Calculator, 
  LogOut,
  Settings,
  PieChart,
  FileText
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

import { ROLES } from '@/types/roles';

const menuGroups = [
  {
    title: 'DASHBOARD',
    allowedRoles: [ROLES.EKKLESIA_ADMIN, ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.TREASURER, ROLES.SECRETARY, ROLES.LEADER],
    items: [
      { label: 'Inicio', icon: LayoutDashboard, to: '/' }
    ]
  },
  {
    title: 'CRM',
    allowedRoles: [ROLES.EKKLESIA_ADMIN, ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.SECRETARY, ROLES.LEADER],
    items: [
      { label: 'Miembros', icon: Users, to: '/miembros' },
      // { label: 'Grupos', icon: Users, to: '/grupos' }, // Placeholder
    ]
  },
  {
    title: 'CONTABLE',
    allowedRoles: [ROLES.EKKLESIA_ADMIN, ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.TREASURER],
    items: [
      { label: 'Contabilidad', icon: Calculator, to: '/finanzas' },
      // { label: 'Reportes', icon: PieChart, to: '/reportes' }, // Placeholder
      // { label: 'Recibos', icon: FileText, to: '/recibos' }, // Placeholder
    ]
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header with Logo and Collapse Toggle */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-[5rem]">
        {!isCollapsed && (
          <img src={logo} alt="Ekklesia" className="h-20 w-auto object-contain" />
        )}
        {isCollapsed && (
             <img src={logo} alt="Ekklesia" className="h-10 w-auto mx-auto object-contain" />
        )}
        
        <button 
          onClick={toggleCollapse}
          className={cn(
            "p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors",
            isCollapsed ? "absolute -right-3 top-8 bg-white border border-gray-200 shadow-sm" : ""
          )}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {menuGroups.map((group, index) => {
           // Filter groups based on role
           if (group.allowedRoles && profile?.role && !group.allowedRoles.includes(profile.role)) {
             return null;
           }

           return (
            <div key={index}>
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                        isActive
                          ? 'bg-brand-orange/10 text-brand-orange'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        isCollapsed ? 'justify-center' : ''
                      )
                    }
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon size={20} className={cn("flex-shrink-0")} />
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                          {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-100">
        <NavLink 
          to="/perfil"
          className={cn(
            "flex items-center gap-3 mb-2 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group", 
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold flex-shrink-0 group-hover:bg-brand-orange/20 transition-colors">
            {profile?.first_name?.[0] || 'U'}
          </div>
          
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-orange transition-colors">
                {profile?.first_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.role || 'Miembro'}
              </p>
            </div>
          )}
        </NavLink>
        
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
             isCollapsed ? "justify-center" : ""
          )}
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
