import { ChevronDown, ListFilter, Plus } from 'lucide-react';
import { PageHeader } from '../Shared/PageHeader';
import { MonthSwitcher } from '../Shared/MonthSwitcher';

// Opciones del filtro de estado del Gestor de Actividades
const STATUS_FILTER_OPTIONS = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'ACTIVAS', label: 'Activas' },
    { value: 'COMPLETADAS', label: 'Completadas' },
];

export const QAHeader = ({ onNewTicketClick, currentDate, onPrevMonth, onNextMonth, statusFilter = 'TODAS', onStatusFilterChange }) => {
    const currentFilterLabel = STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label || 'Todas';

    return (
        <PageHeader
            title="Gestor de Actividades"
            subtitle="Organiza, supervisa y da seguimiento al trabajo del equipo."
        >
            <MonthSwitcher currentDate={currentDate} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} />

            {/* Filtro por estado (select nativo transparente sobre el control visual) */}
            <div className="focus-ring-within relative h-10 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm flex items-center px-4 cursor-pointer transition-colors">
                <ListFilter className="w-3.5 h-3.5 text-gray-500 mr-2" aria-hidden="true" />
                <span className="text-[10px] font-bold text-[#07152F] uppercase tracking-widest" aria-hidden="true">{currentFilterLabel}</span>
                <ChevronDown className="w-3 h-3 ml-2 text-gray-500" aria-hidden="true" />
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
                    aria-label="Filtrar actividades por estado"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                >
                    {STATUS_FILTER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {/* Acción principal */}
            <button
                type="button"
                onClick={onNewTicketClick}
                className="h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Nueva Actividad
            </button>
        </PageHeader>
    );
};
