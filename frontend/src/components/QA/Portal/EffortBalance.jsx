import { PieChart } from 'lucide-react';

export const EffortBalance = ({ balanceData = null }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider flex items-center gap-2 mb-8">
                <PieChart className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                Balance de esfuerzo por tipo
            </h2>

            {!balanceData ? (
                /* ESTADO VACÍO (Empty State) */
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-gray-100 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 mb-4 shadow-sm text-gray-500">
                        <PieChart className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-[#0B132B]">Sin actividades para calcular</p>
                    <p className="text-xs text-gray-500 mt-1.5 max-w-[280px]">
                        El balance por tipo aparecerá aquí cuando el equipo registre actividades.
                    </p>
                </div>
            ) : (
            <div className="flex-1 flex flex-col justify-center">
                {/* BARRA DE ESFUERZO */}
                <div className="flex gap-[2px] h-6 rounded-full overflow-hidden mb-8 border border-gray-100">
                    <div
                        className="bg-[#0B132B] hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.funcionales}%` }}
                    >
                        {balanceData.funcionales > 10 && <span className="text-[10px] font-bold text-white">{balanceData.funcionales}%</span>}
                    </div>
                    <div
                        className="bg-[#0072b2] hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.automatizacion}%` }}
                    >
                        {balanceData.automatizacion > 10 && <span className="text-[10px] font-bold text-white">{balanceData.automatizacion}%</span>}
                    </div>
                    <div
                        className="bg-slate-500 hover:opacity-90 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                        style={{ width: `${balanceData.performance}%` }}
                    >
                        {balanceData.performance > 10 && <span className="text-[10px] font-bold text-white">{balanceData.performance}%</span>}
                    </div>
                </div>

                {/* LEYENDAS */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-[#0B132B] mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Funcionales</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-[#0072b2] mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Pruebas</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2 h-2 rounded-full bg-slate-500 mb-2"></div>
                        <span className="text-xs font-bold text-[#0B132B]">Bugs / Perf.</span>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
