import { describe, it, expect } from 'vitest';
import {
    shiftDay, shiftMonth, longDayLabel, dayCount, monthCells, addMonths, viewOf, viewKey,
    weekStart, weekEnd, rangePresets, singlePresets, nextRangeSelection, isOutOfBounds,
} from './calendar';

describe('calendar: aritmética de fechas', () => {
    it('suma y resta días cruzando meses y años', () => {
        expect(shiftDay('2026-11-30', 1)).toBe('2026-12-01');
        expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('suma meses sin saltarse el mes cuando el día no existe', () => {
        expect(shiftMonth('2026-01-31', 1)).toBe('2026-02-28');
        expect(shiftMonth('2028-01-31', 1)).toBe('2028-02-29'); // bisiesto
        expect(shiftMonth('2026-03-31', -1)).toBe('2026-02-28');
        expect(shiftMonth('2026-12-15', 1)).toBe('2027-01-15');
    });

    it('cuenta los días de un rango incluyendo ambos extremos', () => {
        expect(dayCount('2026-11-17', '2026-11-17')).toBe(1);
        expect(dayCount('2026-11-17', '2026-11-21')).toBe(5);
    });

    it('describe el día en español para lectores de pantalla', () => {
        expect(longDayLabel('2026-11-17')).toBe('martes 17 de noviembre de 2026');
    });

    it('calcula el lunes y el domingo de la semana', () => {
        expect(weekStart('2026-11-19')).toBe('2026-11-16');
        expect(weekEnd('2026-11-19')).toBe('2026-11-22');
        expect(weekStart('2026-11-22')).toBe('2026-11-16'); // domingo pertenece a la semana que inicia el lunes anterior
    });
});

describe('calendar: rejilla del mes', () => {
    it('inicia en lunes con huecos antes del día 1', () => {
        const cells = monthCells({ y: 2026, m: 10 }); // noviembre 2026 inicia en domingo
        expect(cells.slice(0, 6)).toEqual([null, null, null, null, null, null]);
        expect(cells[6]).toBe('2026-11-01');
        expect(cells.filter(Boolean)).toHaveLength(30);
    });

    it('no deja huecos cuando el mes inicia en lunes', () => {
        expect(monthCells({ y: 2026, m: 5 })[0]).toBe('2026-06-01');
    });

    it('avanza vistas de mes cruzando el año', () => {
        expect(viewKey(addMonths({ y: 2026, m: 11 }, 1))).toBe('2027-01');
        expect(viewOf('2026-11-17')).toEqual({ y: 2026, m: 10 });
    });
});

describe('calendar: atajos', () => {
    const byLabel = (list) => Object.fromEntries(list.map(p => [p.label, [p.start, p.end]]));

    it('entre semana: esta semana termina el sábado y la próxima va de lunes a sábado', () => {
        const p = byLabel(rangePresets('2026-11-17')); // martes
        expect(p['Hoy']).toEqual(['2026-11-17', '2026-11-17']);
        expect(p['Mañana']).toEqual(['2026-11-18', '2026-11-18']);
        expect(p['Esta semana']).toEqual(['2026-11-17', '2026-11-21']);
        expect(p['Próxima semana']).toEqual(['2026-11-23', '2026-11-28']);
        expect(p['2 semanas']).toEqual(['2026-11-17', '2026-11-30']);
    });

    it('en lunes, la próxima semana es la siguiente y no la actual', () => {
        expect(byLabel(rangePresets('2026-11-16'))['Próxima semana']).toEqual(['2026-11-23', '2026-11-28']);
    });

    it('en domingo, la próxima semana empieza al día siguiente', () => {
        expect(byLabel(rangePresets('2026-11-22'))['Próxima semana']).toEqual(['2026-11-23', '2026-11-28']);
    });

    it('en sábado, esta semana es solo ese día', () => {
        expect(byLabel(rangePresets('2026-11-21'))['Esta semana']).toEqual(['2026-11-21', '2026-11-21']);
    });

    it('para un solo día ofrece hoy y ayer', () => {
        expect(byLabel(singlePresets('2026-11-01'))).toEqual({
            Hoy: ['2026-11-01', '2026-11-01'],
            Ayer: ['2026-10-31', '2026-10-31'],
        });
    });
});

describe('calendar: selección de un rango', () => {
    it('el primer clic fija el inicio y espera el vencimiento', () => {
        expect(nextRangeSelection({ start: '', pickingEnd: false }, '2026-11-19'))
            .toEqual({ start: '2026-11-19', end: '', pickingEnd: true, done: false });
    });

    it('el segundo clic completa el rango', () => {
        expect(nextRangeSelection({ start: '2026-11-19', pickingEnd: true }, '2026-11-25'))
            .toEqual({ start: '2026-11-19', end: '2026-11-25', pickingEnd: false, done: true });
    });

    it('el mismo día dos veces es una actividad de un día', () => {
        expect(nextRangeSelection({ start: '2026-11-19', pickingEnd: true }, '2026-11-19'))
            .toEqual({ start: '2026-11-19', end: '2026-11-19', pickingEnd: false, done: true });
    });

    it('un día anterior al inicio se toma como nuevo inicio (nunca un rango invertido)', () => {
        expect(nextRangeSelection({ start: '2026-11-19', pickingEnd: true }, '2026-11-10'))
            .toEqual({ start: '2026-11-10', end: '', pickingEnd: true, done: false });
    });

    it('con vencimiento y sin inicio, elegir un día anterior completa el rango sin perder el vencimiento', () => {
        expect(nextRangeSelection({ start: '', end: '2026-11-25', pickingEnd: false }, '2026-11-20'))
            .toEqual({ start: '2026-11-20', end: '2026-11-25', pickingEnd: false, done: true });
        // Un día posterior al vencimiento empieza un rango nuevo (nunca invertido)
        expect(nextRangeSelection({ start: '', end: '2026-11-25', pickingEnd: false }, '2026-11-28'))
            .toEqual({ start: '2026-11-28', end: '', pickingEnd: true, done: false });
    });

    it('al reabrir con un rango ya elegido, el clic empieza un rango nuevo', () => {
        expect(nextRangeSelection({ start: '2026-11-19', pickingEnd: false }, '2026-12-01'))
            .toEqual({ start: '2026-12-01', end: '', pickingEnd: true, done: false });
    });
});

describe('calendar: límites', () => {
    it('bloquea días fuera de min/max y permite los extremos', () => {
        expect(isOutOfBounds('2026-11-18', { max: '2026-11-17' })).toBe(true);
        expect(isOutOfBounds('2026-11-17', { max: '2026-11-17' })).toBe(false);
        expect(isOutOfBounds('2026-11-09', { min: '2026-11-10' })).toBe(true);
        expect(isOutOfBounds('2026-11-09')).toBe(false);
    });
});
