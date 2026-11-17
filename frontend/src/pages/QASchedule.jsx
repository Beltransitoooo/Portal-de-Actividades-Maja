import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardList, Hourglass, Clock3, CheckCircle2, Flag, CalendarClock,
    ChevronDown, Users, TrendingUp, RotateCcw, Ban, Eye, ShieldCheck, Activity, History as HistoryIcon
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/Shared/PageHeader';
import { MonthSwitcher } from '../components/Shared/MonthSwitcher';
import { ExportBar } from '../components/Shared/ExportBar';
import { ActivityFilters } from '../components/QA/ActivityFilters';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { ScheduleHistoryModal } from '../components/QA/ScheduleHistoryModal';
import { useQAData } from '../hooks/useQAData';
import { useActivityFilters } from '../hooks/useActivityFilters';
import { STATUS_CONFIG } from '../services/qaData';
import { toLocalDateStr, formatDateMx } from '../utils/dates';
import { distributeHours, fmtHours, getEquivalentWorkingDays } from '../utils/schedule';
import { WEEKDAY_SCHEDULE_TEXT, SATURDAY_SCHEDULE_TEXT } from '../utils/capacity';
import { toCsv, downloadCsv } from '../utils/csv';
import { printPage } from '../utils/print';

const WEEKDAY_LETTERS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const LABEL_COL = 'w-[300px] shrink-0 sticky left-0 z-10 border-r border-slate-200';
const fmtH = fmtHours;

// Rayado diagonal que marca visualmente las actividades bloqueadas en la barra
const BLOCKED_STRIPES = 'repeating-linear-gradient(135deg, rgba(0,0,0,0.30) 0 5px, transparent 5px 10px)';

// Estado actual de la actividad (con icono para no depender solo del color)
const StatusPill = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['PENDIENTE'];
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap ${config.bg} ${config.border} ${config.color}`}>
            {status === 'BLOQUEADA' ? <Ban className="w-2.5 h-2.5" aria-hidden="true" />
                : status === 'EN REVISIÓN' ? <Eye className="w-2.5 h-2.5" aria-hidden="true" />
                : <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true"></span>}
            {status}
        </span>
    );
};

const StatTile = ({ icon: Icon, label, value, detail, alert = false }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-red-50 text-red-700' : 'bg-[#1296E8]/10 text-[#0e71af]'}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
            <p className="text-[12px] font-bold text-gray-500">{label}</p>
            <p className="text-2xl font-black text-[#07152F] tabular-nums leading-tight">{value}</p>
            {detail && <p className={`text-[10px] font-bold mt-0.5 ${alert ? 'text-red-700' : 'text-gray-500'}`}>{detail}</p>}
        </div>
    </div>
);

export const QASchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [memberFilter, setMemberFilter] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);

    const { teamUsers, tasks, leaders, me, isLoading, loadError, reload } = useQAData();
    const { filters, setFilter, reset, matches, activeCount } = useActivityFilters();

    const selectedTicket = tasks.find(t => t.db_id === selectedTicketId) ?? null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = toLocalDateStr(new Date(year, month, 1));
    const monthEnd = toLocalDateStr(new Date(year, month, daysInMonth));
    const todayStr = toLocalDateStr(new Date());

    const days = useMemo(
        () => Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
        [year, month, daysInMonth]
    );

    // Actividades cuyo rango (inicio → vencimiento) toca el mes visible, con búsqueda y filtros aplicados
    const monthTasks = useMemo(() => tasks
        .filter(t => t.startDate && t.startDate <= monthEnd && (t.dueDate || t.startDate) >= monthStart)
        .filter(t => !memberFilter || String(t.assignee_raw_id) === memberFilter)
        .filter(matches)
        .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.dueDate || '').localeCompare(b.dueDate || '')),
    [tasks, monthStart, monthEnd, memberFilter, matches]);

    // Las completadas salen de la línea de tiempo y se consultan en el historial
    const activeTasks = useMemo(() => monthTasks.filter(t => !t.completada), [monthTasks]);
    const completedTasks = useMemo(() => monthTasks.filter(t => t.completada), [monthTasks]);

    // Reparto de la estimación por día (mismo que usa el calendario) de cada actividad visible
    const distributions = useMemo(
        () => new Map(activeTasks.map(t => [t.db_id, distributeHours(t.maxHours, t.startDate, t.dueDate || t.startDate)])),
        [activeTasks]
    );

    // Resumen del mes: cuenta todas las actividades (también las completadas);
    // "Horas reales" por día suma solo las filas visibles en la línea de tiempo.
    const { totalEstimated, totalLogged, completedCount, onTimeCount, realByDay, blockedCount, reviewCount } = useMemo(() => {
        const est = monthTasks.reduce((s, t) => s + (parseFloat(t.maxHours) || 0), 0);
        const logged = monthTasks.reduce((s, t) => s + (parseFloat(t.loggedHours) || 0), 0);
        const onTime = completedTasks.filter(t => !t.maxHours || t.loggedHours <= t.maxHours);
        const real = days.map(d => {
            const dateStr = toLocalDateStr(d);
            return activeTasks.reduce((sum, t) => sum + (t.hoursByDate[dateStr] || 0), 0);
        });
        return {
            totalEstimated: est,
            totalLogged: logged,
            completedCount: completedTasks.length,
            onTimeCount: onTime.length,
            realByDay: real,
            blockedCount: monthTasks.filter(t => t.status === 'BLOQUEADA').length,
            reviewCount: monthTasks.filter(t => t.status === 'EN REVISIÓN').length,
        };
    }, [monthTasks, activeTasks, completedTasks, days]);

    const getUserTheme = (assigneeRawId) => {
        const user = teamUsers.find(u => u.raw_id === assigneeRawId);
        return user ? user.theme : { main: 'bg-slate-600' };
    };

    const memberName = memberFilter
        ? (teamUsers.find(u => String(u.raw_id) === memberFilter)?.name || memberFilter)
        : 'Todo el equipo';

    const exportCsv = () => {
        const columns = [
            { label: 'Código', value: t => t.id },
            { label: 'Actividad', value: t => t.title },
            { label: 'Responsable', value: t => t.assigneeName },
            { label: 'Líder técnico', value: t => t.leaderName || '' },
            { label: 'Estado', value: t => t.status },
            { label: 'Prioridad', value: t => t.priority },
            { label: 'Tipo', value: t => t.type || '' },
            { label: 'Inicio', value: t => formatDateMx(t.startDate) },
            { label: 'Vencimiento', value: t => formatDateMx(t.dueDate) },
            { label: 'Horas estimadas', value: t => t.maxHours },
            { label: 'Horas utilizadas', value: t => t.loggedHours },
            { label: 'Diferencia (h)', value: t => Math.round((t.loggedHours - t.maxHours) * 10) / 10 },
            { label: 'Motivo de bloqueo', value: t => t.blockReason || '' },
        ];
        downloadCsv(`cronograma-${year}-${String(month + 1).padStart(2, '0')}.csv`, toCsv(columns, monthTasks));
    };

    const dayGridStyle = { gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` };
    const boardMinWidth = { minWidth: `${300 + daysInMonth * 30}px` };
    const loggedOver = totalEstimated > 0 && totalLogged > totalEstimated;

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto flex flex-col gap-5 animate-fade-in">
                <PageHeader
                    title="Cronograma"
                    subtitle="Línea de tiempo del mes: la estimación de cada actividad se reparte entre sus días de ejecución y se compara con las horas reales de cada día."
                >
                    <button
                        type="button"
                        onClick={() => setHistoryOpen(true)}
                        disabled={isLoading || Boolean(loadError)}
                        className="no-print h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm flex items-center gap-2 text-[12px] font-bold text-[#07152F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HistoryIcon className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
                        Historial
                        <span className="tabular-nums text-gray-500">({completedTasks.length})</span>
                    </button>

                    <ExportBar onCsv={exportCsv} onPrint={printPage} />

                    {/* Filtro por integrante (select nativo transparente sobre el control visual) */}
                    <div className="no-print focus-ring-within relative h-10 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm flex items-center px-4 cursor-pointer transition-colors">
                        <Users className="w-3.5 h-3.5 text-gray-500 mr-2" aria-hidden="true" />
                        <span className="text-[12px] font-bold text-[#07152F] max-w-[160px] truncate" aria-hidden="true">{memberName}</span>
                        <ChevronDown className="w-3 h-3 ml-2 text-gray-500" aria-hidden="true" />
                        <select
                            value={memberFilter}
                            onChange={(e) => setMemberFilter(e.target.value)}
                            aria-label="Filtrar cronograma por integrante"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                        >
                            <option value="">Todo el equipo</option>
                            {teamUsers.map(user => (
                                <option key={user.raw_id} value={String(user.raw_id)}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <MonthSwitcher
                        currentDate={currentDate}
                        onPrevMonth={() => setCurrentDate(new Date(year, month - 1, 1))}
                        onNextMonth={() => setCurrentDate(new Date(year, month + 1, 1))}
                    />
                </PageHeader>

                <ActivityFilters filters={filters} setFilter={setFilter} reset={reset} activeCount={activeCount} showStatus resultCount={monthTasks.length} />

                {isLoading ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#0e71af] rounded-full animate-spin mb-4"></div>
                        <p className="text-[12px] font-bold text-gray-500 animate-pulse">Cargando cronograma...</p>
                    </div>
                ) : loadError ? (
                    <div role="alert" className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-xl shadow-sm py-16 px-6">
                        <p className="text-sm font-bold text-[#07152F]">No se pudo cargar la información</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                        <button type="button" onClick={reload} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Resumen del mes */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            <StatTile
                                icon={blockedCount > 0 ? Ban : ClipboardList}
                                label="Actividades del mes"
                                value={monthTasks.length}
                                detail={[
                                    blockedCount > 0 ? `${blockedCount} bloqueada${blockedCount > 1 ? 's' : ''}` : null,
                                    reviewCount > 0 ? `${reviewCount} en revisión` : null,
                                ].filter(Boolean).join(' · ') || undefined}
                                alert={blockedCount > 0}
                            />
                            <StatTile icon={Hourglass} label="Horas estimadas" value={`${fmtH(totalEstimated)}h`} />
                            <StatTile
                                icon={loggedOver ? TrendingUp : Clock3}
                                label="Horas utilizadas"
                                value={`${fmtH(totalLogged)}h`}
                                detail={loggedOver ? `+${fmtH(totalLogged - totalEstimated)}h sobre lo estimado` : undefined}
                                alert={loggedOver}
                            />
                            <StatTile
                                icon={CheckCircle2}
                                label="Completadas"
                                value={`${completedCount}/${monthTasks.length}`}
                                detail={completedCount > 0 ? `${onTimeCount} dentro de la estimación` : undefined}
                            />
                        </div>

                        {monthTasks.length > 0 && activeTasks.length === 0 ? (
                            <div className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl shadow-sm py-20 px-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4 text-gray-500">
                                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <p className="text-sm font-bold text-[#07152F]">Todas las actividades de {MONTH_NAMES[month]} están completadas</p>
                                <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">Consulta cómo se movieron en el historial.</p>
                                <button type="button" onClick={() => setHistoryOpen(true)} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors">
                                    Ver historial
                                </button>
                            </div>
                        ) : monthTasks.length === 0 ? (
                            <div className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl shadow-sm py-20 px-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4 text-gray-500">
                                    <CalendarClock className="w-6 h-6" aria-hidden="true" />
                                </div>
                                {activeCount > 0 || memberFilter ? (
                                    <>
                                        <p className="text-sm font-bold text-[#07152F]">Ninguna actividad coincide con los filtros</p>
                                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">Prueba con otra búsqueda o quita algún filtro.</p>
                                        <button type="button" onClick={() => { reset(); setMemberFilter(''); }} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors">
                                            Limpiar filtros
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-[#07152F]">Sin actividades en {MONTH_NAMES[month]}</p>
                                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">Las actividades con fechas dentro de este mes aparecerán aquí automáticamente.</p>
                                        <Link to="/qa/actividades" className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors inline-flex items-center">
                                            Ir al gestor de actividades
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto print-fit">
                                    <div style={boardMinWidth}>

                                        {/* Encabezado de días */}
                                        <div className="flex bg-slate-50/80 border-b border-slate-200">
                                            <div className={`${LABEL_COL} bg-slate-50/80 px-4 py-2.5 flex items-center text-[12px] font-bold text-slate-500`}>
                                                Actividad
                                            </div>
                                            <div className="flex-1 grid" style={dayGridStyle}>
                                                {days.map((d, i) => {
                                                    const dow = d.getDay();
                                                    const dateStr = toLocalDateStr(d);
                                                    const isToday = dateStr === todayStr;
                                                    return (
                                                        <div key={i} className={`py-1.5 text-center ${i > 0 ? 'border-l border-slate-100' : ''} ${dow === 0 ? 'bg-slate-100/70' : dow === 6 ? 'bg-amber-50/60' : ''}`}>
                                                            <p className={`text-[8px] font-bold uppercase ${dow === 6 ? 'text-amber-700' : dow === 0 ? 'text-slate-600' : 'text-slate-500'}`}>{WEEKDAY_LETTERS[dow]}</p>
                                                            <p className={`text-[10px] font-black mx-auto mt-0.5 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-[#0e71af] text-white shadow' : 'text-[#07152F]'}`}>
                                                                {d.getDate()}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Filas de actividades */}
                                        {activeTasks.map(task => {
                                            const theme = getUserTheme(task.assignee_raw_id);
                                            const endDate = task.dueDate || task.startDate;
                                            const clampedStart = task.startDate < monthStart;
                                            const clampedEnd = endDate > monthEnd;
                                            const startIdx = clampedStart ? 0 : parseInt(task.startDate.slice(8), 10) - 1;
                                            const endIdx = clampedEnd ? daysInMonth - 1 : parseInt(endDate.slice(8), 10) - 1;
                                            const colSpan = endIdx - startIdx + 1;
                                            const estimated = parseFloat(task.maxHours) || 0;
                                            const logged = parseFloat(task.loggedHours) || 0;
                                            const perDay = estimated > 0 ? estimated / getEquivalentWorkingDays(task.startDate, endDate) : 0;
                                            const isCritical = task.priority === 'CRÍTICA';
                                            const dist = distributions.get(task.db_id) || {};
                                            const isBlocked = task.status === 'BLOQUEADA';

                                            const barLabel = `${task.id}: ${task.title}. Del ${formatDateMx(task.startDate)} al ${formatDateMx(endDate)}. ` +
                                                `Estimada: ${fmtH(estimated)} horas${perDay > 0 ? ` (≈${fmtH(perDay)} por día)` : ''}. ` +
                                                `Utilizadas: ${fmtH(logged)} horas. Estado: ${task.status}.` +
                                                `${isBlocked && task.blockReason ? ` Motivo del bloqueo: ${task.blockReason}.` : ''}` +
                                                `${task.leaderName ? ` Líder técnico: ${task.leaderName}.` : ''}`;

                                            return (
                                                <div key={task.db_id} className="flex border-t border-slate-100 min-h-[76px]">
                                                    {/* Columna fija: identidad y métricas */}
                                                    <div className={`${LABEL_COL} bg-white px-4 py-2.5 flex flex-col justify-center gap-1.5`}>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`w-5 h-5 rounded-full text-white text-[8px] font-black flex items-center justify-center shrink-0 ${theme.main}`} title={task.assigneeName}>
                                                                {task.assignee}
                                                            </span>
                                                            <p className="text-xs font-bold text-[#07152F] truncate" title={task.title}>{task.title}</p>
                                                        </div>
                                                        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 pl-7">
                                                            <span className="text-[10px] font-bold text-slate-500">{task.id}</span>
                                                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                                                <Hourglass className="w-2.5 h-2.5" aria-hidden="true" />
                                                                Est {fmtH(estimated)}h
                                                            </span>
                                                            <span className={`flex items-center gap-1 text-[9px] font-bold ${estimated > 0 && logged > estimated ? 'text-red-700' : 'text-slate-500'}`}>
                                                                <Clock3 className="w-2.5 h-2.5" aria-hidden="true" />
                                                                {fmtH(logged)}h
                                                            </span>
                                                            <StatusPill status={task.status} />
                                                        </div>
                                                        {task.leaderName && (
                                                            <p className="flex items-center gap-1 pl-7 text-[9px] font-semibold text-slate-500 min-w-0">
                                                                <ShieldCheck className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                                                                <span className="truncate">Líder: {task.leaderName}</span>
                                                            </p>
                                                        )}
                                                        {isBlocked && task.blockReason && (
                                                            <p className="flex items-start gap-1 pl-7 text-[9px] font-semibold text-red-700 min-w-0" title={task.blockReason}>
                                                                <Ban className="w-2.5 h-2.5 shrink-0 mt-0.5" aria-hidden="true" />
                                                                <span className="line-clamp-2 break-words">{task.blockReason}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Línea de tiempo */}
                                                    <div className="flex-1 relative">
                                                        <div className="absolute inset-0 grid" style={dayGridStyle} aria-hidden="true">
                                                            {days.map((d, i) => {
                                                                const dow = d.getDay();
                                                                const isToday = toLocalDateStr(d) === todayStr;
                                                                return (
                                                                    <div key={i} className={`${i > 0 ? 'border-l border-slate-100' : ''} ${dow === 0 ? 'bg-slate-50' : dow === 6 ? 'bg-amber-50/40' : ''} ${isToday ? 'bg-[#1296E8]/5' : ''}`}></div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Barra planeada */}
                                                        <div
                                                            className="absolute top-2.5 h-8 flex items-center px-[2px]"
                                                            style={{ left: `${(startIdx / daysInMonth) * 100}%`, width: `${(colSpan / daysInMonth) * 100}%` }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedTicketId(task.db_id)}
                                                                title={barLabel}
                                                                aria-label={barLabel}
                                                                style={isBlocked ? { backgroundImage: BLOCKED_STRIPES } : undefined}
                                                                className={`w-full h-8 flex items-center gap-1.5 px-2 text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 ${theme.main} ${isBlocked ? 'ring-2 ring-red-600 ring-offset-1' : ''} ${clampedStart ? 'rounded-l-none border-l-2 border-white/60 border-dashed' : 'rounded-l-md'} ${clampedEnd ? 'rounded-r-none border-r-2 border-white/60 border-dashed' : 'rounded-r-md'}`}
                                                            >
                                                                {isBlocked && <Ban className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                                                                {task.status === 'EN REVISIÓN' && <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                                                                {isCritical && <Flag className="w-3 h-3 shrink-0" aria-hidden="true" />}
                                                                {colSpan >= 3 && <span className="text-[10px] font-bold truncate">{task.title}</span>}
                                                                {colSpan >= 2 && perDay > 0 && (
                                                                    <span className="ml-auto text-[9px] font-black whitespace-nowrap tabular-nums">≈{fmtH(perDay)}h/d</span>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Horas reales de cada día (rojo si superan lo planeado para ese día) */}
                                                        <div className="absolute inset-x-0 bottom-1 grid" style={dayGridStyle}>
                                                            {days.map((d, i) => {
                                                                const dateStr = toLocalDateStr(d);
                                                                const real = task.hoursByDate[dateStr] || 0;
                                                                if (!real) return <div key={i}></div>;
                                                                const planned = dist[dateStr] || 0;
                                                                const exceeds = real > planned + 0.05;
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        title={`${formatDateMx(dateStr)}: ${fmtH(real)} h reales (planeadas ${fmtH(planned)} h)`}
                                                                        className={`text-center text-[8px] font-black tabular-nums leading-none ${exceeds ? 'text-red-700' : 'text-slate-600'}`}
                                                                    >
                                                                        {fmtH(real)}
                                                                        <span className="sr-only"> horas reales el {formatDateMx(dateStr)}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Horas reales por día */}
                                        <div className="flex border-t-2 border-slate-200 bg-slate-50/80">
                                            <div className={`${LABEL_COL} bg-slate-50/80 px-4 py-2.5 flex items-center gap-2 text-[12px] font-bold text-slate-500`}>
                                                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                                                Horas reales
                                                <span className="font-bold normal-case tracking-normal">(h por día)</span>
                                            </div>
                                            <div className="flex-1 grid" style={dayGridStyle}>
                                                {days.map((d, i) => {
                                                    const dow = d.getDay();
                                                    const real = realByDay[i];
                                                    return (
                                                        <div key={i} className={`py-2.5 text-center text-[9px] tabular-nums font-bold text-slate-600 ${i > 0 ? 'border-l border-slate-100' : ''}`}>
                                                            {dow === 0 ? '—' : real > 0 ? fmtH(real) : ''}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 -mt-2" role="group" aria-label="Leyenda de estados">
                            {Object.keys(STATUS_CONFIG).map(status => <StatusPill key={status} status={status} />)}
                            <span className="text-[10px] text-gray-500 font-medium">Las barras rayadas con borde rojo son actividades bloqueadas.</span>
                        </div>

                        <p className="text-[10px] text-gray-500 font-medium -mt-2 px-1">
                            La estimación se reparte entre los días de ejecución según la jornada ({WEEKDAY_SCHEDULE_TEXT} entre semana; sábado {SATURDAY_SCHEDULE_TEXT}; domingo se descansa). Bajo cada barra se muestran las horas reales de cada día: en rojo cuando superan lo planeado.
                            Las actividades completadas salen de la línea de tiempo y se consultan en Historial.
                        </p>
                    </>
                )}
            </div>

            <ScheduleHistoryModal
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
                tasks={completedTasks}
                monthLabel={`${MONTH_NAMES[month]} ${year}`}
            />

            <QATicketPanel
                allTasks={tasks}
                key={selectedTicket?.db_id ?? 'sin-ticket'}
                ticket={selectedTicket}
                onClose={() => setSelectedTicketId(null)}
                onTicketUpdated={reload}
                onDeleted={reload}
                leaders={leaders}
                teamUsers={teamUsers}
                me={me}
            />
        </DashboardLayout>
    );
};
