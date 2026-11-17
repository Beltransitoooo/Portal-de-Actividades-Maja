import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutList, ChartColumn } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { fetchWithAuth, readErrorMessage, toUserMessage } from '../services/authService';
import { getQuarterWeeks, overlapsPeriod, toLocalDateStr, formatDateMx } from '../utils/dates';
import { getInitials } from '../utils/initials';
import { COLOR_PALETTES } from '../services/qaData';
import { WEEKLY_CAPACITY, NEAR_LIMIT_RATIO } from '../utils/capacity';
import { toCsv, downloadCsv } from '../utils/csv';
import { printPage } from '../utils/print';

import { PortalHeader } from '../components/QA/Portal/PortalHeader';
import { PerformanceHero } from '../components/QA/Portal/PerformanceHero';
import { CapacityTable } from '../components/QA/Portal/CapacityTable';
import { DeviationTable } from '../components/QA/Portal/DeviationTable';
import { EffortBalance } from '../components/QA/Portal/EffortBalance';
// Recharts solo se descarga al abrir la pestaña Gráficos
const ChartsView = lazy(() => import('../components/QA/Charts/ChartsView').then(m => ({ default: m.ChartsView })));

// Gráficos es la pestaña principal; el Resumen queda como segunda
const TABS = [
    { key: 'graficos', label: 'Gráficos', icon: ChartColumn },
    { key: 'resumen', label: 'Resumen', icon: LayoutList },
];



export const QAPortal = () => {
    // Pestaña activa en la URL (?vista=resumen) para poder compartirla o volver a ella; por defecto, Gráficos
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('vista') === 'resumen' ? 'resumen' : 'graficos';
    const tabRefs = useRef({});
    const selectTab = (key, focus = false) => {
        setSearchParams(key === 'graficos' ? {} : { vista: key }, { replace: true });
        if (focus) tabRefs.current[key]?.focus();
    };
    // Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs)
    const onTabKey = (e) => {
        const i = TABS.findIndex(t => t.key === tab);
        const next = e.key === 'ArrowRight' ? TABS[(i + 1) % TABS.length] : e.key === 'ArrowLeft' ? TABS[(i - 1 + TABS.length) % TABS.length] : null;
        if (next) { e.preventDefault(); selectTab(next.key, true); }
    };
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
            let statusColor = 'text-green-700 bg-green-50 border-green-200';
            if (assignedHours > WEEKLY_CAPACITY * NEAR_LIMIT_RATIO && assignedHours <= WEEKLY_CAPACITY) {
                status = 'Al Límite';
                statusColor = 'text-yellow-800 bg-yellow-50 border-yellow-200';
            } else if (assignedHours > WEEKLY_CAPACITY) {
                status = 'Sobrecargado';
                statusColor = 'text-red-700 bg-red-50 border-red-200';
            }

            return {
                raw_id: user.id,
                id: initials,
                name: user.name_users || user.usuario,
                role: user.es_admin ? 'Administrador' : 'Tester / Dev',
                tasks: userTasks.length,
                logged: assignedHours,
                max: WEEKLY_CAPACITY,
                status,
                color: COLOR_PALETTES[index % COLOR_PALETTES.length].main,
                statusColor
            };
        });

        const processedTracking = periodTasks.map(task => {
            const assignedUser = processedCapacity.find(u => u.raw_id === task.asignado_a_id) || { name: 'Sin Asignar', id: 'NA' };
            // Sin estimación no hay contra qué medir la desviación (antes se suponían 8 h)
            const rawEst = parseFloat(task.estimacion_max_hrs);
            const est = rawEst > 0 ? rawEst : null;
            const logged = parseFloat(task.horas_utilizadas || 0);
            const diffValue = est === null ? 0 : Math.round((logged - est) * 100) / 100;

            let status = 'success';
            let diffText = 'A tiempo';

            if (est === null) {
                status = 'neutral';
                diffText = logged > 0 ? `${logged} hrs (sin estimación)` : 'Sin estimación';
            } else if (task.completada) {
                // Cerrada pasada de lo estimado sigue siendo una desviación
                status = diffValue > 0 ? 'danger' : 'success';
                diffText = `${diffValue > 0 ? '+' : ''}${diffValue} hrs (Cerrada)`;
            } else if (diffValue > 0) {
                status = 'danger';
                diffText = `+${diffValue} hrs (Retraso)`;
            } else if (diffValue < 0) {
                status = 'success';
                diffText = `${diffValue} hrs (A tiempo)`;
            }

            // Bloqueo real (antes se aproximaba con la prioridad "Crítica")
            if (task.estado === 'BLOQUEADA') {
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

    const exportCsv = () => {
        const columns = [
            { label: 'Código', value: r => r.ticket },
            { label: 'Actividad', value: r => r.activity },
            { label: 'Responsable', value: r => r.name },
            { label: 'Horas estimadas', value: r => r.est ?? '' },
            { label: 'Horas utilizadas', value: r => r.logged },
            { label: 'Resultado', value: r => r.diff },
        ];
        downloadCsv(`desviacion-de-tiempos-${selectedWeek.start}.csv`, toCsv(columns, trackingData));
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col gap-6 animate-fade-in">
                <PerformanceHero />

                <div className="flex flex-wrap items-end justify-between gap-4 -mt-1">
                    <div role="tablist" aria-label="Secciones del panel" onKeyDown={onTabKey} className="no-print flex gap-1">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                ref={el => { tabRefs.current[t.key] = el; }}
                                id={`panel-tab-${t.key}`}
                                type="button"
                                role="tab"
                                aria-selected={tab === t.key}
                                aria-controls={`panel-${t.key}`}
                                tabIndex={tab === t.key ? 0 : -1}
                                onClick={() => selectTab(t.key)}
                                className={`relative h-11 px-4 flex items-center gap-2 rounded-[10px] text-[14px] font-bold transition-colors ${
                                    tab === t.key ? 'bg-white text-[#07152F] shadow-[0_8px_20px_-14px_rgb(10_22_48/0.5)]' : 'text-[#475569] hover:text-[#07152F]'
                                }`}
                            >
                                <t.icon className={`w-4 h-4 ${tab === t.key ? 'text-[#0e71af]' : ''}`} aria-hidden="true" />
                                {t.label}
                                {tab === t.key && <span aria-hidden="true" className="absolute left-3 right-3 -bottom-[3px] h-[3px] bg-tartan -skew-x-[14deg]"></span>}
                            </button>
                        ))}
                    </div>
                    <PortalHeader
                        onExportCsv={exportCsv}
                        onPrint={printPage}
                        selectedSprint={selectedSprint}
                        setSelectedSprint={setSelectedSprint}
                        optionsSprints={optionsSprints}
                        periodRange={`${formatDateMx(selectedWeek.start)} – ${formatDateMx(selectedWeek.end)}`}
                        showControls={tab === 'resumen'}
                    />
                </div>

                {tab === 'graficos' ? (
                    <div role="tabpanel" id="panel-graficos" aria-labelledby="panel-tab-graficos">
                        <Suspense fallback={<p role="status" className="text-xs text-gray-500 py-10 text-center">Cargando gráficas...</p>}>
                            <ChartsView />
                        </Suspense>
                    </div>
                ) : (
                <div role="tabpanel" id="panel-resumen" aria-labelledby="panel-tab-resumen" className="flex flex-col gap-6">
                {isLoading ? (
                    <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-100 mt-6 rounded-xl shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-[3px] border-gray-100 border-t-[#0e71af] rounded-full animate-spin mb-3"></div>
                            <p className="text-[13px] font-bold text-gray-500 animate-pulse">Sincronizando portal...</p>
                        </div>
                    </div>
                ) : loadError ? (
                    <div role="alert" className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-100 mt-6 rounded-xl shadow-sm py-16 px-6">
                        <p className="text-sm font-bold text-[#0B132B]">No se pudo cargar la información</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                        <button type="button" onClick={() => setReloadKey(k => k + 1)} className="mt-5 h-10 px-5 bg-[#0B132B] hover:bg-[#00A3FF] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors">
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
                )}
            </div>
        </DashboardLayout>
    );
};
