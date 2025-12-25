import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Printer } from 'lucide-react';
import { useFinanceReports } from '@/features/finance/reports/hooks/useFinanceReports';
import ReportsFilter from '@/features/finance/reports/components/ReportsFilter';
import FinanceSummaryCards from '@/features/finance/reports/components/FinanceSummaryCards';
import IncomeExpenseChart from '@/features/finance/reports/components/IncomeExpenseChart';
import CategoryBreakdownChart from '@/features/finance/reports/components/CategoryBreakdownChart';
import MovementsDetailTable from '@/features/finance/reports/components/MovementsDetailTable';
import WeeklyReportModal from '@/features/finance/reports/components/generator/WeeklyReportModal';

export default function SiteReportsPage() {
  const { siteId } = useParams();
  const { dateRange, setDateRange, data, isLoading } = useFinanceReports(siteId);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleRefresh = () => {
    // Refresh logic
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-brand-orange" size={32} />
            Informes Contables
          </h2>
          <p className="text-gray-500 mt-1">
            Visualiza el balance, ingresos y egresos de la sede con filtros personalizables
          </p>
        </div>
        
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-text text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          <Printer size={18} />
          Informe Semanal
        </button>
      </div>

      {/* Filters */}
      <ReportsFilter 
        dateRange={dateRange}
        setDateRange={setDateRange}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Summary Cards */}
      <FinanceSummaryCards data={data} isLoading={isLoading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
           <IncomeExpenseChart data={data} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryBreakdownChart 
          title="Ingresos por Tipo" 
          data={data?.incomeByType} 
          isLoading={isLoading}
        />
        <CategoryBreakdownChart 
          title="Egresos por Tipo" 
          data={data?.expensesByType} 
          isLoading={isLoading} 
        />
      </div>

      {/* Detailed Table */}
      <MovementsDetailTable movements={data?.recentMovements} isLoading={isLoading} />
      
      {/* Generator Modal */}
      <WeeklyReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        siteId={siteId}
      />
      
    </div>
  );
}
