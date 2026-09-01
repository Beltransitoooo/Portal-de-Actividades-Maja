import { DashboardLayout } from '../layouts/DashboardLayout';

export const QAPortal = () => {
    // Mock Data adaptada a tu equipo
    const capacityData = [
        { id: 'AB', name: 'Angel Beltrán', role: 'Frontend / UI', tasks: 5, logged: 32, max: 40, status: 'Óptimo', color: 'bg-[#00A3FF]', statusColor: 'text-green-600 bg-green-50 border-green-200' },
        { id: 'LM', name: 'Luis Martínez', role: 'Backend / API', tasks: 8, logged: 40, max: 40, status: 'Al Límite', color: 'bg-emerald-500', statusColor: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
        { id: 'JD', name: 'Jane Doe', role: 'QA Tester', tasks: 4, logged: 44, max: 40, status: 'Sobrecargada', color: 'bg-red-500', statusColor: 'text-red-600 bg-red-50 border-red-200' }
    ];

    const trackingData = [
        { ticket: 'QA-1024', tester: 'LM', name: 'Luis M.', activity: 'Regresión Módulo de Pagos', est: 6, logged: 9, diff: '+3 hrs (Retraso)', status: 'danger' },
        { ticket: 'QA-5542', tester: 'AB', name: 'Angel B.', activity: 'Automatización Login OAuth2', est: 16, logged: 10, diff: '-6 hrs (A tiempo)', status: 'success' },
        { ticket: 'QA-0089', tester: 'JD', name: 'Jane D.', activity: 'Prueba de Carga Base de Datos', est: 12, logged: 15, diff: 'Bloqueado', status: 'blocked' }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col gap-6">
                
                {/* Header Simplificado */}
                <div className="flex flex-col mb-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                        <span>Módulos</span>
                        <span>/</span>
                        <span className="text-[#00A3FF]">QA & Testing</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-black text-[#0B132B] tracking-tight uppercase border-l-4 border-[#00A3FF] pl-4">
                            Panel de Rendimiento
                        </h1>
                        <div className="bg-white border border-gray-200 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest rounded-sm shadow-sm">
                            Sprint Actual: <span className="text-[#0B132B]">Q3 - Semana 2</span>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 1: Control de Capacidad */}
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

                {/* SECCIÓN 2: Seguimiento de Actividades */}
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
                                {trackingData.map((row, idx) => (
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

                {/* SECCIÓN 3: Balance de Esfuerzo */}
                <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        <h2 className="text-xs font-black text-[#0B132B] uppercase tracking-widest">3. Balance de Esfuerzo por Tipo</h2>
                    </div>
                    <div className="p-6">
                        <div className="w-full flex h-8 rounded-sm overflow-hidden shadow-inner mb-3">
                            <div className="bg-[#0B132B] h-full flex items-center justify-center text-white text-[9px] font-bold tracking-widest" style={{ width: '50%' }}>Funcionales (50%)</div>
                            <div className="bg-[#00A3FF] h-full flex items-center justify-center text-white text-[9px] font-bold tracking-widest" style={{ width: '30%' }}>Automatización (30%)</div>
                            <div className="bg-gray-300 h-full flex items-center justify-center text-gray-700 text-[9px] font-bold tracking-widest" style={{ width: '20%' }}>Performance (20%)</div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};