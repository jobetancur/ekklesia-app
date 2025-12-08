import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
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
