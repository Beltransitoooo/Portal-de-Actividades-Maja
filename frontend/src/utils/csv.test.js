import { describe, it, expect } from 'vitest';
import { csvCell, toCsv } from './csv';

describe('csvCell', () => {
    it('deja pasar texto simple y números', () => {
        expect(csvCell('Hola')).toBe('Hola');
        expect(csvCell(12.5)).toBe('12.5');
        expect(csvCell(-2)).toBe('-2'); // un número negativo no es una fórmula
    });

    it('vacía null y undefined', () => {
        expect(csvCell(null)).toBe('');
        expect(csvCell(undefined)).toBe('');
    });

    it('entrecomilla comas, saltos de línea y duplica comillas', () => {
        expect(csvCell('a,b')).toBe('"a,b"');
        expect(csvCell('línea1\nlínea2')).toBe('"línea1\nlínea2"');
        expect(csvCell('dijo "hola"')).toBe('"dijo ""hola"""');
    });

    it('neutraliza fórmulas de Excel escritas por usuarios (inyección de fórmulas)', () => {
        for (const peligroso of ['=1+1', '+SUMA(A1)', '-2+3', '@cmd', '=HYPERLINK("http://x","clic")']) {
            expect(csvCell(peligroso).replace(/^"/, '').startsWith("'")).toBe(true);
        }
    });
});

describe('toCsv', () => {
    it('arma encabezado y filas', () => {
        const csv = toCsv(
            [{ label: 'Código', value: r => r.id }, { label: 'Título', value: r => r.title }],
            [{ id: 'QA-1', title: 'Uno, dos' }, { id: 'QA-2', title: '=MALO()' }]
        );
        expect(csv.split('\r\n')).toEqual(['Código,Título', 'QA-1,"Uno, dos"', "QA-2,'=MALO()"]);
    });
});
