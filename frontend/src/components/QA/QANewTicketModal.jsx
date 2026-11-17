import { useState, useId, useMemo } from 'react';
import { X, Hourglass, TriangleAlert, Split } from 'lucide-react';
import { createActivity, updateActivity } from '../../services/qaApi';
import { toUserMessage } from '../../services/authService';
import { useDialog } from '../../hooks/useDialog';
import { WEEKDAY_HOURS, SATURDAY_HOURS } from '../../utils/capacity';
import { toLocalDateStr, formatDateMx } from '../../utils/dates';
import { distributeHours, fmtHours } from '../../utils/schedule';
import { shiftDay } from '../../utils/calendar';
import {
    personLoadByDay, dayStatus, busyDaysInRange, overloadedDays, splitRange, splitHours, partTitle, stripWindow,
} from '../../utils/availability';
import { DateRangeField } from '../Shared/DateRangeField';
import { AvailabilityStrip } from './AvailabilityStrip';

const PRIORITIES = ['Crítica', 'Alta', 'Media', 'Baja'];

// "18/11/2026, 19/11/2026 y 20/11/2026"
const listDates = (dates) => {
    const f = dates.map(formatDateMx);
    return f.length <= 1 ? f.join('') : `${f.slice(0, -1).join(', ')} y ${f[f.length - 1]}`;
};

// Formulario para crear una actividad o, si recibe `ticket`, para editarla.
// Se monta solo cuando está abierto, así cada apertura empieza con los valores correctos.
// `allTasks` (actividades ya cargadas) alimenta la disponibilidad de la persona asignada.
export const QANewTicketModal = ({ ticket = null, onClose, onSubmit, teamUsers = [], leaders = [], isAdmin = false, meId = null, allTasks = [] }) => {
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
    const [splitEnabled, setSplitEnabled] = useState(false);
    // Si una división falla a medias: el plan se congela y el reintento crea solo las partes que faltan
    // (al recargar, las partes ya creadas ocupan días y recalcular cambiaría la división)
    const [createdParts, setCreatedParts] = useState(0);
    const [frozenPlan, setFrozenPlan] = useState(null);
    const resetSplitProgress = () => { setCreatedParts(0); setFrozenPlan(null); };
    // Con partes ya creadas, la persona, las fechas y la división quedan fijas: cambiarlas duplicaría actividades
    const locked = createdParts > 0;
    // Desplazamiento manual del mini cronograma (se reinicia al cambiar la fecha de inicio)
    const [stripShift, setStripShift] = useState({ base: '', days: 0 });

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
        dates: `${uid}-dates`,
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

    // ---- Disponibilidad de la persona asignada ----
    const today = toLocalDateStr(new Date());
    const person = assigneeId ? teamUsers.find(u => String(u.raw_id) === assigneeId) : null;
    const stripBase = startDate || today;
    const stripDays = stripShift.base === stripBase ? stripShift.days : 0;
    const strip = stripWindow(shiftDay(stripBase, stripDays), stripDays === 0 ? dueDate : null);
    // Un solo cálculo cubre el mini cronograma y los meses que puede mostrar el calendario
    const loadFrom = [strip.from, shiftDay(stripBase, -45)].sort()[0];
    const loadTo = [strip.to, shiftDay(stripBase, 120)].sort().pop();
    const load = useMemo(
        () => (person ? personLoadByDay(allTasks, person.raw_id, loadFrom, loadTo, { excludeId: ticket?.db_id ?? null }) : {}),
        [allTasks, person, loadFrom, loadTo, ticket?.db_id]
    );
    const markers = useMemo(() => {
        if (!person) return undefined;
        const out = {};
        for (const [date, day] of Object.entries(load)) {
            const status = dayStatus(day);
            if (status === 'lleno' || status === 'parcial') out[date] = status;
        }
        return out;
    }, [load, person]);

    const busyDays = person ? busyDaysInRange(load, startDate, dueDate) : [];
    // Dividir solo al crear: al editar se avisa, pero la actividad no se parte
    const computedParts = !isEdit && busyDays.length > 0 ? splitRange(startDate, dueDate || startDate, busyDays) : [];
    const parts = frozenPlan?.parts ?? computedParts;
    // Dividir exige persona asignada (los días ocupados son suyos), salvo que el plan ya esté en curso
    const splitActive = splitEnabled && parts.length > 0 && (Boolean(person) || locked);
    const partHours = frozenPlan?.hours ?? (splitActive ? splitHours(estimatedHours, parts) : []);
    // Solo las partes que faltan: las ya creadas ya están en la carga de la persona
    const newDistribution = splitActive
        ? Object.assign({}, ...parts.map((p, i) => (i < createdParts ? {} : distributeHours(partHours[i], p.start, p.end))))
        : distributeHours(estimatedHours, startDate, dueDate || startDate);
    const overloads = person && startDate ? overloadedDays(load, newDistribution) : [];

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

        if (splitActive) {
            // Una actividad por tramo; se crean en orden y, si una falla, el reintento continúa desde ahí
            const base = { ...payload, completada: false, horas_utilizadas: 0 };
            if (!frozenPlan) setFrozenPlan({ parts, hours: partHours });
            let done = createdParts;
            try {
                for (let i = createdParts; i < parts.length; i++) {
                    await createActivity({
                        ...base,
                        titulo: partTitle(payload.titulo, i, parts.length),
                        fecha_inicio: parts[i].start,
                        fecha_vencimiento: parts[i].end,
                        estimacion_max_hrs: partHours[i],
                    });
                    done = i + 1;
                    setCreatedParts(done);
                }
                if (onSubmit) onSubmit();
                onClose();
            } catch (err) {
                if (done > 0 && onSubmit) onSubmit(); // mostrar en pantalla las partes que sí se crearon
                setErrorMessage(`Se crearon ${done} de ${parts.length} actividades. ${toUserMessage(err, 'No se pudo crear la siguiente parte.')} Puedes reintentar: se crearán solo las que faltan.`);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

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
                        <span aria-hidden="true" className="w-1.5 bg-tartan rounded-[1px] -skew-x-[14deg] shrink-0"></span>
                        <div>
                            <p className="text-[12px] text-[#0e71af] font-bold mb-1">{isEdit ? ticket.id : 'QA & Testing'}</p>
                            <h2 id={ids.heading} className="font-dorsal text-[34px] text-[#07152F] uppercase">{isEdit ? 'Editar actividad' : 'Crear nueva tarea'}</h2>
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
                            <label htmlFor={ids.title} className="block text-[12px] font-bold text-gray-500 mb-1.5">Título</label>
                            <input
                                id={ids.title}
                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="Añade una descripción breve..."
                                className={`${fieldClass} bg-slate-50 p-3 rounded-lg font-medium`}
                            />
                        </div>

                        <div>
                            <label htmlFor={ids.description} className="block text-[12px] font-bold text-gray-500 mb-1.5">Descripción</label>
                            <textarea
                                id={ids.description}
                                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe los detalles o pasos para reproducir..."
                                className={`${fieldClass} bg-slate-50 p-3 rounded-lg resize-none`}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                            <div>
                                <label htmlFor={ids.type} className="block text-[12px] font-bold text-gray-500 mb-1.5">Tipo de actividad</label>
                                <select id={ids.type} value={type} onChange={(e) => setType(e.target.value)} className={`${fieldClass} bg-white p-2.5 rounded-md cursor-pointer`}>
                                    <option value="Tarea">Tarea</option>
                                    <option value="Bug">Error / Bug</option>
                                    <option value="Pruebas">Solicitud de pruebas</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor={ids.priority} className="block text-[12px] font-bold text-gray-500 mb-1.5">Prioridad</label>
                                <select id={ids.priority} value={priority} onChange={(e) => setPriority(e.target.value)} className={`${fieldClass} bg-white p-2.5 rounded-md cursor-pointer`}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={ids.assignee} className="block text-[12px] font-bold text-gray-500 mb-1.5">Persona asignada</label>
                                    <select id={ids.assignee} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} disabled={!canChooseAssignee || locked} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}>
                                        <option value="">Sin asignar</option>
                                        {assigneeOptions.map(user => (
                                            <option key={user.raw_id} value={user.raw_id}>{user.name}</option>
                                        ))}
                                    </select>
                                    {!canChooseAssignee && <p className="text-[10px] text-gray-500 mt-1">Solo un administrador puede reasignar.</p>}
                                    {canChooseAssignee && !isAdmin && <p className="text-[10px] text-gray-500 mt-1">Puedes asignártela a ti; a otras personas las asigna un administrador.</p>}
                                    {!person && <p className="text-[10px] text-gray-500 mt-1">Elige a una persona para ver su disponibilidad.</p>}
                                </div>
                                <div>
                                    <label htmlFor={ids.leader} className="block text-[12px] font-bold text-gray-500 mb-1.5">Líder técnico</label>
                                    <select id={ids.leader} value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className={`${fieldClass} bg-slate-50 p-2.5 rounded-md cursor-pointer`}>
                                        <option value="">Sin líder</option>
                                        {leaderOptions.map(leader => (
                                            <option key={leader.id} value={leader.id}>{leader.nombre}{leader.activo ? '' : ' (inactivo)'}</option>
                                        ))}
                                    </select>
                                </div>
                        </div>

                        {person && (
                            <AvailabilityStrip
                                personName={person.name}
                                load={load}
                                from={strip.from}
                                to={strip.to}
                                rangeStart={startDate}
                                rangeEnd={dueDate}
                                onShift={(n) => setStripShift({ base: stripBase, days: stripDays + n })}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="md:col-span-2 space-y-3">
                                <DateRangeField
                                    id={ids.dates}
                                    label="Fechas de ejecución"
                                    start={startDate}
                                    end={dueDate}
                                    onChange={(s, e) => { setStartDate(s); setDueDate(e); resetSplitProgress(); }}
                                    disabled={locked}
                                    markers={markers}
                                    markersLabel={person ? `Disponibilidad de ${person.name}` : undefined}
                                />

                                {(locked || (person && startDate && (busyDays.length > 0 || overloads.length > 0))) && (
                                    <div role="status" className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col gap-2 text-xs text-[#07152F]">
                                        <p className="flex items-start gap-2 font-bold text-amber-700">
                                            <TriangleAlert className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
                                            Aviso de disponibilidad
                                        </p>
                                        {busyDays.length > 0 && (
                                            <p className="pl-6">{person.name} tiene la jornada llena el {listDates(busyDays)}.</p>
                                        )}
                                        {overloads.length > 0 && (
                                            <p className="pl-6">
                                                Con esta actividad excedería la jornada el{' '}
                                                {overloads.map((o, i) => (
                                                    <span key={o.date}>{i > 0 ? (i === overloads.length - 1 ? ' y ' : ', ') : ''}{formatDateMx(o.date)} ({fmtHours(o.total)} de {fmtHours(o.capacity)} h)</span>
                                                ))}.
                                            </p>
                                        )}
                                        <p className="pl-6 text-[10px] text-gray-500">Puedes guardarla así; es solo un aviso.</p>

                                        {!isEdit && (busyDays.length > 0 || frozenPlan) && (
                                            parts.length === 0 ? (
                                                <p className="pl-6 font-semibold">No hay días libres en el rango elegido para dividirla.</p>
                                            ) : (
                                                <div className="ml-6 border-t border-amber-200 pt-2 flex flex-col gap-2">
                                                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={splitEnabled}
                                                            onChange={(e) => { setSplitEnabled(e.target.checked); resetSplitProgress(); }}
                                                            disabled={locked}
                                                            className="w-4 h-4 accent-[#0e71af]"
                                                        />
                                                        <Split className="w-3.5 h-3.5 text-[#0e71af]" aria-hidden="true" />
                                                        {parts.length > 1
                                                            ? `Dividir en ${parts.length} actividades sin los días ocupados`
                                                            : 'Ajustar las fechas sin los días ocupados'}
                                                    </label>
                                                    {locked && (
                                                        <p className="text-[12px] text-[#475569]">
                                                            Ya se crearon {createdParts} de {parts.length}. Para no duplicar actividades, la persona, las fechas y la división quedan fijas: reintenta o cancela.
                                                        </p>
                                                    )}
                                                    {splitActive && (
                                                        <ol className="flex flex-col gap-1 pl-6" aria-label="Actividades que se crearán">
                                                            {parts.map((p, i) => (
                                                                <li key={p.start} className={`flex flex-wrap gap-x-2 ${i < createdParts ? 'line-through text-gray-500' : ''}`}>
                                                                    <span className="font-bold">{parts.length > 1 ? `Parte ${i + 1}/${parts.length}` : 'Fechas'}:</span>
                                                                    <span className="tabular-nums">{p.start === p.end ? formatDateMx(p.start) : `${formatDateMx(p.start)} – ${formatDateMx(p.end)}`}</span>
                                                                    {partHours[i] !== null && <span className="text-gray-500 tabular-nums">· {fmtHours(partHours[i])} h</span>}
                                                                    {i < createdParts && <span className="no-underline">(creada)</span>}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
                                <label htmlFor={ids.hours} className="flex items-center gap-1.5 text-[12px] font-bold text-[#0e71af] mb-3">
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
                                    Se reparte entre los días de ejecución según la jornada ({WEEKDAY_HOURS} h entre semana, {SATURDAY_HOURS} h el sábado).
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-3 p-5 border-t border-gray-100 bg-white mt-auto">
                    <button type="button" onClick={onClose} className="text-[12px] font-bold text-gray-500 hover:text-[#07152F] px-4 py-2 transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="ticket-form"
                        disabled={isSubmitting}
                        className="bg-[#07152F] text-white px-8 py-3 text-[12px] font-bold shadow-md hover:bg-[#0e71af] transition-colors rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting
                            ? 'Guardando...'
                            : isEdit
                                ? 'Guardar cambios'
                                : splitActive && parts.length > 1
                                    ? (parts.length - createdParts === 1 ? 'Crear 1 actividad' : `Crear ${parts.length - createdParts} actividades`)
                                    : 'Crear tarea'}
                    </button>
                </div>
            </div>
        </div>
    );
};
