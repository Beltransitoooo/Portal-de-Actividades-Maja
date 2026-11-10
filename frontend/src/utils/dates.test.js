import { describe, it, expect } from 'vitest';
import { formatDateMx, formatDateTimeMx, daysBetween, toLocalDateStr, overlapsPeriod } from './dates';

describe('fechas', () => {
    it('formatea DD/MM/AAAA sin desfase de zona horaria', () => {
        expect(formatDateMx('2026-11-09')).toBe('09/11/2026');
        expect(formatDateMx('')).toBe('');
    });

    it('toLocalDateStr usa la fecha local', () => {
        expect(toLocalDateStr(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09');
    });

    it('formatDateTimeMx interpreta el datetime del servidor como UTC y lo muestra con el formato mexicano', () => {
        const out = formatDateTimeMx('2026-11-10T18:48:07.021019');
        expect(out).toMatch(/^\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/);
        expect(formatDateTimeMx('')).toBe('');
        expect(formatDateTimeMx('no es fecha')).toBe('');
    });

    it('daysBetween cuenta días exactos', () => {
        expect(daysBetween('2026-11-09', '2026-11-12')).toBe(3);
        expect(daysBetween('2026-11-12', '2026-11-09')).toBe(-3);
        expect(daysBetween('2026-11-09', '2026-11-09')).toBe(0);
    });

    it('overlapsPeriod detecta cruces de rangos', () => {
        const periodo = { start: '2026-11-05', end: '2026-11-11' };
        expect(overlapsPeriod('2026-11-01', '2026-11-05', periodo)).toBe(true);
        expect(overlapsPeriod('2026-11-12', '2026-11-20', periodo)).toBe(false);
        expect(overlapsPeriod(null, null, periodo)).toBe(false);
    });
});
