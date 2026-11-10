import { useState, useId } from 'react';
import { X, Hourglass } from 'lucide-react';
import { createActivity, updateActivity } from '../../services/qaApi';
import { toUserMessage } from '../../services/authService';
import { useDialog } from '../../hooks/useDialog';

const PRIORITIES = ['Crítica', 'Alta', 'Media', 'Baja'];

// Formulario para crear una actividad o, si recibe `ticket`, para editarla.
// Se monta solo cuando está abierto, así cada apertura empieza con los valores correctos.
export const QANewTicketModal = ({ ticket = null, onClose, onSubmit, teamUsers = [], leaders = [], isAdmin = false, meId = null }) => {
    const isEdit = Boolean(ticket);

    const [title, setTitle] = useState(ticket?.title ?? '');
    const [type, setType] = useState(ticket?.type ?? 'Tarea');
    const [priority, setPriority] = useState(() => PRIORITIES.find(p => p.toUpperCase() === ticket?.priority) ?? 'Media');
    const [assigneeId, setAssigneeId] = useState(ticket?.assignee_raw_id ? String(ticket.assignee_raw_id) : '');
    const [leaderId, setLeaderId] = useState(ticket?.leaderId ? String(ticket.leaderId) : '');
    const [startDate, setStartDate] = useState(ticket?.startDate ?? '');
    const [dueDate, setDueDate] = useState(ticket?.dueDate ?? '');
    const [estimatedHours, setEstimatedHours] = useState(ticket?.maxHours ? String(ticket.maxHours) : '');
    const [description, setDescription] = useState(ticket?.description ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const dialogRef = useDialog(true, onClose);
    const uid = useId();
    const ids = {
        heading: `${uid}-heading`,
        title: `${uid}-title`,
        description: `${uid}-description`,
        type: `${uid}-type`,
        priority: `${uid}-priority`,
        assignee: `${uid}-assignee`,
        leader: `${uid}-leader`,
        startDate: `${uid}-start`,
        dueDate: `${uid}-due`,
        hours: `${uid}-hours`,
    };

    // Solo líderes activos (más el actual, aunque se haya desactivado después)
    const leaderOptions = leaders.filter(l => l.activo || String(l.id) === leaderId);
    // Reasignar es una acción de administrador (el servidor también lo exige)
    const canChooseAssignee = !isEdit || isAdmin;
    // Sin ser administrador solo puede asignarse a sí mismo (se conserva el responsable actual al editar)
    const assigneeOptions = isAdmin
        ? teamUsers
        : teamUsers.filter(u => u.raw_id === meId || u.raw_id === ticket?.assignee_raw_id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!title.trim()) {
            setErrorMessage('Escribe un título para la actividad.');
            return;
        }
        if (startDate && dueDate && dueDate < startDate) {
            setErrorMessage('La fecha de vencimiento no puede ser anterior a la de inicio.');
            return;
        }

        const payload = {
            titulo: title.trim(),
            descripcion: description.trim() || null,
            tipo_actividad: type,
            prioridad: priority,
            fecha_inicio: startDate || null,
            fecha_vencimiento: dueDate || null,
            estimacion_max_hrs: estimatedHours !== '' ? parseFloat(estimatedHours) : null,
            lider_catalogo_id: leaderId ? parseInt(leaderId, 10) : null,
        };
        if (canChooseAssignee) payload.asignado_a_id = assigneeId ? parseInt(assigneeId, 10) : null;

        setIsSubmitting(true);
        try {
            const saved = isEdit
                ? await updateActivity(ticket.db_id, payload)
                : await createActivity({ ...payload, completada: false, horas_utilizadas: 0 });
            if (onSubmit) onSubmit(saved);
            onClose();
        } catch (err) {
            setErrorMessage(toUserMessage(err, isEdit ? 'No se pudieron guardar los cambios.' : 'Error al crear la actividad.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const fieldClass = 'w-full border border-gray-200 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 transition-colors';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B132B]/40 backdrop-blur-sm transition-opacity p-4">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ids.heading}
                tabIndex={-1}
                className="bg-white w-full max-w-4xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh] rounded-xl outline-none"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#0e71af]"></div>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                    <div className="flex items-stretch gap-3">
                        <span aria-hidden="true" className="w-1 bg-[#0072b2] rounded-sm -skew-x-12 shrink-0"></span>
                        <div>
                            <p className="text-[10px] text-[#0e71af] font-bold tracking-widest uppercase mb-1">{isEdit ? ticket.id : 'QA & Testing'}</p>
                            <h2 id={ids.heading} className="text-xl font-black italic text-[#07152F] uppercase tracking-tight">{isEdit ? 'Editar actividad' : 'Crear nueva tarea'}</h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-red-700 transition-colors p-2">
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {errorMessage && (
                    <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mx-6 mt-4 text-xs rounded font-medium">
                        {errorMessage}
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    <form id="ticket-form" onSubmit={handleSubmit} noValidate className="space-y-6">

                        <div>
                            <label htmlFor={ids.title} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Resumen / Título</label>
                            <input
                                id={ids.title}
                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Añade una descripción breve..."
                                className={`${fieldClass} bg-slate-50 p-3 rounded-lg font-medium`}
                            />
                        </div>

                        <div>
                            <label htmlFor={ids.description} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                            <textarea
                                id={ids.description}
                                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los detalles o pasos para reproducir..."
                                className={`${fieldClass} bg-slate-50 p-3 rounded-lg resize-none`}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                            <div>
                                <label htmlFor={ids.type} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Actividad</label>
                                <select id={ids.type} value={type} onChange={(e) => setType(e.target.value)} className={`${fieldClass} bg-white p-2.5 rounded-md cursor-pointer`}>
                                    <option value="Tarea">Tarea</option>
                                    <option value="Bug">Error / Bug</option>
                                    <option value="Pruebas">Solicitud de pruebas</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor={ids.priority} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prioridad</label>
                                <select id={ids.priority} value={priority} onChange={(e) => setPriority(e.target.value)} className={`${fieldClass} bg-white p-2.5 rounded-md cursor-pointer`}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor={ids.assignee} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Persona Asignada</label>
                                    <select id={ids.assignee} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} disabled={!canChooseAssignee} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}>
                                        <option value="">Sin Asignar</option>
                                        {assigneeOptions.map(user => (
                                            <option key={user.raw_id} value={user.raw_id}>{user.name}</option>
                                        ))}
                                    </select>
                                    {!canChooseAssignee && <p className="text-[10px] text-gray-500 mt-1">Solo un administrador puede reasignar.</p>}
                                    {canChooseAssignee && !isAdmin && <p className="text-[10px] text-gray-500 mt-1">Puedes asignártela a ti; a otras personas las asigna un administrador.</p>}
                                </div>
                                <div>
                                    <label htmlFor={ids.leader} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Líder Técnico</label>
                                    <select id={ids.leader} value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer`}>
                                        <option value="">Sin líder</option>
                                        {leaderOptions.map(leader => (
                                            <option key={leader.id} value={leader.id}>{leader.nombre}{leader.activo ? '' : ' (inactivo)'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor={ids.startDate} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio</label>
                                    <input id={ids.startDate} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer`} />
                                </div>
                                <div>
                                    <label htmlFor={ids.dueDate} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Vencimiento</label>
                                    <input id={ids.dueDate} type="date" value={dueDate} min={startDate || undefined} onChange={(e) => setDueDate(e.target.value)} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer`} />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
                                <label htmlFor={ids.hours} className="flex items-center gap-1.5 text-[10px] font-bold text-[#0e71af] uppercase tracking-widest mb-3">
                                    <Hourglass className="w-3 h-3" aria-hidden="true" />
                                    Estimación de horas
                                </label>
                                <input
                                    id={ids.hours}
                                    type="number" step="0.5" min="0" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)}
                                    placeholder="Ej: 8"
                                    className={`${fieldClass} bg-white p-2.5 rounded-md text-center font-bold`}
                                />
                                <p className="text-[9px] text-gray-500 font-medium mt-2 leading-relaxed">
                                    Se reparte entre los días de ejecución (sábado cuenta medio día).
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-3 p-5 border-t border-gray-100 bg-white mt-auto">
                    <button type="button" onClick={onClose} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#07152F] px-4 py-2 transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="ticket-form"
                        disabled={isSubmitting}
                        className="bg-[#07152F] text-white px-8 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#0e71af] transition-colors rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear Tarea')}
                    </button>
                </div>
            </div>
        </div>
    );
};
