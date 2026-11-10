import { useState, useEffect } from 'react';
import { listHistory } from '../../../services/qaApi';
import { toUserMessage } from '../../../services/authService';
import { formatDateTimeMx } from '../../../utils/dates';
import { STATUS_LABELS } from '../../../services/qaData';

const quote = (value) => (value ? `"${value}"` : 'vacío');

// Convierte una fila de la bitácora en una frase legible
const describe = (entry) => {
    const from = entry.valor_anterior;
    const to = entry.valor_nuevo;
    switch (entry.campo) {
        case 'creada': return 'creó la actividad';
        case 'eliminada': return 'eliminó la actividad';
        case 'estado': return `cambió el estado de ${STATUS_LABELS[from] || from} a ${STATUS_LABELS[to] || to}`;
        case 'titulo': return `cambió el título de ${quote(from)} a ${quote(to)}`;
        case 'descripcion': return 'actualizó la descripción';
        case 'prioridad': return `cambió la prioridad de ${from || 'vacío'} a ${to || 'vacío'}`;
        case 'tipo_actividad': return `cambió el tipo de ${from || 'vacío'} a ${to || 'vacío'}`;
        case 'fecha_inicio': return `cambió la fecha de inicio de ${from || 'sin fecha'} a ${to || 'sin fecha'}`;
        case 'fecha_vencimiento': return `cambió el vencimiento de ${from || 'sin fecha'} a ${to || 'sin fecha'}`;
        case 'estimacion_max_hrs': return `cambió la estimación de ${from || '0'} h a ${to || '0'} h`;
        case 'motivo_bloqueo': return to ? `indicó el motivo del bloqueo: ${quote(to)}` : 'quitó el motivo del bloqueo';
        case 'asignado_a': return `reasignó la actividad de ${from} a ${to}`;
        case 'lider_catalogo': return `cambió el líder técnico de ${from} a ${to}`;
        case 'horas': return to ? `registró ${to}` : `eliminó el registro de ${from}`;
        default: return `modificó ${entry.campo}`;
    }
};

// Bitácora de cambios de la actividad: quién hizo qué y cuándo.
export const History = ({ ticket }) => {
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        listHistory(ticket.db_id)
            .then(data => { if (active) setItems(data); })
            .catch(err => { if (active) setError(toUserMessage(err, 'No se pudo cargar el historial.')); });
        return () => { active = false; };
    }, [ticket.db_id]);

    if (error) return <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{error}</div>;
    if (items === null) return <p role="status" className="text-xs text-gray-500">Cargando historial...</p>;
    if (items.length === 0) return <p className="text-xs text-gray-500 bg-slate-50 border border-gray-100 rounded-lg p-4">Esta actividad todavía no tiene cambios registrados.</p>;

    return (
        <ol className="relative flex flex-col gap-4 pl-5 border-l-2 border-gray-100 ml-1.5">
            {items.map(entry => (
                <li key={entry.id} className="relative">
                    <span aria-hidden="true" className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0e71af]"></span>
                    <p className="text-xs text-[#07152F] leading-relaxed break-words">
                        <span className="font-bold">{entry.usuario_nombre || 'Persona eliminada'}</span> {describe(entry)}
                    </p>
                    <p className="text-[10px] text-gray-500 tabular-nums mt-0.5">{formatDateTimeMx(entry.creado)}</p>
                </li>
            ))}
        </ol>
    );
};
