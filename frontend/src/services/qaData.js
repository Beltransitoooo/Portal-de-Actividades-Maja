import { fetchWithAuth, readErrorMessage } from './authService';
import { listLeaders, listHours, getMe } from './qaApi';
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

// Obtiene equipo, actividades, líderes técnicos y horas por día, y los transforma para las vistas de QA
// (Gestor de actividades, Cronograma y Mi día). No toca estado de React.
export const fetchDashboardData = async () => {
    const [resUsers, resTasks, leaders, hoursRaw, me] = await Promise.all([
        fetchWithAuth('/usuarios/'),
        fetchWithAuth('/actividades/'),
        listLeaders(),
        listHours(),
        getMe(),
    ]);

    if (!resUsers.ok) {
        throw new Error(await readErrorMessage(resUsers, 'No se pudo cargar la información del equipo.'));
    }
    if (!resTasks.ok) {
        throw new Error(await readErrorMessage(resTasks, 'No se pudieron cargar las actividades.'));
    }
    const usersData = await resUsers.json();
    const tasksData = await resTasks.json();

    const formattedUsers = usersData.map((user, index) => ({
        raw_id: user.id,
        id: getInitials(user.name_users || user.usuario),
        name: user.name_users || user.usuario,
        role: user.es_admin ? 'Administrador' : 'QA Tester',
        isAdmin: Boolean(user.es_admin),
        theme: COLOR_PALETTES[index % COLOR_PALETTES.length],
        email: user.usuario
    }));

    // Horas reales agrupadas por actividad y por día
    const entriesByTask = new Map();
    for (const entry of hoursRaw) {
        if (!entriesByTask.has(entry.actividad_id)) entriesByTask.set(entry.actividad_id, []);
        entriesByTask.get(entry.actividad_id).push(entry);
    }

    const formattedTasks = tasksData.map(t => {
        const assignedUser = formattedUsers.find(u => u.raw_id === t.asignado_a_id);
        const leader = leaders.find(l => l.id === t.lider_catalogo_id);
        // estimacion_max_hrs guarda la estimación única; horas_utilizadas es la suma de las horas por día
        const estimated = parseFloat(t.estimacion_max_hrs || 0);
        const logged = parseFloat(t.horas_utilizadas || 0);
        const calculatedProgress = estimated > 0 ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
        const finalProgress = t.estado === 'COMPLETADA' ? 100 : calculatedProgress;

        const hoursEntries = entriesByTask.get(t.id) || [];
        const hoursByDate = {};
        for (const entry of hoursEntries) {
            hoursByDate[entry.fecha] = (hoursByDate[entry.fecha] || 0) + entry.horas;
        }

        return {
            db_id: t.id,
            id: `QA-${t.id}`,
            title: t.titulo,
            description: t.descripcion,
            status: STATUS_LABELS[t.estado] || 'PENDIENTE',
            priority: (t.prioridad || 'MEDIA').toUpperCase(),
            startDate: t.fecha_inicio,
            dueDate: t.fecha_vencimiento || t.fecha_inicio,
            loggedHours: logged,
            maxHours: estimated,
            progressPct: finalProgress,
            assignee: assignedUser ? assignedUser.id : 'NA',
            assignee_raw_id: t.asignado_a_id,
            assigneeName: assignedUser ? assignedUser.name : 'Sin asignar',
            leaderId: t.lider_catalogo_id,
            leaderName: leader ? leader.nombre : null,
            blockReason: t.motivo_bloqueo,
            hoursEntries,
            hoursByDate,
            type: t.tipo_actividad,
            completada: t.estado === 'COMPLETADA'
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

    return { teamUsers: usersWithStats, tasks: formattedTasks, leaders, me };
};
