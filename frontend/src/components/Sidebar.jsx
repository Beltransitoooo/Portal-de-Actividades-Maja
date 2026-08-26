import { useNavigate } from 'react-router-dom';

export const Sidebar = ({ username, initials }) => {
    const navigate = useNavigate();
    const displayName = username.split('@')[0];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <aside className="w-64 bg-white flex flex-col justify-between hidden sm:flex border-r border-gray-200 relative z-10">
            {/* Mallado sutil y minimalista */}
            <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            ></div>

            {/* Menú Superior */}
            <div className="p-8 relative z-10">
                <p className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase mb-8">Navegación</p>
                {/* Espacio para futuros links */}
            </div>
            
            {/* Controles Inferiores (Perfil y Logout) */}
            <div className="relative z-10 border-t border-gray-100 bg-gray-50/50">
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#041D3B] text-white flex items-center justify-center font-bold text-xs rounded-sm">
                            {initials}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                            <p className="text-[10px] text-gray-500 font-semibold tracking-[0.1em] uppercase mt-1">Admin</p>
                        </div>
                    </div>

                    {/* Botón de Logout Minimalista */}
                    <button 
                        onClick={handleLogout}
                        className="group flex items-center gap-3 text-xs font-bold text-gray-400 hover:text-[#041D3B] transition-colors uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
};