import React, { useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Printer, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useWeeklyReportData } from '@/features/finance/reports/hooks/generator/useWeeklyReportData';
import WeeklyReportContent from './WeeklyReportContent';

export default function WeeklyReportModal({ isOpen, onClose, siteId }) {
  const { 
    currentDate,
    startDate, 
    endDate,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    data,
    isLoading 
  } = useWeeklyReportData(siteId);

  const reportRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    // Simple window print for now, ideal would be to print the iframe or new window found in some libraries
    // But since we have a preview, users might expect that to print. 
    // Usually printing a specific div is tricky without a library like react-to-print.
    // For now, let's suggest PDF download for printing.
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      // Calculate dimensions to fit exactly or width-wise
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // Top margin

      // For A4 standard, usually just fit width and let height flow (or pagination if multi-page).
      // Assuming single page report for now based on design.
      const componentWidth = pdfWidth;
      const componentHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
      pdf.save(`Informe_Semanal_${data.week}_${data.year}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Generar Informe Semanal</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar & Controls */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-6 justify-between items-center">
          
          {/* Week Selection */}
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
             <button onClick={goToPreviousWeek} className="p-1 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded transition">
                <ChevronLeft size={20} />
             </button>
             
             <div className="text-center min-w-[200px]">
                <p className="text-sm font-bold text-brand-text/80">Semana {format(startDate, 'w', { locale: es })} de {format(startDate, 'yyyy')}</p>
                <p className="text-xs text-gray-500">
                   {format(startDate, 'd MMM')} - {format(endDate, 'd MMM yyyy', { locale: es })}
                </p>
             </div>

             <button onClick={goToNextWeek} className="p-1 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded transition">
                <ChevronRight size={20} />
             </button>
          </div>

          <div className="flex gap-2">
            <button 
                onClick={goToCurrentWeek}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-orange bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
            >
                <Calendar size={14} />
                Semana Actual
            </button>
          </div>

        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8 flex justify-center">
             {isLoading ? (
                 <div className="flex flex-col items-center justify-center p-20">
                     <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-gray-500">Cargando datos del informe...</p>
                 </div>
             ) : (
                <div className="shadow-xl bg-white scale-90 origin-top shadow-black/10">
                     <WeeklyReportContent ref={reportRef} data={data} />
                </div>
             )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
                Cerrar
            </button>
            
            <button 
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                // Print note: implementing window.print not ideal inside an app, but ok for now.
                // Or we rely on PDF export.
                onClick={() => alert("Usa la opción Descargar PDF para imprimir con mejor calidad.")}
            >
                <Printer size={18} />
                Imprimir
            </button>

            <button 
                onClick={handleDownloadPDF}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-text rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
                <Download size={18} />
                Descargar PDF
            </button>
        </div>

      </div>
    </div>
  );
}
