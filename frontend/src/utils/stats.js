// Cálculos de la pestaña Gráficos (lógica pura, sin React).
// Fechas como 'AAAA-MM-DD' en hora local. Las horas estimadas de una actividad se reparten por día
// con la misma regla del cronograma (distributeHours); las reales salen de los registros por día.
import { toLocalDateStr, getQuarterWeeks, formatDateMx } from './dates';
import { parseDay, shiftDay, weekStart } from './calendar';
import { distributeHours } from './schedule';
import { dayCapacity, NEAR_LIMIT_RATIO } from './capacity';

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const r1 = (n) => Math.round(n * 10) / 10;
export const shortDate = (s) => { const d = parseDay(s); return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`; };

// ---- Periodo ----

// Sprint actual: la semana del trimestre que contiene hoy (mismo criterio que el Resumen del Panel)
export const sprintPeriod = (today) => {
    const weeks = getQuarterWeeks(parseDay(today));
    const w = weeks.find(x => today >= x.start && today <= x.end) || weeks[0];
    return { key: 'sprint', label: w.label, start: w.start, end: w.end };
};

// Histórico: desde el primer dato registrado (inicio, horas o cierre) hasta hoy o el último vencimiento
export const historicPeriod = (tasks, closures, today) => {
    let start = today;
    let end = today;
    for (const t of tasks) {
        if (t.startDate && t.startDate < start) start = t.startDate;
        const due = t.dueDate || t.startDate;
        if (due && due > end) end = due;
        for (const d of Object.keys(t.hoursByDate || {})) if (d < start) start = d;
    }
    for (const d of closures.values()) if (d < start) start = d;
    return { key: 'historico', label: 'Histórico', start, end };
};

const WEEKDAYS_SHORT = ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'];

// Meses que tocan el periodo, recortados a sus límites
export const monthsBetween = (start, end) => {
    const months = [];
    const d = parseDay(start);
    let y = d.getFullYear();
    let m = d.getMonth();
    for (;;) {
        const first = toLocalDateStr(new Date(y, m, 1));
        if (first > end) break;
        const last = toLocalDateStr(new Date(y, m + 1, 0));
        months.push({ start: first < start ? start : first, end: last > end ? end : last, label: `${MONTHS_SHORT[m]} ${y}` });
        m += 1;
        if (m === 12) { m = 0; y += 1; }
    }
    return months;
};

/**
 * Agrupación de las gráficas en el tiempo según la duración del periodo, para que siempre se lean:
 * hasta 14 días → por día; hasta 16 semanas → por semana; más → por mes.
 */
export const bucketsBetween = (start, end) => {
    const days = [];
    for (let d = start; d <= end; d = shiftDay(d, 1)) days.push(d);
    if (days.length <= 14) {
        return { unit: 'day', buckets: days.map(d => ({ start: d, end: d, label: `${WEEKDAYS_SHORT[parseDay(d).getDay()]} ${parseDay(d).getDate()}` })) };
    }
    const weeks = weeksBetween(start, end);
    if (weeks.length <= 16) return { unit: 'week', buckets: weeks };
    return { unit: 'month', buckets: monthsBetween(start, end) };
};

export const bucketRange = (b) => (b.start === b.end ? formatDateMx(b.start) : `${formatDateMx(b.start)} – ${formatDateMx(b.end)}`);

// Pastel: máximo 6 rebanadas; el resto se agrupa en "Otros". Sin categorías en cero.
export const pieSlices = (rows, max = 6) => {
    const nonZero = rows.filter(r => r.value > 0);
    const total = nonZero.reduce((s, r) => s + r.value, 0);
    let slices = nonZero;
    if (nonZero.length > max) {
        const sorted = [...nonZero].sort((a, b) => b.value - a.value);
        const rest = sorted.slice(max - 1).reduce((s, r) => s + r.value, 0);
        slices = [...sorted.slice(0, max - 1), { label: 'Otros', value: rest }];
    }
    return slices.map(r => ({ ...r, pct: total ? Math.round((r.value / total) * 1000) / 10 : 0 }));
};

// Semanas (lunes a domingo) que tocan el periodo, recortadas a sus límites
export const weeksBetween = (start, end) => {
    const weeks = [];
    for (let s = weekStart(start); s <= end; s = shiftDay(s, 7)) {
        const a = s < start ? start : s;
        const e = shiftDay(s, 6);
        weeks.push({ start: a, end: e > end ? end : e, label: shortDate(a) });
    }
    return weeks;
};

const eachDay = (start, end, fn) => { for (let d = start; d <= end; d = shiftDay(d, 1)) fn(d); };

export const capacityBetween = (start, end) => {
    let total = 0;
    eachDay(start, end, d => { total += dayCapacity(parseDay(d)); });
    return total;
};

// ---- Selección de actividades ----

const overlaps = (t, start, end) => Boolean(t.startDate) && t.startDate <= end && (t.dueDate || t.startDate) >= start;
const ofPerson = (t, personId) => personId === null || personId === undefined || String(t.assignee_raw_id) === String(personId);

export const tasksInPeriod = (tasks, { start, end, personId = null }) =>
    tasks.filter(t => overlaps(t, start, end) && ofPerson(t, personId));

const estimatedWithin = (t, start, end) => {
    let sum = 0;
    for (const [date, h] of Object.entries(distributeHours(t.maxHours, t.startDate, t.dueDate || t.startDate))) {
        if (date >= start && date <= end) sum += h;
    }
    return sum;
};
const realWithin = (t, start, end) => {
    let sum = 0;
    for (const [date, h] of Object.entries(t.hoursByDate || {})) {
        if (date >= start && date <= end) sum += h;
    }
    return sum;
};

// ---- Horas ----

export const hoursByWeek = (tasks, weeks) => weeks.map(w => ({
    label: w.label,
    start: w.start,
    end: w.end,
    estimated: r1(tasks.reduce((s, t) => s + estimatedWithin(t, w.start, w.end), 0)),
    real: r1(tasks.reduce((s, t) => s + realWithin(t, w.start, w.end), 0)),
}));

// ---- Entregas ----

// Fecha de cierre local: el servidor guarda UTC sin zona
export const closureMap = (closures = []) => new Map(closures.map(c => {
    const raw = c.fecha_cierre;
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
    return [c.actividad_id, toLocalDateStr(new Date(hasZone ? raw : `${raw}Z`))];
}));

/**
 * Actividades completadas cuya fecha de cierre cae en el periodo.
 * - Fecha de cierre: la de la bitácora; si no existe (actividades anteriores a la bitácora),
 *   el último día con horas registradas (`approx: true`); sin ninguna de las dos no se puede ubicar.
 * - A tiempo: cerrada en o antes de su vencimiento.
 */
export const deliveries = (tasks, closures, { start, end, personId = null }) => {
    const list = [];
    let undated = 0;
    for (const t of tasks) {
        if (!t.completada || !ofPerson(t, personId)) continue;
        let date = closures.get(t.db_id) || null;
        let approx = false;
        if (!date) {
            const days = Object.keys(t.hoursByDate || {}).filter(d => t.hoursByDate[d] > 0).sort();
            date = days.length ? days[days.length - 1] : null;
            approx = Boolean(date);
        }
        if (!date) {
            if (overlaps(t, start, end)) undated += 1;
            continue;
        }
        if (date < start || date > end) continue;
        const due = t.dueDate || t.startDate;
        list.push({ task: t, date, approx, onTime: !due || date <= due });
    }
    return { list, undated };
};

export const deliveriesByWeek = (list, weeks) => weeks.map(w => {
    const inWeek = list.filter(x => x.date >= w.start && x.date <= w.end);
    return {
        label: w.label,
        start: w.start,
        end: w.end,
        onTime: inWeek.filter(x => x.onTime).length,
        late: inWeek.filter(x => !x.onTime).length,
    };
});

// Desviación de la estimación en lo entregado: real − estimado (top por magnitud)
export const deviations = (list, limit = 10) => list
    .filter(x => parseFloat(x.task.maxHours) > 0)
    .map(x => {
        const est = parseFloat(x.task.maxHours);
        const real = parseFloat(x.task.loggedHours) || 0;
        return { id: x.task.id, title: x.task.title, estimated: est, real, diff: r1(real - est) };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff) || a.id.localeCompare(b.id))
    .slice(0, limit);

// ---- Carga vs capacidad ----

export const loadStatus = (ratio) => {
    if (ratio > 1) return { key: 'critical', label: 'Sobrecargado' };
    if (ratio > NEAR_LIMIT_RATIO) return { key: 'warning', label: 'Al límite' };
    return { key: 'ok', label: 'Óptimo' };
};

// Horas asignadas a cada persona dentro del periodo frente a su jornada disponible
export const loadByPerson = (tasks, users, { start, end }) => {
    const capacity = capacityBetween(start, end);
    return users
        .map(u => {
            const planned = r1(tasks
                .filter(t => String(t.assignee_raw_id) === String(u.raw_id) && overlaps(t, start, end))
                .reduce((s, t) => s + estimatedWithin(t, start, end), 0));
            const ratio = capacity > 0 ? planned / capacity : 0;
            return { id: u.raw_id, name: u.name, planned, capacity, ratio, status: loadStatus(ratio) };
        })
        .sort((a, b) => b.ratio - a.ratio || a.name.localeCompare(b.name));
};

// Carga planeada por día de una persona (o del conjunto) frente a la jornada
export const loadByDay = (tasks, { start, end }) => {
    const days = [];
    eachDay(start, end, d => {
        const capacity = dayCapacity(parseDay(d));
        if (capacity === 0) return; // domingo: descanso
        const planned = r1(tasks.reduce((s, t) => s + estimatedWithin(t, d, d), 0));
        days.push({ date: d, label: shortDate(d), planned, capacity, over: planned > capacity + 0.01 });
    });
    return days;
};

// Carga planeada por semana frente a la capacidad de esa semana (para periodos largos)
export const loadByWeek = (tasks, weeks) => weeks.map(w => {
    const capacity = capacityBetween(w.start, w.end);
    const planned = r1(tasks.reduce((s, t) => s + estimatedWithin(t, w.start, w.end), 0));
    return { date: w.start, end: w.end, label: w.label, planned, capacity, over: planned > capacity + 0.01 };
});

// Más de un mes de días en barras ya no se lee: se agrupa por semana
export const MAX_DAILY_DAYS = 31;
export const loadSeries = (tasks, { start, end }) => {
    let days = 0;
    eachDay(start, end, () => { days += 1; });
    return days > MAX_DAILY_DAYS
        ? { granularity: 'week', data: loadByWeek(tasks, weeksBetween(start, end)) }
        : { granularity: 'day', data: loadByDay(tasks, { start, end }) };
};

// ---- Distribución ----

const TYPE_LABELS = { Tarea: 'Tarea', Bug: 'Error / Bug', Pruebas: 'Solicitud de pruebas' };
const PRIORITY_ORDER = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'];
const PRIORITY_LABELS = { 'CRÍTICA': 'Crítica', ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' };

const countBy = (tasks, keyOf) => {
    const counts = new Map();
    for (const t of tasks) {
        const k = keyOf(t);
        counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
};

// Categorías sin orden natural: de mayor a menor
export const distributionBy = (tasks, keyOf) => [...countBy(tasks, keyOf)]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

export const byStatus = (tasks) => distributionBy(tasks, t => t.status || 'PENDIENTE');
export const byType = (tasks) => distributionBy(tasks, t => TYPE_LABELS[t.type] || t.type || 'Sin tipo');
export const byArea = (tasks, areas) => {
    const names = new Map(areas.map(a => [a.id, a.nombre]));
    return distributionBy(tasks, t => names.get(t.areaId) || 'Sin área');
};
// La prioridad sí tiene orden: se respeta (Crítica → Baja), incluso con cero
export const byPriority = (tasks) => {
    const counts = countBy(tasks, t => t.priority);
    return PRIORITY_ORDER.map(p => ({ label: PRIORITY_LABELS[p], value: counts.get(p) || 0 }));
};

// ---- Indicadores ----

export const summary = (tasks, delivered, { start, end }) => {
    const estimated = r1(tasks.reduce((s, t) => s + estimatedWithin(t, start, end), 0));
    const real = r1(tasks.reduce((s, t) => s + realWithin(t, start, end), 0));
    const onTime = delivered.filter(x => x.onTime).length;
    return {
        activities: tasks.length,
        estimated,
        real,
        delivered: delivered.length,
        onTime,
        onTimePct: delivered.length ? Math.round((onTime / delivered.length) * 100) : null,
    };
};
