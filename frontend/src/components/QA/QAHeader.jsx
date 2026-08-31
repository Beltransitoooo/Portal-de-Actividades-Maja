export const QAHeader = ({ onNewTicketClick, currentDate, onPrevMonth, onNextMonth }) => {
    
    // Función para formatear el mes
    const getFormattedMonth = () => {
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    };

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
            
            {/* Títulos y breadcrumbs */}
            <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                    <span>Módulos</span>
                    <span>/</span>
                    <span className="text-[#00A3FF]">QA & Testing</span>
                </div>
                <h1 className="text-3xl font-black text-[#0B132B] tracking-tight uppercase border-l-4 border-[#00A3FF] pl-4">
                    Gestor de Incidencias
                </h1>
            </div>

            {/* Controles de Calendario y Filtros */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
                
                {/* Selector de Mes Dinámico */}
                <div className="flex items-center bg-white border border-gray-200 shadow-sm rounded-sm">
                    <button onClick={onPrevMonth} className="p-2 text-gray-400 hover:text-[#0B132B] transition-colors border-r border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="px-6 text-xs font-bold text-[#0B132B] uppercase tracking-widest min-w-[140px] text-center">
                        {getFormattedMonth()}
                    </span>
                    <button onClick={onNextMonth} className="p-2 text-gray-400 hover:text-[#0B132B] transition-colors border-l border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Filtro rápido */}
                <select className="bg-white border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-widest p-2 shadow-sm rounded-sm focus:outline-none focus:border-[#00A3FF]">
                    <option>Todas (Activas)</option>
                    <option>Solo Bugs Críticos</option>
                    <option>Mis Asignaciones</option>
                </select>

                <button onClick={onNewTicketClick} className="bg-[#0B132B] text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#1a264a] transition-all flex items-center gap-2 rounded-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Nuevo Ticket
                </button>
            </div>
        </div>
    );
};