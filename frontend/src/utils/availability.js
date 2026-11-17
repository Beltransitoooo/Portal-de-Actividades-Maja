// Disponibilidad de una persona por día (lógica pura, sin React).
// Reglas acordadas (17/11/2026):
// - "Ocupado" se mide por horas: la estimación de cada actividad se reparte por día (distributeHours)
//   y se compara con la jornada (7 h entre semana, 5 h el sábado, domingo descanso).
// - Cuentan todas las actividades asignadas a la persona excepto las completadas.
import { distributeHours, getEquivalentWorkingDays } from './schedule';
import { dayCapacity } from './capacity';
import { parseDay, shiftDay, weekStart } from './calendar';

const EPS = 0.01;

// Carga de la persona en cada día del intervalo [from, to].
// Devuelve { 'AAAA-MM-DD': { hours, capacity, activities: [{ id, title, hours }] } }
export const personLoadByDay = (tasks, personId, from, to, { excludeId = null } = {}) => {
    const load = {};
    for (let d = from; d <= to; d = shiftDay(d, 1)) {
        load[d] = { hours: 0, capacity: dayCapacity(parseDay(d)), activities: [] };
    }
    if (personId === null || personId === undefined || personId === '') return load;

    const pid = String(personId);
    for (const t of tasks) {
        if (String(t.assignee_raw_id) !== pid || t.completada || !t.startDate) continue;
        if (excludeId !== null && t.db_id === excludeId) continue;
        const end = t.dueDate || t.startDate;
        if (end < from || t.startDate > to) continue;
        const dist = distributeHours(t.maxHours, t.startDate, end);
        for (const [date, hours] of Object.entries(dist)) {
            if (!load[date] || !hours) continue;
            load[date].hours += hours;
            load[date].activities.push({ id: t.id, title: t.title, hours });
        }
    }
    return load;
};

// Estado de un día según su carga
export const dayStatus = ({ hours, capacity }) => {
    if (capacity === 0) return 'descanso';
    if (hours >= capacity - EPS) return 'lleno';
    if (hours > EPS) return 'parcial';
    return 'libre';
};

// Días del rango [start, end] con la jornada llena
export const busyDaysInRange = (load, start, end) => {
    if (!start) return [];
    const last = end || start;
    const days = [];
    for (let d = start; d <= last; d = shiftDay(d, 1)) {
        if (load[d] && dayStatus(load[d]) === 'lleno') days.push(d);
    }
    return days;
};

// Días que excederían la jornada al sumar la nueva actividad (sin contar los que ya estaban llenos)
export const overloadedDays = (load, newDistribution) => Object.entries(newDistribution)
    .filter(([date, hours]) => {
        const day = load[date];
        if (!day || day.capacity === 0 || !hours) return false;
        return dayStatus(day) !== 'lleno' && day.hours + hours > day.capacity + EPS;
    })
    .map(([date, hours]) => ({ date, total: load[date].hours + hours, capacity: load[date].capacity }))
    .sort((a, b) => a.date.localeCompare(b.date));

const isWorkday = (d) => dayCapacity(parseDay(d)) > 0;

/**
 * Divide [start, end] en tramos continuos sin los días excluidos.
 * Los domingos no cortan un tramo, pero se recortan en los extremos;
 * los tramos sin días laborables se descartan.
 */
export const splitRange = (start, end, excluded = []) => {
    if (!start) return [];
    const skip = new Set(excluded);
    const segments = [];
    let current = null;
    for (let d = start; d <= (end || start); d = shiftDay(d, 1)) {
        if (skip.has(d)) {
            if (current) segments.push(current);
            current = null;
        } else if (current) {
            current.end = d;
        } else {
            current = { start: d, end: d };
        }
    }
    if (current) segments.push(current);

    return segments
        .map(({ start: s, end: e }) => {
            let a = s;
            let b = e;
            while (a <= b && !isWorkday(a)) a = shiftDay(a, 1);
            while (b >= a && !isWorkday(b)) b = shiftDay(b, -1);
            return a <= b ? { start: a, end: b } : null;
        })
        .filter(Boolean);
};

// Reparte la estimación entre los tramos en medias horas, proporcional a sus días laborables
// equivalentes (sábado = 5/7). La suma es igual al total redondeado a la media hora (el formulario
// pide la estimación en pasos de 0.5 h).
export const splitHours = (total, segments) => {
    const hours = parseFloat(total);
    if (!hours || segments.length === 0) return segments.map(() => null);
    const weights = segments.map(s => getEquivalentWorkingDays(s.start, s.end));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const halves = Math.round(hours * 2);
    const shares = weights.map(w => {
        const exact = (halves * w) / totalWeight;
        return { floor: Math.floor(exact), frac: exact - Math.floor(exact) };
    });
    let remaining = halves - shares.reduce((s, x) => s + x.floor, 0);
    [...shares.keys()]
        .sort((a, b) => shares[b].frac - shares[a].frac || a - b)
        .forEach(i => { if (remaining > 0) { shares[i].floor += 1; remaining -= 1; } });
    return shares.map(s => s.floor / 2);
};

// Título de cada parte cuando una actividad se divide
export const partTitle = (title, index, count) => (count > 1 ? `${title} (parte ${index + 1}/${count})` : title);

// Ventana visible: dos semanas desde el lunes de `anchor`, ampliada para cubrir el rango elegido (máx. 6 semanas)
export const stripWindow = (anchor, rangeEnd) => {
    const from = weekStart(anchor);
    let to = shiftDay(from, 13);
    if (rangeEnd && rangeEnd > to) {
        const limit = shiftDay(from, 41);
        to = shiftDay(weekStart(rangeEnd > limit ? limit : rangeEnd), 6);
    }
    return { from, to };
};
