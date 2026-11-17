// Lógica pura del historial (bitácora de cambios y plan frente a lo real), sin React.
import { STATUS_LABELS } from '../services/qaData';
import { formatDateMx, daysBetween } from './dates';

const quote = (value) => (value ? `"${value}"` : 'vacío');
// El servidor guarda las fechas como AAAA-MM-DD; se muestran como DD/MM/AAAA
const day = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(value || '') ? formatDateMx(value) : value || 'sin fecha');

// Convierte una fila de la bitácora en una frase legible
export const describeHistoryEntry = (entry) => {
    const from = entry.valor_anterior;
    const to = entry.valor_nuevo;
    switch (entry.campo) {
        case 'creada': return 'creó la actividad';
        case 'eliminada': return 'eliminó la actividad';
        case 'estado': return `cambió el estado de ${STATUS_LABELS[from] || from || 'sin estado'} a ${STATUS_LABELS[to] || to}`;
        case 'titulo': return `cambió el título de ${quote(from)} a ${quote(to)}`;
        case 'descripcion': return 'actualizó la descripción';
        case 'prioridad': return `cambió la prioridad de ${from || 'vacío'} a ${to || 'vacío'}`;
        case 'tipo_actividad': return `cambió el tipo de ${from || 'vacío'} a ${to || 'vacío'}`;
        case 'fecha_inicio': return `cambió la fecha de inicio de ${day(from)} a ${day(to)}`;
        case 'fecha_vencimiento': return `cambió el vencimiento de ${day(from)} a ${day(to)}`;
        case 'estimacion_max_hrs': return `cambió la estimación de ${from || '0'} h a ${to || '0'} h`;
        case 'motivo_bloqueo': return to ? `indicó el motivo del bloqueo: ${quote(to)}` : 'quitó el motivo del bloqueo';
        case 'asignado_a': return `reasignó la actividad de ${from} a ${to}`;
        case 'lider_catalogo': return `cambió el líder técnico de ${from} a ${to}`;
        case 'horas': return to ? `registró ${to}` : `eliminó el registro de ${from}`;
        default: return `modificó ${entry.campo}`;
    }
};

// Primer y último día con horas registradas (null si no hay horas)
export const realRange = (hoursByDate = {}) => {
    const dates = Object.keys(hoursByDate).filter(d => hoursByDate[d] > 0).sort();
    return dates.length ? { first: dates[0], last: dates[dates.length - 1], count: dates.length } : null;
};

// Resumen de una actividad cerrada: plan, real, desvío de horas y días de retraso
export const closureSummary = (task) => {
    const real = realRange(task.hoursByDate);
    const estimated = parseFloat(task.maxHours) || 0;
    const logged = parseFloat(task.loggedHours) || 0;
    const planEnd = task.dueDate || task.startDate || '';
    return {
        real,
        estimated,
        logged,
        planEnd,
        overHours: estimated > 0 && logged > estimated ? Math.round((logged - estimated) * 10) / 10 : 0,
        lateDays: real && planEnd && real.last > planEnd ? daysBetween(planEnd, real.last) : 0,
    };
};

// Orden del historial: lo que se cerró más recientemente primero
export const sortByClosure = (tasks) => [...tasks].sort((a, b) => {
    const endA = realRange(a.hoursByDate)?.last || a.dueDate || a.startDate || '';
    const endB = realRange(b.hoursByDate)?.last || b.dueDate || b.startDate || '';
    return endB.localeCompare(endA);
});
