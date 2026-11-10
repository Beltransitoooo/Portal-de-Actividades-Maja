import { useState, useRef, useEffect } from 'react';
import { Clock3, ChevronDown, Hourglass } from 'lucide-react';
import { Modal } from '../Shared/Modal';
import { toLocalDateStr, formatDateMx } from '../../utils/dates';
import { distributeHours, fmtHours } from '../../utils/schedule';

// --- CONFIGURACIÓN VISUAL DE ESTADOS ---
const STATUS_CONFIG = {
    'PENDIENTE':   { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', border: 'border-slate-200', hover: 'hover:bg-slate-200' },
    'EN PROGRESO': { color: 'text-[#0b5a8c]', bg: 'bg-[#1296E8]/10', dot: 'bg-[#0e71af]', border: 'border-[#1296E8]/20', hover: 'hover:bg-[#1296E8]/20' },
    'EN REVISIÓN': { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
    'COMPLETADA':  { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
    'BLOQUEADA':   { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200', hover: 'hover:bg-red-100' }
};

// Estados que el backend aún no puede guardar (la actividad solo tiene el campo "completada").
// Se muestran deshabilitados hasta que exista soporte en el servidor.
const UNSUPPORTED_STATUSES = ['EN REVISIÓN', 'BLOQUEADA'];

// --- COMPONENTE: BADGE INTERACTIVO DE ESTADO ---
const CustomStatusBadge = ({ currentStatus, onChangeStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['PENDIENTE'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleSelect = (status, e) => {
        e.stopPropagation();
        onChangeStatus(status);
        setIsOpen(false);
    };

    return (
        <div className="relative min-w-0 max-w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={`Estado: ${currentStatus}. Cambiar estado`}
                className={`flex items-center gap-1 px-1.5 min-h-6 max-w-full min-w-0 rounded border text-[8px] font-black tracking-widest uppercase whitespace-nowrap transition-all duration-200 ${config.bg} ${config.border} ${config.color} ${config.hover}`}
                title="Cambiar Estado"
            >
                <span className={`w-1 h-1 rounded-full shrink-0 ${config.dot}`} aria-hidden="true"></span>
                <span className="truncate">{currentStatus}</span>
                <ChevronDown className={`w-2 h-2 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-fade-in origin-top-left">
                    <div className="p-1 flex flex-col gap-0.5">
                        {Object.keys(STATUS_CONFIG).map((status) => {
                            const opt = STATUS_CONFIG[status];
                            const isUnsupported = UNSUPPORTED_STATUSES.includes(status);
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    disabled={isUnsupported}
                                    onClick={(e) => handleSelect(status, e)}
                                    title={isUnsupported ? 'Próximamente: este estado aún no se puede guardar' : undefined}
                                    className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-[8.5px] font-black tracking-widest uppercase transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent ${currentStatus === status ? opt.bg + ' ' + opt.color : 'text-slate-600'}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`}></span>
                                    {status}
                                    {isUnsupported && <span className="ml-auto text-[8px] font-bold text-slate-600 normal-case tracking-normal">Próx.</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL: CALENDARIO ---
export const QACalendar = ({ tasks, currentDate, onTicketClick, teamUsers, onStatusChange }) => {
    // Día cuyo listado completo se muestra ("+N" o "N ACT"); se guarda solo la fecha
    // y las actividades se derivan en vivo para que el modal refleje cambios de estado.
    const [detailDate, setDetailDate] = useState(null);

    const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDayOfWeek = new Date(year, month, 1).getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Solo las semanas que el mes necesita (5 o 6): cada fila gana altura en pantallas bajas
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil((startDayOfWeek + daysInMonth) / 7);

    const startDateOfCalendar = new Date(year, month, 1);
    startDateOfCalendar.setDate(1 - startDayOfWeek);

    const calendarCells = [];
    for (let i = 0; i < weekCount * 7; i++) {
        const cellDate = new Date(startDateOfCalendar);
        cellDate.setDate(startDateOfCalendar.getDate() + i);
        calendarCells.push({
            dateObj: cellDate,
            dayNumber: cellDate.getDate(),
            isCurrentMonth: cellDate.getMonth() === month,
            dateStr: toLocalDateStr(cellDate)
        });
    }

    const todayStr = toLocalDateStr(new Date());

    // Reparto de la estimación por día (pasos de media hora que suman el total)
    const taskHours = new Map(tasks.map(t => [t.db_id, distributeHours(t.maxHours, t.startDate, t.dueDate || t.startDate)]));

    const tasksForDate = (dateStr) => tasks.filter(t => {
        if (!t.startDate) return false;
        return dateStr >= t.startDate && dateStr <= (t.dueDate || t.startDate);
    });

    const getUserTheme = (assigneeId) => {
        const user = teamUsers.find(u => u.id === assigneeId);
        return user ? user.theme : { main: 'bg-slate-600' };
    };

    const detailTasks = detailDate ? tasksForDate(detailDate) : [];

    // Fila compacta de actividad dentro de una celda del día
    const TaskChip = ({ task, dateStr }) => {
        const theme = getUserTheme(task.assignee);
        const config = STATUS_CONFIG[task.status] || STATUS_CONFIG['PENDIENTE'];
        const hours = taskHours.get(task.db_id)?.[dateStr] || 0;
        const isCritical = task.priority === 'CRÍTICA';
        return (
            <button
                type="button"
                onClick={() => onTicketClick && onTicketClick(task)}
                aria-label={`Abrir ${task.id}: ${task.title} (${task.status}${hours > 0 ? `, ${fmtHours(hours)} horas este día` : ''})`}
                title={`${task.title} · ${task.status}${hours > 0 ? ` · ${fmtHours(hours)}h este día` : ''}`}
                className={`w-full min-h-6 flex items-center gap-1.5 px-1.5 bg-white border border-slate-200 rounded-md hover:border-[#1296E8]/40 hover:shadow-sm transition-all text-left overflow-hidden shrink-0 ${isCritical ? 'border-l-2 border-l-red-500' : ''}`}
            >
                <span className={`w-4 h-4 rounded-full text-white text-[7px] font-black flex items-center justify-center shrink-0 ${theme.main}`} aria-hidden="true">
                    {task.assignee}
                </span>
                <span className="flex-1 min-w-0 text-[9.5px] font-bold text-[#07152F] truncate">{task.title}</span>
                {hours > 0 && (
                    <span className="hidden md:inline text-[8px] font-bold text-slate-500 tabular-nums shrink-0">{fmtHours(hours)}h</span>
                )}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true"></span>
            </button>
        );
    };

    return (
        <>
        <div className="w-full bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm mt-2 animate-fade-in flex-1 min-h-[440px] overflow-x-auto">

            {/* Header Fijo */}
            <div className="grid grid-cols-7 min-w-[640px] border-b border-slate-200 bg-slate-50/80 shrink-0 rounded-t-2xl overflow-hidden">
                {weekDays.map((day, idx) => (
                    <div key={day} className={`py-2 text-center text-[10px] font-black tracking-widest uppercase ${idx === 6 ? 'text-slate-500' : idx === 5 ? 'text-amber-700' : 'text-slate-500'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Cuadrícula: tantas filas como semanas tenga el mes */}
            <div
                className="grid grid-cols-7 min-w-[640px] bg-slate-200 gap-px flex-1 min-h-0 rounded-b-2xl overflow-hidden"
                style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
            >
                {calendarCells.map((cell, index) => {
                    const isToday = cell.dateStr === todayStr;
                    const isSaturday = cell.dateObj.getDay() === 6;
                    const isSunday = cell.dateObj.getDay() === 0;

                    const dayTasks = isSunday ? [] : tasksForDate(cell.dateStr);

                    let cellBg = 'bg-white hover:bg-slate-50/50';
                    if (!cell.isCurrentMonth) cellBg = 'bg-slate-50';
                    if (isSunday) cellBg = 'bg-slate-50';

                    return (
                        <div key={index} className={`relative p-1.5 flex flex-col transition-colors group min-h-[76px] ${cellBg}`}
                             style={isSunday ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.01) 10px, rgba(0,0,0,0.01) 20px)' } : {}}>

                            {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-[#0e71af] shrink-0"></div>}

                            {/* Cabecera del Día */}
                            <div className="flex justify-between items-start mb-1 shrink-0">
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                                        isToday ? 'bg-[#0e71af] text-white shadow-md' :
                                        cell.isCurrentMonth ? (isSunday ? 'text-slate-500' : 'text-[#07152F]') : 'text-slate-500'
                                    }`}>
                                        {cell.dayNumber}
                                    </span>

                                    {isSaturday && cell.isCurrentMonth && (
                                        <div className="flex items-center bg-amber-50 border border-amber-200/50 text-amber-700 px-1 py-0.5 rounded">
                                            <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap hidden lg:block">9–13 h</span>
                                        </div>
                                    )}

                                    {isSunday && cell.isCurrentMonth && (
                                        <div className="bg-slate-100 border border-slate-200/60 text-slate-600 px-1 py-0.5 rounded">
                                            <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap hidden lg:block">Descanso</span>
                                        </div>
                                    )}
                                </div>

                                {dayTasks.length > 0 && !isSunday && (
                                    <button
                                        type="button"
                                        onClick={() => setDetailDate(cell.dateStr)}
                                        aria-label={`Ver las ${dayTasks.length} actividades del ${formatDateMx(cell.dateStr)}`}
                                        className="min-h-6 shrink-0 whitespace-nowrap text-[8px] font-black text-slate-500 tracking-wider bg-slate-50 border border-slate-100 px-1.5 rounded shadow-sm hover:text-[#0e71af] hover:border-[#1296E8]/30 transition-colors"
                                    >
                                        {dayTasks.length} ACT
                                    </button>
                                )}
                            </div>

                            {/* Actividades del día: una fila compacta + "+N" en la misma línea.
                                Nada se encima ni se corta, aunque varios integrantes coincidan en un día. */}
                            {!isSunday && dayTasks.length > 0 && (
                                <div className="flex items-start gap-1 flex-1 min-h-0 overflow-hidden">
                                    <div className="flex-1 min-w-0">
                                        <TaskChip task={dayTasks[0]} dateStr={cell.dateStr} />
                                    </div>
                                    {dayTasks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setDetailDate(cell.dateStr)}
                                            aria-label={`Ver las ${dayTasks.length} actividades del ${formatDateMx(cell.dateStr)}`}
                                            title="Ver todas las actividades del día"
                                            className="min-h-6 min-w-6 px-1 shrink-0 rounded-md border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-600 hover:text-[#0e71af] hover:border-[#1296E8]/40 transition-colors"
                                        >
                                            +{dayTasks.length - 1}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Detalle del día: lista completa con estado editable y horas del día */}
        <Modal
            isOpen={detailDate !== null}
            onClose={() => setDetailDate(null)}
            eyebrow="QA & Testing"
            title={detailDate ? `Actividades del ${formatDateMx(detailDate)}` : ''}
        >
            {detailDate && (
                <ul className="flex flex-col gap-2">
                    {detailTasks.map((task) => {
                        const theme = getUserTheme(task.assignee);
                        const dayHours = taskHours.get(task.db_id)?.[detailDate] || 0;
                        const estimated = parseFloat(task.maxHours) || 0;
                        return (
                            <li key={task.db_id} className="bg-white border border-slate-200 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[9px] font-black shrink-0 ${theme.main}`}>
                                        {task.assignee}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setDetailDate(null); if (onTicketClick) onTicketClick(task); }}
                                        className="flex-1 min-w-0 text-left min-h-6 group/item"
                                        aria-label={`Abrir ${task.id}: ${task.title}`}
                                    >
                                        <p className="text-xs font-bold text-[#07152F] truncate group-hover/item:text-[#0e71af] transition-colors">{task.title}</p>
                                        <p className="text-[9px] font-black tracking-widest text-slate-500 uppercase mt-0.5">{task.id}</p>
                                    </button>
                                    <CustomStatusBadge
                                        currentStatus={task.status}
                                        onChangeStatus={(newStatus) => onStatusChange && onStatusChange(task, newStatus)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-2 pl-10">
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                        <Hourglass className="w-2.5 h-2.5" aria-hidden="true" />
                                        Est {fmtHours(estimated)}h
                                    </span>
                                    {dayHours > 0 && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#0b5a8c]">
                                            <Clock3 className="w-2.5 h-2.5" aria-hidden="true" />
                                            {fmtHours(dayHours)}h este día
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Modal>
        </>
    );
};
