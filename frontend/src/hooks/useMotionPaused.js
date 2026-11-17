import { useEffect, useState } from 'react';

// Pausa manual de las animaciones decorativas (WCAG 2.2.2): clase en <html> + preferencia guardada.
// Se aplica antes de pintar desde index.html para que no haya un instante de movimiento.
const CLASS = 'animaciones-pausadas';
const KEY = 'maja-animaciones';

const read = () => typeof document !== 'undefined' && document.documentElement.classList.contains(CLASS);

export const setMotionPaused = (paused) => {
    document.documentElement.classList.toggle(CLASS, paused);
    try { localStorage.setItem(KEY, paused ? 'pausadas' : 'activas'); } catch { /* sin almacenamiento: solo esta sesión */ }
};

export const useMotionPaused = () => {
    const [paused, setPaused] = useState(read);
    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => setPaused(root.classList.contains(CLASS)));
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return paused;
};
