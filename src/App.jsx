import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import AccountsPayablePage from '@/pages/finance/AccountsPayablePage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Placeholder para el Dashboard
const DashboardHome = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Panel Principal</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Ingresos del Mes</h3>
        <p className="text-2xl font-bold text-green-600 mt-2">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Gastos del Mes</h3>
        <p className="text-2xl font-bold text-red-600 mt-2">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Miembros Activos</h3>
        <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/finanzas" element={<AccountsPayablePage />} />
            <Route path="/miembros" element={<div>Módulo de Miembros (Próximamente)</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;