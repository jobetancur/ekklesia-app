import React, { forwardRef } from 'react';
import { formatCurrency } from '@/utils/format';
import { TrendingUp, TrendingDown, Scale, Landmark } from 'lucide-react';

const ReportTable = ({ title, colorClass, icon: Icon, data, total }) => (
  <div className="mb-6">
    <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
      <Icon size={20} />
      <h3 className="uppercase font-bold tracking-wide">{title}</h3>
    </div>
    <div className="overflow-hidden rounded-t-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className={`${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '200')} text-gray-700`}>
            <th className="px-4 py-2 text-left font-semibold">Concepto</th>
            <th className="px-4 py-2 text-right font-semibold">Cantidad de Movimientos</th>
            <th className="px-4 py-2 text-right font-semibold">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr key={idx} className="bg-white">
              <td className="px-4 py-2 text-gray-600">{item.concept}</td>
              <td className="px-4 py-2 text-right text-gray-500">{item.count}</td>
              <td className="px-4 py-2 text-right font-medium text-gray-800">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          <tr className={`${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '400')} font-bold text-gray-800`}>
             <td className="px-4 py-2 uppercase">TOTAL {title}</td>
             <td className="px-4 py-2 text-right">{data.reduce((acc, curr) => acc + curr.count, 0)}</td>
             <td className="px-4 py-2 text-right">{formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const WeeklyReportContent = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="bg-white p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none text-gray-800">
        
        {/* Header */}
        <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-2 mb-4 text-brand-text">
                {/* Placeholder for Logo if available, using text/icon for now */}
                <Landmark size={32} />
                <h1 className="text-2xl font-bold uppercase tracking-widest">INFORME CONTABLE SEMANAL</h1>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Semana {data.week} de {data.year}</h2>
            <p className="text-gray-500 text-lg font-light">Período: {data.period}</p>
            
            <div className="mt-6 border-t border-b border-gray-100 py-2">
                <p className="text-xs text-center text-gray-400">
                    Elaborado por: <span className="font-medium text-gray-600">{data.elaboratedBy}</span> • 
                    Fecha de elaboración: <span className="font-medium text-gray-600">{data.dateOfElaboration}</span>
                </p>
            </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
            <ReportTable 
                title="ENTRADAS" 
                colorClass="text-emerald-500" 
                icon={TrendingUp}
                data={data.entradas}
                total={data.totalEntradas}
            />

            <ReportTable 
                title="SALIDAS FIJAS" 
                colorClass="text-rose-500" 
                icon={TrendingDown}
                data={data.salidasFijas}
                total={data.totalSalidasFijas}
            />

            <ReportTable 
                title="OTRAS SALIDAS" 
                colorClass="text-amber-500" 
                icon={TrendingDown}
                data={data.otrasSalidas}
                total={data.totalOtrasSalidas}
            />
        </div>

        {/* Totals Summary */}
        <div className="mt-10 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-semibold text-gray-600">Total Entradas:</span>
                <span className="font-bold text-gray-800">{formatCurrency(data.totalEntradas)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm">
                <span className="font-semibold text-gray-600">Total Salidas:</span>
                <span className="font-bold text-gray-800">{formatCurrency(data.totalSalidas)}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg">
                <span className="font-bold text-emerald-600">Balance General:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(data.balanceGeneral)}</span>
            </div>
        </div>

        {/* Account Status Table */}
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-4 text-brand-text">
                <Landmark size={20} />
                <h3 className="uppercase font-bold tracking-wide">ESTADO DE CUENTAS</h3>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Cuenta</th>
                        <th className="px-4 py-2 text-right">Ingresos</th>
                        <th className="px-4 py-2 text-right">Egresos</th>
                        <th className="px-4 py-2 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.accountStatus.map((acc, idx) => (
                        <tr key={idx} className="bg-white">
                            <td className="px-4 py-2 font-medium text-gray-700">{acc.name}</td>
                            <td className={`px-4 py-2 text-right ${acc.income > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {formatCurrency(acc.income)}
                            </td>
                            <td className={`px-4 py-2 text-right ${acc.expense > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                {formatCurrency(acc.expense)}
                            </td>
                            <td className={`px-4 py-2 text-right font-bold ${acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(acc.balance)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Signatures */}
        <div className="mt-20 flex justify-between items-end">
            <div className="flex-1 mr-10">
                <div className="border-t border-gray-400 pt-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">(Espacio para firma)</p>
                    <p className="font-bold text-sm">FIRMA DEL ENCARGADO</p>
                    <p className="text-xs text-gray-500">Nombre: ________________________</p>
                </div>
            </div>
            <div className="flex-1 ml-10">
                <div className="border-t border-gray-400 pt-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">(Espacio para fecha)</p>
                    <p className="font-bold text-sm">FECHA DE APROBACIÓN</p>
                    <p className="text-xs text-gray-500">DD / MM / AAAA</p>
                </div>
            </div>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-[10px] text-gray-300">Este informe fue generado automáticamente el {new Date().toLocaleDateString()}</p>
        </div>

    </div>
  );
});

export default WeeklyReportContent;
