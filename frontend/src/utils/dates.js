// Fecha local en formato AAAA-MM-DD (toISOString usa UTC y desfasa el día en México)
export const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Convierte 'AAAA-MM-DD' a 'DD/MM/AAAA' sin pasar por Date (evita desfases de zona horaria)
export const formatDateMx = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
};

// Semanas del trimestre de una fecha: la semana 1 inicia el primer día del trimestre
// y cada semana abarca 7 días naturales (la última se recorta al cierre del trimestre).
export const getQuarterWeeks = (referenceDate = new Date()) => {
    const quarterIndex = Math.floor(referenceDate.getMonth() / 3);
    const year = referenceDate.getFullYear();
    const quarterStart = new Date(year, quarterIndex * 3, 1);
    const quarterEnd = new Date(year, quarterIndex * 3 + 3, 0);

    const weeks = [];
    const cursor = new Date(quarterStart);
    let weekNumber = 1;

    while (cursor <= quarterEnd) {
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const end = weekEnd > quarterEnd ? quarterEnd : weekEnd;

        weeks.push({
            label: `Q${quarterIndex + 1} - Semana ${weekNumber}`,
            start: toLocalDateStr(cursor),
            end: toLocalDateStr(end),
        });

        cursor.setDate(cursor.getDate() + 7);
        weekNumber += 1;
    }

    return weeks;
};

// Indica si el rango de una actividad (inicio → vencimiento) se cruza con un periodo
export const overlapsPeriod = (startDate, endDate, period) => {
    if (!startDate) return false;
    const end = endDate || startDate;
    return startDate <= period.end && end >= period.start;
};

// Fecha y hora local (DD/MM/AAAA HH:mm) a partir de un datetime del servidor.
// El servidor guarda UTC sin zona ("2026-11-10T18:48:07"), por eso se interpreta como UTC.
export const formatDateTimeMx = (value) => {
    if (!value) return '';
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
    const date = new Date(hasZone ? value : `${value}Z`);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Días entre dos fechas 'AAAA-MM-DD' (b - a), sin desfases de zona horaria
export const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);
