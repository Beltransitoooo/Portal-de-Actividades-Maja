// Lógica pura de los selectores de fecha (sin React), para poder probarla aparte.
import { toLocalDateStr, daysBetween } from './dates';

export const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// 'AAAA-MM-DD' → Date local (sin desfase de zona horaria)
export const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const shiftDay = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return toLocalDateStr(d); };
export const shiftMonth = (s, n) => {
    const d = parseDay(s);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    // 31/01 + 1 mes → 28/02 (o 29), no 03/03
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return toLocalDateStr(d);
};
export const longDayLabel = (s) => {
    const d = parseDay(s);
    return `${WEEKDAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
};
export const isSunday = (s) => parseDay(s).getDay() === 0;
export const dayCount = (a, b) => daysBetween(a, b) + 1;

// Vista de mes { y, m } (m: 0-11)
export const viewOf = (s) => { const d = parseDay(s); return { y: d.getFullYear(), m: d.getMonth() }; };
export const addMonths = ({ y, m }, n) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; };
export const viewKey = ({ y, m }) => `${y}-${String(m + 1).padStart(2, '0')}`;
export const monthKey = (s) => s.slice(0, 7);

// Celdas de un mes con la semana iniciando en lunes; null = hueco antes del día 1
export const monthCells = ({ y, m }) => {
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    return [
        ...Array.from({ length: offset }, () => null),
        ...Array.from({ length: total }, (_, i) => toLocalDateStr(new Date(y, m, i + 1))),
    ];
};

// Inicio y fin de la semana (lunes a domingo) de un día
export const weekStart = (s) => shiftDay(s, -((parseDay(s).getDay() + 6) % 7));
export const weekEnd = (s) => shiftDay(weekStart(s), 6);

// Atajos de rango. La semana laboral termina en sábado; el domingo se descansa.
export const rangePresets = (today) => {
    const dow = parseDay(today).getDay();
    const nextMonday = shiftDay(today, ((8 - dow) % 7) || 7);
    return [
        { label: 'Hoy', start: today, end: today },
        { label: 'Mañana', start: shiftDay(today, 1), end: shiftDay(today, 1) },
        { label: 'Esta semana', start: today, end: shiftDay(today, (6 - dow + 7) % 7) },
        { label: 'Próxima semana', start: nextMonday, end: shiftDay(nextMonday, 5) },
        { label: '2 semanas', start: today, end: shiftDay(today, 13) },
    ];
};

// Atajos de un solo día (registro de horas)
export const singlePresets = (today) => [
    { label: 'Hoy', start: today, end: today },
    { label: 'Ayer', start: shiftDay(today, -1), end: shiftDay(today, -1) },
];

/**
 * Siguiente estado de la selección de un rango al hacer clic en `date`.
 * - Sin inicio, o eligiendo inicio: ese día es el inicio y se espera el vencimiento.
 * - Eligiendo vencimiento y el día es anterior al inicio: se toma como nuevo inicio.
 * - Eligiendo vencimiento (mismo día o posterior): se completa el rango (`done`).
 * - Si ya hay vencimiento pero no inicio, un día igual o anterior al vencimiento completa el
 *   rango sin perder el vencimiento existente.
 */
export const nextRangeSelection = ({ start, end = '', pickingEnd }, date) => {
    if (!start && end && !pickingEnd && date <= end) {
        return { start: date, end, pickingEnd: false, done: true };
    }
    if (!pickingEnd || !start || date < start) {
        return { start: date, end: '', pickingEnd: true, done: false };
    }
    return { start, end: date, pickingEnd: false, done: true };
};

// Un día está fuera de los límites permitidos
export const isOutOfBounds = (date, { min, max } = {}) => Boolean((min && date < min) || (max && date > max));
