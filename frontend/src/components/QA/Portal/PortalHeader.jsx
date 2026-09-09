import React from 'react';

export const PortalHeader = ({ selectedSprint, setSelectedSprint, optionsSprints }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            
            {/* --- TITULO Y BREADCRUMB --- */}
            <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2 tracking-wide uppercase">
                    <span>Módulos</span>
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#00A3FF]">QA & Testing</span>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight">
                    Panel de rendimiento
                </h1>
                
                <p className="text-sm text-gray-500 mt-2 font-medium">
                    Visualiza el progreso, la carga de trabajo y el estado de las actividades del equipo.
                </p>
            </div>

            {/* --- SELECTOR PREMIUM (Con funcionalidad nativa oculta) --- */}
            <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    Período de trabajo
                </label>
                
                <div className="relative group">
                    {/* 1. Botón Visual (Lo que ve el usuario) */}
                    <div className="flex items-center gap-3 bg-white border border-gray-200 group-hover:border-[#00A3FF]/30 group-hover:shadow-md shadow-sm rounded-lg px-4 py-2.5 text-xs font-bold text-[#0B132B] transition-all duration-200">
                        
                        {/* Puntito verde animado */}
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        
                        {/* Texto dinámico según el state */}
                        {selectedSprint ? selectedSprint.toUpperCase() : 'SELECCIONA...'}
                        
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {/* 2. Select Funcional (Transparente y posicionado encima) */}
                    <select 
                        value={selectedSprint}
                        onChange={(e) => setSelectedSprint(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                    >
                        {optionsSprints.map((sprint, index) => (
                            <option key={index} value={sprint}>
                                {sprint.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
        </div>
    );
};