import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Loader } from './Loader';

export const Sidebar = ({ username, initials }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const displayName = username?.split('@')[0] || 'Usuario';

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/');
        }, 2000);
    };

    const navItems = [
        {
            id: 'portal',
            path: '/qa',
            label: 'Portal Principal',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"></path>
                </svg>
            )
        },
        {
            id: 'activities',
            path: '/qa/actividades',
            label: 'Gestor de Actividades',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-7 3c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm5 12H7v-1c0-2.206 2.691-3 5-3s5 .794 5 3v1z"></path>
                </svg>
            )
        },
        {
            id: 'profile',
            path: '/profile',
            label: 'Mi Perfil',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"></path>
                </svg>
            )
        },
        {
            id: 'messages',
            path: '/messages',
            label: 'Mensajes',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M5 18v3.766l1.515-.909L11.277 18H16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h1zM4 8h12v8h-5.277L7 18.234V16H4V8z"></path>
                    <path d="M20 2H8c-1.103 0-2 .897-2 2h12c1.103 0 2 .897 2 2v8c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2z"></path>
                </svg>
            )
        },
        {
            id: 'help',
            path: '/help',
            label: 'Soporte',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z"></path>
                    <path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path>
                </svg>
            )
        },
        {
            id: 'settings',
            path: '/settings',
            label: 'Configuración',
            svg: (
                <svg className="peer-hover/expand:scale-125 peer-hover/expand:text-[#00A3FF] peer-hover/expand:fill-[#00A3FF] peer-checked/expand:text-[#00A3FF] peer-checked/expand:fill-[#00A3FF] text-2xl peer-checked/expand:scale-125 ease-in-out duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z"></path>
                    <path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z"></path>
                </svg>
            )
        }
    ];

    return (
        <>
            {isLoggingOut && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-200/70 backdrop-blur-md">
                    <Loader />
                    <p className="mt-8 text-sm font-bold tracking-widest text-[#0B132B] uppercase animate-pulse">
                        Cerrando sesión...
                    </p>
                </div>
            )}

            <aside className="w-72 bg-white flex flex-col justify-between hidden sm:flex border-r border-gray-200 relative overflow-hidden shadow-sm z-10">
                <div 
                    className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                ></div>

                <div className="flex flex-col h-full relative z-10">
                    <div className="p-6 mt-2">
                        <div className="flex items-center gap-2 mb-6 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Navegación</p>
                        </div>

                        <article className="w-full flex flex-col gap-1 transition-all duration-[450ms] ease-in-out">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <label
                                        key={item.id}
                                        htmlFor={item.id}
                                        onClick={() => navigate(item.path)}
                                        className="has-[:checked]:shadow-sm relative w-full h-14 px-4 ease-in-out duration-300 border border-transparent has-[:checked]:border-gray-200 has-[:checked]:bg-slate-50 group flex flex-row gap-4 items-center text-gray-400 rounded-xl cursor-pointer hover:bg-gray-50/50"
                                    >
                                        <input
                                            className="hidden peer/expand"
                                            type="radio"
                                            name="sidebar-path"
                                            id={item.id}
                                            checked={isActive}
                                            onChange={() => {}}
                                        />
                                        {item.svg}
                                        <span className="font-bold text-xs uppercase tracking-widest peer-checked/expand:text-[#0B132B] transition-colors mt-0.5">
                                            {item.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </article>
                    </div>
                </div>
                
                <div className="p-4 mx-4 mb-6 rounded-2xl bg-white border border-gray-100 shadow-md relative overflow-hidden group z-10">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00A3FF]"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-10 h-10 rounded-xl bg-[#0B132B] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {initials}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-gray-800 truncate" title={username}>
                                {displayName}
                            </p>
                            <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase mt-0.5">
                                Nivel Administrativo
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Cerrar sesión"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </aside>
        </>
    );
};