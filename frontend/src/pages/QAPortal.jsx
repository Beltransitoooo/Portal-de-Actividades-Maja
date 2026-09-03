import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { fetchWithAuth } from '../services/authService';

// Importamos nuestros nuevos micro-componentes
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
                // ... Todo el bloque lógico que ya tenías para calcular los datos
                const resUsers = await fetchWithAuth('/usuarios');
                const resTasks = await fetchWithAuth('/actividades');
                
                const usersData = resUsers.ok ? await resUsers.json() : [];
                const tasksData = resTasks.ok ? await resTasks.json() : [];

                const colorPalettes = [
                    { main: 'bg-[#00A3FF]', statusColor: 'text-green-600 bg-green-50 border-green-200' },
                    { main: 'bg-emerald-500', statusColor: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
                    { main: 'bg-purple-500', statusColor: 'text-red-600 bg-red-50 border-red-200' },
                    { main: 'bg-amber-500', statusColor: 'text-green-600 bg-green-50 border-green-200' }
                ];

                const processedCapacity = usersData.map((user, index) => {
                    const initials = getInitials(user.name_users || user.usuario);
                    const userTasks = tasksData.filter(t => t.assignee === initials || t.assignee === user.usuario);
                    const assignedHours = userTasks.reduce((total, task) => total + parseFloat(task.maxHours || 0), 0);
                    
                    let status = 'Óptimo';
                    let statusColor = 'text-green-600 bg-green-50 border-green-200';
                    if (assignedHours > 32 && assignedHours <= 40) { status = 'Al Límite'; statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200'; } 
                    else if (assignedHours > 40) { status = 'Sobrecargado'; statusColor = 'text-red-600 bg-red-50 border-red-200'; }

                    return { id: initials, name: user.name_users || user.usuario, role: user.es_admin ? 'Administrador' : 'Tester / Dev', tasks: userTasks.length, logged: assignedHours, max: 40, status, color: colorPalettes[index % colorPalettes.length].main, statusColor };
                });

                const processedTracking = tasksData.slice(0, 5).map(task => {
                    const assignedUser = processedCapacity.find(u => u.id === task.assignee || u.name === task.assignee) || { name: task.assignee || 'Sin Asignar', id: task.assignee || 'NA' };
                    const est = parseFloat(task.maxHours || 8); const logged = parseFloat(task.minHours || est); const diffValue = logged - est;
                    let status = 'success'; let diffText = 'A tiempo';
                    
                    if (diffValue > 0) { status = 'danger'; diffText = `+${diffValue} hrs (Retraso)`; } 
                    else if (diffValue < 0) { status = 'success'; diffText = `${diffValue} hrs (A tiempo)`; }
                    if (task.priority === 'CRÍTICA') { status = 'blocked'; diffText = 'Bloqueado'; }

                    return { ticket: task.id || `QA-PENDIENTE`, tester: assignedUser.id, name: assignedUser.name, activity: task.title || 'Actividad sin título', est, logged, diff: diffText, status };
                });

                const totalTasks = tasksData.length || 1;
                setBalanceData({
                    funcionales: Math.round((tasksData.filter(t => t.type === 'TAREA').length / totalTasks) * 100) || 33,
                    automatizacion: Math.round((tasksData.filter(t => t.type === 'PRUEBAS').length / totalTasks) * 100) || 33,
                    performance: Math.round((tasksData.filter(t => t.type === 'BUG').length / totalTasks) * 100) || 34,
                });

                setCapacityData(processedCapacity);
                setTrackingData(processedTracking);

            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRealData();
    }, [selectedSprint]);

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col gap-6">
                <PortalHeader 
                    selectedSprint={selectedSprint} 
                    setSelectedSprint={setSelectedSprint} 
                    optionsSprints={optionsSprints} 
                />

                {isLoading ? (
                    <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-200 mt-6 rounded-sm shadow-sm">
                        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase animate-pulse">Sincronizando...</p>
                    </div>
                ) : (
                    <>
                        <CapacityTable capacityData={capacityData} />
                        <DeviationTable trackingData={trackingData} />
                        <EffortBalance balanceData={balanceData} />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};