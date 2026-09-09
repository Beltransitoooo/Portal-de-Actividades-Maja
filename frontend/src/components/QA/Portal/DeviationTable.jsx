import React from 'react';

export const DeviationTable = ({ trackingData = [] }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-wider flex items-center gap-2 mb-6">
                <svg className="w-4 h-4 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Desviación de tiempos
            </h3>

            <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col">
                {/* Header de la tabla */}
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white">
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
                                <span className="col-span-2 text-xs text-gray-600 font-medium truncate pr-4">{item.activity}</span>
                                <span className="text-xs font-semibold text-gray-500">{item.name}</span>
                                
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-xs font-bold text-gray-700">{item.est}h</span>
                                    <span className={`text-[10px] font-bold ${item.status === 'danger' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {item.diff}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ESTADO VACÍO (Empty State) */
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 mb-4 shadow-sm text-gray-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
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