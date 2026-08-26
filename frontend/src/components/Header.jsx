import { useNavigate } from 'react-router-dom';
import logoMaja from '../assets/Logo_MAJA.png';

export const Header = ({ username, initials }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <header className="bg-[#041D3B] text-white h-16 flex items-center justify-between px-6 shadow-md z-20 relative">
            {/* Sección de Logo */}
            <div className="flex items-center gap-3">
                <img src={logoMaja} alt="MAJA Logo" className="w-8 h-8 object-contain" />
                <span className="font-black text-xl tracking-[0.15em] flex items-baseline gap-1.5">
                    MAJA <span className="font-medium text-xs tracking-[0.2em] text-blue-300/80">SPORTSWEAR</span>
                </span>
            </div>

            {/* Perfil (Problema de encimado resuelto) */}
            <div className="flex items-center gap-3 bg-[#0a2e5a] rounded-full py-1.5 pl-4 pr-1.5 border border-blue-800/50 shadow-inner">
                <div className="flex flex-col items-end hidden md:flex min-w-[120px] max-w-[180px]">
                    <span className="text-xs font-bold truncate w-full text-right leading-none mb-1">{username}</span>
                    <span className="text-[9px] text-blue-300 tracking-widest uppercase leading-none">En línea</span>
                </div>
                <button 
                    onClick={handleLogout} 
                    title="Cerrar sesión"
                    className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center justify-center hover:bg-blue-400 flex-shrink-0"
                >
                    {initials}
                </button>
            </div>
        </header>
    );
};