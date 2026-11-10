import { describe, it, expect } from 'vitest';
import { WORKDAY, WEEKDAY_HOURS, SATURDAY_HOURS, WEEKLY_CAPACITY, dayCapacity, NEAR_LIMIT_RATIO, scheduleText } from './capacity';

describe('jornada y capacidad semanal', () => {
    it('lunes a viernes: 9:00 a 17:00 con comida de 14:00 a 15:00 = 7 h', () => {
        expect(WORKDAY).toEqual({ start: 9, lunchStart: 14, lunchEnd: 15, end: 17 });
        expect(WEEKDAY_HOURS).toBe(7);
    });

    it('sábado: 9:00 a 14:00 = 5 h', () => {
        expect(SATURDAY_HOURS).toBe(5);
    });

    it('son 40 h por semana: 5 días de 7 h + sábado de 5 h', () => {
        expect(WEEKLY_CAPACITY).toBe(40);
        const week = [9, 10, 11, 12, 13, 14, 15].map(d => dayCapacity(new Date(2026, 10, d)));
        expect(week).toEqual([7, 7, 7, 7, 7, 5, 0]);
        expect(week.reduce((a, b) => a + b, 0)).toBe(WEEKLY_CAPACITY);
    });

    it('"al límite" arranca a las 32 h (80 %)', () => {
        expect(WEEKLY_CAPACITY * NEAR_LIMIT_RATIO).toBe(32);
    });

    it('describe el horario del día', () => {
        expect(scheduleText(new Date(2026, 10, 10))).toBe('9:00–14:00 y 15:00–17:00');
        expect(scheduleText(new Date(2026, 10, 14))).toBe('9:00–14:00');
        expect(scheduleText(new Date(2026, 10, 15))).toBe('');
    });
});
