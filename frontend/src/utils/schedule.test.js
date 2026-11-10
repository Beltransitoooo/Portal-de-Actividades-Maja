import { describe, it, expect } from 'vitest';
import { distributeHours, getEquivalentWorkingDays, fmtHours, spanDays } from './schedule';

const sum = (dist) => Object.values(dist).reduce((a, b) => a + b, 0);

describe('distributeHours', () => {
    it('reparte en pasos de media hora y la suma da exactamente el total', () => {
        // 8 h entre lunes 9, martes 10 y miércoles 11 de noviembre de 2026 (antes salía 2.7 h por día)
        const dist = distributeHours(8, '2026-11-09', '2026-11-11');
        expect(Object.keys(dist)).toHaveLength(3);
        expect(sum(dist)).toBe(8);
        for (const hours of Object.values(dist)) expect((hours * 2) % 1).toBe(0);
    });

    it('la suma coincide con el total para muchos casos (propiedad)', () => {
        for (let total = 0.5; total <= 60; total += 0.5) {
            for (const [start, end] of [['2026-11-09', '2026-11-09'], ['2026-11-09', '2026-11-13'], ['2026-11-12', '2026-11-24'], ['2026-11-07', '2026-11-16']]) {
                const dist = distributeHours(total, start, end);
                expect(sum(dist)).toBeCloseTo(total, 9);
            }
        }
    });

    it('el sábado recibe la mitad y el domingo nada', () => {
        // viernes 13, sábado 14 y domingo 15
        const dist = distributeHours(6, '2026-11-13', '2026-11-15');
        expect(dist['2026-11-15']).toBeUndefined();
        expect(dist['2026-11-13']).toBeGreaterThan(dist['2026-11-14']);
        expect(sum(dist)).toBe(6);
    });

    it('un rango solo de domingo deja todo en la fecha de inicio', () => {
        expect(distributeHours(4, '2026-11-15', '2026-11-15')).toEqual({ '2026-11-15': 4 });
    });

    it('devuelve vacío sin horas o sin fecha', () => {
        expect(distributeHours(0, '2026-11-09', '2026-11-10')).toEqual({});
        expect(distributeHours(4, null, null)).toEqual({});
        expect(distributeHours('abc', '2026-11-09', '2026-11-10')).toEqual({});
    });

    it('usa la fecha de inicio si no hay vencimiento', () => {
        expect(distributeHours(3, '2026-11-10', undefined)).toEqual({ '2026-11-10': 3 });
    });
});

describe('utilidades de horas y días', () => {
    it('cuenta días laborales equivalentes (sábado medio día, domingo nada)', () => {
        expect(getEquivalentWorkingDays('2026-11-09', '2026-11-13')).toBe(5);
        expect(getEquivalentWorkingDays('2026-11-09', '2026-11-15')).toBe(5.5);
        expect(getEquivalentWorkingDays('2026-11-15', '2026-11-15')).toBe(1); // nunca 0
    });

    it('formatea horas sin ceros sobrantes', () => {
        expect(fmtHours(4)).toBe('4');
        expect(fmtHours(2.5)).toBe('2.5');
        expect(fmtHours(0.8333)).toBe('0.8');
    });

    it('cuenta días naturales del rango', () => {
        expect(spanDays('2026-11-09', '2026-11-13')).toBe(5);
        expect(spanDays('2026-11-09')).toBe(1);
        expect(spanDays(null)).toBe(0);
    });
});
