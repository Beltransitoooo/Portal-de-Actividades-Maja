import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { STATUS_CONFIG } from '../../services/qaData';

// Insignia de estado que abre un menú para cambiarlo.
// El menú usa posición fija calculada desde el botón: así ninguna ventana (overflow) lo recorta
// y, si abajo no hay espacio, se abre hacia arriba.
const MENU_WIDTH = 132;
const MENU_HEIGHT = Object.keys(STATUS_CONFIG).length * 28 + 8;

export const StatusBadge = ({ currentStatus, onChangeStatus, disabled = false, size = 'sm' }) => {
    const [menuPos, setMenuPos] = useState(null); // null = cerrado; posición deseada en la ventana
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['PENDIENTE'];
    const isOpen = menuPos !== null;

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (isOpen) { setMenuPos(null); return; }
        setOffset({ x: 0, y: 0 });
        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < MENU_HEIGHT + 8 && rect.top > spaceBelow;
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - MENU_WIDTH - 8);
        setMenuPos({ left, top: openUp ? Math.max(8, rect.top - MENU_HEIGHT - 4) : rect.bottom + 4 });
    };

    // Si un contenedor con transform (p. ej. un panel animado) hace de bloque contenedor del
    // menú fijo, este aparecería desplazado: se mide dónde quedó y se corrige la diferencia.
    useLayoutEffect(() => {
        if (!menuPos || !menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const errorX = menuPos.left - rect.left;
        const errorY = menuPos.top - rect.top;
        if (Math.abs(errorX) > 0.5 || Math.abs(errorY) > 0.5) {
            setOffset(prev => ({ x: prev.x + errorX, y: prev.y + errorY }));
        }
    }, [menuPos, offset]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const close = () => setMenuPos(null);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) close();
        };
        // En captura: Escape cierra solo el menú y no la ventana que lo contiene
        const handleEscape = (event) => {
            if (event.key === 'Escape') { event.stopPropagation(); close(); }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape, true);
        window.addEventListener('resize', close);
        document.addEventListener('scroll', close, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape, true);
            window.removeEventListener('resize', close);
            document.removeEventListener('scroll', close, true);
        };
    }, [isOpen]);

    const handleSelect = (status, e) => {
        e.stopPropagation();
        setMenuPos(null);
        onChangeStatus(status);
    };

    const sizeClasses = size === 'md' ? 'px-2.5 min-h-8 text-[10px]' : 'px-1.5 min-h-6 text-[8px]';

    return (
        <div className="min-w-0 max-w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleMenu}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={`Estado: ${currentStatus}. Cambiar estado`}
                className={`flex items-center gap-1.5 max-w-full min-w-0 rounded border font-black tracking-widest uppercase whitespace-nowrap transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${config.bg} ${config.border} ${config.color} ${config.hover}`}
                title="Cambiar Estado"
            >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true"></span>
                <span className="truncate">{currentStatus}</span>
                <ChevronDown className={`w-2.5 h-2.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Cambiar estado"
                    style={{ position: 'fixed', left: menuPos.left + offset.x, top: menuPos.top + offset.y, width: MENU_WIDTH }}
                    className="bg-white border border-slate-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-fade-in"
                >
                    <div className="p-1 flex flex-col gap-0.5">
                        {Object.keys(STATUS_CONFIG).map((status) => {
                            const opt = STATUS_CONFIG[status];
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => handleSelect(status, e)}
                                    className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-[8.5px] font-black tracking-widest uppercase transition-colors hover:bg-slate-50 ${currentStatus === status ? opt.bg + ' ' + opt.color : 'text-slate-600'}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`}></span>
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
