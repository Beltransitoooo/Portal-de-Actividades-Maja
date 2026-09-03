export const DeviationTable = ({ trackingData }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="text-xs font-black text-[#0B132B] uppercase tracking-widest">2. Desviación de Tiempos</h2>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actividad</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tester</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Est. Inicial</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Logueado</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trackingData.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center text-xs text-gray-400 font-bold">No hay actividades recientes</td></tr>
                        ) : trackingData.map((row, idx) => (
                            <tr key={idx} className={`border-b border-gray-50 transition-colors ${row.status === 'danger' ? 'bg-red-50/30' : row.status === 'blocked' ? 'bg-orange-50/30' : 'hover:bg-slate-50'}`}>
                                <td className="p-4">
                                    <span className="text-[10px] font-black bg-[#0B132B] text-white px-2 py-1 rounded-sm tracking-widest">{row.ticket}</span>
                                </td>
                                <td className="p-4 text-xs font-bold text-[#0B132B]">{row.activity}</td>
                                <td className="p-4 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[8px] font-black shadow-sm">{row.tester}</div>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{row.name}</span>
                                </td>
                                <td className="p-4 text-center text-xs font-bold text-gray-500">{row.est}h</td>
                                <td className="p-4 text-center text-xs font-bold text-[#0B132B]">{row.logged}h</td>
                                <td className="p-4 text-right">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-end gap-1 ${
                                        row.status === 'danger' ? 'text-red-600' : row.status === 'success' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                        {row.status === 'danger' && '⚠️ '}
                                        {row.status === 'blocked' && '🛑 '}
                                        {row.diff}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};