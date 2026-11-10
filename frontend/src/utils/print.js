// Imprime la página actual (o la guarda como PDF desde el diálogo del navegador).
// El modo oscuro se desactiva mientras se imprime para no gastar tinta ni perder legibilidad.
export const printPage = () => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (wasDark) {
        const restore = () => {
            root.classList.add('dark');
            window.removeEventListener('afterprint', restore);
        };
        root.classList.remove('dark');
        window.addEventListener('afterprint', restore);
    }
    window.print();
};
