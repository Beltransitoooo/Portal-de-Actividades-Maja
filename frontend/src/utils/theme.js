// Preferencia de tema (claro/oscuro) del usuario en este navegador.
// La clase "dark" en <html> activa la capa de colores oscuros definida en index.css.
// index.html aplica el tema guardado antes de pintar para evitar un destello claro.
export const THEME_KEY = 'maja-theme';

export const getStoredTheme = () => {
    try {
        return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
};

export const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // Sin almacenamiento disponible: el tema aplica solo en esta visita
    }
};

// Cierra la sesión local sin perder la preferencia de tema
export const clearSessionStorage = () => {
    const theme = getStoredTheme();
    localStorage.clear();
    applyTheme(theme);
};
