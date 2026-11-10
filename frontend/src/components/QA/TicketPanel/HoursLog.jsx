import { useState, useId } from 'react';
import { Clock3, Trash2, Plus } from 'lucide-react';
import { addHours, deleteHours } from '../../../services/qaApi';
import { toUserMessage } from '../../../services/authService';
import { toLocalDateStr, formatDateMx } from '../../../utils/dates';
import { fmtHours } from '../../../utils/schedule';

// Registro de horas por día de una actividad. La suma de los registros es la hora utilizada.
export const HoursLog = ({ ticket, me, onChanged }) => {
    const todayStr = toLocalDateStr(new Date());
    const [date, setDate] = useState(todayStr);
    const [hours, setHours] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const ids = { date: useId(), hours: useId(), note: useId() };

    const estimated = ticket.maxHours;
    const logged = ticket.loggedHours;
    const diff = Math.round((logged - estimated) * 10) / 10;
    const over = estimated > 0 && logged > estimated;
    const entries = [...ticket.hoursEntries].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

    const submit = async (event) => {
        event.preventDefault();
        const value = parseFloat(hours);
        if (!value || value <= 0 || value > 24) {
            setError('Escribe las horas trabajadas (entre 0.5 y 24).');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await addHours(ticket.db_id, { fecha: date, horas: value, nota: note.trim() || null });
            setHours('');
            setNote('');
            onChanged('Horas registradas');
        } catch (err) {
            setError(toUserMessage(err, 'No se pudieron registrar las horas.'));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (entry) => {
        setError(null);
        try {
            await deleteHours(ticket.db_id, entry.id);
            onChanged('Registro eliminado');
        } catch (err) {
            setError(toUserMessage(err, 'No se pudo eliminar el registro.'));
        }
    };

    const inputClass = 'w-full h-10 bg-white border border-gray-200 focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 rounded-lg px-3 text-sm font-bold text-[#07152F] transition-colors';

    return (
        <div className="flex flex-col gap-5">
            {/* Resumen frente a la estimación */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 border border-gray-100 rounded-lg p-3">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Estimadas</p>
                    <p className="text-lg font-black text-[#07152F] tabular-nums">{fmtHours(estimated)}h</p>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-lg p-3">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Utilizadas</p>
                    <p className={`text-lg font-black tabular-nums ${over ? 'text-red-700' : 'text-[#07152F]'}`}>{fmtHours(logged)}h</p>
                </div>
                <div className={`border rounded-lg p-3 ${over ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-gray-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${over ? 'text-red-700' : 'text-gray-500'}`}>{over ? 'Excede' : 'Restan'}</p>
                    <p className={`text-lg font-black tabular-nums ${over ? 'text-red-700' : 'text-[#07152F]'}`}>
                        {estimated > 0 ? `${fmtHours(Math.abs(diff))}h` : '—'}
                    </p>
                </div>
            </div>

            {/* Alta de horas del día */}
            <form onSubmit={submit} noValidate className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-black text-[#07152F] uppercase tracking-widest flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-[#0e71af]" aria-hidden="true" />
                    Registrar horas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor={ids.date} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Día</label>
                        <input id={ids.date} type="date" value={date} max={todayStr} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor={ids.hours} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Horas</label>
                        <input id={ids.hours} type="number" step="0.5" min="0.5" max="24" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ej: 2.5" className={inputClass} />
                    </div>
                </div>
                <div>
                    <label htmlFor={ids.note} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nota (opcional)</label>
                    <input id={ids.note} type="text" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="¿Qué hiciste?" className={`${inputClass} font-medium`} />
                </div>
                {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{error}</div>}
                <button type="submit" disabled={saving} className="h-10 bg-[#07152F] hover:bg-[#0e71af] disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    {saving ? 'Guardando...' : 'Registrar horas'}
                </button>
            </form>

            {/* Registros por día */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Horas por día</h3>
                {entries.length === 0 ? (
                    <p className="text-xs text-gray-500 bg-slate-50 border border-gray-100 rounded-lg p-4">Todavía no hay horas registradas. Anota aquí el tiempo real que dedicas cada día.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                        {entries.map(entry => {
                            const canDelete = me && (me.es_admin || entry.usuario_id === me.id);
                            return (
                                <li key={entry.id} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                                    <div className="w-14 shrink-0 text-center">
                                        <p className="text-sm font-black text-[#07152F] tabular-nums">{fmtHours(entry.horas)}h</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#07152F]">{formatDateMx(entry.fecha)}</p>
                                        <p className="text-[11px] text-gray-500 truncate">
                                            {entry.usuario_nombre || 'Persona eliminada'}{entry.nota ? ` · ${entry.nota}` : ''}
                                        </p>
                                    </div>
                                    {canDelete && (
                                        <button type="button" onClick={() => remove(entry)} aria-label={`Eliminar ${fmtHours(entry.horas)} horas del ${formatDateMx(entry.fecha)}`} className="min-h-6 min-w-6 p-1.5 text-gray-500 hover:text-red-700 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};
