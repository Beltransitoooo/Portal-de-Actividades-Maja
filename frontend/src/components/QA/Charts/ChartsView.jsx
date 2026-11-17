import { useState, useEffect, useMemo, useId } from 'react';
import { RotateCcw, Users, User, Check, Printer, History, Flag } from 'lucide-react';
import { printPage } from '../../../utils/print';
import { useQAData } from '../../../hooks/useQAData';
import { listClosures, listAreas } from '../../../services/qaApi';
import { toLocalDateStr, formatDateMx } from '../../../utils/dates';
import {
    sprintPeriod, historicPeriod, bucketsBetween, tasksInPeriod, hoursByWeek, closureMap, deliveries, deliveriesByWeek,
    deviations, loadByPerson, loadSeries, byStatus, byType, byPriority, byArea, summary,
} from '../../../utils/stats';
import { fmtNum } from './chartTheme';
import { HoursChart, DeliveriesChart, DeliveriesShareChart, DeviationChart, LoadOverTimeChart, DistributionChart, LoadMeters, TaskStatusPie } from './Charts';

const Tile = ({ label, value, detail }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-w-0">
        <p className="text-[12px] font-bold text-gray-500">{label}</p>
        <p className="text-2xl font-black text-[#07152F] leading-tight mt-1">{value}</p>
        {detail && <p className="text-[11px] text-gray-500 mt-1">{detail}</p>}
    </div>
);

// Orden natural de cada categoría (estado del flujo, tipo y prioridad) para los pasteles
const STATUS_ORDER = ['PENDIENTE', 'EN PROGRESO', 'EN REVISIÓN', 'COMPLETADA', 'BLOQUEADA'];
const TYPE_ORDER = ['Tarea', 'Error / Bug', 'Solicitud de pruebas'];
const PRIORITY_ORDER = ['Crítica', 'Alta', 'Media', 'Baja'];

const segmentClass = (active) => `h-9 px-3 flex items-center gap-1.5 text-[12px] font-bold rounded-md transition-colors ${
    active ? 'bg-[#07152F] text-white shadow-sm' : 'text-gray-500 hover:text-[#07152F]'
}`;

/**
 * Pestaña Gráficos del Panel de rendimiento.
 * - Vista general: lo que la persona puede ver (administrador: todo; los demás: su área y lo suyo).
 *   La carga por persona solo la ve un administrador; los demás ven solo la suya.
 * - Vista por persona: un administrador elige a cualquiera; los demás solo se ven a sí mismos.
 * Periodo: en la vista general, "Sprint actual" o "Histórico"; en la vista por persona, solo el sprint actual.
 * El sprint es la semana del trimestre (el mismo "Período de trabajo" del Resumen).
 */
export const ChartsView = () => {
    const { teamUsers, tasks, me, isLoading, loadError, reload } = useQAData();
    const today = toLocalDateStr(new Date());
    const uid = useId();

    const [scopeKey, setScopeKey] = useState('sprint');
    const [mode, setMode] = useState('general');
    const [personId, setPersonId] = useState('');
    const [extra, setExtra] = useState({ closures: [], areas: [], error: null });

    const isAdmin = Boolean(me?.es_admin);

    // Fechas de cierre y áreas: datos complementarios; si fallan, las gráficas siguen con lo demás
    useEffect(() => {
        if (!me) return undefined; // sin perfil todavía no se sabe si es administrador
        let active = true;
        Promise.allSettled([listClosures(), isAdmin ? listAreas() : Promise.resolve([])]).then(([c, a]) => {
            if (!active) return;
            setExtra({
                closures: c.status === 'fulfilled' ? c.value : [],
                areas: a.status === 'fulfilled' ? a.value : [],
                error: c.status === 'rejected' ? 'No se pudieron cargar las fechas de cierre; las entregas usan el último día con horas.' : null,
            });
        });
        return () => { active = false; };
    }, [me, isAdmin, tasks]);

    const closures = useMemo(() => closureMap(extra.closures), [extra.closures]);
    const sprint = useMemo(() => sprintPeriod(today), [today]);
    const historic = useMemo(() => historicPeriod(tasks, closures, today), [tasks, closures, today]);
    // La vista por persona siempre usa el sprint actual
    const period = mode === 'general' && scopeKey === 'historico' ? historic : sprint;
    const pStart = period.start;
    const pEnd = period.end;

    // Sin ser administrador, la vista por persona es siempre la propia
    const effectivePerson = mode === 'persona' ? (isAdmin ? personId : String(me?.id ?? '')) : '';
    const selectedUser = teamUsers.find(u => String(u.raw_id) === effectivePerson) || null;

    // Historial de tareas: siempre sprint actual frente a histórico, sin depender de los filtros de abajo
    const statusHistory = useMemo(() => ({
        sprint: byStatus(tasksInPeriod(tasks, { start: sprint.start, end: sprint.end })),
        historic: byStatus(tasks),
    }), [tasks, sprint.start, sprint.end]);

    const data = useMemo(() => {
        if (mode === 'persona' && !effectivePerson) return null;
        const scope = { start: pStart, end: pEnd, personId: mode === 'persona' ? effectivePerson : null };
        const { unit, buckets } = bucketsBetween(pStart, pEnd);
        const inPeriod = tasksInPeriod(tasks, scope);
        const delivered = deliveries(tasks, closures, scope);
        const approx = delivered.list.filter(x => x.approx).length;
        const people = isAdmin ? teamUsers : teamUsers.filter(u => u.raw_id === me?.id);
        return {
            summary: summary(inPeriod, delivered.list, scope),
            unit,
            hours: hoursByWeek(inPeriod, buckets),
            deliveries: deliveriesByWeek(delivered.list, buckets),
            deliveriesNote: [
                approx ? `${approx} entrega${approx > 1 ? 's' : ''} sin registro de cierre en la bitácora: se usó su último día con horas.` : null,
                delivered.undated ? `${delivered.undated} completada${delivered.undated > 1 ? 's' : ''} sin fecha de cierre ni horas: no se pueden ubicar en el tiempo.` : null,
                extra.error,
            ].filter(Boolean).join(' ') || undefined,
            deviations: deviations(delivered.list),
            load: mode === 'general' ? loadByPerson(tasks, people, scope) : loadSeries(inPeriod, scope),
            status: byStatus(inPeriod),
            type: byType(inPeriod),
            priority: byPriority(inPeriod),
            area: mode === 'general' && isAdmin ? byArea(inPeriod, extra.areas) : null,
        };
    }, [pStart, pEnd, mode, effectivePerson, tasks, closures, extra.areas, extra.error, isAdmin, teamUsers, me?.id]);

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 border-[3px] border-gray-100 border-t-[#0e71af] rounded-full animate-spin mb-3"></div>
                <p className="text-[12px] font-bold text-gray-500 animate-pulse">Cargando gráficas...</p>
            </div>
        );
    }
    if (loadError) {
        return (
            <div role="alert" className="w-full flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-xl shadow-sm py-16 px-6">
                <p className="text-sm font-bold text-[#07152F]">No se pudo cargar la información</p>
                <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                <button type="button" onClick={reload} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[12px] font-bold rounded-lg shadow-md transition-colors flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reintentar
                </button>
            </div>
        );
    }

    const periodLabel = `${period.key === 'sprint' ? `Sprint actual: ${period.label},` : 'Histórico:'} ${formatDateMx(pStart)} – ${formatDateMx(pEnd)}`;
    const s = data?.summary;
    // Nombre de cada CSV: gráfica + quién + periodo (sin acentos ni espacios)
    const who = mode === 'general' ? 'equipo' : (selectedUser?.name || 'persona');
    const slug = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const csvName = (chart) => `${slug(chart)}-${slug(who)}-${period.key === 'sprint' ? 'sprint' : 'historico'}-${pStart}-a-${pEnd}`;
    const viewTitle = mode === 'general'
        ? (isAdmin ? 'Vista general del equipo' : 'Vista general de tu área')
        : `Estadísticas de ${selectedUser?.name ?? 'la persona'}`;

    return (
        <div className="flex flex-col gap-5">
            {/* Historial de tareas: va aparte, antes de los filtros (no le afectan) */}
            <section aria-labelledby={`${uid}-historial`} className="flex flex-col gap-3">
                <h2 id={`${uid}-historial`} className="font-dorsal uppercase text-[30px] text-[#07152F]">Historial de tareas</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <TaskStatusPie
                        title="Sprint actual"
                        subtitle={`${sprint.label}, del ${formatDateMx(sprint.start)} al ${formatDateMx(sprint.end)}: estado de las tareas que tocan el sprint.`}
                        rows={statusHistory.sprint}
                        csvName={`historial-tareas-sprint-${sprint.start}-a-${sprint.end}`}
                        empty="No hay tareas en el sprint actual."
                    />
                    <TaskStatusPie
                        title="Histórico"
                        subtitle="Estado actual de todas las tareas registradas."
                        rows={statusHistory.historic}
                        csvName={`historial-tareas-historico-${today}`}
                        empty="Todavía no hay tareas registradas."
                    />
                </div>
            </section>

            {/* Filtros: una sola fila sobre todo lo que afectan */}
            <div className="no-print flex flex-wrap items-end gap-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <fieldset className="flex flex-col gap-1.5">
                    <legend className="text-[12px] font-bold text-gray-500 mb-1.5">Periodo</legend>
                    {mode === 'general' ? (
                        <div className="flex gap-1 bg-slate-50 border border-gray-200 rounded-lg p-1">
                            {[{ key: 'sprint', label: 'Sprint actual', icon: Flag }, { key: 'historico', label: 'Histórico', icon: History }].map(o => (
                                <button key={o.key} type="button" aria-pressed={scopeKey === o.key} onClick={() => setScopeKey(o.key)} className={segmentClass(scopeKey === o.key)}>
                                    {scopeKey === o.key ? <Check className="w-3 h-3" aria-hidden="true" /> : <o.icon className="w-3 h-3" aria-hidden="true" />}
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="h-11 flex items-center gap-1.5 px-3 bg-slate-50 border border-gray-200 rounded-lg text-[12px] font-bold text-[#07152F]">
                            <Flag className="w-3 h-3" aria-hidden="true" /> Sprint actual
                        </p>
                    )}
                </fieldset>

                <fieldset className="flex flex-col gap-1.5">
                    <legend className="text-[12px] font-bold text-gray-500 mb-1.5">Vista</legend>
                    <div className="flex gap-1 bg-slate-50 border border-gray-200 rounded-lg p-1">
                        <button type="button" aria-pressed={mode === 'general'} onClick={() => setMode('general')} className={segmentClass(mode === 'general')}>
                            <Users className="w-3.5 h-3.5" aria-hidden="true" /> General
                        </button>
                        <button type="button" aria-pressed={mode === 'persona'} onClick={() => setMode('persona')} className={segmentClass(mode === 'persona')}>
                            <User className="w-3.5 h-3.5" aria-hidden="true" /> {isAdmin ? 'Por persona' : 'Mis estadísticas'}
                        </button>
                    </div>
                </fieldset>

                {mode === 'persona' && isAdmin && (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={`${uid}-persona`} className="text-[12px] font-bold text-gray-500">Persona</label>
                        <select
                            id={`${uid}-persona`}
                            value={personId}
                            onChange={(e) => setPersonId(e.target.value)}
                            className="h-11 min-w-[200px] bg-slate-50 border border-gray-200 rounded-lg px-3 text-xs font-bold text-[#07152F] focus:outline-none focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30"
                        >
                            <option value="">Elige a una persona</option>
                            {teamUsers.map(u => <option key={u.raw_id} value={String(u.raw_id)}>{u.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="ml-auto self-center flex items-center gap-3">
                    <p className="text-[11px] font-semibold text-gray-500 tabular-nums" aria-live="polite">{periodLabel}</p>
                    <button
                        type="button"
                        onClick={printPage}
                        disabled={!data}
                        title="Imprimir o guardar como PDF"
                        className="h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-slate-50 rounded-lg shadow-sm text-[12px] font-bold text-[#07152F] flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                        PDF
                    </button>
                </div>

            </div>

            {!data ? (
                <div className="w-full flex items-center justify-center text-center bg-white border border-gray-200 rounded-xl shadow-sm py-16 px-6 text-xs text-gray-500">
                    Elige a una persona para ver sus estadísticas.
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-[17px] font-bold tracking-tight text-[#07152F]">{viewTitle}</h2>
                        {/* Al imprimir, los filtros se ocultan: el periodo queda escrito aquí */}
                        <p className="hidden print:block text-xs text-gray-500 mt-1">Periodo: {periodLabel}</p>
                    </div>

                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <Tile label="Actividades en el periodo" value={s.activities} />
                        <Tile label="Horas estimadas" value={`${fmtNum(s.estimated)} h`} />
                        <Tile
                            label="Horas reales"
                            value={`${fmtNum(s.real)} h`}
                            detail={s.estimated > 0 ? `${s.real >= s.estimated ? '+' : ''}${fmtNum(Math.round((s.real - s.estimated) * 10) / 10)} h frente a lo estimado` : undefined}
                        />
                        <Tile
                            label="Entregas a tiempo"
                            value={s.onTimePct === null ? '—' : `${s.onTimePct}%`}
                            detail={s.delivered ? `${s.onTime} de ${s.delivered} completada${s.delivered > 1 ? 's' : ''}` : 'Sin entregas en el periodo'}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <HoursChart data={data.hours} unit={data.unit} subtitle="Estimación repartida por día frente a las horas registradas." csvName={csvName(`horas-por-${data.unit === 'day' ? 'dia' : data.unit === 'week' ? 'semana' : 'mes'}`)} />
                        <DeliveriesChart data={data.deliveries} unit={data.unit} note={data.deliveriesNote} csvName={csvName(`entregas-por-${data.unit === 'day' ? 'dia' : data.unit === 'week' ? 'semana' : 'mes'}`)} />
                        <DeliveriesShareChart onTime={s.onTime} late={s.delivered - s.onTime} csvName={csvName('entregas-a-tiempo')} />
                        {mode === 'general'
                            ? <LoadMeters data={data.load} note={isAdmin ? undefined : 'Solo un administrador ve la carga de cada persona; aquí ves la tuya.'} csvName={csvName('carga-vs-capacidad')} />
                            : <LoadOverTimeChart data={data.load.data} granularity={data.load.granularity} csvName={csvName(data.load.granularity === 'week' ? 'carga-por-semana' : 'carga-por-dia')} />}
                        <DeviationChart data={data.deviations} csvName={csvName('desviacion')} className="xl:col-span-2" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <DistributionChart title="Por estado" data={data.status} pieOrder={STATUS_ORDER} csvName={csvName('por-estado')} />
                        <DistributionChart title="Por tipo" data={data.type} pieOrder={TYPE_ORDER} csvName={csvName('por-tipo')} />
                        <DistributionChart title="Por prioridad" data={data.priority} keepOrder pieOrder={PRIORITY_ORDER} csvName={csvName('por-prioridad')} />
                        {data.area && <DistributionChart title="Por área" data={data.area} csvName={csvName('por-area')} />}
                    </div>
                </>
            )}
        </div>
    );
};
