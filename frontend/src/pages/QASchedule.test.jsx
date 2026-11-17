// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Se aísla la página: datos simulados y sin layout, panel lateral ni llamadas a la API
const qaData = { current: null };
vi.mock('../hooks/useQAData', () => ({ useQAData: () => qaData.current }));
vi.mock('../layouts/DashboardLayout', () => ({ DashboardLayout: ({ children }) => <div>{children}</div> }));
vi.mock('../components/QA/QATicketPanel', () => ({ QATicketPanel: () => null }));
vi.mock('../services/qaApi', () => ({ listHistory: vi.fn(() => Promise.resolve([])) }));

import { QASchedule } from './QASchedule';

const task = (over) => ({
    db_id: 1, id: 'QA-1', title: 'Actividad', status: 'PENDIENTE', priority: 'MEDIA', type: 'Tarea',
    startDate: '2026-11-16', dueDate: '2026-11-20', maxHours: 8, loggedHours: 0,
    assignee: 'QP', assignee_raw_id: 10, assigneeName: 'QA Prueba', leaderName: null,
    hoursEntries: [], hoursByDate: {}, completada: false, ...over,
});

const tasks = [
    task({ db_id: 1, id: 'QA-1', title: 'Activa en progreso', status: 'EN PROGRESO', loggedHours: 3, hoursByDate: { '2026-11-16': 3 } }),
    task({ db_id: 2, id: 'QA-2', title: 'Activa pendiente' }),
    task({ db_id: 3, id: 'QA-3', title: 'Ya completada', status: 'COMPLETADA', completada: true, loggedHours: 4, hoursByDate: { '2026-11-10': 4 }, startDate: '2026-11-09', dueDate: '2026-11-12' }),
];

const renderPage = () => render(<MemoryRouter><QASchedule /></MemoryRouter>);

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));
    qaData.current = {
        teamUsers: [{ raw_id: 10, name: 'QA Prueba', theme: { main: 'bg-slate-600' } }],
        tasks, leaders: [], me: { id: 10, es_admin: true }, isLoading: false, loadError: null, reload: vi.fn(),
    };
});
afterEach(() => vi.useRealTimers());

describe('QASchedule', () => {
    it('las completadas salen de la línea de tiempo', () => {
        renderPage();
        expect(screen.getByRole('button', { name: /^QA-1: Activa en progreso/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^QA-2: Activa pendiente/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^QA-3: Ya completada/ })).not.toBeInTheDocument();
    });

    it('ya no muestra la fila de carga planeada, pero sí la de horas reales', () => {
        renderPage();
        expect(screen.queryByText(/Carga planeada/i)).not.toBeInTheDocument();
        // Encabezado de la fila (el texto "horas reales" también aparece en etiquetas para lectores de pantalla)
        expect(screen.getByText((_, el) => el?.textContent === 'Horas reales(h por día)')).toBeInTheDocument();
    });

    it('el resumen del mes sigue contando las completadas', () => {
        renderPage();
        expect(screen.getByText('Completadas').parentElement).toHaveTextContent('1/3');
    });

    it('el botón Historial indica cuántas hay y abre el modal con ellas', async () => {
        const user = userEvent.setup();
        renderPage();
        const button = screen.getByRole('button', { name: /Historial/ });
        expect(button).toHaveTextContent('(1)');

        await user.click(button);
        const dialog = screen.getByRole('dialog', { name: 'Historial del cronograma' });
        expect(within(dialog).getByText('Ya completada')).toBeInTheDocument();
        expect(within(dialog).queryByText('Activa pendiente')).not.toBeInTheDocument();
    });

    it('si todo el mes está completado, lo indica y ofrece ver el historial', async () => {
        const user = userEvent.setup();
        qaData.current = { ...qaData.current, tasks: [tasks[2]] };
        renderPage();
        expect(screen.getByText(/Todas las actividades de noviembre están completadas/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Ver historial' }));
        expect(screen.getByRole('dialog', { name: 'Historial del cronograma' })).toBeInTheDocument();
    });
});
