import React from 'react';

import { Clock3, ClipboardList } from 'lucide-react';

export const DeviationTable = ({ trackingData = [] }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h2 className="text-sm font-black text-[#0B132B] uppercase tracking-wider flex items-center gap-2 mb-6">
                <Clock3 className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                Desviación de tiempos
            </h2>

            <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col">
                {/* Header de la tabla */}
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white">
                    <span>Código</span>
                    <span className="col-span-2">Actividad</span>
                    <span>Tester</span>
                    <span className="text-right">Est/Diferencia</span>
                </div>
                
                {trackingData.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {trackingData.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                                <span className="text-xs font-bold text-[#0B132B]">{item.ticket}</span>
                                <span className="col-span-2 text-xs text-gray-600 font-medium break-words md:truncate pr-4">{item.activity}</span>
                                <span className="text-xs font-semibold text-gray-500">{item.name}</span>
                                
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-xs font-bold text-gray-700">{item.est}h</span>
                                    <span className={`text-[10px] font-bold ${item.status === 'danger' ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {item.diff}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ESTADO VACÍO (Empty State) */
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 mb-4 shadow-sm text-gray-500">
                            <ClipboardList className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-bold text-[#0B132B]">No hay actividades registradas</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[280px]">
                            El historial y las desviaciones de tiempo aparecerán aquí una vez que el equipo comience a loguear horas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};