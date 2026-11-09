import { Link } from 'react-router-dom';

// ==========================================
// 1. HEADER (Elegante, minimalista y compacto)
// ==========================================
// Opciones del filtro de estado del Gestor de Actividades
const STATUS_FILTER_OPTIONS = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'ACTIVAS', label: 'Activas' },
    { value: 'COMPLETADAS', label: 'Completadas' },
];

export const QAHeader = ({ onNewTicketClick, currentDate, onPrevMonth, onNextMonth, statusFilter = 'TODAS', onStatusFilterChange }) => {
    const currentFilterLabel = STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label || 'Todas';
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in">
            
            {/* Título y Breadcrumb */}
            <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                    <Link to="/dashboard" className="hover:text-[#0e71af] transition-colors flex items-center gap-1 cursor-pointer" title="Regresar a Selección de Módulo">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Módulos
                    </Link>
                    <span>/</span>
                    <span className="text-[#0e71af]">QA & Testing</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#07152F] tracking-tight uppercase">
                    Gestor de Actividades
                </h1>
                
                <p className="text-sm text-gray-500 mt-2 font-medium">
                    Organiza, supervisa y da seguimiento al trabajo del equipo.
                </p>
            </div>

            {/* Controles SaaS Premium */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
                
                {/* Selector de Mes */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-10 overflow-hidden">
                    <button type="button" onClick={onPrevMonth} aria-label="Mes anterior" className="px-3 text-gray-500 hover:text-[#0e71af] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span aria-live="polite" className="text-[10px] font-black text-[#07152F] uppercase tracking-widest min-w-[130px] text-center">
                        {currentMonthName} {currentYear}
                    </span>
                    <button type="button" onClick={onNextMonth} aria-label="Mes siguiente" className="px-3 text-gray-500 hover:text-[#0e71af] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Filtro Principal */}
                <div className="focus-ring-within relative h-10 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm flex items-center px-4 cursor-pointer transition-colors">
                    <span className="text-[10px] font-bold text-[#07152F] uppercase tracking-widest" aria-hidden="true">{currentFilterLabel}</span>
                    <svg className="w-3 h-3 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>

                    {/* Select nativo transparente encima del botón visual (mismo patrón que el selector de período) */}
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

                {/* Botón de Acción Principal */}
                <button
                    type="button"
                    onClick={onNewTicketClick}
                    className="h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Nueva Actividad
                </button>
            </div>
        </div>
    );
};
