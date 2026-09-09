import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)]">
            <div className="p-4 lg:p-6">
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 px-2">
                    Navegación
                </p>

                <nav className="space-y-1">
                    {/* PANEL DE RENDIMIENTO */}
                    <NavLink
                        to="/qa"
                        end
                        className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-[#00A3FF]/10 text-[#00A3FF]'
                                    : 'text-gray-500 hover:bg-slate-50 hover:text-[#0B132B]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Indicador lateral premium */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00A3FF] rounded-r-md"></div>
                                )}
                                <svg className={`w-4 h-4 ${isActive ? 'text-[#00A3FF]' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                PANEL DE RENDIMIENTO
                            </>
                        )}
                    </NavLink>

                    {/* GESTOR DE ACTIVIDADES */}
                    <NavLink
                        to="/qa/actividades"
                        className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-[#00A3FF]/10 text-[#00A3FF]'
                                    : 'text-gray-500 hover:bg-slate-50 hover:text-[#0B132B]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00A3FF] rounded-r-md"></div>
                                )}
                                <svg className={`w-4 h-4 ${isActive ? 'text-[#00A3FF]' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                GESTOR DE ACTIVIDADES
                            </>
                        )}
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};