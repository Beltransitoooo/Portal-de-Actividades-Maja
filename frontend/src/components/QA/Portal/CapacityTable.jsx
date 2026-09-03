export const CapacityTable = ({ capacityData }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <h2 className="text-xs font-black text-[#0B132B] uppercase tracking-widest">1. Capacidad y Distribución de Carga</h2>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-auto">(Base: 40h Semanales)</span>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tester Asignado</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tareas</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Esfuerzo Asignado</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {capacityData.map((user, idx) => {
                            const percentage = Math.min((user.logged / user.max) * 100, 100);
                            return (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm ${user.color}`}>
                                            {user.id}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#0B132B]">{user.name}</p>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">{user.role}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm font-black text-[#0B132B]">{user.tasks}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                                                <div className={`${user.color} h-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 min-w-[60px] text-right">
                                                {user.logged} / {user.max}h
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${user.statusColor}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};