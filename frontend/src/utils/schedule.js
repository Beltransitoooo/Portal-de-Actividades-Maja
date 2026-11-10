import { toLocalDateStr } from './dates';

// Reglas de jornada del equipo (mismas que usa el calendario):
// Lun–Vie cuentan como día completo, Sábado como medio día (9–13 h) y Domingo se descansa.
export const dayWeight = (date) => {
    const dow = date.getDay();
    if (dow === 0) return 0;
    if (dow === 6) return 0.5;
    return 1;
};

// 'T00:00:00' fuerza hora local; new Date('AAAA-MM-DD') se interpreta en UTC y corre el día
export const parseLocalDate = (dateStr) => new Date(`${dateStr}T00:00:00`);

// Días laborales equivalentes entre dos fechas (inclusive), según las reglas de jornada
export const getEquivalentWorkingDays = (start, end) => {
    const startDate = parseLocalDate(start);
    const endDate = parseLocalDate(end);
    if (startDate > endDate) return 1;

    let totalDays = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
        totalDays += dayWeight(current);
        current.setDate(current.getDate() + 1);
    }
    return totalDays === 0 ? 1 : totalDays;
};

// Reparte la estimación entre los días de ejecución en pasos de media hora,
// de modo que la suma de los días dé exactamente el total (sin 2.7h: salen 2.5h y 3h).
// El sábado recibe la mitad de carga y el domingo nada. Devuelve { 'AAAA-MM-DD': horas }.
export const distributeHours = (totalHours, start, end) => {
    const hours = parseFloat(totalHours);
    if (!hours || !start) return {};

    const endDate = parseLocalDate(end || start);
    const days = [];
    const cursor = parseLocalDate(start);
    while (cursor <= endDate) {
        const weight = dayWeight(cursor);
        if (weight > 0) days.push({ date: toLocalDateStr(cursor), weight });
        cursor.setDate(cursor.getDate() + 1);
    }
    // Rango sin días laborales (p. ej. solo domingo): todo cae en la fecha de inicio
    if (days.length === 0) return { [start]: hours };

    const totalWeight = days.reduce((sum, d) => sum + d.weight, 0);
    const totalHalves = Math.round(hours * 2); // unidades de media hora

    // Método de restos mayores: piso proporcional y las medias horas sobrantes
    // se asignan a los días con mayor fracción pendiente.
    const shares = days.map(d => {
        const exact = (totalHalves * d.weight) / totalWeight;
        const floor = Math.floor(exact);
        return { date: d.date, halves: floor, frac: exact - floor };
    });
    let remaining = totalHalves - shares.reduce((sum, s) => sum + s.halves, 0);
    const byFrac = [...shares].sort((a, b) => b.frac - a.frac);
    for (const share of byFrac) {
        if (remaining <= 0) break;
        share.halves += 1;
        remaining -= 1;
    }

    const result = {};
    for (const share of shares) result[share.date] = share.halves / 2;
    return result;
};

// Horas con un decimal, sin ".0" (4, 2.5, 0.8)
export const fmtHours = (n) => {
    const v = Math.round(n * 10) / 10;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

// Días naturales del rango (inclusive), para mostrar cuánto abarca una actividad
export const spanDays = (start, end) => {
    if (!start) return 0;
    const ms = parseLocalDate(end || start) - parseLocalDate(start);
    return Math.round(ms / 86400000) + 1;
};
