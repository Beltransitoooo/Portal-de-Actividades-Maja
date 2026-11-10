import { useState, useId } from 'react';
import { X, Hourglass } from 'lucide-react';
import { fetchWithAuth, readErrorMessage, toUserMessage } from '../../services/authService';
import { useDialog } from '../../hooks/useDialog';

export const QANewTicketModal = ({ isOpen, onClose, onSubmit, teamUsers = [] }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Tarea');
    const [priority, setPriority] = useState('Media');
    const [assigneeId, setAssigneeId] = useState('');
    const [techLeadId, setTechLeadId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const dialogRef = useDialog(isOpen, onClose);
    const uid = useId();
    const ids = {
        heading: `${uid}-heading`,
        title: `${uid}-title`,
        description: `${uid}-description`,
        type: `${uid}-type`,
        priority: `${uid}-priority`,
        assignee: `${uid}-assignee`,
        techLead: `${uid}-techlead`,
        startDate: `${uid}-start`,
        dueDate: `${uid}-due`,
        hours: `${uid}-hours`,
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        const payload = {
            titulo: title,
            descripcion: description || null,
            completada: false,
            tipo_actividad: type,
            prioridad: priority,
            fecha_inicio: startDate || null,
            fecha_vencimiento: dueDate || null,
            // Estimación única; las horas reales arrancan en 0 y el estado lo asigna el servidor
            estimacion_max_hrs: estimatedHours ? parseFloat(estimatedHours) : null,
            horas_utilizadas: 0,
            asignado_a_id: assigneeId ? parseInt(assigneeId, 10) : null,
            lider_tecnico_id: techLeadId ? parseInt(techLeadId, 10) : null,
        };

        try {
            const response = await fetchWithAuth('/actividades/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, 'Error al crear la actividad en la base de datos'));
            }

            const createdTask = await response.json();

            if (onSubmit) onSubmit(createdTask);

            setTitle('');
            setDescription('');
            setStartDate('');
            setDueDate('');
            setEstimatedHours('');
            setAssigneeId('');
            setTechLeadId('');
            onClose();

        } catch (err) {
            setErrorMessage(toUserMessage(err, 'Error al crear la actividad en la base de datos'));
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <p className="text-[10px] text-[#0e71af] font-bold tracking-widest uppercase mb-1">QA & Testing</p>
                            <h2 id={ids.heading} className="text-xl font-black italic text-[#07152F] uppercase tracking-tight">Crear nueva tarea</h2>
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
                    <form id="new-ticket-form" onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label htmlFor={ids.title} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Resumen / Título</label>
                            <input
                                id={ids.title}
                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Añade una descripción breve..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] transition-colors rounded-lg font-medium"
                            />
                        </div>

                        <div>
                            <label htmlFor={ids.description} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                            <textarea
                                id={ids.description}
                                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los detalles o pasos para reproducir..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] transition-colors rounded-lg resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                            <div>
                                <label htmlFor={ids.type} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Actividad</label>
                                <select id={ids.type} value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer">
                                    <option value="Tarea">Tarea</option>
                                    <option value="Bug">Error / Bug</option>
                                    <option value="Pruebas">Solicitud de pruebas</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor={ids.priority} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prioridad</label>
                                <select id={ids.priority} value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer">
                                    <option value="Crítica">Crítica</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor={ids.assignee} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Persona Asignada</label>
                                    <select id={ids.assignee} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer">
                                        <option value="">Sin Asignar</option>
                                        {teamUsers.map(user => (
                                            <option key={user.raw_id || user.id} value={user.raw_id || user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor={ids.techLead} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Líder Técnico</label>
                                    <select id={ids.techLead} value={techLeadId} onChange={(e) => setTechLeadId(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer">
                                        <option value="">Ninguno</option>
                                        {teamUsers.map(user => (
                                            <option key={user.raw_id || user.id} value={user.raw_id || user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor={ids.startDate} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio</label>
                                    <input
                                        id={ids.startDate}
                                        type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={ids.dueDate} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Vencimiento</label>
                                    <input
                                        id={ids.dueDate}
                                        type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md cursor-pointer"
                                    />
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
                                    className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] rounded-md text-center font-bold"
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
                        form="new-ticket-form"
                        disabled={isSubmitting}
                        className="bg-[#07152F] text-white px-8 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#0e71af] transition-colors rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Tarea'}
                    </button>
                </div>
            </div>
        </div>
    );
};
