import logoMaja from '../assets/Logo_MAJA.png';
import { UserDropdown } from './Shared/UserDropdown';

export const Header = () => {
    return (
        <header className="h-16 bg-[#0B132B] flex items-center justify-between px-6 shadow-md shrink-0 z-40">
            {/* Logo de imagen + Texto de MAJA */}
            <div className="flex items-center gap-3">
                <img 
                    src={logoMaja} 
                    alt="Logo" 
                    className="h-6 w-auto object-contain"
                />
                <span className="text-white font-black text-xl tracking-widest flex items-center gap-2">
                    MAJA <span className="text-[10px] font-normal tracking-[0.3em] text-[#00A3FF] uppercase mt-1">Sportswear</span>
                </span>
            </div>

            {/* Menú de Usuario */}
            <UserDropdown />
        </header>
    );
};