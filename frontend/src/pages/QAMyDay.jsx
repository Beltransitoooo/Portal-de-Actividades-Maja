import { useState, useMemo } from 'react';
import { CalendarCheck, Clock3, Hourglass, Ban, TriangleAlert, Flame, CheckCircle2, AlarmClock, Gauge, Users, UserRound, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/Shared/PageHeader';
import { StatusBadge } from '../components/Shared/StatusBadge';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { useQAData } from '../hooks/useQAData';
import { useStatusChange } from '../hooks/useStatusChange';
import { updateActivity } from '../services/qaApi';
import { STATUS_CODES } from '../services/qaData';
import { toUserMessage } from '../services/authService';
import { toLocalDateStr, formatDateMx } from '../utils/dates';
import { distributeHours, fmtHours } from '../utils/schedule';
import { dayCapacity } from '../utils/capacity';
import { buildAlerts } from '../utils/alerts';

const ALERT_STYLES = {
    overdue: { icon: Flame, tone: 'text-red-700 bg-red-50 border-red-200', label: 'Vencida' },
    blocked: { icon: Ban, tone: 'text-red-700 bg-red-50 border-red-200', label: 'Bloqueada' },
    overload: { icon: Gauge, tone: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Sobrecarga' },
    dueSoon: { icon: AlarmClock, tone: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Por vencer' },
};

const pluralDays = (n) => `${n} día${n !== 1 ? 's' : ''}`;

// Texto de cada aviso en lenguaje claro
const alertText = (alert, me) => {
    switch (alert.kind) {
        case 'overdue': return `Venció hace ${pluralDays(alert.days)} (${formatDateMx(alert.task.dueDate)}) y sigue sin completarse.`;
        case 'dueSoon': return alert.days === 0 ? 'Vence hoy.' : alert.days === 1 ? 'Vence mañana.' : `Vence en ${pluralDays(alert.days)} (${formatDateMx(alert.task.dueDate)}).`;
        case 'blocked': return alert.task.blockReason ? `Bloqueada: ${alert.task.blockReason}` : 'Bloqueada, sin motivo registrado.';
        case 'overload': {
            const who = me && alert.personId === me.id ? 'Tienes' : `${alert.person} tiene`;
            const extra = alert.overloaded.length > 1 ? ` (y ${alert.overloaded.length - 1} día${alert.overloaded.length > 2 ? 's' : ''} más esta semana)` : '';
            return `${who} ${fmtHours(alert.worst.planned)} h planeadas el ${formatDateMx(alert.worst.date)} y caben ${fmtHours(alert.worst.capacity)} h${extra}.`;
        }
        default: return '';
    }
};

const Summary = ({ icon: Icon, label, value, detail, alert = false }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-red-50 text-red-700' : 'bg-[#1296E8]/10 text-[#0e71af]'}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-[#07152F] tabular-nums leading-tight">{value}</p>
            {detail && <p className={`text-[10px] font-bold mt-0.5 ${alert ? 'text-red-700' : 'text-gray-500'}`}>{detail}</p>}
        </div>
    </div>
);

// Mi día: lo que toca hoy y lo que requiere atención, calculado con los datos actuales.
export const QAMyDay = () => {
    const [scope, setScope] = useState('mine');
    const [panel, setPanel] = useState(null); // { id, tab, seq }
    const [actionError, setActionError] = useState(null);

    const { teamUsers, tasks, leaders, me, isLoading, loadError, reload } = useQAData();

    const today = useMemo(() => new Date(), []);
    const todayStr = toLocalDateStr(today);
    const isAdmin = Boolean(me?.es_admin);
    const activeScope = isAdmin ? scope : 'mine';

    const scoped = useMemo(
        () => tasks.filter(t => activeScope === 'team' || (me && t.assignee_raw_id === me.id)),
        [tasks, activeScope, me]
    );

    const todayTasks = useMemo(() => scoped
        .filter(t => !t.completada && t.startDate && t.startDate <= todayStr && (t.dueDate || t.startDate) >= todayStr)
        .map(t => ({ task: t, planned: distributeHours(t.maxHours, t.startDate, t.dueDate || t.startDate)[todayStr] || 0 })),
    [scoped, todayStr]);

    const plannedToday = todayTasks.reduce((sum, item) => sum + item.planned, 0);
    const loggedToday = scoped.reduce((sum, t) => sum + (t.hoursByDate[todayStr] || 0), 0);
    const capacityToday = dayCapacity(today);
    const alerts = useMemo(() => buildAlerts(scoped, { today }), [scoped, today]);

    const selected = panel ? tasks.find(t => t.db_id === panel.id) ?? null : null;
    const openPanel = (task, tab = 'detalle') => setPanel(prev => ({ id: task.db_id, tab, seq: (prev?.seq ?? 0) + 1 }));

    const applyStatus = async (task, newStatus, reason) => {
        setActionError(null);
        try {
            const body = { estado: STATUS_CODES[newStatus] };
            if (reason) body.motivo_bloqueo = reason;
            await updateActivity(task.db_id, body);
            reload();
        } catch (error) {
            setActionError(`${task.id}: ${toUserMessage(error, 'No se pudo actualizar el estado de la actividad.')}`);
        }
    };
    const [requestStatusChange, blockDialog] = useStatusChange(applyStatus);

    const dateLabel = formatDateMx(todayStr);
    const isRestDay = capacityToday === 0;

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-fade-in">
                <PageHeader
                    title="Mi día"
                    subtitle={`${dateLabel}. Lo que toca trabajar hoy y lo que necesita tu atención.`}
                >
                    {isAdmin && (
                        <div role="group" aria-label="Alcance" className="no-print flex bg-white border border-gray-200 rounded-lg shadow-sm p-1">
                            {[{ id: 'mine', label: 'Mis actividades', icon: UserRound }, { id: 'team', label: 'Todo el equipo', icon: Users }].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={activeScope === id}
                                    onClick={() => setScope(id)}
                                    className={`h-8 px-3 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${activeScope === id ? 'bg-[#07152F] text-white' : 'text-gray-600 hover:bg-slate-50'}`}
                                >
                                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </PageHeader>

                {isLoading ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#0e71af] rounded-full animate-spin mb-4"></div>
                        <p role="status" className="text-[10px] font-bold text-gray-500 tracking-widest uppercase animate-pulse">Preparando tu día...</p>
                    </div>
                ) : loadError ? (
                    <div role="alert" className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-xl shadow-sm py-16 px-6">
                        <p className="text-sm font-bold text-[#07152F]">No se pudo cargar la información</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                        <button type="button" onClick={reload} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-colors flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Summary
                                icon={Hourglass}
                                label="Plan de hoy"
                                value={`${fmtHours(plannedToday)}h`}
                                detail={activeScope === 'mine' ? (isRestDay ? 'Hoy es día de descanso' : `de ${fmtHours(capacityToday)} h disponibles`) : undefined}
                                alert={activeScope === 'mine' && capacityToday > 0 && plannedToday > capacityToday + 0.05}
                            />
                            <Summary icon={Clock3} label="Registradas hoy" value={`${fmtHours(loggedToday)}h`} detail={plannedToday > 0 ? `${Math.round(Math.min(loggedToday / plannedToday, 9.99) * 100)}% de lo planeado` : undefined} />
                            <Summary icon={alerts.length > 0 ? TriangleAlert : CheckCircle2} label="Avisos" value={alerts.length} detail={alerts.length === 0 ? 'Todo en orden' : undefined} alert={alerts.length > 0} />
                        </div>

                        {actionError && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded-md font-medium">{actionError}</div>}

                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
                            {/* Para hoy */}
                            <section aria-labelledby="hoy-titulo" className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:p-6">
                                <h2 id="hoy-titulo" className="text-sm font-black text-[#07152F] uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <CalendarCheck className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                                    Para hoy
                                </h2>

                                {todayTasks.length === 0 ? (
                                    <div className="flex flex-col items-center text-center py-12 gap-2">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-500">
                                            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm font-bold text-[#07152F]">No hay actividades programadas para hoy</p>
                                        <p className="text-xs text-gray-500 max-w-[300px]">Las actividades cuyo rango de fechas incluye hoy y siguen abiertas aparecerán aquí.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {todayTasks.map(({ task, planned }) => {
                                            const theme = teamUsers.find(u => u.id === task.assignee)?.theme ?? { main: 'bg-slate-600' };
                                            const loggedHere = task.hoursByDate[todayStr] || 0;
                                            const usage = task.maxHours > 0 ? Math.min((task.loggedHours / task.maxHours) * 100, 100) : 0;
                                            const over = task.maxHours > 0 && task.loggedHours > task.maxHours;
                                            return (
                                                <li key={task.db_id} className="border border-gray-100 rounded-xl p-4 bg-white hover:border-[#1296E8]/40 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <span className={`w-7 h-7 rounded-full text-white text-[9px] font-black flex items-center justify-center shrink-0 ${theme.main}`} title={task.assigneeName}>{task.assignee}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <button type="button" onClick={() => openPanel(task)} className="text-left min-h-6 max-w-full">
                                                                <p className="text-sm font-bold text-[#07152F] break-words">{task.title}</p>
                                                                <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mt-0.5">
                                                                    {task.id}{activeScope === 'team' ? ` · ${task.assigneeName}` : ''}{task.leaderName ? ` · Líder: ${task.leaderName}` : ''}
                                                                </p>
                                                            </button>
                                                            {task.status === 'BLOQUEADA' && task.blockReason && (
                                                                <p className="flex items-start gap-1.5 mt-2 text-[11px] font-semibold text-red-700 break-words">
                                                                    <Ban className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
                                                                    {task.blockReason}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                                <StatusBadge currentStatus={task.status} onChangeStatus={(s) => requestStatusChange(task, s)} />
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600"><Hourglass className="w-3 h-3" aria-hidden="true" />Plan hoy {fmtHours(planned)}h</span>
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600"><Clock3 className="w-3 h-3" aria-hidden="true" />Registradas {fmtHours(loggedHere)}h</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3" role="progressbar" aria-label={`Consumo de la estimación de ${task.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(usage)}>
                                                                <div className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-[#0e71af]'}`} style={{ width: `${usage}%` }}></div>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 font-medium mt-1">{fmtHours(task.loggedHours)}h de {fmtHours(task.maxHours)}h estimadas</p>
                                                        </div>
                                                        <button type="button" onClick={() => openPanel(task, 'horas')} className="shrink-0 h-9 px-3 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                                                            <Clock3 className="w-3.5 h-3.5" aria-hidden="true" />
                                                            Registrar horas
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>

                            {/* Avisos */}
                            <section aria-labelledby="avisos-titulo" className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:p-6">
                                <h2 id="avisos-titulo" className="text-sm font-black text-[#07152F] uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <TriangleAlert className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                                    Requiere atención
                                </h2>

                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center text-center py-12 gap-2">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-200 text-emerald-700">
                                            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm font-bold text-[#07152F]">Todo en orden</p>
                                        <p className="text-xs text-gray-500 max-w-[260px]">No hay actividades vencidas, por vencer, bloqueadas ni días con sobrecarga.</p>
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-2.5">
                                        {alerts.map(alert => {
                                            const style = ALERT_STYLES[alert.kind];
                                            const Icon = style.icon;
                                            return (
                                                <li key={alert.key}>
                                                    <button type="button" onClick={() => openPanel(alert.task)} className={`w-full text-left border rounded-xl p-3 flex items-start gap-3 hover:shadow-sm transition-shadow ${style.tone}`}>
                                                        <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                                                        <span className="min-w-0">
                                                            <span className="block text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                                                            {alert.kind !== 'overload' && <span className="block text-xs font-bold text-[#07152F] break-words mt-0.5">{alert.task.title}</span>}
                                                            <span className="block text-[11px] font-medium text-[#07152F] break-words mt-0.5">{alertText(alert, me)}</span>
                                                            {activeScope === 'team' && alert.kind !== 'overload' && <span className="block text-[10px] font-semibold text-gray-600 mt-0.5">{alert.task.assigneeName}</span>}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </div>

            <QATicketPanel
                key={panel ? `${panel.id}-${panel.seq}` : 'sin-ticket'}
                ticket={selected}
                initialTab={panel?.tab}
                onClose={() => setPanel(null)}
                onTicketUpdated={reload}
                onDeleted={reload}
                leaders={leaders}
                teamUsers={teamUsers}
                me={me}
            />
            {blockDialog}
        </DashboardLayout>
    );
};
