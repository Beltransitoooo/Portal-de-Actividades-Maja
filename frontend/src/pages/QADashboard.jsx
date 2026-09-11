import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { QAHeader } from '../components/QA/QAHeader';
import { QAUserFilter } from '../components/QA/QAUserFilter';
import { QAKpiPanel } from '../components/QA/QAKpiPanel';
import { QACalendar } from '../components/QA/QACalendar';
import { QANewTicketModal } from '../components/QA/QANewTicketModal';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { fetchWithAuth } from '../services/authService'; 

export const QADashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [teamUsers, setTeamUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const colorPalettes = [
        { main: 'bg-[#1296E8]', light: 'bg-blue-50', border: 'border-[#1296E8]' },
        { main: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500' },
        { main: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-500' },
        { main: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-500' }
    ];

    const getInitials = (name) => {
        if (!name) return 'US';
        const words = name.trim().split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const loadRealData = async () => {
        setIsLoading(true);
        try {
            const resUsers = await fetchWithAuth('/usuarios/'); 
            let formattedUsers = [];
            if (resUsers.ok) {
                const usersData = await resUsers.json();
                formattedUsers = usersData.map((user, index) => ({
                    raw_id: user.id,
                    id: getInitials(user.name_users || user.usuario), 
                    name: user.name_users || user.usuario,
                    role: user.es_admin ? 'Administrador' : 'QA Tester',
                    theme: colorPalettes[index % colorPalettes.length],
                    email: user.usuario
                }));
            }

            const resTasks = await fetchWithAuth('/actividades/');
            if (resTasks.ok) {
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

                setTeamUsers(usersWithStats);
                setTasks(formattedTasks);
            }
        } catch (error) {
            console.error("Error al sincronizar datos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRealData();
    }, []);

    const handleStatusChange = async (task, newStatus) => {
        const isCompleted = newStatus === 'COMPLETADA';
        const updatedProgress = isCompleted ? 100 : task.progressPct; 
        
        const updatedTasks = tasks.map(t => 
            t.db_id === task.db_id ? { ...t, status: newStatus, completada: isCompleted, progressPct: updatedProgress } : t
        );
        setTasks(updatedTasks);

        try {
            await fetchWithAuth(`/actividades/${task.db_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completada: isCompleted })
            });
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            loadRealData(); 
        }
    };

    const handleTicketCreated = () => loadRealData();
    const filteredTasks = selectedUser ? tasks.filter(task => task.assignee === selectedUser) : tasks;
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8 animate-fade-in h-[calc(100vh-90px)] min-h-[880px]">
                
                {/* Sidebar */}
                <div className="w-full xl:w-72 shrink-0 h-full min-h-0 flex flex-col">
                    <QAUserFilter teamUsers={teamUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
                </div>

                {/* Contenedor Derecho */}
                <div className="flex-1 min-w-0 flex flex-col min-h-0 h-full">
                    
                    <div className="shrink-0">
                        <QAHeader 
                            onNewTicketClick={() => setIsModalOpen(true)}
                            currentDate={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                        />
                    </div>
                    
                    <div className="shrink-0">
                        <QAKpiPanel filteredTasks={filteredTasks} />
                    </div>
                    
                    {isLoading ? (
                        <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm mt-2">
                            <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#1296E8] rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase animate-pulse">Sincronizando con base de datos...</p>
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
            <QATicketPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onTicketUpdated={loadRealData} />
        </DashboardLayout>
    );
};