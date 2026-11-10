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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 mb-4 shadow-sm animate-fade-in flex flex-col xl:flex-row xl:items-center gap-5">
            
            {/* IZQUIERDA: Métrica Principal */}
            <div className="flex items-center gap-6 xl:w-1/4 xl:border-r border-slate-100 xl:pr-6 shrink-0">
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Actividades</h2>
                        {total > 0 && (
                            <span className="text-[10px] font-black text-[#0e71af] bg-[#1296E8]/10 px-2 py-1 rounded-md tracking-wider">
                                {progressPct}% AVANCE
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#07152F] tracking-tighter leading-none tabular-nums">{total}</span>
                        <span className="text-sm font-semibold text-slate-500">tickets</span>
                    </div>
                </div>
            </div>

            {/* DERECHA: Desglose Visual */}
            <div className="flex-1 flex flex-col justify-center">
                
                {/* Barra de Progreso Integrada */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-[2px] mb-3">
                    <div style={{ width: `${getPct(completed)}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inProgress)}%` }} className="bg-[#0e71af] transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(inReview)}%` }} className="bg-amber-400 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(blocked)}%` }} className="bg-red-500 transition-all duration-1000"></div>
                    <div style={{ width: `${getPct(pending)}%` }} className="bg-slate-300 transition-all duration-1000"></div>
                </div>

                {/* Leyendas (Tarjetas de métrica) */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <MetricCard label="Completadas" count={completed} color="bg-emerald-500" />
                    <MetricCard label="En Progreso" count={inProgress} color="bg-[#0e71af]" />
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
    <div className={`flex flex-col p-2.5 rounded-xl border ${isAlert ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50'} ${count === 0 ? 'grayscale' : ''} transition-all`}>
        {/* La etiqueta se ajusta en dos líneas si no cabe (antes se truncaba: "COMPL…") */}
        <div className="flex items-start gap-2 mb-1.5">
            <div className={`w-2 h-2 mt-[3px] rounded-full shrink-0 ${color} ${isAlert ? 'shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''}`} aria-hidden="true"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight break-words min-w-0">{label}</span>
        </div>
        <span className={`text-lg font-black leading-none tabular-nums ${isAlert ? 'text-red-700' : 'text-[#07152F]'}`}>{count}</span>
    </div>
);