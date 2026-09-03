export const TicketMetaInfo = ({ assignee, type }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Responsable</p>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#00A3FF] text-white flex items-center justify-center text-[8px] font-black">
                        {assignee || 'UN'}
                    </div>
                    <p className="text-xs font-bold text-[#0B132B]">{assignee || 'Sin Asignar'}</p>
                </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tipo de Tarea</p>
                <p className="text-xs font-bold text-[#0B132B] uppercase tracking-widest">{type || 'TAREA'}</p>
            </div>
        </div>
    );
};