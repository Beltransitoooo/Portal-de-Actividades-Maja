import { useState } from 'react';
import { X, CalendarOff } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { QAHeader } from '../components/QA/QAHeader';
import { QAUserFilter } from '../components/QA/QAUserFilter';
import { QAKpiPanel } from '../components/QA/QAKpiPanel';
import { QACalendar } from '../components/QA/QACalendar';
import { QANewTicketModal } from '../components/QA/QANewTicketModal';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { ActivityFilters } from '../components/QA/ActivityFilters';
import { useQAData } from '../hooks/useQAData';
import { useActivityFilters } from '../hooks/useActivityFilters';
import { useStatusChange } from '../hooks/useStatusChange';
import { updateActivity } from '../services/qaApi';
import { STATUS_CODES } from '../services/qaData';
import { toUserMessage } from '../services/authService';

export const QADashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('TODAS');
    const [actionError, setActionError] = useState(null);

    const { teamUsers, tasks, leaders, me, setTasks, isLoading, loadError, reload } = useQAData();
    const { filters, setFilter, reset, matches, activeCount } = useActivityFilters();

    // La actividad abierta siempre se toma de los datos cargados, así el panel refleja cada cambio
    const selectedTicket = tasks.find(t => t.db_id === selectedTicketId) ?? null;

    const applyStatus = async (task, newStatus, reason) => {
        const isCompleted = newStatus === 'COMPLETADA';
        const previousTasks = tasks;
        setTasks(current => current.map(t =>
            t.db_id === task.db_id
                ? { ...t, status: newStatus, completada: isCompleted, progressPct: isCompleted ? 100 : t.progressPct, blockReason: newStatus === 'BLOQUEADA' ? reason : null }
                : t
        ));
        setActionError(null);

        try {
            const body = { estado: STATUS_CODES[newStatus] };
            if (reason) body.motivo_bloqueo = reason;
            await updateActivity(task.db_id, body);
            reload();
        } catch (error) {
            // Se revierte el cambio optimista para no mostrar un estado que no se guardó
            setTasks(previousTasks);
            setActionError(`${task.id}: ${toUserMessage(error, 'No se pudo actualizar el estado de la actividad.')}`);
        }
    };
    // Pasar a "Bloqueada" pide primero el motivo
    const [requestStatusChange, blockDialog] = useStatusChange(applyStatus);

    const filteredTasks = tasks.filter(task => {
        if (selectedUser && task.assignee_raw_id !== selectedUser) return false;
        if (statusFilter === 'ACTIVAS' && task.completada) return false;
        if (statusFilter === 'COMPLETADAS' && !task.completada) return false;
        return matches(task);
    });
    // Sin fecha de inicio no caben en el calendario: se listan aparte para poder abrirlas
    const undatedTasks = filteredTasks.filter(task => !task.startDate);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-5 animate-fade-in xl:h-[calc(100vh-112px)] xl:min-h-[620px]">

                {/* Sidebar (en móvil va al final para que el título y el calendario se vean primero) */}
                <div className="order-last xl:order-none w-full xl:w-72 shrink-0 xl:h-full min-h-0 flex flex-col">
                    <QAUserFilter teamUsers={teamUsers} tasks={tasks} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
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

                    <div className="shrink-0 mb-3">
                        <ActivityFilters filters={filters} setFilter={setFilter} reset={reset} activeCount={activeCount} resultCount={filteredTasks.length} />
                    </div>

                    <div className="shrink-0">
                        <QAKpiPanel filteredTasks={filteredTasks} />
                    </div>

                    {!isLoading && !loadError && undatedTasks.length > 0 && (
                        <section aria-labelledby="sin-fechas-titulo" className="shrink-0 bg-amber-50/60 border border-amber-200 rounded-xl px-4 py-3 mb-3">
                            <h2 id="sin-fechas-titulo" className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <CalendarOff className="w-3.5 h-3.5" aria-hidden="true" />
                                Sin fechas ({undatedTasks.length}) · no aparecen en el calendario
                            </h2>
                            <ul className="flex flex-wrap gap-2">
                                {undatedTasks.map(task => (
                                    <li key={task.db_id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTicketId(task.db_id)}
                                            className="max-w-[260px] h-8 px-3 bg-white border border-amber-200 hover:border-amber-400 rounded-lg text-[11px] font-semibold text-[#07152F] flex items-center gap-2 transition-colors"
                                        >
                                            <span className="text-[9px] font-black text-gray-500 shrink-0">{task.id}</span>
                                            <span className="truncate">{task.title}</span>
                                            <span className="sr-only">, {task.status}. Abrir para asignarle fechas</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {actionError && (
                        <div role="alert" className="shrink-0 flex items-start justify-between gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-2 rounded-md font-medium">
                            <span>{actionError}</span>
                            <button type="button" onClick={() => setActionError(null)} aria-label="Cerrar mensaje" className="text-red-400 hover:text-red-700 transition-colors">
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
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
                            onTicketClick={(ticket) => setSelectedTicketId(ticket.db_id)}
                            onStatusChange={requestStatusChange}
                        />
                    )}
                </div>
            </div>

            {isModalOpen && (
                <QANewTicketModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={reload}
                    teamUsers={teamUsers}
                    leaders={leaders}
                    isAdmin={Boolean(me?.es_admin)}
                    meId={me?.id ?? null}
                />
            )}
            <QATicketPanel
                allTasks={tasks}
                key={selectedTicket?.db_id ?? 'sin-ticket'}
                ticket={selectedTicket}
                onClose={() => setSelectedTicketId(null)}
                onTicketUpdated={reload}
                onDeleted={reload}
                leaders={leaders}
                teamUsers={teamUsers}
                me={me}
            />
            {blockDialog}
        </DashboardLayout>
    );
};
