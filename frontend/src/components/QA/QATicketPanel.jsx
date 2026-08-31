export const QATicketPanel = ({ ticket, onClose }) => {
    if (!ticket) return null;

    return (
        <>
            {/* Overlay oscuro de fondo */}
            <div 
                className="fixed inset-0 bg-[#0B132B]/30 backdrop-blur-[2px] z-[110] transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>
            
            {/* Contenedor del Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[120] border-l border-gray-200 flex flex-col animate-slide-in-right">
                
                {/* Header del Panel */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-slate-50 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#00A3FF]"></div>
                    <div className="pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black bg-[#0B132B] text-white px-2 py-0.5 rounded-sm tracking-widest">
                                {ticket.id}
                            </span>
                            <span className="text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest">
                                {ticket.type || 'TAREA'}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-[#0B132B] leading-tight">
                            {ticket.title}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-sm shadow-sm transition-colors"
                        title="Cerrar panel"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    
                    {/* Sección 1: Detalles Clave */}
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">
                            Detalles Clave
                        </p>
                        <div className="flex gap-4">
                            <div className="flex-1 border border-gray-100 bg-slate-50 p-3 rounded-sm">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Prioridad</p>
                                <p className="text-xs font-black text-[#0B132B]">{ticket.priority}</p>
                            </div>
                            <div className="flex-1 border border-gray-100 bg-slate-50 p-3 rounded-sm">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Área</p>
                                <p className="text-xs font-black text-[#0B132B]">{ticket.area || 'QA'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Descripción */}
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">
                            Descripción
                        </p>
                        <div className="text-xs text-gray-700 leading-relaxed bg-slate-50 border border-gray-100 p-4 rounded-sm min-h-[100px] whitespace-pre-wrap">
                            {ticket.description || 'Sin descripción detallada para este ticket.'}
                        </div>
                    </div>

                    {/* Sección 3: Fechas y Tiempos */}
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">
                            Planificación
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Fecha de Inicio</p>
                                <p className="text-xs font-bold text-[#0B132B]">{ticket.startDate}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Vencimiento</p>
                                <p className="text-xs font-bold text-[#0B132B]">{ticket.dueDate || ticket.startDate}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Horas Asignadas</p>
                                <p className="text-xs font-bold text-[#0B132B]">
                                    {ticket.minHours && ticket.maxHours 
                                        ? `${ticket.minHours} - ${ticket.maxHours} HRS` 
                                        : 'No estimadas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sección 4: Asignaciones */}
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">
                            Asignaciones
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-[#0B132B] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                    {ticket.assignee}
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Persona Asignada</p>
                                    <p className="text-xs font-bold text-[#0B132B]">
                                        {ticket.assignee === 'UNASSIGNED' ? 'Sin asignar' : ticket.assignee}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shadow-sm">
                                    {ticket.techLead || 'UN'}
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Líder Técnico</p>
                                    <p className="text-xs font-bold text-gray-700">
                                        {ticket.techLead === 'UNASSIGNED' || !ticket.techLead ? 'Ninguno' : ticket.techLead}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};