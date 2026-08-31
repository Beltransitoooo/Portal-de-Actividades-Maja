export const QAKpiPanel = ({ filteredTasks }) => {
    const totalOpen = filteredTasks.length;
    const totalCritical = filteredTasks.filter(t => t.priority === 'CRÍTICA').length;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 border border-gray-200 shadow-sm border-l-4 border-l-gray-400">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Abiertas</p>
                <p className="text-2xl font-black text-[#0B132B]">{totalOpen}</p>
            </div>
            <div className="bg-white p-4 border border-gray-200 shadow-sm border-l-4 border-l-red-500">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Críticas</p>
                <p className="text-2xl font-black text-red-600">{totalCritical}</p>
            </div>
            <div className="bg-white p-4 border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">En Revisión</p>
                <p className="text-2xl font-black text-yellow-600">0</p>
            </div>
            <div className="bg-white p-4 border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Resueltas (Mes)</p>
                <p className="text-2xl font-black text-green-600">89</p>
            </div>
        </div>
    );
};