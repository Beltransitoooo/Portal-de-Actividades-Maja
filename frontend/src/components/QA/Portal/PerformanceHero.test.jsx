// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PerformanceHero } from './PerformanceHero';

const renderHero = () => render(<MemoryRouter><PerformanceHero /></MemoryRouter>);

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // jsdom no tiene WebGL: se comprueba el respaldo estático
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('PerformanceHero', () => {
    it('lleva el sprint actual en el dorsal con dos cifras y una descripción accesible', () => {
        vi.setSystemTime(new Date(2026, 10, 17, 12));
        renderHero();
        expect(screen.getByRole('heading', { level: 1, name: /Panel de\s*rendimiento/i })).toBeInTheDocument();
        const bib = screen.getByRole('figure', { name: 'Sprint actual: Q4 - Semana 7, del 12/11 al 18/11' });
        expect(bib).toHaveTextContent('07');
        expect(bib).toHaveTextContent('12/11 – 18/11');
    });

    it('la primera semana del trimestre también sale con dos cifras', () => {
        vi.setSystemTime(new Date(2027, 0, 2, 12));
        renderHero();
        expect(screen.getByRole('figure', { name: /Q1 - Semana 1/ })).toHaveTextContent('01');
    });

    it('sin WebGL muestra la textura estática y la escena queda oculta para lectores de pantalla', () => {
        vi.setSystemTime(new Date(2026, 10, 17, 12));
        renderHero();
        const scene = screen.getByTestId('fabric-hero');
        expect(scene).toHaveAttribute('aria-hidden', 'true');
        expect(scene.querySelector('.textura-punto')).not.toBeNull();
        expect(scene.querySelector('canvas')).toBeNull();
    });
});
