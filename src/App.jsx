import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from '@/pages/LoginPage';
import AccountsPayablePage from '@/pages/finance/AccountsPayablePage';
import FinanceDashboardPage from '@/pages/finance/FinanceDashboardPage';
import TransactionsPage from '@/pages/finance/TransactionsPage';
import FinanceSettingsPage from '@/pages/finance/FinanceSettingsPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteFinanceLayout from '@/components/layout/SiteFinanceLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import RoleProtected from '@/components/layout/RoleProtected';
import { ROLES } from '@/types/roles';
import TithesPage from '@/pages/finance/TithesPage';
import SiteReportsPage from '@/pages/finance/SiteReportsPage';
import NewsWall from '@/features/dashboard/components/NewsWall';
import ProfilePage from '@/pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<NewsWall />} />
            <Route path="/perfil" element={<ProfilePage />} />
            
            {/* Rutas de Finanzas (Contable) */}
            <Route element={<RoleProtected allowedRoles={[ROLES.EKKLESIA_ADMIN, ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.TREASURER]} />}>
              <Route path="/finanzas" element={<FinanceDashboardPage />} />
              
              {/* Rutas por Sede con Layout Propio */}
              <Route path="/finanzas/sede/:siteId" element={<SiteFinanceLayout />}>
                <Route index element={<Navigate to="cuentas-por-pagar" replace />} />
                <Route path="cuentas-por-pagar" element={<AccountsPayablePage />} />
                <Route path="movimientos" element={<TransactionsPage />} />
                <Route path="informes" element={<SiteReportsPage />} />
                <Route path="diezmos/*" element={<TithesPage />} />
                <Route path="configuracion" element={<FinanceSettingsPage />} />
              </Route>
            </Route>

            {/* Rutas de CRM (Miembros) */}
            <Route element={<RoleProtected allowedRoles={[ROLES.EKKLESIA_ADMIN, ROLES.SUPER_ADMIN, ROLES.SITE_ADMIN, ROLES.SECRETARY, ROLES.LEADER]} />}>
              <Route path="/miembros" element={<div>Módulo de Miembros (Próximamente)</div>} />
            </Route>

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;