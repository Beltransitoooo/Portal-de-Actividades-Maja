import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarRange, GanttChart } from 'lucide-react';

const NAV_ITEMS = [
    { to: '/qa', end: true, label: 'Panel de rendimiento', hint: 'Carga y desviaciones', icon: LayoutDashboard },
    { to: '/qa/actividades', end: false, label: 'Gestor de actividades', hint: 'Calendario del equipo', icon: CalendarRange },
    { to: '/qa/cronograma', end: false, label: 'Cronograma', hint: 'Tiempos por actividad', icon: GanttChart },
];

export const Sidebar = () => {
    return (
        <aside aria-label="Barra lateral" className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between shrink-0 lg:min-h-[calc(100vh-64px)]">
            <div className="p-4 lg:p-6">
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4 px-2">
                    Navegación
                </p>

                <nav aria-label="Navegación principal" className="flex flex-wrap gap-1.5 lg:flex-col">
                    {NAV_ITEMS.map(({ to, end, label, hint, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-[#00A3FF]/10'
                                        : 'hover:bg-slate-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Acento diagonal MAJA del elemento activo */}
                                    {isActive && (
                                        <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0072b2] -skew-x-12 rounded-sm"></span>
                                    )}
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isActive ? 'bg-[#0072b2] text-white shadow-sm' : 'bg-slate-100 text-gray-600 group-hover:bg-slate-200 group-hover:text-[#07152F]'
                                    }`}>
                                        <Icon className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 hidden sm:block">
                                        <span className={`block text-xs font-bold leading-tight ${isActive ? 'text-[#0072b2]' : 'text-gray-600 group-hover:text-[#07152F]'}`}>
                                            {label}
                                        </span>
                                        <span className={`block text-[9px] font-medium mt-0.5 truncate ${isActive ? 'text-[#0b5a8c]' : 'text-gray-500'}`}>
                                            {hint}
                                        </span>
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};
