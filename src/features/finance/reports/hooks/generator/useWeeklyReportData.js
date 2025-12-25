import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, subWeeks, addWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

export function useWeeklyReportData(siteId) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const weekNumber = format(startDate, 'w', { locale: es });
  const year = format(startDate, 'yyyy');
  const periodString = `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`;

  const goToPreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const goToCurrentWeek = () => setCurrentDate(new Date());

  useEffect(() => {
    async function fetchWeeklyData() {
      if (!siteId) return;
      setIsLoading(true);

      try {
        // 1. Fetch Transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*, account_categories(name)')
          .eq('site_id', siteId)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);

        if (txError) throw txError;

        // 2. Fetch Account Balances
        const { data: accounts, error: accError } = await supabase
          .from('financial_accounts')
          .select('name, balance')
          .eq('site_id', siteId);
        
        if (accError) throw accError;

        // 3. Fetch Site Name (Optional but good)
        const { data: site } = await supabase.from('sites').select('name').eq('id', siteId).single();

        // 4. Process Data
        const entries = transactions.filter(t => t.type === 'INCOME');
        const exits = transactions.filter(t => t.type === 'EXPENSE');

        const groupedEntries = {};
        entries.forEach(t => {
          const name = t.account_categories?.name || 'Otros';
          if (!groupedEntries[name]) groupedEntries[name] = { concept: name, count: 0, amount: 0 };
          groupedEntries[name].count++;
          groupedEntries[name].amount += parseFloat(t.amount);
        });

        // Classification logic for fixed vs other exits (simplified for now)
        const FIXED_CAT_KEYWORDS = ['diezmo', 'misiones', 'aporte', 'admin'];
        const salidasFijas = [];
        const otrasSalidas = [];

        const groupedExits = {};
        exits.forEach(t => {
          const name = t.account_categories?.name || 'Otros';
          if (!groupedExits[name]) groupedExits[name] = { concept: name, count: 0, amount: 0 };
          groupedExits[name].count++;
          groupedExits[name].amount += parseFloat(t.amount);
        });

        Object.values(groupedExits).forEach(item => {
          const isFixed = FIXED_CAT_KEYWORDS.some(k => item.concept.toLowerCase().includes(k));
          if (isFixed) salidasFijas.push(item);
          else otrasSalidas.push(item);
        });

        const totalEntradas = Object.values(groupedEntries).reduce((sum, i) => sum + i.amount, 0);
        const totalSalidasFijas = salidasFijas.reduce((sum, i) => sum + i.amount, 0);
        const totalOtrasSalidas = otrasSalidas.reduce((sum, i) => sum + i.amount, 0);

        setReportData({
          week: weekNumber,
          year: year,
          period: periodString,
          siteName: site?.name || 'Sede sin nombre',
          elaboratedBy: 'Usuario Ekklesia', // Placeholder, could be from profile
          dateOfElaboration: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es }),
          entradas: Object.values(groupedEntries),
          totalEntradas,
          salidasFijas,
          totalSalidasFijas,
          otrasSalidas,
          totalOtrasSalidas,
          totalSalidas: totalSalidasFijas + totalOtrasSalidas,
          balanceGeneral: totalEntradas - (totalSalidasFijas + totalOtrasSalidas),
          accountStatus: accounts.map(a => ({
            name: a.name,
            balance: parseFloat(a.balance) || 0
          }))
        });
      } catch (err) {
        console.error('Error in useWeeklyReportData:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeeklyData();
  }, [startDate.toISOString(), siteId]);

  return {
    currentDate,
    startDate,
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    data: reportData,
    isLoading
  };
}
