import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useMotionPaused } from '../../hooks/useMotionPaused';

// La escena (WebGL2) solo se descarga en las pantallas que la muestran
const FabricScene = lazy(() => import('./FabricScene'));

// La escena usa WebGL2; el contexto de prueba se libera de inmediato
const supportsWebGL = () => {
    try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return false;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return true;
    } catch {
        return false;
    }
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Fondo 3D de tejido para un encabezado. Decorativo (aria-hidden).
 * - Sin WebGL: textura de punto estática equivalente.
 * - Con "reducir movimiento": un solo cuadro quieto y sin seguir al cursor.
 * - Fuera de pantalla: la animación se pausa.
 */
export const FabricHero = ({ className = '' }) => {
    const wrapper = useRef(null);
    const pointer = useRef({ x: 0.7, y: 0.55, active: false });
    const [webgl] = useState(supportsWebGL);
    const [reduced, setReduced] = useState(prefersReducedMotion);
    const manualPause = useMotionPaused();
    const still = reduced || manualPause;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return undefined;
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const el = wrapper.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // El cursor se escucha en el encabezado completo (la escena está detrás del texto)
    useEffect(() => {
        const host = wrapper.current?.parentElement;
        if (!host || still) return undefined;
        const move = (e) => {
            const r = host.getBoundingClientRect();
            pointer.current = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height, active: true };
        };
        const leave = () => { pointer.current = { ...pointer.current, active: false }; };
        host.addEventListener('pointermove', move);
        host.addEventListener('pointerleave', leave);
        return () => {
            host.removeEventListener('pointermove', move);
            host.removeEventListener('pointerleave', leave);
        };
    }, [still]);

    const fallback = <div className="absolute inset-0 textura-punto" aria-hidden="true"></div>;

    return (
        <div ref={wrapper} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true" data-testid="fabric-hero">
            {webgl ? (
                <Suspense fallback={fallback}>
                    <FabricScene pointer={pointer} still={still} paused={!visible} />
                </Suspense>
            ) : fallback}
        </div>
    );
};
