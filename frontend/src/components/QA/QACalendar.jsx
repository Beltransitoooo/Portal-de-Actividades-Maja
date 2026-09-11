import { useState, useRef, useEffect } from 'react';

// --- CONFIGURACIÓN VISUAL DE ESTADOS ---
const STATUS_CONFIG = {
    'PENDIENTE':   { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', border: 'border-slate-200', hover: 'hover:bg-slate-200' },
    'EN PROGRESO': { color: 'text-[#1296E8]', bg: 'bg-[#1296E8]/10', dot: 'bg-[#1296E8]', border: 'border-[#1296E8]/20', hover: 'hover:bg-[#1296E8]/20' },
    'EN REVISIÓN': { color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
    'COMPLETADA':  { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
    'BLOQUEADA':   { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200', hover: 'hover:bg-red-100' }
};

// --- COLORES PARA VISTA COMPACTA ---
const COMPACT_COLORS = [
    'bg-[#1296E8]',   
    'bg-emerald-500', 
    'bg-purple-500',  
    'bg-amber-500',   
    'bg-rose-500',    
];

// --- COMPONENTE: BADGE INTERACTIVO DE ESTADO ---
const CustomStatusBadge = ({ currentStatus, onChangeStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['PENDIENTE'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (status, e) => {
        e.stopPropagation(); 
        onChangeStatus(status);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[7.5px] font-black tracking-widest uppercase transition-all duration-200 ${config.bg} ${config.border} ${config.color} ${config.hover}`}
                title="Cambiar Estado"
            >
                <span className={`w-1 h-1 rounded-full ${config.dot}`}></span>
                {currentStatus}
                <svg className={`w-2 h-2 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-fade-in origin-top-left">
                    <div className="p-1 flex flex-col gap-0.5">
                        {Object.keys(STATUS_CONFIG).map((status) => {
                            const opt = STATUS_CONFIG[status];
                            return (
                                <button
                                    key={status}
                                    onClick={(e) => handleSelect(status, e)}
                                    className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-[8.5px] font-black tracking-widest uppercase transition-colors hover:bg-slate-50 ${currentStatus === status ? opt.bg + ' ' + opt.color : 'text-slate-600'}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`}></span>
                                    {status}
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
    const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let startDayOfWeek = new Date(year, month, 1).getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const startDateOfCalendar = new Date(year, month, 1);
    startDateOfCalendar.setDate(1 - startDayOfWeek);

    const calendarCells = [];
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDateOfCalendar);
        cellDate.setDate(startDateOfCalendar.getDate() + i);
        calendarCells.push({
            dateObj: cellDate,
            dayNumber: cellDate.getDate(),
            isCurrentMonth: cellDate.getMonth() === month,
            dateStr: cellDate.toISOString().split('T')[0]
        });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const getEquivalentWorkingDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (startDate > endDate) return 1;

        let totalDays = 0;
        let current = new Date(startDate);
        
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek === 6) totalDays += 0.5; 
            else if (dayOfWeek !== 0) totalDays += 1; 
            current.setDate(current.getDate() + 1);
        }
        return totalDays === 0 ? 1 : totalDays; 
    };

    const getUserTheme = (assigneeId) => {
        const user = teamUsers.find(u => u.id === assigneeId);
        return user ? user.theme : { main: 'bg-slate-600' };
    };

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm mt-2 animate-fade-in flex-1 min-h-[650px]">
            
            {/* Header Fijo */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 shrink-0 rounded-t-2xl overflow-hidden">
                {weekDays.map((day, idx) => (
                    <div key={day} className={`py-3 text-center text-[10px] font-black tracking-widest uppercase ${idx === 6 ? 'text-slate-300' : idx === 5 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Cuadrícula Restringida */}
            <div className="grid grid-cols-7 grid-rows-6 bg-slate-200 gap-px flex-1 min-h-0 rounded-b-2xl overflow-hidden">
                {calendarCells.map((cell, index) => {
                    const isToday = cell.dateStr === todayStr;
                    const isSaturday = cell.dateObj.getDay() === 6;
                    const isSunday = cell.dateObj.getDay() === 0;
                    
                    const dayTasks = isSunday ? [] : tasks.filter(t => {
                        if (!t.startDate) return false;
                        const endDate = t.dueDate || t.startDate;
                        return cell.dateStr >= t.startDate && cell.dateStr <= endDate;
                    });

                    const isMultipleTasks = dayTasks.length > 1;
                    const MAX_COMPACT_VISIBLE = 3; 
                    
                    let visibleTasks = dayTasks;
                    let hiddenCount = 0;
                    
                    if (isMultipleTasks && dayTasks.length > MAX_COMPACT_VISIBLE) {
                        visibleTasks = dayTasks.slice(0, MAX_COMPACT_VISIBLE);
                        hiddenCount = dayTasks.length - MAX_COMPACT_VISIBLE;
                    }

                    let cellBg = 'bg-white hover:bg-slate-50/50';
                    if (!cell.isCurrentMonth) cellBg = 'bg-slate-50/50 opacity-70';
                    if (isSunday) cellBg = 'bg-slate-50 opacity-80';

                    return (
                        <div key={index} className={`relative p-1.5 lg:p-2 flex flex-col transition-colors group ${cellBg} min-h-0`}
                             style={isSunday ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.01) 10px, rgba(0,0,0,0.01) 20px)' } : {}}>
                            
                            {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-[#1296E8] shrink-0"></div>}

                            {/* Cabecera del Día */}
                            <div className="flex justify-between items-start mb-1.5 shrink-0">
                                <div className="flex flex-col items-start gap-1">
                                    <span className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                                        isToday ? 'bg-[#1296E8] text-white shadow-md' : 
                                        cell.isCurrentMonth ? (isSunday ? 'text-slate-400' : 'text-[#07152F]') : 'text-slate-300'
                                    }`}>
                                        {cell.dayNumber}
                                    </span>
                                    
                                    {isSaturday && cell.isCurrentMonth && (
                                        <div className="flex items-center bg-amber-50 border border-amber-200/50 text-amber-600 px-1 py-0.5 rounded">
                                            <span className="text-[6.5px] font-black uppercase tracking-widest hidden lg:block">9:00-13:00</span>
                                        </div>
                                    )}
                                    
                                    {isSunday && cell.isCurrentMonth && (
                                        <div className="bg-slate-100 border border-slate-200/60 text-slate-400 px-1 py-0.5 rounded">
                                            <span className="text-[6.5px] font-black uppercase tracking-widest hidden lg:block">Descanso</span>
                                        </div>
                                    )}
                                </div>
                                
                                {dayTasks.length > 0 && !isSunday && (
                                    <span className="text-[8px] font-black text-slate-400 tracking-wider bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded shadow-sm">
                                        {dayTasks.length} ACT
                                    </span>
                                )}
                            </div>

                            {/* ZONA DE CONTENIDO DE ACTIVIDADES */}
                            {!isSunday && (
                                <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                                    
                                    {/* CASO A: UNA SOLA ACTIVIDAD */}
                                    {!isMultipleTasks && dayTasks.length === 1 && (
                                        (() => {
                                            const task = dayTasks[0];
                                            let dailyHours = null;
                                            if (task.maxHours && task.startDate) {
                                                const equivalentDays = getEquivalentWorkingDays(task.startDate, task.dueDate || task.startDate);
                                                let calcHours = parseFloat(task.maxHours) / equivalentDays;
                                                if (isSaturday) calcHours = calcHours * 0.5;
                                                dailyHours = calcHours.toFixed(1); 
                                            }
                                            const theme = getUserTheme(task.assignee);
                                            const isCritical = task.priority === 'CRÍTICA';

                                            return (
                                                <div 
                                                    onClick={() => onTicketClick && onTicketClick(task)}
                                                    // Padding súper compacto (p-1) y estructura flexible para que nada se corte
                                                    className="relative bg-white border border-slate-200 rounded-md p-1 cursor-pointer group/task transition-all duration-200 hover:shadow-md hover:border-[#1296E8]/40 flex flex-col flex-1 min-h-0 overflow-hidden"
                                                >
                                                    {isCritical && <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-red-500 rounded-l-md"></div>}
                                                    
                                                    {/* 1. TÍTULO */}
                                                    <div className="pl-1.5 shrink-0 mb-0.5">
                                                        <span className="text-[10px] font-bold text-[#07152F] line-clamp-1 leading-tight" title={task.title}>
                                                            {task.title}
                                                        </span>
                                                    </div>

                                                    {/* 2. ESTADO E ID (Con mb-auto empuja el contenido de abajo) */}
                                                    <div className="flex justify-between items-center pl-1.5 shrink-0 z-10 mb-auto">
                                                        <CustomStatusBadge 
                                                            currentStatus={task.status} 
                                                            onChangeStatus={(newStatus) => onStatusChange && onStatusChange(task, newStatus)}
                                                        />
                                                        <span className="text-[7.5px] font-black tracking-widest text-slate-400 uppercase">
                                                            {task.id}
                                                        </span>
                                                    </div>

                                                    {/* 3. INFO SECUNDARIA (Totalmente a salvo del corte) */}
                                                    <div className="flex items-center justify-between pl-1.5 shrink-0 border-t border-slate-50 pt-0.5 mt-0.5">
                                                        <div className="flex items-center gap-1 text-slate-400">
                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span className="text-[8px] font-bold">{dailyHours ? `${dailyHours}h` : '--'}</span>
                                                        </div>
                                                        <div className={`w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[5.5px] font-black shadow-sm shrink-0 ${theme.main}`} title={task.assignee}>
                                                            {task.assignee}
                                                        </div>
                                                    </div>

                                                    {(task.progressPct > 0) && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                                            <div className={`h-full ${STATUS_CONFIG[task.status]?.dot || 'bg-slate-400'}`} style={{ width: `${task.progressPct}%` }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()
                                    )}

                                    {/* CASO B: DOS O MÁS ACTIVIDADES */}
                                    {isMultipleTasks && (
                                        <div className="flex flex-col gap-1 w-full shrink-0">
                                            {visibleTasks.map((task, idx) => (
                                                <div 
                                                    key={`${task.id}-${idx}`} 
                                                    onClick={() => onTicketClick && onTicketClick(task)}
                                                    className="flex items-center gap-1.5 px-1.5 py-1 bg-white border border-slate-100 rounded hover:border-[#1296E8]/30 hover:shadow-sm cursor-pointer transition-all shrink-0"
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${COMPACT_COLORS[idx % COMPACT_COLORS.length]}`}></div>
                                                    <span className="text-[9.5px] font-bold text-[#07152F] truncate leading-none mt-0.5">
                                                        {task.title}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {hiddenCount > 0 && (
                                                <div 
                                                    className="text-[8px] font-black text-slate-400 hover:text-[#1296E8] text-center pt-0.5 cursor-pointer transition-colors"
                                                    title="Ver más actividades"
                                                >
                                                    +{hiddenCount} actividad{hiddenCount > 1 ? 'es' : ''}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};