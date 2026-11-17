import { describe, it, expect } from 'vitest';
import {
    sprintPeriod, historicPeriod, monthsBetween, bucketsBetween, pieSlices,
    weeksBetween, capacityBetween, tasksInPeriod, hoursByWeek, closureMap, deliveries,
    deliveriesByWeek, deviations, loadStatus, loadByPerson, loadByDay, loadByWeek, loadSeries, byStatus, byType, byPriority, byArea, summary,
} from './stats';

const t = (over) => ({
    db_id: 1, id: 'QA-1', title: 'A', assignee_raw_id: 10, status: 'PENDIENTE', priority: 'MEDIA', type: 'Tarea',
    startDate: '2026-11-16', dueDate: '2026-11-20', maxHours: 10, loggedHours: 0, hoursByDate: {}, completada: false, ...over,
});

describe('periodo', () => {
    it('semanas de lunes a domingo recortadas al periodo', () => {
        expect(weeksBetween('2026-11-01', '2026-11-18')).toEqual([
            { start: '2026-11-01', end: '2026-11-01', label: '1 nov' },
            { start: '2026-11-02', end: '2026-11-08', label: '2 nov' },
            { start: '2026-11-09', end: '2026-11-15', label: '9 nov' },
            { start: '2026-11-16', end: '2026-11-18', label: '16 nov' },
        ]);
    });

    it('capacidad: 7 h entre semana, 5 h sábado, 0 domingo', () => {
        expect(capacityBetween('2026-11-16', '2026-11-22')).toBe(40);
    });

    it('filtra por periodo (rango que se cruza) y persona', () => {
        const tasks = [t({ db_id: 1 }), t({ db_id: 2, startDate: '2026-12-01', dueDate: '2026-12-02' }), t({ db_id: 3, assignee_raw_id: 20 }), t({ db_id: 4, startDate: null })];
        expect(tasksInPeriod(tasks, { start: '2026-11-01', end: '2026-11-30' }).map(x => x.db_id)).toEqual([1, 3]);
        expect(tasksInPeriod(tasks, { start: '2026-11-01', end: '2026-11-30', personId: '10' }).map(x => x.db_id)).toEqual([1]);
    });
});

describe('horas por semana', () => {
    it('reparte la estimación por día y suma solo lo que cae en cada semana', () => {
        // 14 h del jueves 19 al martes 24: 3 días en una semana (jue, vie, sáb = 2+5/7) y 2 en la siguiente
        const task = t({ startDate: '2026-11-19', dueDate: '2026-11-24', maxHours: 14, hoursByDate: { '2026-11-20': 3, '2026-11-23': 4 } });
        const weeks = weeksBetween('2026-11-16', '2026-11-29');
        const [w1, w2] = hoursByWeek([task], weeks);
        expect(w1.estimated + w2.estimated).toBe(14);
        expect(w1.real).toBe(3);
        expect(w2.real).toBe(4);
        expect(w1.estimated).toBeGreaterThan(w2.estimated);
    });
});

describe('entregas', () => {
    const closures = closureMap([
        { actividad_id: 1, fecha_cierre: '2026-11-20T12:00:00' }, // mediodía UTC: mismo día en cualquier zona de América/Europa
        { actividad_id: 2, fecha_cierre: '2026-11-25T18:00:00' },
    ]);

    it('convierte la fecha de cierre UTC (sin zona) a día local', () => {
        expect(closures.get(1)).toBe('2026-11-20');
        expect(closureMap([{ actividad_id: 9, fecha_cierre: '2026-11-20T12:00:00Z' }]).get(9)).toBe('2026-11-20');
    });

    it('a tiempo si cerró en o antes del vencimiento; con retraso si después', () => {
        const tasks = [
            t({ db_id: 1, completada: true, dueDate: '2026-11-20' }),
            t({ db_id: 2, completada: true, dueDate: '2026-11-20' }),
            t({ db_id: 3, completada: false }),
        ];
        const { list } = deliveries(tasks, closures, { start: '2026-11-01', end: '2026-11-30' });
        expect(list.map(x => [x.task.db_id, x.onTime, x.approx])).toEqual([[1, true, false], [2, false, false]]);
    });

    it('sin registro en la bitácora usa el último día con horas (aproximado); sin horas no la ubica', () => {
        const tasks = [
            t({ db_id: 5, completada: true, dueDate: '2026-11-18', hoursByDate: { '2026-11-17': 2, '2026-11-19': 1 } }),
            t({ db_id: 6, completada: true }),
        ];
        const { list, undated } = deliveries(tasks, new Map(), { start: '2026-11-01', end: '2026-11-30' });
        expect(list).toEqual([expect.objectContaining({ date: '2026-11-19', approx: true, onTime: false })]);
        expect(undated).toBe(1);
    });

    it('cuenta la entrega por su fecha de cierre aunque el rango de la actividad sea anterior al periodo', () => {
        const tasks = [t({ db_id: 2, completada: true, startDate: '2026-10-01', dueDate: '2026-10-05' })];
        const { list } = deliveries(tasks, closures, { start: '2026-11-23', end: '2026-11-29' });
        expect(list).toHaveLength(1);
    });

    it('agrupa por semana y calcula la desviación ordenada por magnitud', () => {
        const tasks = [
            t({ db_id: 1, id: 'QA-1', completada: true, dueDate: '2026-11-20', maxHours: 10, loggedHours: 12 }),
            t({ db_id: 2, id: 'QA-2', completada: true, dueDate: '2026-11-20', maxHours: 10, loggedHours: 5 }),
        ];
        const { list } = deliveries(tasks, closures, { start: '2026-11-16', end: '2026-11-29' });
        expect(deliveriesByWeek(list, weeksBetween('2026-11-16', '2026-11-29')).map(w => [w.onTime, w.late])).toEqual([[1, 0], [0, 1]]);
        expect(deviations(list).map(d => [d.id, d.diff])).toEqual([['QA-2', -5], ['QA-1', 2]]);
    });

    it('la desviación ignora actividades sin estimación', () => {
        const list = [{ task: t({ maxHours: 0, loggedHours: 3 }) }];
        expect(deviations(list)).toEqual([]);
    });
});

describe('carga vs capacidad', () => {
    it('estado por proporción de la capacidad', () => {
        expect(loadStatus(0.5).key).toBe('ok');
        expect(loadStatus(0.9).key).toBe('warning');
        expect(loadStatus(1.2).key).toBe('critical');
    });

    it('carga por persona en el periodo, de mayor a menor proporción', () => {
        const users = [{ raw_id: 10, name: 'Uno' }, { raw_id: 20, name: 'Dos' }];
        const tasks = [t({ assignee_raw_id: 10, maxHours: 35 }), t({ db_id: 2, assignee_raw_id: 20, maxHours: 45 })];
        const rows = loadByPerson(tasks, users, { start: '2026-11-16', end: '2026-11-22' });
        expect(rows.map(r => [r.name, r.planned, r.capacity, r.status.key])).toEqual([
            ['Dos', 45, 40, 'critical'],
            ['Uno', 35, 40, 'warning'],
        ]);
    });

    it('carga por día sin domingos y marcando los días que exceden la jornada', () => {
        const days = loadByDay([t({ maxHours: 40 })], { start: '2026-11-16', end: '2026-11-22' });
        expect(days.map(d => d.date)).not.toContain('2026-11-22');
        expect(days.find(d => d.date === '2026-11-16')).toEqual(expect.objectContaining({ planned: 8, capacity: 7, over: true }));
    });
});

describe('carga por periodo largo', () => {
    it('hasta 31 días va por día; más de 31, por semana con la capacidad de cada semana', () => {
        const tasks = [t({ maxHours: 40 })];
        expect(loadSeries(tasks, { start: '2026-11-01', end: '2026-11-30' }).granularity).toBe('day');
        const q = loadSeries(tasks, { start: '2026-10-01', end: '2026-12-31' });
        expect(q.granularity).toBe('week');
        expect(q.data).toHaveLength(14);
        const semana = q.data.find(w => w.date === '2026-11-16');
        expect(semana).toEqual(expect.objectContaining({ planned: 40, capacity: 40, over: false, label: '16 nov' }));
    });

    it('la capacidad de una semana recortada solo cuenta sus días', () => {
        const [w] = loadByWeek([], [{ start: '2026-10-01', end: '2026-10-04', label: '1 oct' }]); // jue a dom
        expect(w.capacity).toBe(7 + 7 + 5);
    });
});

describe('distribución', () => {
    const tasks = [
        t({ status: 'PENDIENTE', type: 'Bug', priority: 'ALTA', areaId: 1 }),
        t({ status: 'PENDIENTE', type: 'Tarea', priority: 'ALTA', areaId: 1 }),
        t({ status: 'COMPLETADA', type: 'Pruebas', priority: 'BAJA', areaId: null }),
    ];

    it('estado y tipo de mayor a menor', () => {
        expect(byStatus(tasks)).toEqual([{ label: 'PENDIENTE', value: 2 }, { label: 'COMPLETADA', value: 1 }]);
        expect(byType(tasks)[0]).toEqual({ label: 'Error / Bug', value: 1 });
    });

    it('prioridad en su orden natural, incluidas las vacías', () => {
        expect(byPriority(tasks)).toEqual([
            { label: 'Crítica', value: 0 }, { label: 'Alta', value: 2 }, { label: 'Media', value: 0 }, { label: 'Baja', value: 1 },
        ]);
    });

    it('área con nombre y "Sin área"', () => {
        expect(byArea(tasks, [{ id: 1, nombre: 'QA' }])).toEqual([{ label: 'QA', value: 2 }, { label: 'Sin área', value: 1 }]);
    });
});

describe('indicadores', () => {
    it('resume horas y entregas; sin entregas el porcentaje es nulo', () => {
        const tasks = [t({ maxHours: 10, hoursByDate: { '2026-11-17': 4 } })];
        expect(summary(tasks, [], { start: '2026-11-16', end: '2026-11-22' })).toEqual({
            activities: 1, estimated: 10, real: 4, delivered: 0, onTime: 0, onTimePct: null,
        });
        expect(summary(tasks, [{ onTime: true }, { onTime: false }, { onTime: true }], { start: '2026-11-16', end: '2026-11-22' }).onTimePct).toBe(67);
    });
});

describe('sprint e histórico', () => {
    it('el sprint actual es la semana del trimestre que contiene hoy', () => {
        expect(sprintPeriod('2026-11-17')).toEqual({ key: 'sprint', label: 'Q4 - Semana 7', start: '2026-11-12', end: '2026-11-18' });
        expect(sprintPeriod('2026-10-01')).toEqual(expect.objectContaining({ label: 'Q4 - Semana 1', start: '2026-10-01', end: '2026-10-07' }));
    });

    it('el histórico va del primer dato (inicio, horas o cierre) hasta hoy o el último vencimiento', () => {
        const tasks = [
            t({ startDate: '2026-09-10', dueDate: '2026-09-12', hoursByDate: { '2026-09-05': 1 } }),
            t({ startDate: '2026-11-20', dueDate: '2026-12-15' }),
        ];
        expect(historicPeriod(tasks, new Map([[9, '2026-08-30']]), '2026-11-17')).toEqual(expect.objectContaining({ start: '2026-08-30', end: '2026-12-15' }));
        expect(historicPeriod([], new Map(), '2026-11-17')).toEqual(expect.objectContaining({ start: '2026-11-17', end: '2026-11-17' }));
    });
});

describe('agrupación en el tiempo', () => {
    it('un sprint (7 días) va por día', () => {
        const { unit, buckets } = bucketsBetween('2026-11-12', '2026-11-18');
        expect(unit).toBe('day');
        expect(buckets.map(b => b.label)).toEqual(['ju 12', 'vi 13', 'sá 14', 'do 15', 'lu 16', 'ma 17', 'mi 18']);
    });

    it('hasta 16 semanas va por semana; más, por mes recortado al periodo', () => {
        expect(bucketsBetween('2026-10-01', '2026-12-31').unit).toBe('week');
        const { unit, buckets } = bucketsBetween('2026-03-15', '2026-11-17');
        expect(unit).toBe('month');
        expect(buckets[0]).toEqual({ start: '2026-03-15', end: '2026-03-31', label: 'mar 2026' });
        expect(buckets.at(-1)).toEqual({ start: '2026-11-01', end: '2026-11-17', label: 'nov 2026' });
        expect(monthsBetween('2026-12-20', '2027-01-05').map(m => m.label)).toEqual(['dic 2026', 'ene 2027']);
    });
});

describe('pastel', () => {
    it('porcentajes con un decimal y sin categorías en cero', () => {
        expect(pieSlices([{ label: 'A', value: 2 }, { label: 'B', value: 1 }, { label: 'C', value: 0 }]))
            .toEqual([{ label: 'A', value: 2, pct: 66.7 }, { label: 'B', value: 1, pct: 33.3 }]);
    });

    it('más de 6 categorías: las 5 mayores y "Otros"', () => {
        const rows = 'ABCDEFGH'.split('').map((l, i) => ({ label: l, value: 10 - i }));
        const slices = pieSlices(rows);
        expect(slices.map(x => x.label)).toEqual(['A', 'B', 'C', 'D', 'E', 'Otros']);
        expect(slices.at(-1).value).toBe(5 + 4 + 3);
        expect(slices.reduce((s, x) => s + x.value, 0)).toBe(rows.reduce((s, x) => s + x.value, 0));
    });

    it('sin datos no hay rebanadas', () => {
        expect(pieSlices([{ label: 'A', value: 0 }])).toEqual([]);
    });
});
