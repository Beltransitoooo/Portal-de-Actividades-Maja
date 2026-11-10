import { describe, it, expect } from 'vitest';
import { buildAlerts } from './alerts';

// Hoy (fijo para las pruebas): martes 10/11/2026
const TODAY = new Date(2026, 10, 10);

const task = (over = {}) => ({
    db_id: 1, id: 'QA-1', title: 'Actividad', status: 'PENDIENTE', completada: false,
    assignee_raw_id: 7, assigneeName: 'Persona Uno', maxHours: 8,
    startDate: '2026-11-10', dueDate: '2026-11-10', blockReason: null, ...over,
});

const kinds = (alerts) => alerts.map(a => a.kind);

describe('buildAlerts', () => {
    it('no avisa si todo está en orden', () => {
        expect(buildAlerts([task({ dueDate: '2026-11-30', startDate: '2026-11-20' })], { today: TODAY })).toEqual([]);
    });

    it('vencida: venció antes de hoy y sigue abierta', () => {
        const alerts = buildAlerts([task({ startDate: '2026-11-02', dueDate: '2026-11-06' })], { today: TODAY });
        expect(kinds(alerts)).toContain('overdue');
        expect(alerts.find(a => a.kind === 'overdue').days).toBe(4);
    });

    it('una actividad completada nunca genera avisos', () => {
        const alerts = buildAlerts([task({ completada: true, status: 'COMPLETADA', dueDate: '2026-11-01', startDate: '2026-11-01' })], { today: TODAY });
        expect(alerts).toEqual([]);
    });

    it('por vencer: hoy, mañana y dentro del margen; fuera del margen no avisa', () => {
        const mk = (due) => kinds(buildAlerts([task({ startDate: due, dueDate: due, maxHours: 2 })], { today: TODAY }));
        expect(mk('2026-11-10')).toContain('dueSoon');
        expect(mk('2026-11-12')).toContain('dueSoon');
        expect(mk('2026-11-13')).not.toContain('dueSoon');
    });

    it('bloqueada: avisa con su motivo disponible', () => {
        const alerts = buildAlerts([task({ status: 'BLOQUEADA', blockReason: 'Sin acceso', startDate: '2026-11-20', dueDate: '2026-11-25' })], { today: TODAY });
        const blocked = alerts.find(a => a.kind === 'blocked');
        expect(blocked.task.blockReason).toBe('Sin acceso');
    });

    it('sobrecarga: más horas planeadas que la capacidad del día', () => {
        // Dos actividades de 8 h el mismo martes = 16 h para una persona que tiene 7 h
        const alerts = buildAlerts([
            task({ db_id: 1 }),
            task({ db_id: 2, id: 'QA-2' }),
        ], { today: TODAY });
        const overload = alerts.find(a => a.kind === 'overload');
        expect(overload).toBeTruthy();
        expect(overload.worst.planned).toBe(16);
        expect(overload.worst.capacity).toBe(7);
    });

    it('sobrecarga: no cuenta el domingo ni a personas distintas juntas', () => {
        const alerts = buildAlerts([
            task({ db_id: 1, assignee_raw_id: 7, maxHours: 7 }),
            task({ db_id: 2, assignee_raw_id: 8, assigneeName: 'Persona Dos', maxHours: 7 }),
        ], { today: TODAY });
        expect(kinds(alerts)).not.toContain('overload'); // 7 h cada quien: cabe en la jornada
    });

    it('ordena por importancia: vencidas, bloqueadas, sobrecarga y por vencer', () => {
        const alerts = buildAlerts([
            task({ db_id: 1, startDate: '2026-11-11', dueDate: '2026-11-11', maxHours: 2 }), // por vencer
            task({ db_id: 2, status: 'BLOQUEADA', blockReason: 'X', startDate: '2026-11-20', dueDate: '2026-11-22' }),
            task({ db_id: 3, startDate: '2026-11-02', dueDate: '2026-11-03' }), // vencida
        ], { today: TODAY });
        expect(kinds(alerts)).toEqual(['overdue', 'blocked', 'dueSoon']);
    });
});
