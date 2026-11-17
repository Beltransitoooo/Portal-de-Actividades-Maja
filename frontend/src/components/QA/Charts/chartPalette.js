// Paleta "Tejido y pista" de las gráficas del Panel de rendimiento.
// Validada con el script del método dataviz contra las superficies reales del portal
// (blanco en claro, #111a2c en oscuro): banda de luminosidad, croma, daltonismo (protan/deutan)
// y visión normal, en pares vecinos y en el par de cierre del pastel (5 ↔ 1).
// Orden fijo: azul MAJA, tartán, césped, ciruela, oro. "Otros" usa un gris neutro reservado.
export const PALETTE = {
    light: ['#0e71af', '#e4572e', '#2a9d6f', '#9b3f86', '#d4a017'],
    dark: ['#3a8fd2', '#dc5a33', '#21906a', '#c75fb0', '#ad7f19'],
};
export const OTHER = { light: '#8b97a8', dark: '#6b7a90' };

// Roles con significado (siempre acompañados de texto o ícono)
export const roles = (dark) => {
    const p = dark ? PALETTE.dark : PALETTE.light;
    return {
        estimated: p[0],     // azul MAJA
        real: p[1],          // tartán
        onTime: p[0],
        late: p[1],
        under: p[0],         // menos horas de lo estimado
        over: p[1],          // más horas de lo estimado
        equal: dark ? OTHER.dark : OTHER.light,
        ok: p[0],
        warning: p[4],       // oro
        critical: p[1],      // tartán
        capacity: dark ? '#9aa9bf' : '#64748b',
    };
};

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const toRgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map(c => clamp(c).toString(16).padStart(2, '0')).join('')}`;

// Aclara (amount > 0) u oscurece (amount < 0) mezclando con blanco o negro
export const shade = (hex, amount) => {
    const target = amount >= 0 ? 255 : 0;
    const t = Math.abs(amount);
    return toHex(toRgb(hex).map(c => c + (target - c) * t));
};

// Caras del volumen 3D: superior con luz, lateral en sombra (luz desde arriba a la izquierda)
export const faces = (hex) => ({ front: hex, top: shade(hex, 0.28), side: shade(hex, -0.3) });

const luminance = (hex) => {
    const [r, g, b] = toRgb(hex).map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
};
// Texto sobre un relleno: blanco o casi negro, el que tenga más contraste
export const textOn = (hex) => (contrast(hex, '#ffffff') >= contrast(hex, '#0b0b0b') ? '#ffffff' : '#0b0b0b');
