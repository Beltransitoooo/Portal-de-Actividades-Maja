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

    // Obtenemos el color según el usuario. Si no está asignado, usamos gris corporativo.
    const getUserTheme = (assigneeId) => {
        const user = teamUsers.find(u => u.id === assigneeId);
        return user ? user.theme : { main: 'bg-gray-500', light: 'bg-gray-50', border: 'border-gray-500' };
    };

    return (
        <div className="w-full bg-white border border-gray-200 flex flex-col shadow-sm rounded-sm overflow-hidden mt-6">
            
            <div className="grid grid-cols-7 border-b border-gray-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="p-3 text-center text-[10px] font-black text-[#0B132B] tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-200 gap-px border-t border-gray-200">
                {calendarCells.map((cell, index) => {
                    const isToday = cell.dateStr === todayStr;
                    
                    const dayTasks = tasks.filter(t => {
                        if (!t.startDate) return false;
                        const endDate = t.dueDate || t.startDate;
                        return cell.dateStr >= t.startDate && cell.dateStr <= endDate;
                    });

                    return (
                        <div key={index} className={`min-h-[140px] p-2 bg-white transition-colors hover:bg-slate-50 group flex flex-col ${!cell.isCurrentMonth ? 'bg-gray-50/50 opacity-60' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold ${isToday ? 'bg-[#0B132B] text-white w-6 h-6 flex items-center justify-center rounded-sm shadow-sm' : cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {cell.dayNumber}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
                                {dayTasks.map((task, idx) => {
                                    let dailyHours = null;
                                    if (task.maxHours && task.startDate) {
                                        const totalDays = getDaysDiff(task.startDate, task.dueDate || task.startDate);
                                        dailyHours = (parseFloat(task.maxHours) / totalDays).toFixed(1); 
                                    }

                                    // Aplicamos el tema del usuario
                                    const theme = getUserTheme(task.assignee);

                                    return (
                                        <div 
                                            key={`${task.id}-${idx}`} 
                                            onClick={() => onTicketClick && onTicketClick(task)}
                                            className={`p-1.5 border-l-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-y border-r border-y-transparent border-r-transparent hover:border-r-gray-200 hover:border-y-gray-200 cursor-pointer transition-all flex flex-col gap-1 ${theme.light} ${theme.border}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black tracking-widest text-[#0B132B] opacity-70">
                                                    {task.id}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {dailyHours && (
                                                        <span className="bg-white/80 border border-gray-300 text-gray-700 rounded-sm px-1 text-[7px] font-black tracking-wider shadow-sm">
                                                            {dailyHours}H
                                                        </span>
                                                    )}
                                                    {/* Badge de avatar con el color principal del usuario */}
                                                    <span className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[7px] font-bold shadow-sm ${theme.main}`}>
                                                        {task.assignee}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-[9.5px] font-semibold text-[#0B132B] leading-snug line-clamp-2 mt-0.5">
                                                {task.title}
                                            </p>
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