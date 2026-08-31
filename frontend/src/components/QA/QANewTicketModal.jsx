import { useState } from 'react';

export const QANewTicketModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('TAREA');
    const [priority, setPriority] = useState('MEDIA');
    const [area, setArea] = useState('QA');
    const [assignee, setAssignee] = useState('UNASSIGNED');
    const [techLead, setTechLead] = useState('UNASSIGNED');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // Nuevos estados para el rango de horas
    const [minHours, setMinHours] = useState('');
    const [maxHours, setMaxHours] = useState('');
    
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            title, type, priority, area, 
            assignee, techLead, startDate, dueDate, 
            minHours, maxHours, description 
        });
        
        // Limpiar formulario y cerrar
        setTitle(''); setDescription(''); setStartDate(''); setDueDate('');
        setMinHours(''); setMaxHours('');
        onClose(); 
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B132B]/40 backdrop-blur-sm transition-opacity p-4">
            
            <div className="bg-white w-full max-w-4xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh]">
                
                {/* Acento azul superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00A3FF]"></div>

                {/* Header del Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                    <div>
                        <p className="text-[10px] text-[#00A3FF] font-bold tracking-widest uppercase mb-1">QA & Testing</p>
                        <h2 className="text-xl font-black text-[#0B132B] uppercase tracking-tight">Crear Incidencia</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <div className="p-6 overflow-y-auto no-scrollbar">
                    <form id="new-ticket-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Título */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Resumen / Título</label>
                            <input 
                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Añade una descripción breve..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] transition-colors rounded-sm font-medium"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                            <textarea 
                                required rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los detalles, entorno o pasos para reproducir..."
                                className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] transition-colors rounded-sm resize-none"
                            ></textarea>
                        </div>

                        {/* Fila 1: Clasificación */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 border border-gray-100 bg-gray-50/50 rounded-sm">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Actividad</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer">
                                    <option value="EPIC">⚡ Épica</option>
                                    <option value="TAREA">☑️ Tarea</option>
                                    <option value="HISTORIA">🔖 Historia</option>
                                    <option value="FEATURE">✨ Feature</option>
                                    <option value="BUG">🐛 Error / Bug</option>
                                    <option value="PRUEBAS">🔬 Solicitud de Pruebas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prioridad</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer">
                                    <option value="CRÍTICA">🚨 Crítica</option>
                                    <option value="ALTA">🔴 Alta</option>
                                    <option value="MEDIA">🟡 Media</option>
                                    <option value="BAJA">🔵 Baja</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Área / Etiqueta</label>
                                <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer">
                                    <option value="WMS">WMS</option>
                                    <option value="ECOMMERCE">E-Commerce</option>
                                    <option value="QA">QA Interno</option>
                                    <option value="INFRA">Infraestructura</option>
                                </select>
                            </div>
                        </div>

                        {/* Fila 2: Asignaciones, Fechas y Horas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Personas */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Persona Asignada</label>
                                    <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer">
                                        <option value="UNASSIGNED">Automático / Sin Asignar</option>
                                        <option value="AB">Angel Beltrán</option>
                                        <option value="LM">Luis Martínez</option>
                                        <option value="JD">Jane Doe</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Líder Técnico</label>
                                    <select value={techLead} onChange={(e) => setTechLead(e.target.value)} className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer">
                                        <option value="UNASSIGNED">Ninguno</option>
                                        <option value="AM">Aurelio Morales</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio</label>
                                    <input 
                                        type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Vencimiento</label>
                                    <input 
                                        type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm cursor-pointer uppercase"
                                    />
                                </div>
                            </div>

                            {/* Asignación de Horas (Nuevo Bloque) */}
                            <div className="bg-slate-50 border border-gray-200 rounded-sm p-4 flex flex-col justify-center">
                                <label className="block text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest mb-3">
                                    Estimación de Horas
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" min="0" value={minHours} onChange={(e) => setMinHours(e.target.value)}
                                        placeholder="Mín"
                                        className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm text-center font-bold"
                                    />
                                    <span className="text-gray-400 font-bold">-</span>
                                    <input 
                                        type="number" min="0" value={maxHours} onChange={(e) => setMaxHours(e.target.value)}
                                        placeholder="Máx"
                                        className="w-full bg-white border border-gray-200 p-2.5 text-xs text-[#0B132B] focus:outline-none focus:border-[#00A3FF] rounded-sm text-center font-bold"
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 ml-1">HRS</span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-3 leading-relaxed">
                                    Define el rango de horas requerido para completar la actividad dentro de las fechas seleccionadas.
                                </p>
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-5 border-t border-gray-100 bg-white mt-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 text-[#00A3FF] rounded-sm border-gray-300 focus:ring-[#00A3FF]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Crear otro</span>
                    </label>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0B132B] px-4 py-2 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" form="new-ticket-form" className="bg-[#0B132B] text-white px-8 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-[#1a264a] transition-colors rounded-sm">
                            Crear Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};