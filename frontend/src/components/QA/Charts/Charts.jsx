import {
    ResponsiveContainer, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine, Cell, LabelList,
} from 'recharts';
import { CircleCheck, Clock3, TriangleAlert, OctagonAlert, Gauge } from 'lucide-react';
import { ChartCard, ChartTooltip, EmptyChart } from './ChartParts';
import { AXIS_TICK, AXIS_LINE, GRID_STROKE, CURSOR, fmtNum } from './chartTheme';
import { PALETTE, OTHER, roles } from './chartPalette';
import { Bar3D, Meter3D, Pie3D } from './Volume3D';
import { useIsDark } from '../../../hooks/useIsDark';
import { formatDateMx } from '../../../utils/dates';
import { pieSlices, bucketRange } from '../../../utils/stats';

// Todas las gráficas del módulo son 3D ortográficas: la cara frontal conserva la escala del eje
// y la profundidad (cara superior con luz, lateral en sombra) es solo volumen. Ver Volume3D.jsx.
const BAR = { maxBarSize: 26, isAnimationActive: false };
const MARGIN = { top: 16, right: 14, bottom: 0, left: -12 };
const range = bucketRange;
// Unidad de agrupación en el tiempo (la decide el periodo: día, semana o mes)
const UNIT = { day: { word: 'día', col: 'Día' }, week: { word: 'semana', col: 'Semana' }, month: { word: 'mes', col: 'Mes' } };
const bucketTitle = (unit, p) => (unit === 'week' ? `Semana ${range(p)}` : unit === 'month' ? `${p.label} (${range(p)})` : range(p));
const rank = (order, label) => { const i = order.indexOf(label); return i === -1 ? order.length : i; };

// Colores del tema activo (claro u oscuro): la paleta "Tejido y pista" y sus roles
const useColors = () => {
    const dark = useIsDark();
    return { series: dark ? PALETTE.dark : PALETTE.light, other: dark ? OTHER.dark : OTHER.light, role: roles(dark) };
};

/**
 * Pastel 3D con porcentajes + leyenda con nombre, % y cantidad (la leyenda también es el texto
 * accesible: nada depende solo del color). `colorIndex` fija la posición de paleta de cada categoría
 * (así una categoría conserva su color entre gráficas); "Otros" va siempre en gris neutro.
 */
const PieBlock = ({ rows, colorIndex, units = ['actividad', 'actividades'], label }) => {
    const { series, other } = useColors();
    const slices = pieSlices(rows, series.length + 1).map((sl, i) => ({
        ...sl,
        fill: sl.label === 'Otros' ? other : series[(colorIndex?.[sl.label] ?? i) % series.length],
    }));
    if (slices.length === 0) return null;
    const summary = slices.map(sl => `${sl.label} ${fmtNum(sl.pct)}%`).join(', ');
    return (
        <div className="flex flex-col sm:flex-row items-center gap-5 min-w-0">
            <div className="shrink-0">
                <Pie3D slices={slices} size={196} ariaLabel={`${label ?? 'Distribución'}: ${summary}`} />
            </div>
            <ul className="flex flex-col gap-1.5 min-w-0 w-full" aria-label="Porcentajes">
                {slices.map(sl => (
                    <li key={sl.label} className="flex items-center gap-2 text-[12px] min-w-0">
                        <span aria-hidden="true" className="w-3 h-3 rounded-[3px] shrink-0 shadow-[inset_0_-3px_0_rgb(0_0_0/0.22)]" style={{ background: sl.fill }}></span>
                        <span className="text-[#07152F] font-semibold truncate" title={sl.label}>{sl.label}</span>
                        <span className="ml-auto pl-2 font-black text-[#07152F] tabular-nums">{fmtNum(sl.pct)}%</span>
                        <span className="text-gray-500 tabular-nums w-[86px] text-right">{sl.value} {sl.value === 1 ? units[0] : units[1]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ---- Horas estimadas vs reales ----
export const HoursChart = ({ data, subtitle, csvName, unit = 'week' }) => {
    const { role } = useColors();
    const hasData = data.some(w => w.estimated > 0 || w.real > 0);
    return (
        <ChartCard
            title={`Horas por ${UNIT[unit].word}`}
            subtitle={subtitle}
            legend={[{ label: 'Estimadas', color: role.estimated }, { label: 'Reales', color: role.real }]}
            columns={[
                { key: 'start', label: UNIT[unit].col, format: (_, r) => range(r) },
                { key: 'estimated', label: 'Estimadas (h)', align: 'right', format: fmtNum },
                { key: 'real', label: 'Reales (h)', align: 'right', format: fmtNum },
                { key: 'diff', label: 'Diferencia (h)', align: 'right', format: (_, r) => `${r.real - r.estimated > 0 ? '+' : ''}${fmtNum(Math.round((r.real - r.estimated) * 10) / 10)}` },
            ]}
            rows={data}
            csvName={csvName}
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} barGap={6} barCategoryGap="26%" margin={MARGIN}>
                        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={CURSOR} content={<ChartTooltip title={(p) => bucketTitle(unit, p)} extra={(p) => [`Diferencia: ${p.real - p.estimated > 0 ? '+' : ''}${fmtNum(Math.round((p.real - p.estimated) * 10) / 10)} h`]} />} />
                        <Bar dataKey="estimated" name="Estimadas" fill={role.estimated} shape={<Bar3D />} {...BAR} />
                        <Bar dataKey="real" name="Reales" fill={role.real} shape={<Bar3D />} {...BAR} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <EmptyChart>No hay horas estimadas ni registradas en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// ---- Entregas: a tiempo / con retraso (apiladas) ----
export const DeliveriesChart = ({ data, note, csvName, unit = 'week' }) => {
    const { role } = useColors();
    const hasData = data.some(w => w.onTime + w.late > 0);
    return (
        <ChartCard
            title={`Entregas por ${UNIT[unit].word}`}
            subtitle="Actividades completadas según su fecha de cierre, frente a su vencimiento."
            legend={[{ label: 'A tiempo', color: role.onTime, icon: CircleCheck }, { label: 'Con retraso', color: role.late, icon: Clock3 }]}
            columns={[
                { key: 'start', label: UNIT[unit].col, format: (_, r) => range(r) },
                { key: 'onTime', label: 'A tiempo', align: 'right' },
                { key: 'late', label: 'Con retraso', align: 'right' },
            ]}
            rows={data}
            note={note}
            csvName={csvName}
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} barCategoryGap="30%" margin={MARGIN}>
                        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={CURSOR} content={<ChartTooltip unit="" title={(p) => bucketTitle(unit, p)} />} />
                        <Bar dataKey="onTime" name="A tiempo" stackId="e" fill={role.onTime} shape={<Bar3D />} {...BAR} />
                        <Bar dataKey="late" name="Con retraso" stackId="e" fill={role.late} shape={<Bar3D />} {...BAR} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <EmptyChart>No hay actividades completadas en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// Etiqueta fuera del extremo de la barra (a la izquierda si es negativa, a la derecha después de
// la cara lateral si es positiva; también para 0). Nunca encima del eje ni del código.
const DiffLabel = ({ x, y, width, height, value }) => {
    const left = Math.min(x, x + width);
    const right = Math.max(x, x + width);
    const negative = value < 0;
    return (
        <text
            x={negative ? left - 6 : right + 14}
            y={y + height / 2}
            dy="0.35em"
            textAnchor={negative ? 'end' : 'start'}
            style={{ fill: 'var(--viz-text-2)', fontSize: 10, fontWeight: 700 }}
        >
            {`${value > 0 ? '+' : ''}${fmtNum(value)} h`}
        </text>
    );
};

// ---- Desviación de la estimación (barras divergentes) ----
export const DeviationChart = ({ data, csvName, className }) => {
    const { role } = useColors();
    const rows = data.map(d => ({ ...d, name: `${d.id} ${d.title}` }));
    const height = Math.max(170, rows.length * 34 + 44);
    // Eje simétrico alrededor de 0 con margen para que las etiquetas quepan fuera de la barra
    const maxDiff = Math.max(0, ...rows.map(r => Math.abs(r.diff)));
    const bound = Math.max(2, Math.ceil(maxDiff * 1.4));
    return (
        <ChartCard
            className={className}
            title="Desviación de la estimación"
            subtitle="Horas reales menos estimadas en lo entregado. Las mayores diferencias primero."
            legend={[{ label: 'Menos de lo estimado', color: role.under }, { label: 'Igual', color: role.equal }, { label: 'Más de lo estimado', color: role.over }]}
            columns={[
                { key: 'id', label: 'Código' },
                { key: 'title', label: 'Actividad' },
                { key: 'estimated', label: 'Estimadas (h)', align: 'right', format: fmtNum },
                { key: 'real', label: 'Reales (h)', align: 'right', format: fmtNum },
                { key: 'diff', label: 'Diferencia (h)', align: 'right', format: (v) => `${v > 0 ? '+' : ''}${fmtNum(v)}` },
            ]}
            rows={data}
            csvName={csvName}
        >
            {rows.length ? (
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={rows} layout="vertical" margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
                        <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
                        <XAxis type="number" domain={[-bound, bound]} tickCount={Math.min(9, bound * 2 + 1)} tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="id" width={56} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                        <ReferenceLine x={0} stroke="var(--viz-axis)" />
                        <Tooltip
                            cursor={CURSOR}
                            content={<ChartTooltip title={(p) => p.name} extra={(p) => [`Estimadas ${fmtNum(p.estimated)} h, reales ${fmtNum(p.real)} h`]} />}
                        />
                        {/* minPointSize: una diferencia de 0 deja una marca mínima en gris (neutral) con su etiqueta */}
                        <Bar dataKey="diff" name="Diferencia" shape={<Bar3D horizontal />} minPointSize={3} {...BAR} maxBarSize={22}>
                            {rows.map(r => <Cell key={r.id} fill={r.diff > 0 ? role.over : r.diff < 0 ? role.under : role.equal} />)}
                            <LabelList dataKey="diff" content={DiffLabel} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : <EmptyChart>No hay entregas con estimación en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// ---- Carga planeada frente a la capacidad (por día, o por semana en periodos largos) ----
export const LoadOverTimeChart = ({ data, granularity = 'day', csvName }) => {
    const { role } = useColors();
    const weekly = granularity === 'week';
    const hasData = data.some(d => d.planned > 0);
    const overCount = data.filter(d => d.over).length;
    const unitLabel = weekly ? 'semana' : 'día';
    const when = (p) => (weekly ? `Semana ${range({ start: p.date, end: p.end })}` : formatDateMx(p.date));
    return (
        <ChartCard
            title={weekly ? 'Carga por semana' : 'Carga por día'}
            subtitle={weekly
                ? 'Horas planeadas por semana frente a la capacidad de esa semana (periodo de más de un mes).'
                : 'Horas planeadas (estimación repartida por día) frente a la jornada disponible.'}
            legend={[{ label: 'Planeadas', color: role.estimated }, { label: weekly ? 'Capacidad' : 'Jornada', color: role.capacity, shape: 'line' }]}
            columns={[
                { key: 'date', label: weekly ? 'Semana' : 'Día', format: (_, r) => (weekly ? range({ start: r.date, end: r.end }) : formatDateMx(r.date)) },
                { key: 'planned', label: 'Planeadas (h)', align: 'right', format: fmtNum },
                { key: 'capacity', label: weekly ? 'Capacidad (h)' : 'Jornada (h)', align: 'right' },
                { key: 'over', label: 'Estado', format: (v) => (v ? 'Excede la capacidad' : '—') },
            ]}
            rows={data}
            csvName={csvName}
            note={overCount > 0 ? `${overCount} ${unitLabel}${overCount > 1 ? 's' : ''} por encima de la capacidad (ver tabla).` : undefined}
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={data} barCategoryGap="24%" margin={MARGIN}>
                        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} interval="preserveStartEnd" minTickGap={16} />
                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                            cursor={CURSOR}
                            content={<ChartTooltip title={when} extra={(p) => (p.over ? [`Excede la capacidad (${p.capacity} h)`] : [])} />}
                        />
                        <Bar dataKey="planned" name="Planeadas" shape={<Bar3D />} {...BAR}>
                            {/* Los días o semanas que exceden la capacidad se marcan en tartán (además de la nota y la tabla) */}
                            {data.map(d => <Cell key={d.date} fill={d.over ? role.critical : role.estimated} />)}
                        </Bar>
                        <Line dataKey="capacity" name={weekly ? 'Capacidad' : 'Jornada'} type="stepAfter" stroke={role.capacity} strokeWidth={2} strokeDasharray="0" dot={false} isAnimationActive={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            ) : <EmptyChart>No hay carga planeada en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// ---- Distribución (barras horizontales 3D + pastel 3D) ----
// `pieOrder`: orden natural de las categorías, así cada una conserva su color entre gráficas
export const DistributionChart = ({ title, data, keepOrder = false, csvName, pieOrder }) => {
    const { series } = useColors();
    const total = data.reduce((s, d) => s + d.value, 0);
    const rows = data.map(d => ({ ...d, pct: total ? Math.round((d.value / total) * 1000) / 10 : 0 }));
    const ordered = pieOrder ? [...rows].sort((a, b) => rank(pieOrder, a.label) - rank(pieOrder, b.label)) : rows;
    const colorIndex = Object.fromEntries(ordered.map((r, i) => [r.label, i]));
    return (
        <ChartCard
            title={title}
            columns={[
                { key: 'label', label: 'Categoría' },
                { key: 'value', label: 'Actividades', align: 'right' },
                { key: 'pct', label: '%', align: 'right', format: (v) => `${fmtNum(v)}%` },
            ]}
            rows={rows}
            csvName={csvName}
            note={keepOrder ? 'En orden de prioridad.' : undefined}
        >
            {total ? (
                <div className="flex flex-col gap-6">
                    <ResponsiveContainer width="100%" height={Math.max(130, rows.length * 34 + 16)}>
                        <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 60, bottom: 0, left: 0 }}>
                            <XAxis type="number" hide allowDecimals={false} />
                            <YAxis type="category" dataKey="label" width={118} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <Tooltip cursor={CURSOR} content={<ChartTooltip unit="" extra={(p) => [`${fmtNum(p.pct)}% del total`]} />} />
                            {/* Cada barra con el color de su categoría, el mismo que en el pastel */}
                            <Bar dataKey="value" name="Actividades" shape={<Bar3D horizontal />} {...BAR} maxBarSize={20}>
                                {rows.map(r => <Cell key={r.label} fill={series[colorIndex[r.label] % series.length]} />)}
                                <LabelList dataKey="value" position="right" offset={14} formatter={(v) => `${v}`} style={{ fill: 'var(--viz-text-2)', fontSize: 11, fontWeight: 700 }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <PieBlock rows={ordered} colorIndex={colorIndex} label={title} />
                </div>
            ) : <EmptyChart>Sin actividades en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// ---- Carga vs capacidad por persona (medidores 3D) ----
const STATUS_ICON = { ok: Gauge, warning: TriangleAlert, critical: OctagonAlert };

export const LoadMeters = ({ data, note, csvName }) => {
    const { role } = useColors();
    const dark = useIsDark();
    const track = dark ? '#22304b' : '#dfe6ef';
    return (
        <ChartCard
            title="Carga vs capacidad"
            subtitle="Horas asignadas en el periodo frente a la jornada disponible de cada persona."
            columns={[
                { key: 'name', label: 'Persona' },
                { key: 'planned', label: 'Asignadas (h)', align: 'right', format: fmtNum },
                { key: 'capacity', label: 'Capacidad (h)', align: 'right' },
                { key: 'ratio', label: '%', align: 'right', format: (v) => `${Math.round(v * 100)}%` },
                { key: 'status', label: 'Estado', format: (v) => v.label },
            ]}
            rows={data}
            note={note}
            csvName={csvName}
        >
            {data.length === 0 ? <EmptyChart>Sin personas para mostrar.</EmptyChart> : (
                <ul className="flex flex-col gap-3.5">
                    {data.map(p => {
                        const Icon = STATUS_ICON[p.status.key];
                        const pct = Math.round(p.ratio * 100);
                        return (
                            <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[160px_minmax(0,1fr)_196px] items-center gap-x-3 gap-y-1">
                                <span className="text-[13px] font-bold text-[#07152F] truncate" title={p.name}>{p.name}</span>
                                <span className="order-last sm:order-none col-span-2 sm:col-span-1">
                                    <Meter3D pct={pct} color={role[p.status.key]} trackColor={track} />
                                </span>
                                <span className="flex items-center justify-end gap-1.5 text-[12px] tabular-nums text-gray-500 whitespace-nowrap">
                                    <span className="font-black text-[#07152F]">{fmtNum(p.planned)}</span>/ {p.capacity} h
                                    <span className="flex items-center gap-1 font-bold">
                                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                        {pct}%, {p.status.label.toLowerCase()}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </ChartCard>
    );
};

// ---- Entregas a tiempo vs con retraso (pastel 3D) ----
export const DeliveriesShareChart = ({ onTime, late, csvName }) => {
    const rows = [{ label: 'A tiempo', value: onTime }, { label: 'Con retraso', value: late }];
    const total = onTime + late;
    const withPct = rows.map(r => ({ ...r, pct: total ? Math.round((r.value / total) * 1000) / 10 : 0 }));
    return (
        <ChartCard
            title="Entregas: a tiempo vs con retraso"
            subtitle="Proporción de lo completado en el periodo que cerró en o antes de su vencimiento."
            columns={[
                { key: 'label', label: 'Resultado' },
                { key: 'value', label: 'Actividades', align: 'right' },
                { key: 'pct', label: '%', align: 'right', format: (v) => `${fmtNum(v)}%` },
            ]}
            rows={withPct}
            csvName={csvName}
        >
            {total ? (
                <PieBlock rows={rows} colorIndex={{ 'A tiempo': 0, 'Con retraso': 1 }} units={['entrega', 'entregas']} label="Entregas" />
            ) : <EmptyChart>No hay actividades completadas en el periodo.</EmptyChart>}
        </ChartCard>
    );
};

// ---- Historial de tareas por estado (pastel 3D, independiente de los filtros) ----
const STATUS_PIE_ORDER = ['PENDIENTE', 'EN PROGRESO', 'EN REVISIÓN', 'COMPLETADA', 'BLOQUEADA'];
const STATUS_PIE_LABELS = { PENDIENTE: 'Pendiente', 'EN PROGRESO': 'En progreso', 'EN REVISIÓN': 'En revisión', COMPLETADA: 'Completada', BLOQUEADA: 'Bloqueada' };

/**
 * `rows`: [{ label: estado, value }]. Cada estado tiene siempre la misma posición y color
 * (en el orden del flujo), así el pastel del sprint y el del histórico se comparan de un vistazo.
 */
export const TaskStatusPie = ({ title, subtitle, rows, csvName, empty }) => {
    const byStatus = new Map(rows.map(r => [r.label, r.value]));
    const ordered = STATUS_PIE_ORDER.map(st => ({ label: STATUS_PIE_LABELS[st], value: byStatus.get(st) || 0 }));
    const colorIndex = Object.fromEntries(STATUS_PIE_ORDER.map((st, i) => [STATUS_PIE_LABELS[st], i]));
    const total = ordered.reduce((sum, r) => sum + r.value, 0);
    const withPct = ordered.map(r => ({ ...r, pct: total ? Math.round((r.value / total) * 1000) / 10 : 0 }));
    return (
        <ChartCard
            title={title}
            subtitle={subtitle}
            columns={[
                { key: 'label', label: 'Estado' },
                { key: 'value', label: 'Tareas', align: 'right' },
                { key: 'pct', label: '%', align: 'right', format: (v) => `${fmtNum(v)}%` },
            ]}
            rows={withPct}
            csvName={csvName}
        >
            {total ? (
                <PieBlock rows={ordered} colorIndex={colorIndex} units={['tarea', 'tareas']} label={`Tareas por estado, ${title}`} />
            ) : <EmptyChart>{empty}</EmptyChart>}
        </ChartCard>
    );
};
