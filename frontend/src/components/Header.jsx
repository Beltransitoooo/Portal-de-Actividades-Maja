import logoMaja from '../assets/Logo_MAJA.png';
import { UserDropdown } from './Shared/UserDropdown';

// Encabezado global: marino con textura de punto, marca en registro de dorsal y el corte tartán MAJA
export const Header = () => {
    return (
        <header className="no-print relative h-16 bg-pista textura-punto flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
                <span aria-hidden="true" className="w-1.5 h-8 bg-tartan -skew-x-[14deg] rounded-[1px]"></span>
                <img src={logoMaja} alt="" className="h-6 w-auto object-contain" />
                <p className="flex items-baseline gap-2.5 min-w-0">
                    <span className="font-dorsal text-white text-[28px] leading-none">MAJA</span>
                    <span className="hidden sm:inline font-condensada text-[13px] font-medium text-white/60 truncate">Portal de actividades</span>
                </p>
            </div>

            <UserDropdown />
        </header>
    );
};
