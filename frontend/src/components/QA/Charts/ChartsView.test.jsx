// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const qa = { current: null };
vi.mock('../../../hooks/useQAData', () => ({ useQAData: () => qa.current }));
vi.mock('../../../services/qaApi', () => ({ listClosures: vi.fn(), listAreas: vi.fn() }));
vi.mock('../../../utils/print', () => ({ printPage: vi.fn() }));
vi.mock('../../../utils/csv', async (importOriginal) => ({ ...(await importOriginal()), downloadCsv: vi.fn() }));
import { listClosures, listAreas } from '../../../services/qaApi';
import { printPage } from '../../../utils/print';
import { downloadCsv } from '../../../utils/csv';
import { ChartsView } from './ChartsView';

// Hoy: martes 17/11/2026 → sprint actual = Q4 - Semana 7 (12/11 al 18/11)
const users = [
    { raw_id: 1, name: 'Admin Prueba' },
    { raw_id: 10, name: 'Persona Uno' },
    { raw_id: 20, name: 'Persona Dos' },
];
const task = (over) => ({
    db_id: 1, id: 'QA-1', title: 'A', assignee_raw_id: 10, status: 'EN PROGRESO', priority: 'ALTA', type: 'Tarea', areaId: 5,
    startDate: '2026-11-16', dueDate: '2026-11-20', maxHours: 10, loggedHours: 0, hoursByDate: {}, completada: false, ...over,
});
const tasks = [
    // 10 h de lunes 16 a viernes 20: 2 h por día → 6 h dentro del sprint (16, 17 y 18)
    task({ db_id: 1, id: 'QA-1', loggedHours: 4, hoursByDate: { '2026-11-17': 4 } }),
    // 50 h → 10 h por día → 30 h en el sprint
    task({ db_id: 2, id: 'QA-2', assignee_raw_id: 20, maxHours: 50, status: 'PENDIENTE' }),
    // Completada el 18/11 (a tiempo), 6 h estimadas y 8 reales
    task({ db_id: 3, id: 'QA-3', status: 'COMPLETADA', completada: true, dueDate: '2026-11-18', maxHours: 6, loggedHours: 8, hoursByDate: { '2026-11-16': 8 } }),
    // Histórica: septiembre, completada con retraso
    task({ db_id: 4, id: 'QA-4', status: 'COMPLETADA', completada: true, startDate: '2026-09-07', dueDate: '2026-09-09', maxHours: 4, loggedHours: 5, hoursByDate: { '2026-09-10': 5 } }),
];

const setup = ({ admin = true } = {}) => {
    qa.current = {
        teamUsers: users, tasks, me: admin ? { id: 1, es_admin: true } : { id: 10, es_admin: false },
        isLoading: false, loadError: null, reload: vi.fn(),
    };
    return userEvent.setup();
};
const table = async (user, title) => {
    const card = screen.getByRole('figure', { name: title });
    await user.click(within(card).getByRole('button', { name: 'Ver tabla' }));
    return within(card).getByRole('table');
};
const tile = (label) => screen.getByText(label).parentElement;

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));
    listClosures.mockReset().mockResolvedValue([
        { actividad_id: 3, fecha_cierre: '2026-11-18T18:00:00' },
        { actividad_id: 4, fecha_cierre: '2026-09-11T18:00:00' },
    ]);
    listAreas.mockReset().mockResolvedValue([{ id: 5, nombre: 'QA' }]);
    downloadCsv.mockReset();
    printPage.mockReset();
});
afterEach(() => vi.useRealTimers());

describe('ChartsView: vista general — sprint actual (por defecto)', () => {
    it('muestra el sprint actual y lo resume con indicadores', async () => {
        setup();
        render(<ChartsView />);
        expect(screen.getByRole('button', { name: 'Sprint actual' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('Sprint actual: Q4 - Semana 7, 12/11/2026 – 18/11/2026')).toBeInTheDocument();
        expect(tile('Actividades en el periodo')).toHaveTextContent('3');
        expect(tile('Horas estimadas')).toHaveTextContent('42 h'); // 6 + 30 + 6
        expect(tile('Horas reales')).toHaveTextContent('12 h'); // 4 + 8
        expect(await screen.findByText('1 de 1 completada')).toBeInTheDocument();
    });

    it('en un sprint las gráficas en el tiempo van por día', async () => {
        const user = setup();
        render(<ChartsView />);
        expect(screen.getByRole('figure', { name: /Horas por día/ })).toBeInTheDocument();
        const rows = within(await table(user, /Horas por día/)).getAllByRole('row').slice(1);
        expect(rows).toHaveLength(7);
        expect(rows[0]).toHaveTextContent('12/11/2026');
    });

    it('agrega pasteles con porcentaje junto a las barras de distribución', () => {
        setup();
        render(<ChartsView />);
        const card = screen.getByRole('figure', { name: 'Por estado' });
        const pct = within(card).getByRole('list', { name: 'Porcentajes' });
        expect(pct).toHaveTextContent('EN PROGRESO');
        expect(pct).toHaveTextContent('33.3%');
        expect(pct).toHaveTextContent('1 actividad');
    });

    it('pastel de entregas a tiempo frente a con retraso', async () => {
        setup();
        render(<ChartsView />);
        await screen.findByText('1 de 1 completada');
        const card = screen.getByRole('figure', { name: /a tiempo vs con retraso/ });
        const pct = within(card).getByRole('list', { name: 'Porcentajes' });
        expect(pct).toHaveTextContent('A tiempo');
        expect(pct).toHaveTextContent('100%');
        expect(pct).toHaveTextContent('1 entrega');
    });

    it('muestra la carga de cada persona, ordenada de mayor a menor', async () => {
        const user = setup();
        render(<ChartsView />);
        const rows = within(await table(user, /Carga vs capacidad/)).getAllByRole('row').slice(1).map(r => r.textContent);
        expect(rows.map(r => r.split(/\d/)[0])).toEqual(['Persona Dos', 'Persona Uno', 'Admin Prueba']);
    });

    it('si fallan las fechas de cierre, sigue mostrando todo y lo avisa', async () => {
        listClosures.mockReset().mockRejectedValue(new Error('caído'));
        setup();
        render(<ChartsView />);
        expect(await screen.findByText(/No se pudieron cargar las fechas de cierre/)).toBeInTheDocument();
    });
});

describe('ChartsView: vista general — histórico', () => {
    it('cubre desde el primer dato hasta el último vencimiento', async () => {
        const user = setup();
        render(<ChartsView />);
        await screen.findByText('1 de 1 completada');
        await user.click(screen.getByRole('button', { name: 'Histórico' }));
        expect(screen.getByRole('button', { name: 'Histórico' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('Histórico: 07/09/2026 – 20/11/2026')).toBeInTheDocument();
        expect(tile('Actividades en el periodo')).toHaveTextContent('4');
        expect(screen.getByText('1 de 2 completadas')).toBeInTheDocument();
        expect(tile('Entregas a tiempo')).toHaveTextContent('50%');
        expect(screen.getByRole('figure', { name: /Horas por semana/ })).toBeInTheDocument(); // 11 semanas
    });

    it('solo hay dos periodos en la vista general', () => {
        setup();
        render(<ChartsView />);
        const periodo = screen.getByRole('group', { name: 'Periodo' });
        expect(within(periodo).getAllByRole('button').map(b => b.textContent)).toEqual(['Sprint actual', 'Histórico']);
    });
});

describe('ChartsView: vista por persona — solo sprint actual', () => {
    it('no ofrece histórico y siempre usa el sprint actual', async () => {
        const user = setup();
        render(<ChartsView />);
        await user.click(screen.getByRole('button', { name: 'Histórico' }));
        await user.click(screen.getByRole('button', { name: /Por persona/ }));
        await user.selectOptions(screen.getByLabelText('Persona'), 'Persona Uno');

        const periodo = screen.getByRole('group', { name: 'Periodo' });
        expect(within(periodo).queryByRole('button')).not.toBeInTheDocument();
        expect(periodo).toHaveTextContent('Sprint actual');
        expect(screen.getByText(/^Sprint actual: Q4 - Semana 7/)).toBeInTheDocument();
        expect(tile('Actividades en el periodo')).toHaveTextContent('2'); // QA-1 y QA-3 (QA-4 es histórica)
        expect(screen.getByRole('figure', { name: /Carga por día/ })).toBeInTheDocument();
    });

    it('al volver a la vista general conserva la elección de histórico', async () => {
        const user = setup();
        render(<ChartsView />);
        await user.click(screen.getByRole('button', { name: 'Histórico' }));
        await user.click(screen.getByRole('button', { name: /Por persona/ }));
        await user.click(screen.getByRole('button', { name: /General/ }));
        expect(screen.getByRole('button', { name: 'Histórico' })).toHaveAttribute('aria-pressed', 'true');
    });
});

describe('ChartsView: permisos (sin ser administrador)', () => {
    it('en la vista general solo ve su propia carga, sin la de sus compañeros ni áreas', async () => {
        const user = setup({ admin: false });
        render(<ChartsView />);
        expect(screen.getByRole('heading', { name: 'Vista general de tu área' })).toBeInTheDocument();
        const rows = within(await table(user, /Carga vs capacidad/)).getAllByRole('row').slice(1);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveTextContent('Persona Uno');
        expect(screen.queryByRole('figure', { name: 'Por área' })).not.toBeInTheDocument();
        expect(listAreas).not.toHaveBeenCalled();
    });

    it('"Mis estadísticas" muestra solo lo suyo y no permite elegir a otra persona', async () => {
        const user = setup({ admin: false });
        render(<ChartsView />);
        await user.click(screen.getByRole('button', { name: /Mis estadísticas/ }));
        expect(screen.queryByLabelText('Persona')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Estadísticas de Persona Uno' })).toBeInTheDocument();
    });
});

describe('ChartsView: exportar', () => {
    it('cada gráfica descarga su CSV con un nombre que dice el periodo', async () => {
        const user = setup();
        render(<ChartsView />);
        await user.click(screen.getByRole('button', { name: 'Descargar CSV: Por prioridad' }));
        const [name, csv] = downloadCsv.mock.calls[0];
        expect(name).toBe('por-prioridad-equipo-sprint-2026-11-12-a-2026-11-18.csv');
        expect(csv.split('\r\n')).toEqual(['Categoría,Actividades,%', 'Crítica,0,0%', 'Alta,3,100%', 'Media,0,0%', 'Baja,0,0%']);

        await user.click(screen.getByRole('button', { name: 'Histórico' }));
        await user.click(screen.getByRole('button', { name: 'Descargar CSV: Por prioridad' }));
        expect(downloadCsv.mock.calls[1][0]).toBe('por-prioridad-equipo-historico-2026-09-07-a-2026-11-20.csv');
    });

    it('PDF imprime la vista', async () => {
        const user = setup();
        render(<ChartsView />);
        await user.click(screen.getByRole('button', { name: /PDF/ }));
        expect(printPage).toHaveBeenCalledTimes(1);
    });
});

describe('ChartsView: historial de tareas (aparte de los filtros)', () => {
    const pies = () => {
        const section = screen.getByRole('region', { name: 'Historial de tareas' });
        return {
            sprint: within(within(section).getByRole('figure', { name: /^Sprint actual/ })).getByRole('list', { name: 'Porcentajes' }),
            historic: within(within(section).getByRole('figure', { name: /^Histórico/ })).getByRole('list', { name: 'Porcentajes' }),
        };
    };

    it('muestra al inicio el estado de las tareas del sprint actual y del histórico', () => {
        setup();
        render(<ChartsView />);
        const { sprint, historic } = pies();
        // Sprint: QA-1 en progreso, QA-2 pendiente, QA-3 completada
        expect(sprint).toHaveTextContent('Pendiente33.3%1 tarea');
        expect(sprint).toHaveTextContent('Completada33.3%1 tarea');
        // Histórico: además QA-4 completada
        expect(historic).toHaveTextContent('Completada50%2 tareas');
    });

    it('no cambia con los filtros de abajo ni con la vista por persona', async () => {
        const user = setup();
        render(<ChartsView />);
        const before = { sprint: pies().sprint.textContent, historic: pies().historic.textContent };
        await user.click(screen.getByRole('button', { name: 'Histórico' }));
        await user.click(screen.getByRole('button', { name: /Por persona/ }));
        await user.selectOptions(screen.getByLabelText('Persona'), 'Persona Dos');
        expect(pies().sprint.textContent).toBe(before.sprint);
        expect(pies().historic.textContent).toBe(before.historic);
    });

    it('cada estado conserva su color en los dos pasteles', () => {
        setup();
        render(<ChartsView />);
        const { sprint, historic } = pies();
        const colorOf = (list, label) => within(list).getByText(label).previousElementSibling.style.background;
        expect(colorOf(sprint, 'Completada')).toBe(colorOf(historic, 'Completada'));
        expect(colorOf(sprint, 'Pendiente')).toBe(colorOf(historic, 'Pendiente'));
    });
});
