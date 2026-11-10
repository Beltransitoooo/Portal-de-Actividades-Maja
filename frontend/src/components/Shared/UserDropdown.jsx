import { useState, useRef, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { getInitials } from '../../utils/initials';
import { getStoredTheme, applyTheme, clearSessionStorage } from '../../utils/theme';
import { UserRound, Settings, LogOut, Moon, Sun } from 'lucide-react';

export const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'Usuario';
    const initials = getInitials(username);
    // Solo informativo para la interfaz; los permisos reales los valida el backend
    const roleLabel = localStorage.getItem('es_admin') === 'true' ? 'Administrador' : 'Colaborador';

    const [isDark, setIsDark] = useState(() => getStoredTheme() === 'dark');
    const themeLabelId = useId();

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        applyTheme(next ? 'dark' : 'light');
    };

    const openProfile = () => {
        setIsOpen(false);
        setIsProfileOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    
    const handleLogout = () => {
        clearSessionStorage();
        navigate('/', { replace: true }); 
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón que activa el menú */}
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Menú de usuario: ${username}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="flex items-center justify-center w-10 h-10 bg-[#00A3FF]/20 text-[#00A3FF] hover:bg-[#0072b2] hover:text-white transition-colors rounded-full font-bold shadow-sm"
            >
                {initials}
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute right-0 mt-2 z-50 max-w-xs w-64 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)] animate-fade-in">
                    
                    {/* Cabecera */}
                    <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-blue-600">
                        <p className="text-xs font-medium text-blue-50 uppercase tracking-wider">
                            Sesión iniciada como
                        </p>
                        <div className="flex items-center mt-1">
                            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 shrink-0">
                                <UserRound className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <p className="text-sm font-medium text-white truncate relative">
                                {username}
                            </p>
                        </div>
                    </div>

                    {/* Opciones */}
                    <div className="py-1.5 bg-white">
                        <button type="button" onClick={openProfile} className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200">
                            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                                <UserRound className="h-5 w-5 text-blue-600 group-hover:text-[#2b6cb0]" aria-hidden="true" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-[#1a365d]">Perfil</span>
                        </button>

                        {/* Configuración: aún no definida, visible pero deshabilitada */}
                        <button type="button" disabled title="Próximamente" className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 transition-all duration-200 opacity-60 cursor-not-allowed">
                            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                                <Settings className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            </div>
                            <span className="font-medium text-gray-700">Configuración</span>
                            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Próximamente</span>
                        </button>

                        <button 
                            type="button"
                            onClick={handleLogout}
                            className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-all duration-200"
                        >
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-red-200 transition-colors duration-200">
                                <LogOut className="h-5 w-5 text-red-700" aria-hidden="true" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-red-700">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Perfil: datos disponibles en la sesión actual */}
            <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} eyebrow="Mi cuenta" title="Perfil">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#0072b2] text-white flex items-center justify-center text-lg font-black shadow-md shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-black text-[#07152F] truncate">{username}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{roleLabel}</p>
                    </div>
                </div>

                {/* Preferencia de apariencia: se guarda en este navegador */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p id={themeLabelId} className="text-sm font-bold text-[#07152F]">Modo oscuro</p>
                        <p className="text-xs text-gray-500 mt-0.5">{isDark ? 'Activado' : 'Desactivado'}</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isDark}
                        aria-labelledby={themeLabelId}
                        onClick={toggleTheme}
                        className={`theme-switch relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors duration-200 ${isDark ? 'bg-[#0072b2] border-[#0072b2]' : 'bg-slate-500 border-slate-500'}`}
                    >
                        <span
                            aria-hidden="true"
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`}
                        >
                            {isDark ? (
                                <Moon className="h-3 w-3 text-[#0072b2]" aria-hidden="true" />
                            ) : (
                                <Sun className="h-3 w-3 text-amber-600" aria-hidden="true" />
                            )}
                        </span>
                    </button>
                </div>
            </Modal>
        </div>
    );
};