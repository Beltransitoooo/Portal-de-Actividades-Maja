import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)]">
            <div className="p-4">
                <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 px-3">
                    Navegación
                </p>

                <nav className="space-y-1">
                    {/* PANEL DE RENDIMIENTO (Ruta principal /qa) */}
                    <NavLink
                        to="/qa"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-md text-xs font-bold transition-all ${
                                isActive
                                    ? 'bg-[#00A3FF]/10 text-[#00A3FF] border-l-4 border-[#00A3FF]'
                                    : 'text-gray-600 hover:bg-slate-50 hover:text-[#0B132B]'
                            }`
                        }
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        PANEL DE RENDIMIENTO
                    </NavLink>

                    {/* GESTOR DE ACTIVIDADES (Tu calendario) */}
                    <NavLink
                        to="/qa/actividades"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-md text-xs font-bold transition-all ${
                                isActive
                                    ? 'bg-[#00A3FF]/10 text-[#00A3FF] border-l-4 border-[#00A3FF]'
                                    : 'text-gray-600 hover:bg-slate-50 hover:text-[#0B132B]'
                            }`
                        }
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        GESTOR DE ACTIVIDADES
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};