import { Link } from 'react-router-dom';

// ==========================================
// 1. HEADER (Elegante, minimalista y compacto)
// ==========================================
export const QAHeader = ({ onNewTicketClick, currentDate, onPrevMonth, onNextMonth }) => {
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in">
            
            {/* Título y Breadcrumb */}
            <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                    <Link to="/dashboard" className="hover:text-[#1296E8] transition-colors flex items-center gap-1 cursor-pointer" title="Regresar a Selección de Módulo">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Módulos
                    </Link>
                    <span>/</span>
                    <span className="text-[#1296E8]">QA & Testing</span>
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
                    <button onClick={onPrevMonth} className="px-3 text-gray-400 hover:text-[#1296E8] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-[10px] font-black text-[#07152F] uppercase tracking-widest min-w-[130px] text-center">
                        {currentMonthName} {currentYear}
                    </span>
                    <button onClick={onNextMonth} className="px-3 text-gray-400 hover:text-[#1296E8] hover:bg-slate-50 h-full transition-colors flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Filtro Principal */}
                <div className="h-10 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm flex items-center px-4 cursor-pointer transition-colors">
                    <span className="text-[10px] font-bold text-[#07152F] uppercase tracking-widest">Todas (Activas)</span>
                    <svg className="w-3 h-3 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>

                {/* Botón de Acción Principal */}
                <button 
                    onClick={onNewTicketClick} 
                    className="h-10 px-5 bg-[#07152F] hover:bg-[#1296E8] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Nueva Actividad
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 2. RESUMEN DE PROGRESO 
// ==========================================
export const QAKpiPanel = ({ filteredTasks = [] }) => {
    const total = filteredTasks.length;

    const inProgress = filteredTasks.filter(t => t.status === 'EN PROGRESO').length || 0;
    const inReview = filteredTasks.filter(t => t.status === 'EN REVISIÓN').length || 0;
    const completed = filteredTasks.filter(t => t.status === 'COMPLETADA').length || 0;
    
    // CORRECCIÓN: Ahora solo cuenta como bloqueadas las que explícitamente tengan ese estado
    const blocked = filteredTasks.filter(t => t.status === 'BLOQUEADA').length || 0;
    
    // Lo que no caiga en las anteriores, es Pendiente
    const pending = total - (inProgress + inReview + completed + blocked);

    // Cálculos seguros de porcentajes para la barra
    const getPct = (val) => total > 0 ? (val / total) * 100 : 0;
    const progressPct = total > 0 ? Math.round(((completed + (inProgress * 0.5)) / total) * 100) : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm animate-fade-in flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            {/* IZQUIERDA: Métrica General */}
            <div className="flex items-center gap-6 xl:w-1/4 xl:border-r border-gray-100 pr-6">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Actividades</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-[#07152F] tracking-tighter leading-none">{total}</span>
                        {total > 0 && (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                {progressPct}% Avance
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* DERECHA: Barra de Segmentos y Leyendas */}
            <div className="flex-1 flex flex-col justify-center">
                
                {/* Barra segmentada extra fina */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
                    <div style={{ width: `${getPct(completed)}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inProgress)}%` }} className="bg-[#1296E8] transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inReview)}%` }} className="bg-amber-400 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(blocked)}%` }} className="bg-red-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(pending)}%` }} className="bg-slate-300 transition-all duration-1000"></div>
                </div>

                {/* Leyendas */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    
                    <div className={`flex items-center gap-2 ${completed === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Completadas</span>
                        <span className="text-xs font-black text-[#07152F]">{completed}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${inProgress === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-[#1296E8]"></div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">En progreso</span>
                        <span className="text-xs font-black text-[#07152F]">{inProgress}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${inReview === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Revisión</span>
                        <span className="text-xs font-black text-[#07152F]">{inReview}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${pending === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Pendientes</span>
                        <span className="text-xs font-black text-[#07152F]">{pending}</span>
                    </div>

                    <div className={`flex items-center gap-2 ${blocked === 0 ? 'opacity-50 grayscale' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Bloqueadas</span>
                        <span className="text-xs font-black text-red-600">{blocked}</span>
                    </div>

                </div>
            </div>
            
        </div>
    );
};