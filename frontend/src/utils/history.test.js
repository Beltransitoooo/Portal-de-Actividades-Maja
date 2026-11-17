import { describe, it, expect } from 'vitest';
import { describeHistoryEntry, realRange, closureSummary, sortByClosure } from './history';

const entry = (campo, valor_anterior, valor_nuevo) => ({ campo, valor_anterior, valor_nuevo });

describe('history: bitácora legible', () => {
    it('muestra las fechas como DD/MM/AAAA', () => {
        expect(describeHistoryEntry(entry('fecha_vencimiento', '2026-11-21', '2026-11-24')))
            .toBe('cambió el vencimiento de 21/11/2026 a 24/11/2026');
        expect(describeHistoryEntry(entry('fecha_inicio', null, '2026-11-17')))
            .toBe('cambió la fecha de inicio de sin fecha a 17/11/2026');
    });

    it('usa las etiquetas de estado de la interfaz', () => {
        expect(describeHistoryEntry(entry('estado', 'EN_PROGRESO', 'EN_REVISION')))
            .toBe('cambió el estado de EN PROGRESO a EN REVISIÓN');
    });

    it('no muestra "null" si falta el estado anterior', () => {
        expect(describeHistoryEntry(entry('estado', null, 'COMPLETADA'))).not.toMatch(/null/);
    });

    it('describe altas y bajas de horas', () => {
        expect(describeHistoryEntry(entry('horas', null, '2 h el 17/11/2026'))).toBe('registró 2 h el 17/11/2026');
        expect(describeHistoryEntry(entry('horas', '2 h el 17/11/2026', null))).toBe('eliminó el registro de 2 h el 17/11/2026');
    });

    it('tiene un texto genérico para campos desconocidos', () => {
        expect(describeHistoryEntry(entry('otro_campo', 'a', 'b'))).toBe('modificó otro_campo');
    });
});

describe('history: plan frente a lo real', () => {
    it('ignora días con 0 horas y devuelve null sin registros', () => {
        expect(realRange({})).toBeNull();
        expect(realRange({ '2026-11-10': 0 })).toBeNull();
        expect(realRange({ '2026-11-12': 2, '2026-11-09': 1, '2026-11-10': 0 }))
            .toEqual({ first: '2026-11-09', last: '2026-11-12', count: 2 });
    });

    it('cierre dentro del plan y de la estimación', () => {
        const s = closureSummary({ startDate: '2026-11-09', dueDate: '2026-11-14', maxHours: 6, loggedHours: 5, hoursByDate: { '2026-11-09': 2, '2026-11-10': 3 } });
        expect(s.lateDays).toBe(0);
        expect(s.overHours).toBe(0);
    });

    it('cierre con retraso y horas de más', () => {
        const s = closureSummary({ startDate: '2026-11-09', dueDate: '2026-11-10', maxHours: 4, loggedHours: 5.5, hoursByDate: { '2026-11-09': 2, '2026-11-13': 3.5 } });
        expect(s.lateDays).toBe(3);
        expect(s.overHours).toBe(1.5);
    });

    it('sin vencimiento usa el inicio como fin del plan', () => {
        const s = closureSummary({ startDate: '2026-11-09', dueDate: null, maxHours: 0, loggedHours: 1, hoursByDate: { '2026-11-10': 1 } });
        expect(s.planEnd).toBe('2026-11-09');
        expect(s.lateDays).toBe(1);
        expect(s.overHours).toBe(0); // sin estimación no hay desvío
    });

    it('ordena primero lo cerrado más recientemente', () => {
        const a = { db_id: 1, dueDate: '2026-11-05', hoursByDate: { '2026-11-20': 1 } };
        const b = { db_id: 2, dueDate: '2026-11-25', hoursByDate: {} };
        const c = { db_id: 3, dueDate: '2026-11-10', hoursByDate: { '2026-11-08': 1 } };
        expect(sortByClosure([c, a, b]).map(t => t.db_id)).toEqual([2, 1, 3]);
    });
});
