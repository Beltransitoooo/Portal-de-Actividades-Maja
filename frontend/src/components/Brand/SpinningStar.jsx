import { useState, useRef, useEffect } from 'react';
import logoMaja from '../../assets/Logo_MAJA.png';

/**
 * Estrella MAJA (el archivo del logo) que gira un cuarto de vuelta cada 3 segundos
 * y da una vuelta completa cuando el cursor pasa por encima.
 * - `triggerRef`: elemento que dispara la vuelta al pasar el cursor (p. ej. todo el logo);
 *   sin él, la dispara la propia estrella.
 * - `size`: píxeles o un valor CSS.
 * Dos capas: la exterior hace la vuelta del cursor y la interior el ciclo de 3 s, así no se pisan.
 * Con "reducir movimiento" queda quieta (ver index.css).
 */
export const SpinningStar = ({ size = 280, className = '', triggerRef }) => {
    const [spinning, setSpinning] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        const trigger = triggerRef?.current || el;
        if (!el || !trigger) return undefined;
        const start = () => setSpinning(true);
        // Fin de la vuelta: evento nativo (onAnimationEnd de React depende de que el navegador
        // declare AnimationEvent). Solo cuenta la animación de esta capa.
        const done = (e) => { if (e.target === el) setSpinning(false); };
        trigger.addEventListener('mouseenter', start);
        el.addEventListener('animationend', done);
        el.addEventListener('animationcancel', done);
        return () => {
            trigger.removeEventListener('mouseenter', start);
            el.removeEventListener('animationend', done);
            el.removeEventListener('animationcancel', done);
        };
    }, [triggerRef]);

    return (
        <div
            ref={ref}
            className={`relative shrink-0 select-none ${spinning ? 'estrella-vuelta' : ''} ${className}`}
            style={{ width: size, height: size }}
            data-testid="estrella-maja"
            aria-hidden="true"
        >
            <img src={logoMaja} alt="" draggable="false" className="estrella-ciclo w-full h-full object-contain" />
        </div>
    );
};
