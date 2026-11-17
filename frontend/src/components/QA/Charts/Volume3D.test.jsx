// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Bar3D, Pie3D, Meter3D } from './Volume3D';
import { faces, textOn, PALETTE } from './chartPalette';

const svg = (el) => render(<svg>{el}</svg>).container;

describe('Bar3D (ortográfica)', () => {
    it('la cara frontal conserva exactamente el valor del eje; la profundidad se agrega aparte', () => {
        const c = svg(<Bar3D x={10} y={40} width={20} height={60} fill="#0e71af" />);
        const front = c.querySelector('rect');
        expect([front.getAttribute('x'), front.getAttribute('y'), front.getAttribute('width'), front.getAttribute('height')]).toEqual(['10', '40', '20', '60']);
        expect(c.querySelectorAll('polygon')).toHaveLength(2); // cara superior y lateral
        expect(front.getAttribute('fill')).toBe('#0e71af');
    });

    it('un valor 0 no dibuja nada (ni la tapa)', () => {
        expect(svg(<Bar3D x={10} y={100} width={20} height={0} fill="#0e71af" />).querySelector('rect')).toBeNull();
        expect(svg(<Bar3D horizontal x={10} y={10} width={0} height={18} fill="#0e71af" />).querySelector('rect')).toBeNull();
    });

    it('acepta valores negativos (barras divergentes) normalizando el rectángulo', () => {
        const front = svg(<Bar3D horizontal x={100} y={10} width={-40} height={18} fill="#e4572e" />).querySelector('rect');
        expect([front.getAttribute('x'), front.getAttribute('width')]).toEqual(['60', '40']);
    });
});

describe('Pie3D', () => {
    const slices = [
        { label: 'A', value: 3, pct: 75, fill: PALETTE.light[0] },
        { label: 'B', value: 1, pct: 25, fill: PALETTE.light[1] },
    ];

    it('dibuja una cara superior por rebanada con su porcentaje y una descripción accesible', () => {
        const { container, getByRole } = render(<Pie3D slices={slices} ariaLabel="Estados: A 75%, B 25%" />);
        expect(getByRole('img', { name: 'Estados: A 75%, B 25%' })).toBeInTheDocument();
        expect(container.querySelectorAll('path[stroke]')).toHaveLength(2);
        expect(container.textContent).toContain('75%');
        expect(container.textContent).toContain('25%');
    });

    it('una sola categoría al 100% se dibuja como disco completo', () => {
        const { container } = render(<Pie3D slices={[{ label: 'A', value: 4, pct: 100, fill: PALETTE.light[0] }]} />);
        expect(container.querySelector('path[stroke]').getAttribute('d')).toMatch(/A .* A /);
        expect(container.querySelector('text').textContent).toBe('100%');
    });

    it('sin datos no dibuja nada', () => {
        expect(render(<Pie3D slices={[{ label: 'A', value: 0, pct: 0, fill: '#000000' }]} />).container.innerHTML).toBe('');
    });
});

describe('Paleta y volumen', () => {
    it('la cara superior es más clara y la lateral más oscura que la frontal', () => {
        const lum = (h) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16);
        const f = faces('#0e71af');
        expect(lum(f.top)).toBeGreaterThan(lum(f.front));
        expect(lum(f.side)).toBeLessThan(lum(f.front));
    });

    it('el texto sobre cada color de la paleta usa el de mayor contraste', () => {
        expect(textOn('#d4a017')).toBe('#0b0b0b'); // oro: texto oscuro
        expect(textOn('#0e71af')).toBe('#ffffff'); // azul MAJA: texto blanco
    });

    it('el medidor expone su valor cuando lleva etiqueta', () => {
        const { getByRole } = render(<Meter3D pct={45} color="#0e71af" trackColor="#dfe6ef" label="45% de la capacidad" />);
        expect(getByRole('img', { name: '45% de la capacidad' })).toBeInTheDocument();
    });
});
