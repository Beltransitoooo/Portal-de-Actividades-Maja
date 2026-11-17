import { ChevronLeft, ChevronRight, UserRoundSearch } from 'lucide-react';
import { longDayLabel, parseDay, shiftDay } from '../../utils/calendar';
import { dayStatus } from '../../utils/availability';
import { fmtHours } from '../../utils/schedule';

const WEEKDAY_LETTERS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Aspecto de cada estado (con texto además del color)
const STATUS_STYLE = {
    libre: { fill: 'bg-emerald-600', label: 'Libre', dot: 'bg-emerald-600' },
    parcial: { fill: 'bg-amber-500', label: 'Parcial', dot: 'bg-amber-500' },
    lleno: { fill: 'bg-red-600', label: 'Jornada llena', dot: 'bg-red-600' },
    descanso: { fill: '', label: 'Descanso', dot: 'bg-slate-300' },
};

/**
 * Mini cronograma de disponibilidad de una persona.
 * `load` viene de personLoadByDay para el intervalo [from, to].
 */
export const AvailabilityStrip = ({ personName, load, from, to, rangeStart, rangeEnd, onShift }) => {
    const days = [];
    for (let d = from; d <= to; d = shiftDay(d, 1)) days.push(d);
    const inRange = (d) => rangeStart && d >= rangeStart && d <= (rangeEnd || rangeStart);
    const first = parseDay(from);
    const last = parseDay(to);
    const periodLabel = `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`;

    return (
        <section aria-label={`Disponibilidad de ${personName}`} className="border border-gray-200 rounded-xl p-4 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="flex items-center gap-2 text-[12px] font-bold text-[#07152F]">
                    <UserRoundSearch className="w-3.5 h-3.5 text-[#0e71af]" aria-hidden="true" />
                    Disponibilidad de {personName}
                </h3>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onShift(-7)} aria-label="Semana anterior" className="p-1 rounded-md text-gray-500 hover:text-[#07152F] hover:bg-slate-200 transition-colors">
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="text-[10px] font-bold text-gray-500 tabular-nums min-w-[150px] text-center" aria-live="polite">{periodLabel}</span>
                    <button type="button" onClick={() => onShift(7)} aria-label="Semana siguiente" className="p-1 rounded-md text-gray-500 hover:text-[#07152F] hover:bg-slate-200 transition-colors">
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <ul className="grid grid-cols-7 gap-1.5" aria-label="Carga por día">
                {days.map(d => {
                    const day = load[d] || { hours: 0, capacity: 0, activities: [] };
                    const status = dayStatus(day);
                    const style = STATUS_STYLE[status];
                    const pct = day.capacity > 0 ? Math.min(100, (day.hours / day.capacity) * 100) : 0;
                    const selected = inRange(d);
                    const conflict = selected && status === 'lleno';
                    const titles = day.activities.map(a => `${a.id} ${a.title} (${fmtHours(a.hours)} h)`);
                    const label = `${longDayLabel(d)}: ${
                        status === 'descanso' ? 'descanso' : `${fmtHours(day.hours)} de ${fmtHours(day.capacity)} h ocupadas, ${style.label.toLowerCase()}`
                    }${titles.length ? `. Actividades: ${titles.join('; ')}` : ''}${selected ? '. Dentro del rango elegido' : ''}`;

                    return (
                        <li
                            key={d}
                            title={label}
                            className={`relative rounded-lg border px-1.5 py-1.5 flex flex-col gap-1 bg-white ${
                                conflict ? 'border-red-600 ring-2 ring-red-600/30'
                                    : selected ? 'border-[#0e71af] ring-2 ring-[#0e71af]/25'
                                        : 'border-gray-200'
                            } ${status === 'descanso' ? 'opacity-60' : ''}`}
                        >
                            <span className="sr-only">{label}</span>
                            <div className="flex items-baseline justify-between" aria-hidden="true">
                                <span className="text-[8px] font-bold uppercase text-gray-500">{WEEKDAY_LETTERS[parseDay(d).getDay()]}</span>
                                <span className="text-[11px] font-black text-[#07152F] tabular-nums">{parseDay(d).getDate()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
                                {status !== 'descanso' && <div className={`h-full rounded-full ${style.fill}`} style={{ width: `${Math.max(pct, status === 'libre' ? 0 : 8)}%` }}></div>}
                            </div>
                            <span className="text-[9px] font-bold tabular-nums text-gray-500 leading-none" aria-hidden="true">
                                {status === 'descanso' ? '—' : `${fmtHours(day.hours)}/${fmtHours(day.capacity)} h`}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[9px] font-bold text-gray-500" aria-hidden="true">
                {['libre', 'parcial', 'lleno', 'descanso'].map(s => (
                    <span key={s} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${STATUS_STYLE[s].dot}`}></span>
                        {STATUS_STYLE[s].label}
                    </span>
                ))}
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-2.5 rounded-sm border-2 border-[#0e71af]"></span>
                    Rango elegido
                </span>
            </div>
        </section>
    );
};
