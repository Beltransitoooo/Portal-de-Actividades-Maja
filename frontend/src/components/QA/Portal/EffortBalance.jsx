import React from 'react';

export const EffortBalance = ({ balanceData = { funcionales: 33, automatizacion: 33, performance: 34 } }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-wider flex items-center gap-2 mb-8">
                <svg className="w-4 h-4 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                Balance de esfuerzo por tipo
            </h3>

            <div className="flex-1 flex flex-col justify-center">
                {/* BARRA DE ESFUERZO */}
                <div className="flex h-6 rounded-full overflow-hidden mb-8 shadow-inner border border-gray-100">
                    <div 
                        className="bg-[#0B132B] hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.funcionales}%` }}
                    >
                        {balanceData.funcionales > 10 && <span className="text-[10px] font-bold text-white">{balanceData.funcionales}%</span>}
                    </div>
                    <div 
                        className="bg-[#00A3FF] hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.automatizacion}%` }}
                    >
                        {balanceData.automatizacion > 10 && <span className="text-[10px] font-bold text-white">{balanceData.automatizacion}%</span>}
                    </div>
                    <div 
                        className="bg-slate-200 hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.performance}%` }}
                    >
                        {balanceData.performance > 10 && <span className="text-[10px] font-bold text-gray-600">{balanceData.performance}%</span>}
                    </div>
                </div>

                {/* LEYENDAS */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-[#0B132B] mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Funcionales</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-[#00A3FF] mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Pruebas</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-slate-300 mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Bugs / Perf.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};