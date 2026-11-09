import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { QAHeader } from '../components/QA/QAHeader';
import { QAUserFilter } from '../components/QA/QAUserFilter';
import { QAKpiPanel } from '../components/QA/QAKpiPanel';
import { QACalendar } from '../components/QA/QACalendar';
import { QANewTicketModal } from '../components/QA/QANewTicketModal';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { fetchWithAuth, readErrorMessage, toUserMessage } from '../services/authService';
import { getInitials } from '../utils/initials';

const COLOR_PALETTES = [
    { main: 'bg-[#0e71af]', light: 'bg-blue-50', border: 'border-[#0e71af]' },
    { main: 'bg-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-500' },
    { main: 'bg-purple-700', light: 'bg-purple-50', border: 'border-purple-500' },
    { main: 'bg-amber-700', light: 'bg-amber-50', border: 'border-amber-500' }
];

// Obtiene equipo y actividades del API y los transforma para la vista (sin tocar estado de React)
const fetchDashboardData = async () => {
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
        const max = parseFloat(t.estimacion_max_hrs || 0);
        const logged = parseFloat(t.estimacion_min_hrs || 0);
        const calculatedProgress = max > 0 ? Math.min(Math.round((logged / max) * 100), 100) : 0;
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
            maxHours: max,
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

export const QADashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [teamUsers, setTeamUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('TODAS');
    const [actionError, setActionError] = useState(null);

    // Cambiar reloadKey vuelve a cargar los datos (reintento, alta o edición de actividades)
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey(k => k + 1);

    useEffect(() => {
        let active = true;
        const loadRealData = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await fetchDashboardData();
                if (!active) return;
                setTeamUsers(data.teamUsers);
                setTasks(data.tasks);
            } catch (error) {
                if (active) setLoadError(toUserMessage(error, 'No se pudo sincronizar con la base de datos.'));
            } finally {
                if (active) setIsLoading(false);
            }
        };
        loadRealData();
        // Evita actualizar estado si la vista se desmonta o se lanza otra carga
        return () => { active = false; };
    }, [reloadKey]);

    const handleStatusChange = async (task, newStatus) => {
        const isCompleted = newStatus === 'COMPLETADA';
        const updatedProgress = isCompleted ? 100 : task.progressPct; 
        
        const previousTasks = tasks;
        const updatedTasks = tasks.map(t =>
            t.db_id === task.db_id ? { ...t, status: newStatus, completada: isCompleted, progressPct: updatedProgress } : t
        );
        setTasks(updatedTasks);
        setActionError(null);

        try {
            const response = await fetchWithAuth(`/actividades/${task.db_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completada: isCompleted })
            });
            if (!response.ok) {
                throw new Error(await readErrorMessage(response, 'No se pudo actualizar el estado de la actividad.'));
            }
        } catch (error) {
            // Se revierte el cambio optimista para no mostrar un estado que no se guardó
            setTasks(previousTasks);
            setActionError(`${task.id}: ${toUserMessage(error, 'No se pudo actualizar el estado de la actividad.')}`);
        }
    };

    const handleTicketCreated = () => reload();
    const filteredTasks = tasks.filter(task => {
        if (selectedUser && task.assignee !== selectedUser) return false;
        if (statusFilter === 'ACTIVAS') return !task.completada;
        if (statusFilter === 'COMPLETADAS') return task.completada;
        return true;
    });
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8 animate-fade-in xl:h-[calc(100vh-90px)] xl:min-h-[1080px]">
                
                {/* Sidebar */}
                <div className="w-full xl:w-72 shrink-0 xl:h-full min-h-0 flex flex-col">
                    <QAUserFilter teamUsers={teamUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
                </div>

                {/* Contenedor Derecho */}
                <div className="flex-1 min-w-0 flex flex-col min-h-0 xl:h-full">
                    
                    <div className="shrink-0">
                        <QAHeader 
                            onNewTicketClick={() => setIsModalOpen(true)}
                            currentDate={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
                        />
                    </div>
                    
                    <div className="shrink-0">
                        <QAKpiPanel filteredTasks={filteredTasks} />
                    </div>
                    
                    {actionError && (
                        <div role="alert" className="shrink-0 flex items-start justify-between gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-2 rounded-md font-medium">
                            <span>{actionError}</span>
                            <button type="button" onClick={() => setActionError(null)} aria-label="Cerrar mensaje" className="text-red-400 hover:text-red-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm mt-2">
                            <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#0e71af] rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase animate-pulse">Sincronizando con base de datos...</p>
                        </div>
                    ) : loadError ? (
                        <div role="alert" className="w-full flex-1 min-h-0 flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-xl shadow-sm mt-2 p-6">
                            <p className="text-sm font-bold text-[#07152F]">No se pudo cargar la información</p>
                            <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                            <button type="button" onClick={reload} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-colors">
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <QACalendar 
                            tasks={filteredTasks} 
                            currentDate={currentDate} 
                            teamUsers={teamUsers}
                            onTicketClick={(ticket) => setSelectedTicket(ticket)} 
                            onStatusChange={handleStatusChange} 
                        />
                    )}
                </div>
            </div>

            <QANewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleTicketCreated} teamUsers={teamUsers} />
            <QATicketPanel key={selectedTicket?.db_id ?? 'sin-ticket'} ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onTicketUpdated={reload} />
        </DashboardLayout>
    );
};