import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useFinanceReports(siteId) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!siteId) return;
      
      setIsLoading(true);
      try {
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select(`
            *,
            account_categories (name, type)
          `)
          .eq('site_id', siteId)
          .gte('date', dateRange.from.toISOString())
          .lte('date', dateRange.to.toISOString())
          .order('date', { ascending: false });

        if (error) throw error;

        // Calculate summary
        const income = transactions
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const expenses = transactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const balance = income - expenses;

        // Group by category
        const incomeByTypeMap = {};
        const expensesByTypeMap = {};

        transactions.forEach(t => {
          const catName = t.account_categories?.name || 'Otros';
          if (t.type === 'INCOME') {
            incomeByTypeMap[catName] = (incomeByTypeMap[catName] || 0) + (parseFloat(t.amount) || 0);
          } else {
            expensesByTypeMap[catName] = (expensesByTypeMap[catName] || 0) + (parseFloat(t.amount) || 0);
          }
        });

        const COLORS = ['#48bb78', '#9f7aea', '#ecc94b', '#f56565', '#ed64a6', '#667eea', '#ed8936', '#4299e1', '#38b2ac', '#a0aec0'];

        const incomeByType = Object.entries(incomeByTypeMap).map(([name, value], idx) => ({
          name,
          value,
          color: COLORS[idx % COLORS.length]
        }));

        const expensesByType = Object.entries(expensesByTypeMap).map(([name, value], idx) => ({
          name,
          value,
          color: COLORS[(idx + 3) % COLORS.length] // Offset colors
        }));

        setData({
          summary: {
            income,
            expenses,
            balance,
            incomeTrend: 0, // Trends might need more complex historical queries
            expensesTrend: 0,
          },
          monthlyTrends: [], // For now, could be empty or calculated if period is long enough
          incomeByType,
          expensesByType,
          recentMovements: transactions.slice(0, 10).map(t => ({
            id: t.id,
            date: t.date,
            type: t.type === 'INCOME' ? 'Ingreso' : 'Egreso',
            description: t.description,
            amount: parseFloat(t.amount),
            category: t.account_categories?.name || 'N/A'
          }))
        });
      } catch (err) {
        console.error('Error fetching finance reports:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange, siteId]);

  return {
    dateRange,
    setDateRange,
    data,
    isLoading
  };
}
