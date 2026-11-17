import { useState, useRef, useEffect, useId } from 'react';
import { CalendarRange, CalendarDays, ChevronLeft, ChevronRight, ChevronDown, ArrowRight, X } from 'lucide-react';
import { toLocalDateStr, formatDateMx } from '../../utils/dates';
import {
    MONTH_NAMES, parseDay, shiftDay, shiftMonth, longDayLabel, isSunday, dayCount,
    viewOf, addMonths, viewKey, monthKey, monthCells, weekStart, weekEnd,
    rangePresets, singlePresets, nextRangeSelection, isOutOfBounds,
} from '../../utils/calendar';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']; // misma semana que el calendario (inicia en lunes)

// Pantallas angostas muestran un mes; a partir de 640 px, dos
const useIsWide = () => {
    const query = '(min-width: 640px)';
    const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setWide(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return wide;
};

const MonthGrid = ({ view, start, end, preview, focused, today, bounds, single, onPick, onHover, onKeyNav }) => {
    const rangeEnd = end || preview;

    return (
        <div className="w-[238px]">
            <p className="text-center text-[11px] font-black uppercase tracking-widest text-[#07152F] mb-2">
                {MONTH_NAMES[view.m]} {view.y}
            </p>
            <div className="grid grid-cols-7 mb-1" aria-hidden="true">
                {WEEKDAYS.map(w => (
                    <span key={w} className={`text-center text-[9px] font-bold uppercase ${w === 'Do' ? 'text-gray-400' : 'text-gray-500'}`}>{w}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => onHover(null)}>
                {monthCells(view).map((date, i) => {
                    if (!date) return <span key={`v${i}`}></span>;
                    const disabled = isOutOfBounds(date, bounds);
                    const isStart = date === start;
                    const isEnd = !single && (date === end || (!end && start && date === preview && preview >= start));
                    const inRange = !single && start && rangeEnd && date > start && date < rangeEnd;
                    const isToday = date === today;
                    const edge = isStart || isEnd;

                    const states = [
                        single && isStart && 'seleccionado',
                        !single && isStart && 'inicio',
                        !single && date === end && 'vencimiento',
                        inRange && 'dentro del rango',
                        isToday && 'hoy',
                        disabled && 'no disponible',
                    ].filter(Boolean).join(', ');

                    return (
                        <div
                            key={date}
                            className={`relative h-[34px] flex items-center justify-center ${inRange ? 'bg-[#1296E8]/10' : ''} ${
                                !single && isStart && rangeEnd && rangeEnd > start ? 'bg-gradient-to-r from-transparent from-50% to-[#1296E8]/10 to-50%' : ''
                            } ${!single && isEnd && start && date > start ? 'bg-gradient-to-l from-transparent from-50% to-[#1296E8]/10 to-50%' : ''}`}
                        >
                            <button
                                type="button"
                                data-date={date}
                                tabIndex={date === focused ? 0 : -1}
                                onClick={() => { if (!disabled) onPick(date); }}
                                onMouseEnter={() => onHover(date)}
                                onKeyDown={(e) => onKeyNav(e, date)}
                                aria-label={`${longDayLabel(date)}${states ? `, ${states}` : ''}`}
                                aria-pressed={edge || Boolean(inRange)}
                                aria-disabled={disabled || undefined}
                                className={`relative w-[32px] h-[32px] rounded-lg text-[11px] tabular-nums transition-colors ${
                                    edge
                                        ? 'bg-[#0e71af] text-white font-black shadow-sm'
                                        : disabled
                                            ? 'text-gray-400 opacity-40 cursor-not-allowed'
                                            : `${isSunday(date) ? 'text-gray-400' : 'text-[#07152F]'} font-semibold hover:bg-slate-200`
                                } ${isToday && !edge ? 'ring-1 ring-inset ring-[#0e71af] font-black' : ''}`}
                            >
                                {parseDay(date).getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Campo de fechas con calendario.
 * - Rango (por defecto): clic en el inicio y luego en el vencimiento (el mismo día dos veces = un día).
 * - `single`: un solo día; `start` es el valor y `onChange(dia)`.
 * Teclado: flechas mueven el día, Re Pág / Av Pág cambian de mes, Inicio / Fin van al lunes / domingo,
 * Enter selecciona y Escape cierra sin cerrar el modal que contiene el campo.
 */
export const DateRangeField = ({ id, label, start, end = '', onChange, single = false, min, max, maxMonths = 2, presets }) => {
    const today = toLocalDateStr(new Date());
    const isWide = useIsWide();
    const uid = useId();
    const panelId = `${uid}-panel`;
    const statusId = `${uid}-status`;
    const labelId = `${uid}-label`;
    const valueId = `${uid}-value`;
    const bounds = { min, max };

    const [open, setOpen] = useState(false);
    const [pickingEnd, setPickingEnd] = useState(false);
    const [hover, setHover] = useState(null);
    const [focused, setFocused] = useState(start || today);
    const [view, setView] = useState(() => viewOf(start || today));

    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    const monthsShown = isWide ? Math.max(1, maxMonths) : 1;
    const months = Array.from({ length: monthsShown }, (_, i) => addMonths(view, i));
    const emit = (s, e) => (single ? onChange(s) : onChange(s, e));

    // Cerrar no modifica las fechas: si solo hay inicio, el vencimiento queda sin definir
    // (igual con ratón, teclado, Escape o clic fuera).
    const close = (returnFocus = true) => {
        setOpen(false);
        setPickingEnd(false);
        setHover(null);
        if (returnFocus) triggerRef.current?.focus();
    };

    const openPanel = () => {
        const base = start || (max && today > max ? max : today);
        setFocused(base);
        setView(viewOf(base));
        setPickingEnd(false);
        setOpen(true);
    };

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => { if (!wrapperRef.current?.contains(e.target)) close(false); };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    });

    // Mantener el foco en el día activo mientras se navega con teclado
    useEffect(() => {
        if (!open) return;
        panelRef.current?.querySelector(`[data-date="${focused}"]`)?.focus();
    }, [open, focused, view]);

    const finish = () => {
        setPickingEnd(false);
        setHover(null);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const pick = (date) => {
        setFocused(date);
        if (single) {
            emit(date);
            finish();
            return;
        }
        const next = nextRangeSelection({ start, end, pickingEnd }, date);
        emit(next.start, next.end);
        if (next.done) finish();
        else setPickingEnd(true);
    };

    const moveFocus = (date) => {
        setFocused(date);
        if (!months.map(viewKey).includes(monthKey(date))) {
            const target = viewOf(date);
            // Avanzando, el mes nuevo queda al final; retrocediendo, al inicio
            setView(date > focused ? addMonths(target, -(monthsShown - 1)) : target);
        }
        if (pickingEnd) setHover(date);
    };

    const onKeyNav = (e, date) => {
        const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        let target = null;
        if (moves[e.key] !== undefined) target = shiftDay(date, moves[e.key]);
        else if (e.key === 'PageUp') target = shiftMonth(date, -1);
        else if (e.key === 'PageDown') target = shiftMonth(date, 1);
        else if (e.key === 'Home') target = weekStart(date);
        else if (e.key === 'End') target = weekEnd(date);
        if (target) {
            e.preventDefault();
            moveFocus(target);
        }
    };

    const onWrapperKeyDown = (e) => {
        if (e.key === 'Escape' && open) {
            e.stopPropagation(); // no cerrar el modal que contiene el campo
            close();
        }
    };

    const presetList = (presets ?? (single ? singlePresets(today) : rangePresets(today)))
        .filter(p => !isOutOfBounds(p.start, bounds) && !isOutOfBounds(p.end, bounds));
    const applyPreset = (p) => {
        emit(p.start, p.end);
        finish();
    };

    const days = start && end ? dayCount(start, end) : 0;
    const statusText = single
        ? `Elige el día${max === today ? ' (no se permiten días futuros)' : ''}.`
        : !pickingEnd
            ? 'Elige el día de inicio.'
            : `Inicio: ${formatDateMx(start)}. Ahora elige el vencimiento (o el mismo día si dura un día).`;
    const TriggerIcon = single ? CalendarDays : CalendarRange;

    return (
        <div ref={wrapperRef} onKeyDown={onWrapperKeyDown} className="relative">
            <label id={labelId} htmlFor={id} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>

            <div className="relative">
                <button
                    id={id}
                    ref={triggerRef}
                    type="button"
                    onClick={() => (open ? close() : openPanel())}
                    // Nombre accesible = etiqueta + fechas elegidas (con solo <label> el lector omitiría las fechas)
                    aria-labelledby={`${labelId} ${valueId}`}
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    aria-haspopup="dialog"
                    className={`w-full ${single ? 'min-h-[40px]' : 'min-h-[46px]'} flex items-center gap-3 pl-3 pr-10 py-2 bg-slate-50 border rounded-lg text-left transition-colors ${
                        open ? 'border-[#0e71af] ring-2 ring-[#0e71af]/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <TriggerIcon className="w-4 h-4 text-[#0e71af] shrink-0" aria-hidden="true" />
                    <span id={valueId} className="sr-only">
                        {single
                            ? (start ? formatDateMx(start) : 'sin día seleccionado')
                            : (start || end)
                                ? `inicio ${start ? formatDateMx(start) : 'sin definir'}, vencimiento ${end ? formatDateMx(end) : 'sin definir'}${start && end ? `, ${days} ${days === 1 ? 'día' : 'días'}` : ''}`
                                : 'sin fechas seleccionadas'}
                    </span>
                    <span aria-hidden="true" className="contents">
                    {single ? (
                        start
                            ? <span className="text-sm font-bold text-[#07152F] tabular-nums">{formatDateMx(start)}{start === today ? <span className="ml-2 text-[9px] font-black uppercase tracking-wider text-[#0e71af]">Hoy</span> : null}</span>
                            : <span className="text-xs text-gray-500 font-medium">Selecciona el día</span>
                    ) : (start || end) ? (
                        <span className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
                            <span className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Inicio</span>
                                <span className="text-xs font-bold text-[#07152F] tabular-nums">{start ? formatDateMx(start) : 'Sin definir'}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
                            <span className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Vencimiento</span>
                                <span className="text-xs font-bold text-[#07152F] tabular-nums">{end ? formatDateMx(end) : 'Sin definir'}</span>
                            </span>
                            {start && end && (
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#1296E8]/10 text-[#0e71af] text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                    {days} {days === 1 ? 'día' : 'días'}
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-500 font-medium">Selecciona inicio y vencimiento</span>
                    )}
                    </span>
                </button>
                {(start || end) && !single ? (
                    <button
                        type="button"
                        onClick={() => { emit('', ''); setPickingEnd(false); triggerRef.current?.focus(); }}
                        aria-label="Quitar fechas"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-red-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                ) : (
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                )}
            </div>

            {open && (
                <div
                    id={panelId}
                    ref={panelRef}
                    role="dialog"
                    aria-label={single ? 'Seleccionar día' : 'Seleccionar fechas de la actividad'}
                    aria-describedby={statusId}
                    className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 animate-fade-in"
                >
                    {presetList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label="Atajos de fechas">
                            {presetList.map(p => {
                                const active = p.start === start && (single || p.end === end);
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        aria-pressed={active}
                                        className={`h-7 px-3 rounded-full border text-[10px] font-bold tracking-wide transition-colors ${
                                            active
                                                ? 'bg-[#0e71af] border-[#0e71af] text-white'
                                                : 'bg-slate-50 border-gray-200 text-[#07152F] hover:border-[#0e71af]'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="relative flex justify-center gap-6">
                        <button
                            type="button"
                            onClick={() => setView(v => addMonths(v, -1))}
                            aria-label="Mes anterior"
                            className="absolute left-0 top-0 p-1 rounded-md text-gray-500 hover:text-[#07152F] hover:bg-slate-100 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setView(v => addMonths(v, 1))}
                            aria-label="Mes siguiente"
                            className="absolute right-0 top-0 p-1 rounded-md text-gray-500 hover:text-[#07152F] hover:bg-slate-100 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                        {months.map(v => (
                            <MonthGrid
                                key={viewKey(v)}
                                view={v}
                                start={start}
                                end={pickingEnd ? '' : end}
                                preview={pickingEnd ? hover : null}
                                focused={months.some(m => viewKey(m) === monthKey(focused)) ? focused : `${viewKey(months[0])}-01`}
                                today={today}
                                bounds={bounds}
                                single={single}
                                onPick={pick}
                                onHover={(d) => pickingEnd && setHover(d)}
                                onKeyNav={onKeyNav}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                        <p id={statusId} role="status" className="text-[10px] font-medium text-gray-500">{statusText}</p>
                        <button
                            type="button"
                            onClick={() => close()}
                            className="h-8 px-4 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors shrink-0"
                        >
                            {single ? 'Cerrar' : 'Listo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
