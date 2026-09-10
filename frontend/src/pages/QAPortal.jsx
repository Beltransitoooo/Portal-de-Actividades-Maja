import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { fetchWithAuth } from '../services/authService';

import { PortalHeader } from '../components/QA/Portal/PortalHeader';
import { CapacityTable } from '../components/QA/Portal/CapacityTable';
import { DeviationTable } from '../components/QA/Portal/DeviationTable';
import { EffortBalance } from '../components/QA/Portal/EffortBalance';

export const QAPortal = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [capacityData, setCapacityData] = useState([]);
    const [trackingData, setTrackingData] = useState([]);
    const [balanceData, setBalanceData] = useState({ funcionales: 0, automatizacion: 0, performance: 0 });

    const [selectedSprint, setSelectedSprint] = useState(() => {
        const quarter = Math.floor(new Date().getMonth() / 3) + 1;
        return `Q${quarter} - Semana 1`;
    });

    const optionsSprints = [
        `Q${Math.floor(new Date().getMonth() / 3) + 1} - Semana 1`,
        `Q${Math.floor(new Date().getMonth() / 3) + 1} - Semana 2`,
        `Q${Math.floor(new Date().getMonth() / 3) + 1} - Semana 3`,
        `Q${Math.floor(new Date().getMonth() / 3) + 1} - Semana 4`,
    ];

    const getInitials = (name) => {
        if (!name) return 'US';
        const words = name.trim().split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        const loadRealData = async () => {
            setIsLoading(true);
            try {
                const resUsers = await fetchWithAuth('/usuarios/');
                const resTasks = await fetchWithAuth('/actividades/');
                
                const usersData = resUsers.ok ? await resUsers.json() : [];
                const tasksData = resTasks.ok ? await resTasks.json() : [];

                const colorPalettes = [
                    'bg-[#1296E8]',
                    'bg-emerald-500',
                    'bg-purple-500',
                    'bg-amber-500'
                ];

                // Procesar la capacidad mapeando por el id numérico del usuario
                const processedCapacity = usersData.map((user, index) => {
                    const initials = getInitials(user.name_users || user.usuario);
                    const userTasks = tasksData.filter(t => t.asignado_a_id === user.id);
                    const assignedHours = userTasks.reduce((total, task) => total + parseFloat(task.estimacion_max_hrs || 0), 0);
                    
                    let status = 'Óptimo';
                    let statusColor = 'text-green-600 bg-green-50 border-green-200';
                    if (assignedHours > 32 && assignedHours <= 40) { 
                        status = 'Al Límite'; 
                        statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200'; 
                    } else if (assignedHours > 40) { 
                        status = 'Sobrecargado'; 
                        statusColor = 'text-red-600 bg-red-50 border-red-200'; 
                    }

                    return { 
                        raw_id: user.id,
                        id: initials, 
                        name: user.name_users || user.usuario, 
                        role: user.es_admin ? 'Administrador' : 'Tester / Dev', 
                        tasks: userTasks.length, 
                        logged: assignedHours, 
                        max: 40, 
                        status, 
                        color: colorPalettes[index % colorPalettes.length], 
                        statusColor 
                    };
                });

                
                const processedTracking = tasksData.map(task => {
                    const assignedUser = processedCapacity.find(u => u.raw_id === task.asignado_a_id) || { name: 'Sin Asignar', id: 'NA' };
                    const est = parseFloat(task.estimacion_max_hrs || 8); 
                    const logged = parseFloat(task.estimacion_min_hrs || 0); 
                    const diffValue = logged - est;
                    
                    let status = 'success'; 
                    let diffText = 'A tiempo';
                    
                    if (task.completada) {
                        diffText = `${diffValue > 0 ? '+' : ''}${diffValue} hrs (Cerrada)`;
                    } else if (diffValue > 0) { 
                        status = 'danger'; 
                        diffText = `+${diffValue} hrs (Retraso)`; 
                    } else if (diffValue < 0) { 
                        status = 'success'; 
                        diffText = `${diffValue} hrs (A tiempo)`; 
                    }
                    
                    if ((task.prioridad || '').toUpperCase() === 'CRÍTICA' && !task.completada) { 
                        status = 'blocked'; 
                        diffText = 'Bloqueado'; 
                    }

                    return { 
                        ticket: `QA-${task.id}`, 
                        tester: assignedUser.id, 
                        name: assignedUser.name, 
                        activity: task.titulo || 'Actividad sin título', 
                        est, 
                        logged, 
                        diff: diffText, 
                        status 
                    };
                });

                // Balance de esfuerzo por tipo de actividad
                const totalTasks = tasksData.length || 1;
                const tareasCount = tasksData.filter(t => t.tipo_actividad === 'Tarea').length;
                const pruebasCount = tasksData.filter(t => t.tipo_actividad === 'Pruebas').length;
                const bugsCount = tasksData.filter(t => t.tipo_actividad === 'Bug').length;

                setBalanceData({
                    funcionales: Math.round((tareasCount / totalTasks) * 100) || 33,
                    automatizacion: Math.round((pruebasCount / totalTasks) * 100) || 33,
                    performance: Math.round((bugsCount / totalTasks) * 100) || 34,
                });

                setCapacityData(processedCapacity);
                setTrackingData(processedTracking);

            } catch (error) {
                console.error("Error al cargar la información del portal:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRealData();
    }, [selectedSprint]);

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col gap-6 animate-fade-in">
                <PortalHeader 
                    selectedSprint={selectedSprint} 
                    setSelectedSprint={setSelectedSprint} 
                    optionsSprints={optionsSprints} 
                />

                {isLoading ? (
                    <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-100 mt-6 rounded-xl shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-[3px] border-gray-100 border-t-[#1296E8] rounded-full animate-spin mb-3"></div>
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase animate-pulse">Sincronizando portal...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <CapacityTable capacityData={capacityData} />
                        
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mt-2">
                            <div className="xl:col-span-7 h-full">
                                <DeviationTable trackingData={trackingData} />
                            </div>
                            <div className="xl:col-span-5 h-full">
                                <EffortBalance balanceData={balanceData} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};