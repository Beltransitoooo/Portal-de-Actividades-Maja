// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangeField } from './DateRangeField';

// "Hoy" fijo: martes 17/11/2026 (solo se simula la fecha; los temporizadores siguen siendo reales)
beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));
});
afterEach(() => vi.useRealTimers());

// Campo controlado, como lo usa el formulario de actividad
const Range = ({ initialStart = '', initialEnd = '', onChange = () => {} }) => {
    const [range, setRange] = useState({ start: initialStart, end: initialEnd });
    return (
        <DateRangeField
            id="fechas"
            label="Fechas de ejecución"
            start={range.start}
            end={range.end}
            onChange={(s, e) => { setRange({ start: s, end: e }); onChange(s, e); }}
        />
    );
};

const Single = ({ onChange = () => {} }) => {
    const [day, setDay] = useState('2026-11-17');
    return (
        <DateRangeField
            id="dia"
            label="Día"
            single
            start={day}
            max="2026-11-17"
            maxMonths={1}
            onChange={(d) => { setDay(d); onChange(d); }}
        />
    );
};

const trigger = (name = /Fechas de ejecución/) => screen.getByRole('button', { name });
const day = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });
const panel = () => screen.queryByRole('dialog', { name: /Seleccionar/ });

describe('DateRangeField (rango)', () => {
    it('se abre con el calendario y el día de hoy marcado', async () => {
        const user = userEvent.setup();
        render(<Range />);
        expect(trigger()).toHaveTextContent('Selecciona inicio y vencimiento');
        expect(trigger()).toHaveAttribute('aria-expanded', 'false');

        await user.click(trigger());
        expect(panel()).toBeInTheDocument();
        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
        expect(day('martes 17 de noviembre de 2026')).toHaveAccessibleName(/hoy/);
        expect(day('martes 17 de noviembre de 2026')).toHaveFocus();
    });

    it('dos clics eligen inicio y vencimiento, cierra y devuelve el foco', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range onChange={onChange} />);

        await user.click(trigger());
        await user.click(day('jueves 19 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-19', '');
        expect(screen.getByRole('status')).toHaveTextContent('Ahora elige el vencimiento');

        await user.click(day('miércoles 25 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-19', '2026-11-25');
        expect(panel()).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
        expect(trigger()).toHaveTextContent('19/11/2026');
        expect(trigger()).toHaveTextContent('25/11/2026');
        expect(trigger()).toHaveTextContent('7 días');
    });

    it('el mismo día dos veces es una actividad de un día', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range onChange={onChange} />);
        await user.click(trigger());
        await user.click(day('viernes 20 de noviembre'));
        await user.click(day('viernes 20 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-20', '2026-11-20');
        expect(trigger()).toHaveTextContent('1 día');
    });

    it('un día anterior al inicio se convierte en el nuevo inicio', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range onChange={onChange} />);
        await user.click(trigger());
        await user.click(day('miércoles 25 de noviembre'));
        await user.click(day('lunes 16 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-16', '');
        expect(panel()).toBeInTheDocument();
    });

    it('cerrar con solo el inicio deja el vencimiento sin definir (igual con ratón, teclado o clic fuera)', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<><Range onChange={onChange} /><button type="button">Afuera</button></>);

        await user.click(trigger());
        await user.click(day('jueves 19 de noviembre'));
        await user.click(screen.getByRole('button', { name: 'Listo' }));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-19', '');
        expect(trigger()).toHaveTextContent('Sin definir');

        await user.click(trigger());
        await user.keyboard('{Escape}');
        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Afuera' }));
        expect(onChange).toHaveBeenCalledTimes(1); // abrir y cerrar no cambia las fechas
    });

    it('editar sin tocar nada conserva un vencimiento vacío', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range initialStart="2026-11-19" onChange={onChange} />);
        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Listo' }));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('con vencimiento y sin inicio, lo muestra y elegir el inicio no lo borra', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range initialEnd="2026-11-25" onChange={onChange} />);
        expect(trigger()).toHaveTextContent('25/11/2026');
        expect(screen.getByRole('button', { name: 'Quitar fechas' })).toBeInTheDocument();

        await user.click(trigger());
        await user.click(day('viernes 20 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-20', '2026-11-25');
        expect(panel()).not.toBeInTheDocument();
    });

    it('el nombre accesible incluye las fechas elegidas', () => {
        render(<Range initialStart="2026-11-19" initialEnd="2026-11-25" />);
        expect(screen.getByRole('button', {
            name: 'Fechas de ejecución inicio 19/11/2026, vencimiento 25/11/2026, 7 días',
        })).toBeInTheDocument();
    });

    it('el atajo "Esta semana" va de hoy al sábado', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range onChange={onChange} />);
        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Esta semana' }));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-17', '2026-11-21');
        expect(panel()).not.toBeInTheDocument();
    });

    it('la X quita ambas fechas', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range initialStart="2026-11-19" initialEnd="2026-11-25" onChange={onChange} />);
        await user.click(screen.getByRole('button', { name: 'Quitar fechas' }));
        expect(onChange).toHaveBeenLastCalledWith('', '');
        expect(trigger()).toHaveTextContent('Selecciona inicio y vencimiento');
    });

    it('se puede usar solo con teclado (flechas, Av Pág y Enter)', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Range onChange={onChange} />);

        trigger().focus();
        await user.keyboard('{Enter}');
        expect(day('martes 17 de noviembre')).toHaveFocus();

        await user.keyboard('{ArrowRight}{ArrowRight}{Enter}');
        expect(onChange).toHaveBeenLastCalledWith('2026-11-19', '');

        await user.keyboard('{PageDown}');
        expect(day('sábado 19 de diciembre')).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(onChange).toHaveBeenLastCalledWith('2026-11-19', '2026-12-19');
        expect(trigger()).toHaveFocus();
    });

    it('Escape cierra el calendario sin llegar al modal que lo contiene', async () => {
        const user = userEvent.setup();
        const modalEscape = vi.fn();
        // Simula el cierre por Escape de useDialog (escucha en document)
        const Host = () => {
            useEffect(() => {
                const onKey = (e) => { if (e.key === 'Escape') modalEscape(); };
                document.addEventListener('keydown', onKey);
                return () => document.removeEventListener('keydown', onKey);
            }, []);
            return <Range />;
        };
        render(<Host />);

        await user.click(trigger());
        await user.keyboard('{Escape}');
        expect(panel()).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
        expect(modalEscape).not.toHaveBeenCalled();

        // Con el calendario cerrado, Escape sí le corresponde al modal
        await user.keyboard('{Escape}');
        expect(modalEscape).toHaveBeenCalledTimes(1);
    });

    it('clic fuera cierra el calendario', async () => {
        const user = userEvent.setup();
        render(<><Range /><button type="button">Afuera</button></>);
        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Afuera' }));
        expect(panel()).not.toBeInTheDocument();
    });
});

describe('DateRangeField (pantalla ancha: dos meses)', () => {
    let originalMatchMedia;
    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        window.matchMedia = (query) => ({ matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} });
    });
    afterEach(() => { window.matchMedia = originalMatchMedia; });

    it('muestra el mes actual y el siguiente', async () => {
        const user = userEvent.setup();
        render(<Range />);
        await user.click(trigger());
        expect(screen.getByText('noviembre 2026')).toBeInTheDocument();
        expect(screen.getByText('diciembre 2026')).toBeInTheDocument();
    });

    it('con teclado, pasar al segundo mes no mueve la vista; salir de ella sí', async () => {
        const user = userEvent.setup();
        render(<Range />);
        trigger().focus();
        await user.keyboard('{Enter}{PageDown}');
        expect(day('jueves 17 de diciembre')).toHaveFocus();
        expect(screen.getByText('noviembre 2026')).toBeInTheDocument(); // diciembre ya estaba visible

        await user.keyboard('{PageDown}');
        expect(day('domingo 17 de enero de 2027')).toHaveFocus();
        expect(screen.queryByText('noviembre 2026')).not.toBeInTheDocument();
        expect(screen.getByText('diciembre 2026')).toBeInTheDocument(); // enero queda a la derecha
        expect(screen.getByText('enero 2027')).toBeInTheDocument();
    });
});

describe('DateRangeField (un día, sin futuro)', () => {
    it('no permite elegir días futuros', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Single onChange={onChange} />);
        await user.click(trigger(/^Día/));

        const tomorrow = day('miércoles 18 de noviembre');
        expect(tomorrow).toHaveAttribute('aria-disabled', 'true');
        expect(tomorrow).toHaveAccessibleName(/no disponible/);
        await user.click(tomorrow);
        expect(onChange).not.toHaveBeenCalled();
        expect(panel()).toBeInTheDocument();
    });

    it('elige un día pasado y cierra', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Single onChange={onChange} />);
        await user.click(trigger(/^Día/));
        await user.click(day('lunes 9 de noviembre'));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-09');
        expect(panel()).not.toBeInTheDocument();
        expect(trigger(/^Día/)).toHaveTextContent('09/11/2026');
    });

    it('el atajo "Ayer" elige el día anterior', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Single onChange={onChange} />);
        await user.click(trigger(/^Día/));
        expect(screen.queryByRole('button', { name: 'Mañana' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Ayer' }));
        expect(onChange).toHaveBeenLastCalledWith('2026-11-16');
    });
});
