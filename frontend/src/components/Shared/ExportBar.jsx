import { Download, Printer } from 'lucide-react';

const buttonClass = 'h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-slate-50 rounded-lg shadow-sm text-[10px] font-black uppercase tracking-widest text-[#07152F] flex items-center gap-2 transition-colors';

// Botones para llevarse la vista: CSV (se abre en Excel) e imprimir / guardar como PDF
export const ExportBar = ({ onCsv, onPrint }) => (
    <div className="no-print flex items-center gap-2">
        <button type="button" onClick={onCsv} className={buttonClass} title="Descargar los datos en CSV (se abre en Excel)">
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            CSV
        </button>
        <button type="button" onClick={onPrint} className={buttonClass} title="Imprimir o guardar como PDF">
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            PDF
        </button>
    </div>
);
