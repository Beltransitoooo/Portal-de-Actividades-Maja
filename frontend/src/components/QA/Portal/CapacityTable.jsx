import React from 'react';

import { BarChart3 } from 'lucide-react';

export const CapacityTable = ({ capacityData = [] }) => {
    return (
        <div className="relative bg-[#07152F] rounded-2xl border border-[#16274D] p-6 lg:p-8 overflow-hidden shadow-2xl">
            
            {/* Elementos gráficos abstractos de fondo */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00A3FF]/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="navy-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#navy-grid)" />
            </svg>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-[#00A3FF]/20 rounded-lg text-[#00A3FF]">
                            <BarChart3 className="w-5 h-5" aria-hidden="true" />
                        </div>
                        Capacidad y distribución de carga
                    </h2>
                    <span className="text-[11px] font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 tracking-wider">
                        BASE: 40H SEMANALES
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    {capacityData.map((tester, index) => {
                        // Calculamos el porcentaje para la barra (máximo 100%)
                        const progressPercentage = Math.min((tester.logged / tester.max) * 100, 100);

                        return (
                            <div key={index} className="group flex flex-col md:flex-row md:items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all duration-300 gap-4">
                                
                                {/* Info del Tester */}
                                <div className="flex items-center gap-4 md:w-1/4">
                                    <div className={`w-10 h-10 rounded-full ${tester.color} flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0`}>
                                        {tester.id} {/* Aquí vienen las iniciales */}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white leading-tight truncate">{tester.name}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5 truncate">{tester.role}</p>
                                    </div>
                                </div>

                                {/* Tareas */}
                                <div className="md:w-1/6">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tareas</p>
                                    <p className="text-sm font-semibold text-white">{tester.tasks}</p>
                                </div>

                                {/* Progreso / Esfuerzo */}
                                <div className="md:w-2/5">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Esfuerzo Asignado</span>
                                        <span className="text-xs font-semibold text-white">
                                            {tester.logged} <span className="text-slate-400 font-normal">/ {tester.max}h</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 relative">
                                        <div 
                                            className="h-full rounded-full bg-[#00A3FF] transition-all duration-1000 shadow-[0_0_10px_rgba(0,163,255,0.5)]" 
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="md:w-1/6 flex justify-end shrink-0">
                                    {/* Utilizamos el statusColor que ya pre-calculas en el backend/hook */}
                                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider border ${tester.statusColor}`}>
                                        {tester.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};