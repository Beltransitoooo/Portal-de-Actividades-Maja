import { updateActividad } from '../../../services/apiService';

export const TimeTracker = ({ ticketId, maxHours, horasTrabajadas, setHorasTrabajadas, onSuccess, isSaving, setIsSaving }) => {
    const handleRegistrar = async () => {
        if (!horasTrabajadas || horasTrabajadas <= 0) return;
        
        setIsSaving(true);
        try {
            // Enviamos el PUT usando el esquema ActividadUpdate (modificando la descripción por ahora para guardar el log de horas)
            await updateActividad(ticketId, { 
                descripcion: `Horas registradas al momento: ${horasTrabajadas}h` 
            });
            onSuccess(`¡Se registraron ${horasTrabajadas}h en la Base de Datos!`);
        } catch (error) {
            console.error(error);
            alert(`No se pudo actualizar: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-black text-[#0B132B] uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Gestión de Tiempos
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horas Estimadas</label>
                    <div className="h-10 bg-gray-100 border border-gray-200 rounded-sm flex items-center px-3">
                        <span className="text-sm font-bold text-gray-600">{maxHours || 0} hrs</span>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest mb-1">Horas Utilizadas</label>
                    <input type="number" min="0" step="0.5" value={horasTrabajadas} onChange={(e) => setHorasTrabajadas(e.target.value)} placeholder="Ej: 4.5" className="w-full h-10 bg-white border border-[#00A3FF]/30 focus:border-[#00A3FF] rounded-sm px-3 text-sm font-bold text-[#0B132B] outline-none transition-colors" />
                </div>
            </div>

            <button onClick={handleRegistrar} disabled={isSaving || !horasTrabajadas} className="w-full h-10 bg-[#0B132B] hover:bg-[#00A3FF] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-sm transition-all flex items-center justify-center gap-2">
                {isSaving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Guardando...</>
                ) : ('Registrar Horas')}
            </button>
        </div>
    );
};