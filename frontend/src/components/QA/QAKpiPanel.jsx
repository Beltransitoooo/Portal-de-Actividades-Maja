export const QAKpiPanel = ({ filteredTasks = [] }) => {
    const total = filteredTasks.length;

    const inProgress = filteredTasks.filter(t => t.status === 'EN PROGRESO').length || 0;
    const inReview = filteredTasks.filter(t => t.status === 'EN REVISIÓN').length || 0;
    const completed = filteredTasks.filter(t => t.status === 'COMPLETADA').length || 0;
    const blocked = filteredTasks.filter(t => t.status === 'BLOQUEADA').length || 0;
    const pending = total - (inProgress + inReview + completed + blocked);

    const getPct = (val) => total > 0 ? (val / total) * 100 : 0;
    const progressPct = total > 0 ? Math.round(((completed + (inProgress * 0.5)) / total) * 100) : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm animate-fade-in flex flex-col xl:flex-row xl:items-center gap-8">
            
            {/* IZQUIERDA: Métrica Principal */}
            <div className="flex items-center gap-6 xl:w-1/4 xl:border-r border-slate-100 xl:pr-8 shrink-0">
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Actividades</h3>
                        {total > 0 && (
                            <span className="text-[10px] font-black text-[#1296E8] bg-[#1296E8]/10 px-2 py-1 rounded-md tracking-wider">
                                {progressPct}% AVANCE
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-[#07152F] tracking-tighter leading-none">{total}</span>
                        <span className="text-sm font-semibold text-slate-400">tickets</span>
                    </div>
                </div>
            </div>

            {/* DERECHA: Desglose Visual */}
            <div className="flex-1 flex flex-col justify-center">
                
                {/* Barra de Progreso Integrada */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5 shadow-inner">
                    <div style={{ width: `${getPct(completed)}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inProgress)}%` }} className="bg-[#1296E8] transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inReview)}%` }} className="bg-amber-400 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(blocked)}%` }} className="bg-red-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(pending)}%` }} className="bg-slate-300 transition-all duration-1000"></div>
                </div>

                {/* Leyendas (Tarjetas de métrica) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <MetricCard label="Completadas" count={completed} color="bg-emerald-500" />
                    <MetricCard label="En Progreso" count={inProgress} color="bg-[#1296E8]" />
                    <MetricCard label="En Revisión" count={inReview} color="bg-amber-400" />
                    <MetricCard label="Pendientes" count={pending} color="bg-slate-300" />
                    <MetricCard label="Bloqueadas" count={blocked} color="bg-red-500" isAlert={blocked > 0} />
                </div>
            </div>
            
        </div>
    );
};

// Subcomponente para mantener limpio el panel
const MetricCard = ({ label, count, color, isAlert }) => (
    <div className={`flex flex-col p-3 rounded-xl border ${isAlert ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50'} ${count === 0 ? 'opacity-60 grayscale' : 'opacity-100'} transition-all`}>
        <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-2 h-2 rounded-full ${color} ${isAlert ? 'shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{label}</span>
        </div>
        <span className={`text-lg font-black leading-none ${isAlert ? 'text-red-600' : 'text-[#07152F]'}`}>{count}</span>
    </div>
);