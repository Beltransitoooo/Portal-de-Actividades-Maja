import { describe, it, expect } from 'vitest';
import { personLoadByDay, dayStatus, busyDaysInRange, overloadedDays, splitRange, splitHours, partTitle, stripWindow } from './availability';

const task = (over) => ({
    db_id: 1, id: 'QA-1', title: 'A', assignee_raw_id: 10, completada: false,
    startDate: '2026-11-18', dueDate: '2026-11-20', maxHours: 21, ...over,
});

// Semana de referencia: lunes 16/11/2026 a domingo 22/11/2026
const FROM = '2026-11-16';
const TO = '2026-11-22';

describe('personLoadByDay', () => {
    it('reparte la estimación de cada actividad por día y la suma', () => {
        const load = personLoadByDay([
            task({ db_id: 1, maxHours: 21 }), // 18-20: 7 h diarias
            task({ db_id: 2, id: 'QA-2', startDate: '2026-11-17', dueDate: '2026-11-17', maxHours: 3 }),
        ], 10, FROM, TO);
        expect(load['2026-11-17'].hours).toBe(3);
        expect(load['2026-11-18'].hours).toBe(7);
        expect(load['2026-11-18'].activities).toEqual([{ id: 'QA-1', title: 'A', hours: 7 }]);
        expect(load['2026-11-16'].hours).toBe(0);
        expect(load['2026-11-22'].capacity).toBe(0); // domingo
        expect(load['2026-11-21'].capacity).toBe(5); // sábado
    });

    it('ignora completadas, otras personas, actividades sin fecha y la que se está editando', () => {
        const load = personLoadByDay([
            task({ db_id: 1, completada: true }),
            task({ db_id: 2, assignee_raw_id: 99 }),
            task({ db_id: 3, startDate: null }),
            task({ db_id: 4 }),
        ], 10, FROM, TO, { excludeId: 4 });
        expect(Object.values(load).every(d => d.hours === 0)).toBe(true);
    });

    it('sin persona devuelve los días vacíos', () => {
        const load = personLoadByDay([task()], '', FROM, TO);
        expect(load['2026-11-18'].hours).toBe(0);
    });

    it('acepta el id de la persona como texto (valor de un select)', () => {
        expect(personLoadByDay([task()], '10', FROM, TO)['2026-11-18'].hours).toBe(7);
    });
});

describe('dayStatus', () => {
    it('clasifica libre, parcial, lleno y descanso', () => {
        expect(dayStatus({ hours: 0, capacity: 7 })).toBe('libre');
        expect(dayStatus({ hours: 3.5, capacity: 7 })).toBe('parcial');
        expect(dayStatus({ hours: 7, capacity: 7 })).toBe('lleno');
        expect(dayStatus({ hours: 9, capacity: 7 })).toBe('lleno');
        expect(dayStatus({ hours: 0, capacity: 0 })).toBe('descanso');
    });
});

describe('días ocupados y sobrecarga', () => {
    const load = personLoadByDay([task()], 10, FROM, TO); // 18, 19 y 20 llenos

    it('detecta los días con jornada llena dentro del rango', () => {
        expect(busyDaysInRange(load, '2026-11-17', '2026-11-21')).toEqual(['2026-11-18', '2026-11-19', '2026-11-20']);
        expect(busyDaysInRange(load, '2026-11-16', '2026-11-17')).toEqual([]);
        expect(busyDaysInRange(load, '', '')).toEqual([]);
    });

    it('avisa qué días excederían la jornada con la nueva actividad', () => {
        const parcial = personLoadByDay([task({ startDate: '2026-11-17', dueDate: '2026-11-17', maxHours: 5 })], 10, FROM, TO);
        expect(overloadedDays(parcial, { '2026-11-17': 3, '2026-11-16': 3 }))
            .toEqual([{ date: '2026-11-17', total: 8, capacity: 7 }]);
    });

    it('no repite como sobrecarga un día que ya estaba lleno', () => {
        expect(overloadedDays(load, { '2026-11-18': 2 })).toEqual([]);
    });
});

describe('splitRange', () => {
    it('separa el rango en tramos sin los días ocupados (ejemplo 17 y 21)', () => {
        expect(splitRange('2026-11-17', '2026-11-21', ['2026-11-18', '2026-11-19', '2026-11-20']))
            .toEqual([{ start: '2026-11-17', end: '2026-11-17' }, { start: '2026-11-21', end: '2026-11-21' }]);
    });

    it('sin días excluidos devuelve el rango completo', () => {
        expect(splitRange('2026-11-16', '2026-11-20', [])).toEqual([{ start: '2026-11-16', end: '2026-11-20' }]);
    });

    it('un domingo no corta el tramo, pero se recorta en los extremos', () => {
        expect(splitRange('2026-11-21', '2026-11-24', [])).toEqual([{ start: '2026-11-21', end: '2026-11-24' }]);
        expect(splitRange('2026-11-22', '2026-11-23', [])).toEqual([{ start: '2026-11-23', end: '2026-11-23' }]);
    });

    it('descarta tramos que solo tienen domingo', () => {
        expect(splitRange('2026-11-20', '2026-11-23', ['2026-11-20', '2026-11-21', '2026-11-23'])).toEqual([]);
    });

    it('si todo está ocupado no hay tramos', () => {
        expect(splitRange('2026-11-18', '2026-11-20', ['2026-11-18', '2026-11-19', '2026-11-20'])).toEqual([]);
    });
});

describe('splitHours', () => {
    it('reparte proporcional a los días laborables y conserva el total', () => {
        // 17 (martes, 1 día) y 21 (sábado, 5/7 de día)
        const parts = splitHours(6, [{ start: '2026-11-17', end: '2026-11-17' }, { start: '2026-11-21', end: '2026-11-21' }]);
        expect(parts).toEqual([3.5, 2.5]);
        expect(parts.reduce((a, b) => a + b, 0)).toBe(6);
    });

    it('usa medias horas y nunca pierde horas por redondeo', () => {
        const segs = [{ start: '2026-11-16', end: '2026-11-16' }, { start: '2026-11-17', end: '2026-11-17' }, { start: '2026-11-18', end: '2026-11-18' }];
        const parts = splitHours(5, segs);
        expect(parts.reduce((a, b) => a + b, 0)).toBe(5);
        parts.forEach(h => expect((h * 2) % 1).toBe(0));
    });

    it('sin estimación deja las partes sin horas', () => {
        expect(splitHours('', [{ start: '2026-11-17', end: '2026-11-17' }])).toEqual([null]);
    });
});

describe('partTitle', () => {
    it('numera las partes solo cuando hay más de una', () => {
        expect(partTitle('Pruebas', 0, 2)).toBe('Pruebas (parte 1/2)');
        expect(partTitle('Pruebas', 0, 1)).toBe('Pruebas');
    });
});

describe('stripWindow', () => {
    it('muestra dos semanas desde el lunes de la fecha', () => {
        expect(stripWindow('2026-11-18')).toEqual({ from: '2026-11-16', to: '2026-11-29' });
    });

    it('se amplía para cubrir un rango largo, hasta 6 semanas', () => {
        expect(stripWindow('2026-11-18', '2026-12-03')).toEqual({ from: '2026-11-16', to: '2026-12-06' });
        expect(stripWindow('2026-11-18', '2027-03-01')).toEqual({ from: '2026-11-16', to: '2026-12-27' });
    });
});
