import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    
    const username = localStorage.getItem('username') || 'Usuario';
    const initials = username.substring(0, 2).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    
    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/', { replace: true }); 
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón que activa el menú */}
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 bg-[#00A3FF]/20 text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white transition-colors rounded-full font-bold shadow-sm"
            >
                {initials}
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute right-0 mt-2 z-50 max-w-xs w-64 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)] animate-fade-in">
                    
                    {/* Cabecera */}
                    <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-blue-600">
                        <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">
                            Signed in as
                        </p>
                        <div className="flex items-center mt-1">
                            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-2 shrink-0">
                                <svg fill="currentColor" viewBox="0 0 20 20" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-white truncate relative">
                                {username}
                            </p>
                        </div>
                    </div>

                    {/* Opciones */}
                    <div className="py-1.5 bg-white">
                        <button type="button" className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200">
                            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                                <svg fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5 text-blue-600 group-hover:text-[#2b6cb0]" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-[#1a365d]">Profile</span>
                        </button>

                        <button type="button" className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200">
                            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                                <svg fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5 text-blue-600 group-hover:text-[#2b6cb0]" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-[#1a365d]">Settings</span>
                        </button>

                        <button 
                            type="button"
                            onClick={handleLogout}
                            className="w-full group relative flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-all duration-200"
                        >
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-y-100 scale-y-80"></div>
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-red-200 transition-colors duration-200">
                                <svg fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5 text-red-500 group-hover:text-red-600" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-red-600">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};