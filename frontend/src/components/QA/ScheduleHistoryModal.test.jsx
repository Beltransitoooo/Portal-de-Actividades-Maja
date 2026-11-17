// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/qaApi', () => ({ listHistory: vi.fn() }));
import { listHistory } from '../../services/qaApi';
import { ScheduleHistoryModal } from './ScheduleHistoryModal';

const task = (over) => ({
    db_id: 1, id: 'QA-1', title: 'Actividad', assigneeName: 'Persona Prueba', leaderName: null,
    startDate: '2026-11-09', dueDate: '2026-11-14', maxHours: 6, loggedHours: 5,
    hoursByDate: { '2026-11-09': 2, '2026-11-10': 3 }, completada: true, ...over,
});

const onTime = task({ db_id: 1, id: 'QA-1', title: 'Cerrada a tiempo' });
const late = task({
    db_id: 2, id: 'QA-2', title: 'Cerrada tarde', dueDate: '2026-11-10', maxHours: 4, loggedHours: 5.5,
    hoursByDate: { '2026-11-09': 2, '2026-11-13': 3.5 },
});

const open = (tasks = [onTime, late]) => render(
    <ScheduleHistoryModal isOpen onClose={() => {}} tasks={tasks} monthLabel="noviembre 2026" />
);
const card = (title) => screen.getByText(title).closest('li');

// Cada prueba parte de una bitácora vacía; las que necesitan otra respuesta la definen ellas mismas
beforeEach(() => {
    listHistory.mockClear();
    listHistory.mockImplementation(() => Promise.resolve([]));
});

describe('ScheduleHistoryModal', () => {
    it('es un diálogo con título y el mes en contexto', () => {
        open();
        const dialog = screen.getByRole('dialog', { name: 'Historial del cronograma' });
        expect(dialog).toHaveTextContent('Completadas · noviembre 2026');
    });

    it('ordena primero lo cerrado más recientemente', () => {
        open();
        const titles = screen.getAllByRole('listitem').map(li => li.querySelector('p:nth-child(2)')?.textContent);
        expect(titles).toEqual(['Cerrada tarde', 'Cerrada a tiempo']);
    });

    it('resume plan contra real de una actividad a tiempo', () => {
        open();
        const c = within(card('Cerrada a tiempo'));
        expect(c.getByText('09/11/2026 – 14/11/2026')).toBeInTheDocument();
        expect(c.getByText('09/11/2026 – 10/11/2026')).toBeInTheDocument();
        expect(c.getByText('5 de 6 estimadas')).toBeInTheDocument();
        expect(c.getByText(/Dentro del plan/)).toBeInTheDocument();
        expect(c.getByText('Tomó 5h')).toBeInTheDocument();
    });

    it('señala retraso y horas de más', () => {
        open();
        const c = within(card('Cerrada tarde'));
        expect(c.getByText(/3 días después del vencimiento/)).toBeInTheDocument();
        expect(c.getByText('Tomó 5.5h (+1.5)')).toBeInTheDocument();
    });

    it('carga la bitácora solo al pedirla y muestra fechas DD/MM/AAAA', async () => {
        const user = userEvent.setup();
        listHistory.mockResolvedValue([
            { id: 10, campo: 'fecha_vencimiento', valor_anterior: '2026-11-09', valor_nuevo: '2026-11-10', usuario_nombre: 'Admin Prueba', creado: '2026-11-08T16:00:00' },
            { id: 11, campo: 'estado', valor_anterior: 'EN_REVISION', valor_nuevo: 'COMPLETADA', usuario_nombre: 'Persona Prueba', creado: '2026-11-13T18:00:00' },
        ]);
        open();
        expect(listHistory).not.toHaveBeenCalled();

        const c = within(card('Cerrada tarde'));
        const toggle = c.getByRole('button', { name: 'Ver movimientos' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await user.click(toggle);

        expect(listHistory).toHaveBeenCalledWith(2);
        expect(await c.findByText(/cambió el vencimiento de 09\/11\/2026 a 10\/11\/2026/)).toBeInTheDocument();
        expect(c.getByText(/cambió el estado de EN REVISIÓN a COMPLETADA/)).toBeInTheDocument();
        expect(c.getByRole('button', { name: 'Ocultar movimientos' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('muestra el error si la bitácora no carga', async () => {
        const user = userEvent.setup();
        listHistory.mockImplementation(() => {
            const failed = Promise.reject(new Error('fallo de red'));
            failed.catch(() => {}); // evita el aviso de rechazo sin manejar del propio mock
            return failed;
        });
        open([onTime]);
        await user.click(screen.getByRole('button', { name: 'Ver movimientos' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('fallo de red');
    });

    it('indica cuando no hay completadas', () => {
        open([]);
        expect(screen.getByText(/No hay actividades completadas en este mes/)).toBeInTheDocument();
    });
});
