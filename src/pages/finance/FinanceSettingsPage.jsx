import React from 'react';
import { useOutletContext } from 'react-router-dom';
import FinancialAccountsManager from '@/features/finance/components/FinancialAccountsManager';
import CategoriesManager from '@/features/finance/components/CategoriesManager';

export default function FinanceSettingsPage() {
  const { siteId, organizationId } = useOutletContext();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="px-1">
        <h2 className="text-2xl font-bold text-gray-900">Configuración Financiera</h2>
        <p className="text-gray-500">Administra las cuentas y categorías para esta sede.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <FinancialAccountsManager siteId={siteId} organizationId={organizationId} />
        </div>
        <div>
           <CategoriesManager siteId={siteId} organizationId={organizationId} />
        </div>
      </div>
    </div>
  );
}
