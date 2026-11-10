import { describe, it, expect } from 'vitest';
import { WEEKLY_CAPACITY, dayCapacity, NEAR_LIMIT_RATIO } from './capacity';

describe('capacidad semanal', () => {
    it('son 44 h: lunes a viernes 8 h y sábado 4 h', () => {
        expect(WEEKLY_CAPACITY).toBe(44);
        const week = [9, 10, 11, 12, 13, 14, 15].map(d => dayCapacity(new Date(2026, 10, d)));
        expect(week).toEqual([8, 8, 8, 8, 8, 4, 0]);
        expect(week.reduce((a, b) => a + b, 0)).toBe(WEEKLY_CAPACITY);
    });

    it('"al límite" arranca al 80 %', () => {
        expect(WEEKLY_CAPACITY * NEAR_LIMIT_RATIO).toBeCloseTo(35.2, 5);
    });
});
