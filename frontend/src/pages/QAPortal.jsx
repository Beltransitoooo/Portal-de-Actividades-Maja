import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { fetchWithAuth, readErrorMessage, toUserMessage } from '../services/authService';
import { getQuarterWeeks, overlapsPeriod, toLocalDateStr, formatDateMx } from '../utils/dates';
import { getInitials } from '../utils/initials';

import { PortalHeader } from '../components/QA/Portal/PortalHeader';
import { CapacityTable } from '../components/QA/Portal/CapacityTable';
import { DeviationTable } from '../components/QA/Portal/DeviationTable';
import { EffortBalance } from '../components/QA/Portal/EffortBalance';

const COLOR_PALETTES = [
    'bg-[#1296E8]',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-amber-500'
];

export const QAPortal = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [usersData, setUsersData] = useState([]);
    const [tasksData, setTasksData] = useState([]);

    // Semanas del trimestre actual (semana 1 = primer día del trimestre, bloques de 7 días)
    const weeks = useMemo(() => getQuarterWeeks(new Date()), []);
    const optionsSprints = weeks.map(w => w.label);

    const [selectedSprint, setSelectedSprint] = useState(() => {
        const today = toLocalDateStr(new Date());
        const currentWeek = weeks.find(w => today >= w.start && today <= w.end);
        return (currentWeek || weeks[0]).label;
    });

    const selectedWeek = weeks.find(w => w.label === selectedSprint) || weeks[0];

    // Carga única de datos; el cambio de semana solo vuelve a filtrar en pantalla
    useEffect(() => {
        const loadRealData = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const resUsers = await fetchWithAuth('/usuarios/');
                const resTasks = await fetchWithAuth('/actividades/');

                if (!resUsers.ok) {
                    throw new Error(await readErrorMessage(resUsers, 'No se pudo cargar la información del equipo.'));
                }
                if (!resTasks.ok) {
                    throw new Error(await readErrorMessage(resTasks, 'No se pudieron cargar las actividades.'));
                }

                setUsersData(await resUsers.json());
                setTasksData(await resTasks.json());
            } catch (error) {
                setLoadError(toUserMessage(error, 'No se pudo cargar la información del portal.'));
            } finally {
                setIsLoading(false);
            }
        };
        loadRealData();
    }, [reloadKey]);

    const { capacityData, trackingData, balanceData } = useMemo(() => {
        // Solo actividades cuyo rango (inicio → vencimiento) se cruza con la semana seleccionada
        const periodTasks = tasksData.filter(t => overlapsPeriod(t.fecha_inicio, t.fecha_vencimiento, selectedWeek));

        // Procesar la capacidad mapeando por el id numérico del usuario
        const processedCapacity = usersData.map((user, index) => {
            const initials = getInitials(user.name_users || user.usuario);
            const userTasks = periodTasks.filter(t => t.asignado_a_id === user.id);
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
                color: COLOR_PALETTES[index % COLOR_PALETTES.length],
                statusColor
            };
        });

        const processedTracking = periodTasks.map(task => {
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
        // Solo con datos reales: sin actividades no se inventa un reparto
        const tareasCount = periodTasks.filter(t => t.tipo_actividad === 'Tarea').length;
        const pruebasCount = periodTasks.filter(t => t.tipo_actividad === 'Pruebas').length;
        const bugsCount = periodTasks.filter(t => t.tipo_actividad === 'Bug').length;
        const totalTipificadas = tareasCount + pruebasCount + bugsCount;

        const processedBalance = totalTipificadas > 0 ? {
            funcionales: Math.round((tareasCount / totalTipificadas) * 100),
            automatizacion: Math.round((pruebasCount / totalTipificadas) * 100),
            performance: Math.round((bugsCount / totalTipificadas) * 100),
        } : null;

        return { capacityData: processedCapacity, trackingData: processedTracking, balanceData: processedBalance };
    }, [usersData, tasksData, selectedWeek]);

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col gap-6 animate-fade-in">
                <PortalHeader
                    selectedSprint={selectedSprint}
                    setSelectedSprint={setSelectedSprint}
                    optionsSprints={optionsSprints}
                    periodRange={`${formatDateMx(selectedWeek.start)} – ${formatDateMx(selectedWeek.end)}`}
                />

                {isLoading ? (
                    <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-100 mt-6 rounded-xl shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-[3px] border-gray-100 border-t-[#1296E8] rounded-full animate-spin mb-3"></div>
                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase animate-pulse">Sincronizando portal...</p>
                        </div>
                    </div>
                ) : loadError ? (
                    <div role="alert" className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-100 mt-6 rounded-xl shadow-sm py-16 px-6">
                        <p className="text-sm font-bold text-[#0B132B]">No se pudo cargar la información</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                        <button type="button" onClick={() => setReloadKey(k => k + 1)} className="mt-5 h-10 px-5 bg-[#0B132B] hover:bg-[#00A3FF] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-colors">
                            Reintentar
                        </button>
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
