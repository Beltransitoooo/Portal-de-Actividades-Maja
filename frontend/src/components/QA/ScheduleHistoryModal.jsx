import { useState, useMemo } from 'react';
import { CheckCircle2, ChevronDown, CalendarClock, Hourglass, Clock3, ShieldCheck } from 'lucide-react';
import { Modal } from '../Shared/Modal';
import { History } from './TicketPanel/History';
import { formatDateMx, daysBetween as diffDays } from '../../utils/dates';
import { fmtHours } from '../../utils/schedule';
import { shiftDay as addDays } from '../../utils/calendar';
import { closureSummary, sortByClosure } from '../../utils/history';

// Plan contra real en una misma escala: barra del rango planeado y, debajo, los días con horas reales.
const PlanVsReal = ({ task, real }) => {
    const planStart = task.startDate;
    const planEnd = task.dueDate || task.startDate;
    const from = real && real.first < planStart ? real.first : planStart;
    const to = real && real.last > planEnd ? real.last : planEnd;
    const total = diffDays(from, to) + 1;
    const pct = (d) => (diffDays(from, d) / total) * 100;
    const width = (a, b) => ((diffDays(a, b) + 1) / total) * 100;

    return (
        <div className="flex flex-col gap-1.5" aria-hidden="true">
            <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[10px] font-bold text-slate-500">Plan</span>
                <div className="relative flex-1 h-2.5 bg-slate-100 rounded">
                    <div className="absolute inset-y-0 bg-[#0e71af]/70 rounded" style={{ left: `${pct(planStart)}%`, width: `${width(planStart, planEnd)}%` }}></div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[10px] font-bold text-slate-500">Real</span>
                <div className="relative flex-1 h-2.5 bg-slate-100 rounded">
                    {Array.from({ length: total }, (_, i) => addDays(from, i))
                        .filter(d => task.hoursByDate[d] > 0)
                        .map(d => {
                            const late = d > planEnd;
                            return (
                                <div
                                    key={d}
                                    className={`absolute inset-y-0 rounded-sm ${late ? 'bg-red-600' : 'bg-emerald-600'}`}
                                    style={{ left: `${pct(d)}%`, width: `${Math.max(width(d, d), 1.5)}%` }}
                                ></div>
                            );
                        })}
                </div>
            </div>
            <div className="flex justify-between pl-12 text-[8px] font-bold text-slate-500 tabular-nums">
                <span>{formatDateMx(from)}</span>
                <span>{formatDateMx(to)}</span>
            </div>
        </div>
    );
};

const HistoryItem = ({ task }) => {
    const [open, setOpen] = useState(false);
    const { real, estimated, logged, planEnd, overHours, lateDays } = closureSummary(task);
    const over = overHours > 0;
    const panelId = `historial-${task.db_id}`;

    return (
        <li className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-500">{task.id} · {task.assigneeName || 'Sin asignar'}</p>
                    <p className="text-sm font-bold text-[#07152F] break-words">{task.title}</p>
                    {task.leaderName && (
                        <p className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 mt-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                            Líder: {task.leaderName}
                        </p>
                    )}
                </div>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap shrink-0 ${
                    over ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                    <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                    Tomó {fmtHours(logged)}h{over ? ` (+${fmtHours(overHours)})` : ''}
                </span>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                    <dt className="flex items-center gap-1 font-bold text-slate-500 text-[10px]"><CalendarClock className="w-2.5 h-2.5" aria-hidden="true" />Plan</dt>
                    <dd className="font-bold text-[#07152F] tabular-nums">{formatDateMx(task.startDate)} – {formatDateMx(planEnd)}</dd>
                </div>
                <div>
                    <dt className="flex items-center gap-1 font-bold text-slate-500 text-[10px]"><Clock3 className="w-2.5 h-2.5" aria-hidden="true" />Real</dt>
                    <dd className="font-bold text-[#07152F] tabular-nums">
                        {real ? `${formatDateMx(real.first)} – ${formatDateMx(real.last)}` : 'Sin horas registradas'}
                    </dd>
                </div>
                <div>
                    <dt className="flex items-center gap-1 font-bold text-slate-500 text-[10px]"><Hourglass className="w-2.5 h-2.5" aria-hidden="true" />Horas</dt>
                    <dd className={`font-bold tabular-nums ${over ? 'text-red-700' : 'text-[#07152F]'}`}>{fmtHours(logged)} de {fmtHours(estimated)} estimadas</dd>
                </div>
                <div>
                    <dt className="font-bold text-slate-500 text-[10px]">Cierre</dt>
                    <dd className={`font-bold ${lateDays > 0 ? 'text-red-700' : 'text-[#07152F]'}`}>
                        {!real ? '—' : lateDays > 0 ? `${lateDays} día${lateDays > 1 ? 's' : ''} después del vencimiento` : 'Dentro del plan'}
                        {real && ` · ${real.count} día${real.count > 1 ? 's' : ''} trabajado${real.count > 1 ? 's' : ''}`}
                    </dd>
                </div>
            </dl>

            {task.startDate && <PlanVsReal task={task} real={real} />}

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                className="self-start flex items-center gap-1 text-[12px] font-bold text-[#0e71af] hover:text-[#07152F] transition-colors"
            >
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                {open ? 'Ocultar movimientos' : 'Ver movimientos'}
            </button>
            {open && (
                <div id={panelId} className="pt-1">
                    <History ticket={task} />
                </div>
            )}
        </li>
    );
};

// Historial del cronograma: actividades completadas del mes visible, con su plan frente a lo real
// y la bitácora de cambios (fechas, estado, reasignaciones, horas).
export const ScheduleHistoryModal = ({ isOpen, onClose, tasks, monthLabel }) => {
    const sorted = useMemo(() => sortByClosure(tasks), [tasks]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Historial del cronograma" eyebrow={`Completadas · ${monthLabel}`} maxWidth="max-w-3xl">
            {sorted.length === 0 ? (
                <p className="text-xs text-gray-500 bg-slate-50 border border-gray-100 rounded-lg p-4">
                    No hay actividades completadas en este mes con los filtros actuales.
                </p>
            ) : (
                <>
                    <p className="text-[10px] text-gray-500 font-medium mb-3">
                        Plan: rango de inicio a vencimiento. Real: días con horas registradas (en rojo, los que cayeron después del vencimiento).
                    </p>
                    <ul className="flex flex-col gap-3">
                        {sorted.map(task => <HistoryItem key={task.db_id} task={task} />)}
                    </ul>
                </>
            )}
        </Modal>
    );
};
