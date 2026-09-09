export const QACalendar = ({ tasks, currentDate, onTicketClick, teamUsers }) => {
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
        
        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');
        
        calendarCells.push({
            dayNumber: cellDate.getDate(),
            isCurrentMonth: cellDate.getMonth() === month,
            dateStr: `${yyyy}-${mm}-${dd}`
        });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const getDaysDiff = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    };

    const getUserTheme = (assigneeId) => {
        const user = teamUsers.find(u => u.id === assigneeId);
        return user ? user.theme : { main: 'bg-slate-600', light: 'bg-slate-50', border: 'border-slate-200' };
    };

    // CORRECCIÓN: Ahora el estado manda sobre el color del punto. La prioridad (crítica) ya se maneja en el borde lateral de la tarjeta.
    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'EN PROGRESO': return 'bg-[#1296E8]';
            case 'EN REVISIÓN': return 'bg-amber-400';
            case 'COMPLETADA':  return 'bg-emerald-500';
            case 'BLOQUEADA':   return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]';
            default:            return 'bg-slate-300'; // Pendiente
        }
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm overflow-hidden mt-6 animate-fade-in flex-1">
            
            <div className="grid grid-cols-7 border-b border-gray-100 bg-slate-50/80">
                {weekDays.map(day => (
                    <div key={day} className="py-4 text-center text-xs font-bold text-gray-500 tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 auto-rows-[minmax(180px,1fr)] bg-gray-100 gap-px flex-1">
                {calendarCells.map((cell, index) => {
                    const isToday = cell.dateStr === todayStr;
                    
                    const dayTasks = tasks.filter(t => {
                        if (!t.startDate) return false;
                        const endDate = t.dueDate || t.startDate;
                        return cell.dateStr >= t.startDate && cell.dateStr <= endDate;
                    });

                    return (
                        <div 
                            key={index} 
                            className={`relative p-3 bg-white flex flex-col group transition-colors ${!cell.isCurrentMonth ? 'bg-slate-50/60' : 'hover:bg-slate-50/30'}`}
                        >
                            {isToday && (
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1296E8]"></div>
                            )}

                            <div className="flex justify-between items-start mb-3 px-1 pt-1">
                                <span 
                                    className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                        isToday 
                                        ? 'bg-[#1296E8] text-white shadow-md' 
                                        : cell.isCurrentMonth 
                                            ? 'text-[#07152F]' 
                                            : 'text-gray-300'
                                    }`}
                                >
                                    {cell.dayNumber}
                                </span>
                                
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider bg-gray-50 px-2 py-1 rounded-md">
                                        {dayTasks.length} ACT
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {dayTasks.map((task, idx) => {
                                    let dailyHours = null;
                                    if (task.maxHours && task.startDate) {
                                        const totalDays = getDaysDiff(task.startDate, task.dueDate || task.startDate);
                                        dailyHours = (parseFloat(task.maxHours) / totalDays).toFixed(1); 
                                    }

                                    const theme = getUserTheme(task.assignee);
                                    
                                    // Pasamos solo el status a la función corregida
                                    const statusDotColor = getStatusColor(task.status);

                                    return (
                                        <div 
                                            key={`${task.id}-${idx}`} 
                                            onClick={() => onTicketClick && onTicketClick(task)}
                                            className={`relative p-3 rounded-lg border border-gray-100 bg-white hover:border-[#1296E8]/40 hover:shadow-md hover:-translate-y-[2px] cursor-pointer transition-all duration-200 flex flex-col gap-2 group/task`}
                                        >
                                            {/* Indicador de prioridad Crítica */}
                                            {task.priority === 'CRÍTICA' && (
                                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500 rounded-l-lg"></div>
                                            )}

                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor}`}></div>
                                                    <span className="text-[10px] font-bold tracking-widest text-gray-500 truncate">
                                                        {task.id || 'TICKET'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {dailyHours && (
                                                        <span className="text-[10px] font-bold text-gray-400">
                                                            {dailyHours}h
                                                        </span>
                                                    )}
                                                    <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[8px] font-bold shadow-sm ${theme.main}`}>
                                                        {task.assignee}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs font-semibold text-[#07152F] leading-snug line-clamp-2">
                                                {task.title}
                                            </p>

                                            {(task.progressPct !== undefined || task.status === 'EN PROGRESO') && (
                                                <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden opacity-0 group-hover/task:opacity-100 transition-opacity">
                                                    <div 
                                                        className={`h-full rounded-full ${statusDotColor}`} 
                                                        style={{ width: `${task.progressPct || 50}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};