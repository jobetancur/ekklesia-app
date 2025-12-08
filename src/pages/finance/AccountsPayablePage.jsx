import { useCallback, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAccountsPayable } from '@/features/finance/hooks/useAccountsPayable';
import { useAuth } from '@/features/auth/hooks/useAuth';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const toneStyles = {
  success: 'text-emerald-700 bg-emerald-100',
  warning: 'text-amber-700 bg-amber-100',
  danger: 'text-rose-700 bg-rose-100',
  default: 'text-gray-700 bg-gray-100',
};

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return currencyFormatter.format(amount);
}

function formatDueDate(value) {
  if (!value) return 'Sin fecha';

  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch {
    return value;
  }
}

function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  const toneClass = toneStyles[status.tone] ?? toneStyles.default;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${toneClass}`}>
      <span aria-hidden>{status.icon}</span>
      <span>{status.label}</span>
    </span>
  );
}

export default function AccountsPayablePage() {
  const { profile } = useAuth();
  const siteId = profile?.site_id;
  const [includePaid, setIncludePaid] = useState(false);

  const {
    data: accounts = [],
    isLoading,
    isFetching,
    error,
    refetch,
    markAsPaid,
    isMarkingPaid,
  } = useAccountsPayable({ siteId, includePaid, enabled: Boolean(siteId) });

  const totals = useMemo(() => {
    const pending = accounts.filter((account) => !account.is_paid);
    const paid = accounts.filter((account) => account.is_paid);

    return {
      totalPending: pending.reduce((sum, account) => sum + Number(account.amount ?? 0), 0),
      totalPaid: paid.reduce((sum, account) => sum + Number(account.amount ?? 0), 0),
      pendingCount: pending.length,
      overdueCount: pending.filter((account) => account.status?.isOverdue).length,
    };
  }, [accounts]);

  const handleToggleIncludePaid = useCallback(() => {
    setIncludePaid((prev) => !prev);
  }, []);

  const handleMarkAsPaid = useCallback(
    async (accountId) => {
      try {
        await markAsPaid(accountId);
      } catch (err) {
        console.error('No se pudo marcar como pagado', err);
      }
    },
    [markAsPaid],
  );

  if (!siteId) {
    return (
      <section className="space-y-4">
        <header>
          <p className="text-sm text-gray-500">Finanzas</p>
          <h1 className="text-3xl font-bold text-gray-900">Selecciona una sede</h1>
          <p className="text-sm text-gray-500">Necesitamos la sede activa para mostrar cuentas por pagar.</p>
        </header>
        <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-6 text-orange-800">
          No se ha seleccionado una sede. Ve al menú de perfil para elegirla y la información aparecerá aquí.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Finanzas · Sede activa</p>
          <h1 className="text-3xl font-bold text-gray-900">Semáforo de cuentas por pagar</h1>
          <p className="text-sm text-gray-500">Gestiona vencimientos y mantiene el flujo de caja al día.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggleIncludePaid}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-secondary hover:border-brand-text"
          >
            {includePaid ? 'Ocultar registradas' : 'Mostrar pagadas'}
          </button>
          <button
            type="button"
            onClick={refetch}
            disabled={isFetching || isLoading}
            className="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-60"
          >
            {isFetching ? 'Actualizando...' : 'Refrescar'}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-rose-700">
          No pudimos cargar las cuentas por pagar. Reintenta en unos segundos.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPending)}</p>
          <p className="text-xs text-gray-400">{totals.pendingCount} cuentas</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-500">Pagadas</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPaid)}</p>
          <p className="text-xs text-gray-400">Actualmente registradas</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-500">Vencidas</p>
          <p className="text-2xl font-bold text-gray-900">{totals.overdueCount}</p>
          <p className="text-xs text-gray-400">Necesitan atención inmediata</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-500">Actualización</p>
          <p className="text-2xl font-bold text-gray-900">{isFetching ? 'En curso' : 'Lista'}</p>
          <p className="text-xs text-gray-400">Última consulta automática</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Detalle de cuentas</h2>
          <p className="text-sm text-gray-500">Los colores representan la urgencia del pago.</p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">Cargando cuentas por pagar...</div>
        ) : accounts.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No hay cuentas registradas para esta sede.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cuenta</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Monto</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Vence</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{account.title}</td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(account.amount)}</td>
                    <td className="px-6 py-3 text-center text-sm text-gray-500">{formatDueDate(account.due_date)}</td>
                    <td className="px-6 py-3 text-center">
                      <StatusBadge status={account.status} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      {account.is_paid ? (
                        <span className="text-xs font-semibold uppercase text-emerald-600">Pagada</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(account.id)}
                          disabled={isMarkingPaid}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {isMarkingPaid ? 'Guardando...' : 'Marcar como pagada'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
