import { useEffect, useState } from 'react';

// Tema activo del portal (clase "dark" en <html>), reactivo al cambio desde el perfil
export const useIsDark = () => {
    const read = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const [dark, setDark] = useState(read);
    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => setDark(root.classList.contains('dark')));
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return dark;
};
