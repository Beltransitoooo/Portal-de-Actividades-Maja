import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarRange, GanttChart, CalendarCheck, UsersRound } from 'lucide-react';

const NAV_ITEMS = [
    { to: '/qa', end: true, label: 'Panel de rendimiento', hint: 'Carga y desviaciones', icon: LayoutDashboard },
    { to: '/qa/actividades', end: false, label: 'Gestor de actividades', hint: 'Calendario del equipo', icon: CalendarRange },
    { to: '/qa/cronograma', end: false, label: 'Cronograma', hint: 'Tiempos por actividad', icon: GanttChart },
    { to: '/qa/mi-dia', end: false, label: 'Mi día', hint: 'Hoy y avisos', icon: CalendarCheck },
];

const ADMIN_ITEMS = [
    { to: '/qa/equipo', end: false, label: 'Equipo', hint: 'Accesos y líderes técnicos', icon: UsersRound },
];

// Cada destino es un carril: el activo lleva el corte tartán (la marca de "estás aquí")
const NavItem = ({ to, end, label, hint, icon: Icon }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-[10px] transition-colors duration-150 ${
                isActive ? 'bg-white shadow-[0_1px_0_rgb(10_22_48/0.06),0_8px_20px_-14px_rgb(10_22_48/0.5)]' : 'hover:bg-white/60'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <span
                    aria-hidden="true"
                    className={`absolute left-1 top-1/2 -translate-y-1/2 w-1 rounded-[1px] -skew-x-[14deg] transition-all duration-200 ${
                        isActive ? 'h-7 bg-tartan' : 'h-0 bg-transparent group-hover:h-3 group-hover:bg-[#94a3b8]'
                    }`}
                ></span>
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#0e71af]' : 'text-[#5b6a80] group-hover:text-[#07152F]'}`} aria-hidden="true" />
                <span className="min-w-0 block">
                    <span className={`block text-[13px] leading-tight ${isActive ? 'font-bold text-[#07152F]' : 'font-semibold text-[#334155] group-hover:text-[#07152F]'}`}>
                        {label}
                    </span>
                    <span className="hidden sm:block text-[11px] text-[#5b6a80] mt-0.5 truncate">{hint}</span>
                </span>
            </>
        )}
    </NavLink>
);

export const Sidebar = () => {
    // Solo decide qué enlaces se muestran; los permisos reales los valida el servidor
    const isAdmin = localStorage.getItem('es_admin') === 'true';

    return (
        <aside aria-label="Barra lateral" className="no-print w-full lg:w-[248px] plano-pagina lg:border-r border-[#dfe5ee] flex flex-col shrink-0 lg:min-h-[calc(100vh-64px)]">
            <div className="p-3 lg:px-4 lg:py-6">
                <nav aria-label="Navegación principal" className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap lg:flex-col">
                    {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
                </nav>

                {isAdmin && (
                    <>
                        <p className="hidden lg:block text-[11px] font-semibold text-[#5b6a80] mt-6 mb-1.5 pl-4">Administración</p>
                        <nav aria-label="Administración" className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap lg:flex-col mt-1 lg:mt-0">
                            {ADMIN_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
                        </nav>
                    </>
                )}
            </div>
        </aside>
    );
};
