export const QACalendar = ({ tasks, currentDate, onTicketClick }) => {
    const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    
    // Lógica para generar la cuadrícula de fechas exacta
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Determinar qué día de la semana empieza el mes (Ajustado a Lunes = 0)
    let startDayOfWeek = new Date(year, month, 1).getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Crear 42 celdas (6 filas de 7 días) para que cualquier mes quepa perfecto
    const startDateOfCalendar = new Date(year, month, 1);
    startDateOfCalendar.setDate(1 - startDayOfWeek);

    const calendarCells = [];
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDateOfCalendar);
        cellDate.setDate(startDateOfCalendar.getDate() + i);
        
        // Formato estricto YYYY-MM-DD para comparar strings de forma segura
        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');
        
        calendarCells.push({
            dayNumber: cellDate.getDate(),
            isCurrentMonth: cellDate.getMonth() === month,
            dateStr: `${yyyy}-${mm}-${dd}`
        });
    }

    // Fecha actual para resaltar el "Día de hoy"
    const todayStr = new Date().toISOString().split('T')[0];

    // Asignación de colores corporativos según la prioridad
    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'CRÍTICA': return 'border-red-500 text-red-700 bg-red-50';
            case 'ALTA': return 'border-orange-500 text-orange-700 bg-orange-50';
            case 'MEDIA': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
            default: return 'border-[#00A3FF] text-[#00A3FF] bg-blue-50';
        }
    };

    // Función auxiliar para calcular días de diferencia entre dos fechas
    const getDaysDiff = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día actual
    };

    return (
        <div className="w-full bg-white border border-gray-200 flex flex-col shadow-sm rounded-sm overflow-hidden mt-6">
            
            {/* Encabezado con los días de la semana */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="p-3 text-center text-[10px] font-black text-[#0B132B] tracking-widest uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Cuadrícula de 42 días (6 filas) */}
            <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-200 gap-px border-t border-gray-200">
                {calendarCells.map((cell, index) => {
                    const isToday = cell.dateStr === todayStr;
                    
                    // Filtrar tareas que caen en este día específico
                    const dayTasks = tasks.filter(t => {
                        if (!t.startDate) return false;
                        const endDate = t.dueDate || t.startDate;
                        return cell.dateStr >= t.startDate && cell.dateStr <= endDate;
                    });

                    return (
                        <div 
                            key={index} 
                            className={`min-h-[140px] p-2 bg-white transition-colors hover:bg-slate-50 group flex flex-col ${!cell.isCurrentMonth ? 'bg-gray-50/50 opacity-60' : ''}`}
                        >
                            {/* Número del día */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold ${isToday ? 'bg-[#0B132B] text-white w-6 h-6 flex items-center justify-center rounded-sm shadow-sm' : cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {cell.dayNumber}
                                </span>
                            </div>

                            {/* Renderizado de los tickets en la celda */}
                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
                                {dayTasks.map((task, idx) => {
                                    
                                    // Cálculo de horas distribuidas por día
                                    let dailyHours = null;
                                    if (task.maxHours && task.startDate) {
                                        const totalDays = getDaysDiff(task.startDate, task.dueDate || task.startDate);
                                        dailyHours = (parseFloat(task.maxHours) / totalDays).toFixed(1); 
                                    }

                                    return (
                                        <div 
                                            key={`${task.id}-${idx}`} 
                                            onClick={() => onTicketClick && onTicketClick(task)} // Evento para abrir el panel
                                            className={`p-1.5 border-l-2 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-y border-r border-y-transparent border-r-transparent hover:border-r-gray-200 hover:border-y-gray-200 cursor-pointer transition-all flex flex-col gap-1 ${getPriorityColor(task.priority)}`}
                                        >
                                            {/* Header de la tarjeta */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black tracking-widest">{task.id}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {/* Badge de Horas si existen */}
                                                    {dailyHours && (
                                                        <span className="bg-white/80 border border-current rounded-sm px-1 text-[7px] font-black tracking-wider opacity-80">
                                                            {dailyHours}H
                                                        </span>
                                                    )}
                                                    <span className="w-4 h-4 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-[7px] font-bold">
                                                        {task.assignee}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Detalles: Tipo y Título */}
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-bold uppercase opacity-70 tracking-widest">
                                                    {task.type || 'TAREA'}
                                                </span>
                                            </div>
                                            <p className="text-[9.5px] font-medium text-gray-800 leading-snug line-clamp-2">
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