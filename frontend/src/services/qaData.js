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

// Estado del API (código) <-> etiqueta que muestra la interfaz
export const STATUS_LABELS = {
    PENDIENTE: 'PENDIENTE',
    EN_PROGRESO: 'EN PROGRESO',
    EN_REVISION: 'EN REVISIÓN',
    COMPLETADA: 'COMPLETADA',
    BLOQUEADA: 'BLOQUEADA',
};
export const STATUS_CODES = Object.fromEntries(Object.entries(STATUS_LABELS).map(([code, label]) => [label, code]));

// Aspecto de cada estado (lo usan el calendario y el cronograma para verse igual)
export const STATUS_CONFIG = {
    'PENDIENTE':   { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', border: 'border-slate-200', hover: 'hover:bg-slate-200' },
    'EN PROGRESO': { color: 'text-[#0b5a8c]', bg: 'bg-[#1296E8]/10', dot: 'bg-[#0e71af]', border: 'border-[#1296E8]/20', hover: 'hover:bg-[#1296E8]/20' },
    'EN REVISIÓN': { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
    'COMPLETADA':  { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
    'BLOQUEADA':   { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200', hover: 'hover:bg-red-100' }
};

// Horas utilizadas: campo nuevo; si el servidor aún no tiene la migración se usa el campo anterior
export const loggedHoursOf = (t) => parseFloat(t.horas_utilizadas ?? t.estimacion_min_hrs ?? 0) || 0;

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
        // estimacion_max_hrs guarda la estimación única; horas_utilizadas, las horas reales
        const estimated = parseFloat(t.estimacion_max_hrs || 0);
        const logged = loggedHoursOf(t);
        const calculatedProgress = estimated > 0 ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
        const finalProgress = t.completada ? 100 : calculatedProgress;

        // Estado real del API; si el servidor no lo envía, se infiere como antes
        let status = STATUS_LABELS[t.estado];
        if (!status) {
            status = 'PENDIENTE';
            if (t.completada) status = 'COMPLETADA';
            else if (logged > 0) status = 'EN PROGRESO';
        }

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
