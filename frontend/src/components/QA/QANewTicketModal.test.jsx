// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/qaApi', () => ({ createActivity: vi.fn(), updateActivity: vi.fn() }));
import { createActivity, updateActivity } from '../../services/qaApi';
import { QANewTicketModal } from './QANewTicketModal';

const teamUsers = [
    { raw_id: 10, name: 'Persona Uno' },
    { raw_id: 20, name: 'Persona Dos' },
];
// Persona Uno tiene la jornada llena del 18 al 20/11/2026 (21 h en 3 días hábiles)
const allTasks = [{
    db_id: 1, id: 'QA-1', title: 'Regresión', assignee_raw_id: 10, completada: false,
    startDate: '2026-11-18', dueDate: '2026-11-20', maxHours: 21,
}];

const renderModal = (props = {}) => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<QANewTicketModal teamUsers={teamUsers} allTasks={allTasks} isAdmin meId={10} onSubmit={onSubmit} onClose={onClose} {...props} />);
    return { onSubmit, onClose };
};

const day = (label) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

// Llena título, persona, rango 17–21/11 y 6 h estimadas
const fillBasics = async (user, { person = 'Persona Uno' } = {}) => {
    await user.type(screen.getByLabelText('Título'), 'Pruebas de pago');
    await user.selectOptions(screen.getByLabelText('Persona asignada'), person);
    await user.click(screen.getByRole('button', { name: /^Fechas de ejecución/ }));
    await user.click(day('martes 17 de noviembre'));
    await user.click(day('sábado 21 de noviembre'));
    await user.type(screen.getByLabelText(/Estimación de horas/), '6');
};

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));
    createActivity.mockReset();
    updateActivity.mockReset();
    createActivity.mockImplementation(async (payload) => ({ id: 99, ...payload }));
});
afterEach(() => vi.useRealTimers());

describe('QANewTicketModal: disponibilidad', () => {
    it('al elegir a la persona muestra su mini cronograma con la carga por día', async () => {
        const user = userEvent.setup();
        renderModal();
        expect(screen.queryByRole('region', { name: /Disponibilidad de/ })).not.toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Persona asignada'), 'Persona Uno');
        const strip = screen.getByRole('region', { name: 'Disponibilidad de Persona Uno' });
        expect(within(strip).getByText(/^miércoles 18 de noviembre de 2026: 7 de 7 h ocupadas, jornada llena\. Actividades: QA-1 Regresión/)).toBeInTheDocument();
        expect(within(strip).getByText(/^martes 17 de noviembre de 2026: 0 de 7 h ocupadas, libre/)).toBeInTheDocument();
        expect(within(strip).getByText(/^domingo 22 de noviembre de 2026: descanso/)).toBeInTheDocument();
    });

    it('el calendario marca los días ocupados de la persona', async () => {
        const user = userEvent.setup();
        renderModal();
        await user.selectOptions(screen.getByLabelText('Persona asignada'), 'Persona Uno');
        await user.click(screen.getByRole('button', { name: /^Fechas de ejecución/ }));
        expect(day('jueves 19 de noviembre')).toHaveAccessibleName(/jornada llena de la persona asignada/);
        expect(day('martes 17 de noviembre')).not.toHaveAccessibleName(/jornada llena/);
    });

    it('avisa de los días ocupados en el rango, pero permite guardarla completa', async () => {
        const user = userEvent.setup();
        const { onSubmit, onClose } = renderModal();
        await fillBasics(user);

        expect(screen.getByText(/Persona Uno tiene la jornada llena el 18\/11\/2026, 19\/11\/2026 y 20\/11\/2026/)).toBeInTheDocument();
        expect(screen.getByText(/es solo un aviso/)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Crear tarea' }));
        expect(createActivity).toHaveBeenCalledTimes(1);
        expect(createActivity).toHaveBeenCalledWith(expect.objectContaining({
            titulo: 'Pruebas de pago', fecha_inicio: '2026-11-17', fecha_vencimiento: '2026-11-21', estimacion_max_hrs: 6, asignado_a_id: 10,
        }));
        expect(onSubmit).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('sin días ocupados no muestra aviso ni opción de dividir', async () => {
        const user = userEvent.setup();
        renderModal();
        await fillBasics(user, { person: 'Persona Dos' });
        expect(screen.queryByText(/Aviso de disponibilidad/)).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
});

describe('QANewTicketModal: dividir sin los días ocupados', () => {
    it('crea una actividad por tramo con el título numerado y las horas repartidas', async () => {
        const user = userEvent.setup();
        const { onSubmit, onClose } = renderModal();
        await fillBasics(user);

        await user.click(screen.getByRole('checkbox', { name: /Dividir en 2 actividades sin los días ocupados/ }));
        const plan = screen.getByRole('list', { name: 'Actividades que se crearán' });
        expect(plan).toHaveTextContent('Parte 1/2:17/11/2026· 3.5 h');
        expect(plan).toHaveTextContent('Parte 2/2:21/11/2026· 2.5 h');

        await user.click(screen.getByRole('button', { name: 'Crear 2 actividades' }));
        expect(createActivity).toHaveBeenCalledTimes(2);
        expect(createActivity).toHaveBeenNthCalledWith(1, expect.objectContaining({
            titulo: 'Pruebas de pago (parte 1/2)', fecha_inicio: '2026-11-17', fecha_vencimiento: '2026-11-17', estimacion_max_hrs: 3.5, asignado_a_id: 10,
        }));
        expect(createActivity).toHaveBeenNthCalledWith(2, expect.objectContaining({
            titulo: 'Pruebas de pago (parte 2/2)', fecha_inicio: '2026-11-21', fecha_vencimiento: '2026-11-21', estimacion_max_hrs: 2.5,
        }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalled();
    });

    it('si una parte falla, avisa y el reintento crea solo las que faltan', async () => {
        const user = userEvent.setup();
        createActivity
            .mockImplementationOnce(async (p) => ({ id: 1, ...p }))
            .mockImplementationOnce(async () => { throw new Error('Servidor no disponible'); });
        const { onSubmit, onClose } = renderModal();
        await fillBasics(user);
        await user.click(screen.getByRole('checkbox', { name: /Dividir en 2 actividades/ }));
        await user.click(screen.getByRole('button', { name: 'Crear 2 actividades' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Se crearon 1 de 2 actividades. Servidor no disponible');
        expect(onSubmit).toHaveBeenCalledTimes(1); // recarga para mostrar la parte creada
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('list', { name: 'Actividades que se crearán' })).toHaveTextContent('(creada)');

        await user.click(screen.getByRole('button', { name: 'Crear 1 actividad' }));
        expect(createActivity).toHaveBeenCalledTimes(3);
        expect(createActivity).toHaveBeenLastCalledWith(expect.objectContaining({ titulo: 'Pruebas de pago (parte 2/2)', fecha_inicio: '2026-11-21' }));
        expect(onClose).toHaveBeenCalled();
    });

    it('si los días ocupados quedan en un extremo, ofrece ajustar las fechas (una sola actividad)', async () => {
        const user = userEvent.setup();
        renderModal();
        await user.type(screen.getByLabelText('Título'), 'Ajuste');
        await user.selectOptions(screen.getByLabelText('Persona asignada'), 'Persona Uno');
        await user.click(screen.getByRole('button', { name: /^Fechas de ejecución/ }));
        await user.click(day('lunes 16 de noviembre'));
        await user.click(day('miércoles 18 de noviembre'));

        await user.click(screen.getByRole('checkbox', { name: 'Ajustar las fechas sin los días ocupados' }));
        await user.click(screen.getByRole('button', { name: 'Crear tarea' }));
        expect(createActivity).toHaveBeenCalledTimes(1);
        expect(createActivity).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Ajuste', fecha_inicio: '2026-11-16', fecha_vencimiento: '2026-11-17' }));
    });
});

describe('QANewTicketModal: edición', () => {
    const ticket = {
        db_id: 1, id: 'QA-1', title: 'Regresión', type: 'Tarea', priority: 'MEDIA', assignee_raw_id: 10,
        startDate: '2026-11-18', dueDate: '2026-11-20', maxHours: 21, description: '',
    };

    it('no cuenta la propia actividad como ocupación ni ofrece dividir', async () => {
        renderModal({ ticket, allTasks });
        expect(screen.queryByText(/tiene la jornada llena/)).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        const strip = screen.getByRole('region', { name: 'Disponibilidad de Persona Uno' });
        expect(within(strip).getByText(/^miércoles 18 de noviembre de 2026: 0 de 7 h ocupadas/)).toBeInTheDocument();
    });

    it('avisa si choca con otra actividad, pero no permite dividir al editar', () => {
        const otra = { ...allTasks[0], db_id: 2, id: 'QA-2', title: 'Otra' };
        renderModal({ ticket, allTasks: [...allTasks, otra] });
        expect(screen.getByText(/Persona Uno tiene la jornada llena/)).toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
});

describe('QANewTicketModal: división a medias (no duplicar)', () => {
    it('tras crear una parte y fallar la siguiente, bloquea persona, fechas y casilla', async () => {
        const user = userEvent.setup();
        createActivity
            .mockImplementationOnce(async (p) => ({ id: 1, ...p }))
            .mockImplementationOnce(async () => { throw new Error('Servidor no disponible'); });
        renderModal();
        await fillBasics(user);
        await user.click(screen.getByRole('checkbox', { name: /Dividir en 2 actividades/ }));
        await user.click(screen.getByRole('button', { name: 'Crear 2 actividades' }));

        expect(screen.getByLabelText('Persona asignada')).toBeDisabled();
        expect(screen.getByRole('button', { name: /^Fechas de ejecución/ })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: /Dividir en 2 actividades/ })).toBeDisabled();
        expect(screen.getByText(/Ya se crearon 1 de 2/)).toBeInTheDocument();
    });

    it('sin persona asignada no se divide aunque la casilla haya quedado marcada', async () => {
        const user = userEvent.setup();
        renderModal();
        await fillBasics(user);
        await user.click(screen.getByRole('checkbox', { name: /Dividir en 2 actividades/ }));
        await user.selectOptions(screen.getByLabelText('Persona asignada'), 'Sin asignar');
        await user.click(screen.getByRole('button', { name: 'Crear tarea' }));
        expect(createActivity).toHaveBeenCalledTimes(1);
        expect(createActivity).toHaveBeenCalledWith(expect.objectContaining({ fecha_inicio: '2026-11-17', fecha_vencimiento: '2026-11-21' }));
    });
});
