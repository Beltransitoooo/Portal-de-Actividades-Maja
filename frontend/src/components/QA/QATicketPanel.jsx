import { useState, useId, useRef } from 'react';
import { X, CalendarDays, Tag, ShieldCheck, Pencil, Trash2, Ban, FileText, Clock3, MessageSquare, History as HistoryIcon, Hourglass } from 'lucide-react';
import { PanelToast } from './TicketPanel/PanelToast';
import { HoursLog } from './TicketPanel/HoursLog';
import { Comments } from './TicketPanel/Comments';
import { History } from './TicketPanel/History';
import { QANewTicketModal } from './QANewTicketModal';
import { StatusBadge } from '../Shared/StatusBadge';
import { ConfirmDialog } from '../Shared/ConfirmDialog';
import { useDialog } from '../../hooks/useDialog';
import { useStatusChange } from '../../hooks/useStatusChange';
import { updateActivity, deleteActivity } from '../../services/qaApi';
import { STATUS_CODES } from '../../services/qaData';
import { toUserMessage } from '../../services/authService';
import { formatDateMx } from '../../utils/dates';
import { spanDays, fmtHours } from '../../utils/schedule';

const TABS = [
    { id: 'detalle', label: 'Detalle', icon: FileText },
    { id: 'horas', label: 'Horas', icon: Clock3 },
    { id: 'comentarios', label: 'Comentarios', icon: MessageSquare },
    { id: 'historial', label: 'Historial', icon: HistoryIcon },
];

const PRIORITY_STYLES = {
    'CRÍTICA': 'text-red-700 bg-red-50 border-red-200',
    'ALTA': 'text-orange-700 bg-orange-50 border-orange-200',
};

// Se monta con key={ticket.db_id}: al abrir otra actividad, el estado inicia desde cero sin efectos.
// ticket es siempre la versión más reciente (la página lo deriva de los datos cargados).
export const QATicketPanel = ({ ticket, onClose, onTicketUpdated, onDeleted, leaders = [], teamUsers = [], me = null, initialTab = 'detalle' }) => {
    const [tab, setTab] = useState(initialTab);
    const [toast, setToast] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const dialogRef = useDialog(Boolean(ticket), onClose);
    const titleId = useId();
    const tabRefs = useRef({});

    const notify = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3500);
    };

    const changed = (message) => {
        if (message) notify(message);
        if (onTicketUpdated) onTicketUpdated();
    };

    const applyStatus = async (task, newStatus, reason) => {
        setActionError(null);
        try {
            const body = { estado: STATUS_CODES[newStatus] };
            if (reason) body.motivo_bloqueo = reason;
            await updateActivity(task.db_id, body);
            changed('Estado actualizado');
        } catch (err) {
            setActionError(toUserMessage(err, 'No se pudo actualizar el estado.'));
        }
    };
    const [requestStatusChange, blockDialog] = useStatusChange(applyStatus);

    const removeActivity = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteActivity(ticket.db_id);
            setConfirmDelete(false);
            if (onDeleted) onDeleted();
            onClose();
        } catch (err) {
            setDeleteError(toUserMessage(err, 'No se pudo eliminar la actividad.'));
        } finally {
            setDeleting(false);
        }
    };

    if (!ticket) return null;

    const days = ticket.startDate ? spanDays(ticket.startDate, ticket.dueDate) : 0;
    const over = ticket.maxHours > 0 && ticket.loggedHours > ticket.maxHours;
    const usagePct = ticket.maxHours > 0 ? Math.min((ticket.loggedHours / ticket.maxHours) * 100, 100) : 0;

    // Navegación por teclado entre pestañas (flechas, Inicio y Fin)
    const onTabKeyDown = (event) => {
        const index = TABS.findIndex(t => t.id === tab);
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = TABS.length - 1;
        if (next === null) return;
        event.preventDefault();
        setTab(TABS[next].id);
        tabRefs.current[TABS[next].id]?.focus();
    };

    return (
        <div className="no-print fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm transition-opacity">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-left relative outline-none"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black bg-[#07152F] text-white px-2.5 py-1 rounded-md tracking-widest">{ticket.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${PRIORITY_STYLES[ticket.priority] || 'text-green-700 bg-green-50 border-green-200'}`}>
                            {ticket.priority || 'NORMAL'}
                        </span>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar detalle de la actividad" className="text-gray-500 hover:text-red-700 transition-colors p-1">
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Pestañas */}
                <div role="tablist" aria-label="Secciones de la actividad" onKeyDown={onTabKeyDown} className="flex border-b border-gray-100 px-3 overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            ref={(el) => { tabRefs.current[id] = el; }}
                            type="button"
                            role="tab"
                            id={`${titleId}-tab-${id}`}
                            aria-selected={tab === id}
                            aria-controls={`${titleId}-panel-${id}`}
                            tabIndex={tab === id ? 0 : -1}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-1.5 px-3 min-h-11 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${tab === id ? 'border-[#0e71af] text-[#0b5a8c]' : 'border-transparent text-gray-500 hover:text-[#07152F]'}`}
                        >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>

                <PanelToast message={toast} onClose={() => setToast(null)} />

                <div
                    role="tabpanel"
                    id={`${titleId}-panel-${tab}`}
                    aria-labelledby={`${titleId}-tab-${tab}`}
                    className="flex-1 overflow-y-auto p-5 flex flex-col gap-5"
                >
                    {tab === 'detalle' && (
                        <>
                            <div>
                                <h2 id={titleId} className="text-xl font-black text-[#07152F] uppercase tracking-tight mb-2 break-words">{ticket.title}</h2>
                                <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">{ticket.description || 'Sin descripción detallada.'}</p>
                            </div>

                            {ticket.status === 'BLOQUEADA' && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <Ban className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Bloqueada</p>
                                        <p className="text-xs text-[#07152F] mt-1 break-words">{ticket.blockReason || 'Sin motivo registrado.'}</p>
                                    </div>
                                </div>
                            )}

                            {actionError && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{actionError}</div>}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estado</p>
                                    <StatusBadge currentStatus={ticket.status} onChangeStatus={(s) => requestStatusChange(ticket, s)} size="md" />
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo</p>
                                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#07152F] uppercase tracking-widest min-h-8">
                                        <Tag className="w-3 h-3 text-[#0e71af]" aria-hidden="true" />
                                        {ticket.type || 'Tarea'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Responsable</p>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-6 h-6 rounded-full bg-[#0072b2] text-white flex items-center justify-center text-[8px] font-black shrink-0">{ticket.assignee}</span>
                                        <p className="text-xs font-bold text-[#07152F] truncate">{ticket.assigneeName}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Líder técnico</p>
                                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#07152F] min-w-0">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#0e71af] shrink-0" aria-hidden="true" />
                                        <span className="truncate">{ticket.leaderName || 'Sin líder'}</span>
                                    </p>
                                </div>
                            </div>

                            {ticket.startDate && (
                                <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-lg p-3">
                                    <CalendarDays className="w-4 h-4 text-[#0e71af] shrink-0" aria-hidden="true" />
                                    <p className="text-xs font-bold text-[#0B132B]">
                                        {formatDateMx(ticket.startDate)}
                                        {ticket.dueDate && ticket.dueDate !== ticket.startDate ? ` → ${formatDateMx(ticket.dueDate)}` : ''}
                                        <span className="text-gray-500 font-semibold ml-2">({days} día{days !== 1 ? 's' : ''})</span>
                                    </p>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <Hourglass className="w-3 h-3" aria-hidden="true" />
                                        {fmtHours(ticket.loggedHours)}h de {fmtHours(ticket.maxHours)}h
                                    </span>
                                    <button type="button" onClick={() => setTab('horas')} className="min-h-6 text-[10px] font-black uppercase tracking-widest text-[#0b5a8c] hover:underline">
                                        Registrar horas
                                    </button>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-label="Consumo de la estimación" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(usagePct)}>
                                    <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-500' : 'bg-[#0e71af]'}`} style={{ width: `${usagePct}%` }}></div>
                                </div>
                                {over && <p className="text-[11px] font-bold text-red-700 mt-1.5">+{fmtHours(ticket.loggedHours - ticket.maxHours)}h sobre lo estimado</p>}
                            </div>

                            <div className="flex flex-wrap gap-2 border-t border-gray-100 mt-1 pt-5">
                                <button type="button" onClick={() => setIsEditing(true)} className="h-10 px-4 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                    Editar
                                </button>
                                {me?.es_admin && (
                                    <button type="button" onClick={() => { setDeleteError(null); setConfirmDelete(true); }} className="h-10 px-4 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2">
                                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {tab !== 'detalle' && <h2 id={titleId} className="sr-only">{ticket.title}</h2>}
                    {tab === 'horas' && <HoursLog ticket={ticket} me={me} onChanged={changed} />}
                    {tab === 'comentarios' && <Comments ticket={ticket} me={me} />}
                    {tab === 'historial' && <History ticket={ticket} />}
                </div>
            </div>

            {isEditing && (
                <QANewTicketModal
                    ticket={ticket}
                    teamUsers={teamUsers}
                    leaders={leaders}
                    isAdmin={Boolean(me?.es_admin)}
                    onClose={() => setIsEditing(false)}
                    onSubmit={() => { setIsEditing(false); changed('Cambios guardados'); }}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    eyebrow={ticket.id}
                    title="Eliminar actividad"
                    message={`Se eliminará "${ticket.title}" junto con sus horas y comentarios. Esta acción no se puede deshacer; el historial conserva el registro de quién la eliminó.`}
                    confirmLabel="Eliminar"
                    danger
                    busy={deleting}
                    error={deleteError}
                    onConfirm={removeActivity}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}

            {blockDialog}
        </div>
    );
};
