import { useState, useId } from 'react';
import { fetchWithAuth, readErrorMessage, toUserMessage } from '../../../services/authService';

export const TimeTracker = ({ ticketId, maxHours, horasTrabajadas, setHorasTrabajadas, onSuccess, isSaving, setIsSaving, completadaInicial }) => {
    const [isCompleted, setIsCompleted] = useState(completadaInicial || false);
    const [saveError, setSaveError] = useState(null);
    const hoursInputId = useId();
    // El estado inicial basta: el panel padre se vuelve a montar al cambiar de ticket

    const handleRegistrar = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const payload = { completada: isCompleted };
            if (horasTrabajadas !== undefined && horasTrabajadas !== '') {
                payload.estimacion_min_hrs = parseFloat(horasTrabajadas);
            }

            const response = await fetchWithAuth(`/actividades/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, 'Error al guardar la información'));
            }

            if (onSuccess) onSuccess(`¡Actividad actualizada correctamente!`);
        } catch (error) {
            setSaveError(`No se pudo actualizar: ${toUserMessage(error, 'Error al guardar la información')}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-black text-[#07152F] uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0e71af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Gestión de Tiempos y Estado
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Horas Estimadas</p>
                    <div className="h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center px-3">
                        <span className="text-sm font-bold text-gray-600">{maxHours || 0} hrs</span>
                    </div>
                </div>
                <div>
                    <label htmlFor={hoursInputId} className="block text-[10px] font-bold text-[#0e71af] uppercase tracking-widest mb-1">Horas Utilizadas</label>
                    <input
                        id={hoursInputId}
                        type="number" min="0" step="0.5" 
                        value={horasTrabajadas} 
                        onChange={(e) => setHorasTrabajadas(e.target.value)} 
                        placeholder="Ej: 4.5" 
                        className="w-full h-10 bg-white border border-[#1296E8]/30 focus:border-[#0e71af] rounded-lg px-3 text-sm font-bold text-[#07152F] outline-none transition-colors" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-5 mt-2 bg-slate-50 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                        className="w-4 h-4 text-[#0e71af] rounded-sm border-gray-300 focus:ring-[#0e71af]" 
                    />
                    <span className="text-xs font-bold text-[#07152F] uppercase tracking-widest">
                        Marcar como Completada
                    </span>
                </label>
            </div>

            {saveError && (
                <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-4 rounded-md font-medium">
                    {saveError}
                </div>
            )}

            <button
                type="button"
                onClick={handleRegistrar}
                disabled={isSaving} 
                className="w-full h-10 bg-[#07152F] hover:bg-[#0e71af] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Guardando...</>
                ) : ('Actualizar Actividad')}
            </button>
        </div>
    );
};