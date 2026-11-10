import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

// Navegación de mes compartida por el calendario y el cronograma
export const MonthSwitcher = ({ currentDate, onPrevMonth, onNextMonth }) => (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-10 overflow-hidden">
        <button type="button" onClick={onPrevMonth} aria-label="Mes anterior" className="px-3 text-gray-500 hover:text-[#0e71af] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <span aria-live="polite" className="text-[10px] font-black text-[#07152F] uppercase tracking-widest min-w-[130px] text-center">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button type="button" onClick={onNextMonth} aria-label="Mes siguiente" className="px-3 text-gray-500 hover:text-[#0e71af] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
    </div>
);
