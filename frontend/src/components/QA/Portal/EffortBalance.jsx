export const EffortBalance = ({ balanceData }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                <h2 className="text-xs font-black text-[#0B132B] uppercase tracking-widest">3. Balance de Esfuerzo por Tipo</h2>
            </div>
            <div className="p-6">
                <div className="w-full flex h-8 rounded-sm overflow-hidden shadow-inner mb-3">
                    <div className="bg-[#0B132B] h-full flex items-center justify-center text-white text-[9px] font-bold tracking-widest overflow-hidden whitespace-nowrap transition-all duration-1000" style={{ width: `${balanceData.funcionales}%` }}>
                        {balanceData.funcionales > 10 ? `Funcionales (${balanceData.funcionales}%)` : ''}
                    </div>
                    <div className="bg-[#00A3FF] h-full flex items-center justify-center text-white text-[9px] font-bold tracking-widest overflow-hidden whitespace-nowrap transition-all duration-1000" style={{ width: `${balanceData.automatizacion}%` }}>
                        {balanceData.automatizacion > 10 ? `Pruebas (${balanceData.automatizacion}%)` : ''}
                    </div>
                    <div className="bg-gray-300 h-full flex items-center justify-center text-gray-700 text-[9px] font-bold tracking-widest overflow-hidden whitespace-nowrap transition-all duration-1000" style={{ width: `${balanceData.performance}%` }}>
                        {balanceData.performance > 10 ? `Bugs/Perf. (${balanceData.performance}%)` : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};