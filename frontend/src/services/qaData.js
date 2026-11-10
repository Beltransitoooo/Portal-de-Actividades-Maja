import { fetchWithAuth, readErrorMessage } from './authService';
import { getInitials } from '../utils/initials';

// Colores de identidad por integrante (orden fijo por índice de usuario).
// Paleta verificada: separación para daltonismo y contraste AA sobre fondo claro y oscuro.
export const COLOR_PALETTES = [
    { main: 'bg-[#0e71af]', light: 'bg-blue-50', border: 'border-[#0e71af]' },
    { main: 'bg-green-700', light: 'bg-green-50', border: 'border-green-700' },
    { main: 'bg-purple-700', light: 'bg-purple-50', border: 'border-purple-500' },
    { main: 'bg-amber-700', light: 'bg-amber-50', border: 'border-amber-500' }
];

// Obtiene equipo y actividades del API y los transforma para las vistas de QA
// (Gestor de actividades y Cronograma). No toca estado de React.
export const fetchDashboardData = async () => {
    const resUsers = await fetchWithAuth('/usuarios/');
    if (!resUsers.ok) {
        throw new Error(await readErrorMessage(resUsers, 'No se pudo cargar la información del equipo.'));
    }
    const usersData = await resUsers.json();
    const formattedUsers = usersData.map((user, index) => ({
        raw_id: user.id,
        id: getInitials(user.name_users || user.usuario),
        name: user.name_users || user.usuario,
        role: user.es_admin ? 'Administrador' : 'QA Tester',
        theme: COLOR_PALETTES[index % COLOR_PALETTES.length],
        email: user.usuario
    }));

    const resTasks = await fetchWithAuth('/actividades/');
    if (!resTasks.ok) {
        throw new Error(await readErrorMessage(resTasks, 'No se pudieron cargar las actividades.'));
    }
    const tasksData = await resTasks.json();

    const formattedTasks = tasksData.map(t => {
        const assignedUser = formattedUsers.find(u => u.raw_id === t.asignado_a_id);
        // estimacion_max_hrs guarda la estimación única; estimacion_min_hrs acumula las horas utilizadas
        const estimated = parseFloat(t.estimacion_max_hrs || 0);
        const logged = parseFloat(t.estimacion_min_hrs || 0);
        const calculatedProgress = estimated > 0 ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
        const finalProgress = t.completada ? 100 : calculatedProgress;

        let status = 'PENDIENTE';
        if (t.completada) status = 'COMPLETADA';
        else if (logged > 0) status = 'EN PROGRESO';

        return {
            db_id: t.id,
            id: `QA-${t.id}`,
            title: t.titulo,
            description: t.descripcion,
            status: status,
            priority: (t.prioridad || 'MEDIA').toUpperCase(),
            startDate: t.fecha_inicio,
            dueDate: t.fecha_vencimiento || t.fecha_inicio,
            minHours: logged,
            maxHours: estimated,
            progressPct: finalProgress,
            assignee: assignedUser ? assignedUser.id : 'NA',
            assignee_raw_id: t.asignado_a_id,
            type: t.tipo_actividad,
            completada: t.completada
        };
    });

    const usersWithStats = formattedUsers.map(user => {
        const userTasks = formattedTasks.filter(t => t.assignee_raw_id === user.raw_id);
        const tasksCount = userTasks.length;
        const avgProgress = tasksCount > 0
            ? Math.round(userTasks.reduce((sum, task) => sum + task.progressPct, 0) / tasksCount)
            : 0;

        return { ...user, tasksCount, progressPct: avgProgress };
    });

    return { teamUsers: usersWithStats, tasks: formattedTasks };
};
