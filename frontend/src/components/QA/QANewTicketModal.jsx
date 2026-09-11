import { useState } from 'react';
import { fetchWithAuth } from '../../services/authService';

export const QANewTicketModal = ({ isOpen, onClose, onSubmit, teamUsers = [] }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Tarea');
    const [priority, setPriority] = useState('Media');
    const [assigneeId, setAssigneeId] = useState('');
    const [techLeadId, setTechLeadId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [minHours, setMinHours] = useState('');
    const [maxHours, setMaxHours] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

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
            estimacion_min_hrs: minHours ? parseFloat(minHours) : null,
            estimacion_max_hrs: maxHours ? parseFloat(maxHours) : null,
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
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear la actividad en la base de datos');
            }

            const createdTask = await response.json();
            
            if (onSubmit) onSubmit(createdTask);

            setTitle(''); 
            setDescription(''); 
            setStartDate(''); 
            setDueDate('');
            setMinHours(''); 
            setMaxHours('');
            setAssigneeId('');
            setTechLeadId('');
            onClose();

        } catch (err) {
            console.error("Error en POST /actividades:", err);
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B132B]/40 backdrop-blur-sm transition-opacity p-4">
            <div className="bg-white w-full max-w-4xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh] rounded-xl">
                
                <div className="absolute top-0 left-0 w-full h-1 bg-[#1296E8]"></div>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                    <div>
                        <p className="text-[10px] text-[#1296E8] font-bold tracking-widest uppercase mb-1">QA & Testing</p>
                        {/* CAMBIO REALIZADO AQUÍ */}
                        <h2 className="text-xl font-black text-[#07152F] uppercase tracking-tight">Crear nueva tarea</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mx-6 mt-4 text-xs rounded font-medium">
                        {errorMessage}
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    <form id="new-ticket-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Resumen / Título</label>
                            <input 
                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Añade una descripción breve..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] transition-colors rounded-lg font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                            <textarea 
                                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los detalles o pasos para reproducir..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] transition-colors rounded-lg resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Actividad</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer">
                                    <option value="Tarea">☑️ Tarea</option>
                                    <option value="Bug">🐛 Error / Bug</option>
                                    <option value="Pruebas">🔬 Solicitud de Pruebas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prioridad</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer">
                                    <option value="Crítica">🚨 Crítica</option>
                                    <option value="Alta">🔴 Alta</option>
                                    <option value="Media">🟡 Media</option>
                                    <option value="Baja">🔵 Baja</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Persona Asignada</label>
                                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer">
                                        <option value="">Sin Asignar</option>
                                        {teamUsers.map(user => (
                                            <option key={user.raw_id || user.id} value={user.raw_id || user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Líder Técnico</label>
                                    <select value={techLeadId} onChange={(e) => setTechLeadId(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer">
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
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio</label>
                                    <input 
                                        type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Vencimiento</label>
                                    <input 
                                        type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
                                <label className="block text-[10px] font-bold text-[#1296E8] uppercase tracking-widest mb-3">
                                    Estimación de Horas
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" step="0.5" min="0" value={minHours} onChange={(e) => setMinHours(e.target.value)}
                                        placeholder="Mín"
                                        className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md text-center font-bold"
                                    />
                                    <span className="text-gray-400 font-bold">-</span>
                                    <input 
                                        type="number" step="0.5" min="0" value={maxHours} onChange={(e) => setMaxHours(e.target.value)}
                                        placeholder="Máx"
                                        className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#07152F] focus:outline-none focus:border-[#1296E8] rounded-md text-center font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-3 p-5 border-t border-gray-100 bg-white mt-auto">
                    <button type="button" onClick={onClose} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#07152F] px-4 py-2 transition-colors">
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="new-ticket-form" 
                        disabled={isSubmitting}
                        className="bg-[#07152F] text-white px-8 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#1296E8] transition-colors rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Tarea'}
                    </button>
                </div>
            </div>
        </div>
    );
};