import { toLocalDateStr, daysBetween } from './dates';
import { distributeHours } from './schedule';
import { dayCapacity } from './capacity';

// Orden de importancia al mostrar los avisos
const KIND_ORDER = { overdue: 0, blocked: 1, overload: 2, dueSoon: 3 };

/**
 * Avisos calculados a partir de las actividades (no se guardan: desaparecen al resolverse).
 *  - overdue:  vencida y sin completar
 *  - dueSoon:  vence hoy o en los próximos `dueSoonDays` días
 *  - blocked:  en estado Bloqueada
 *  - overload: una persona tiene más horas planeadas que su capacidad en algún día de los próximos `overloadDays`
 */
export const buildAlerts = (tasks, { today = new Date(), dueSoonDays = 2, overloadDays = 7 } = {}) => {
    const todayStr = toLocalDateStr(today);
    const open = tasks.filter(t => !t.completada);
    const alerts = [];

    for (const task of open) {
        if (task.dueDate && task.dueDate < todayStr) {
            alerts.push({ key: `overdue-${task.db_id}`, kind: 'overdue', task, days: daysBetween(task.dueDate, todayStr) });
        } else if (task.dueDate && daysBetween(todayStr, task.dueDate) <= dueSoonDays) {
            alerts.push({ key: `dueSoon-${task.db_id}`, kind: 'dueSoon', task, days: daysBetween(todayStr, task.dueDate) });
        }
        if (task.status === 'BLOQUEADA') {
            alerts.push({ key: `blocked-${task.db_id}`, kind: 'blocked', task });
        }
    }

    // Sobrecarga: horas planeadas por persona y día (la estimación se reparte entre los días de ejecución)
    const byPerson = new Map();
    for (const task of open) {
        if (!task.assignee_raw_id || !task.startDate) continue;
        if (!byPerson.has(task.assignee_raw_id)) byPerson.set(task.assignee_raw_id, []);
        byPerson.get(task.assignee_raw_id).push(task);
    }
    for (const [personId, personTasks] of byPerson) {
        const distributions = personTasks.map(t => distributeHours(t.maxHours, t.startDate, t.dueDate || t.startDate));
        const overloaded = [];
        for (let i = 0; i < overloadDays; i += 1) {
            const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
            const capacity = dayCapacity(day);
            if (capacity === 0) continue;
            const dateStr = toLocalDateStr(day);
            const planned = distributions.reduce((sum, dist) => sum + (dist[dateStr] || 0), 0);
            if (planned > capacity + 0.05) overloaded.push({ date: dateStr, planned, capacity });
        }
        if (overloaded.length > 0) {
            const worst = overloaded.reduce((a, b) => (b.planned - b.capacity > a.planned - a.capacity ? b : a));
            alerts.push({
                key: `overload-${personId}`,
                kind: 'overload',
                person: personTasks[0].assigneeName,
                personId,
                overloaded,
                worst,
                task: personTasks[0],
            });
        }
    }

    return alerts.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || (b.days || 0) - (a.days || 0));
};
