// Configuración común de las pruebas.
// Las pruebas de utilidades corren en Node; las de componentes declaran
// `// @vitest-environment jsdom` al inicio del archivo.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(async () => {
    if (typeof document === 'undefined') return;
    // Desmontar lo renderizado para que cada prueba empiece limpia
    const { cleanup } = await import('@testing-library/react');
    cleanup();
});

// jsdom no implementa matchMedia; los componentes lo usan para decidir cuántos meses mostrar
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    });
}
