import { Link } from 'react-router-dom';

export const QAHeader = ({ onNewTicketClick, currentDate, onPrevMonth, onNextMonth }) => {
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    return (
        <div className="flex flex-col mb-4">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                <Link to="/dashboard" className="hover:text-[#00A3FF] transition-colors flex items-center gap-1 cursor-pointer" title="Regresar a Selección de Módulo">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Módulos
                </Link>
                <span>/</span>
                <span className="text-[#00A3FF]">QA & Testing</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h1 className="text-3xl font-black text-[#0B132B] tracking-tight uppercase border-l-4 border-[#00A3FF] pl-4">
                    Gestor de Actividades
                </h1>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-sm shadow-sm h-10">
                        <button onClick={onPrevMonth} className="px-3 text-gray-400 hover:text-[#00A3FF] hover:bg-slate-50 h-full transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-[10px] font-black text-[#0B132B] uppercase tracking-widest min-w-[120px] text-center">
                            {currentMonthName} {currentYear}
                        </span>
                        <button onClick={onNextMonth} className="px-3 text-gray-400 hover:text-[#00A3FF] hover:bg-slate-50 h-full transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="h-10 bg-white border border-gray-200 rounded-sm shadow-sm flex items-center px-3">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Todas (Activas)</span>
                         <svg className="w-3 h-3 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    <button onClick={onNewTicketClick} className="h-10 px-4 bg-[#0B132B] hover:bg-[#00A3FF] text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-md transition-all flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Nueva Actividad
                    </button>
                </div>
            </div>
        </div>
    );
};