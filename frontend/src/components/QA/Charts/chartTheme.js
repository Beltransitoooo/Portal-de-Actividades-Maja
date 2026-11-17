// Estilo común de ejes y retícula (líneas finas un tono sobre la superficie; colores en index.css)
export const AXIS_TICK = { fill: 'var(--viz-muted)', fontSize: 10, fontWeight: 600 };
export const AXIS_LINE = { stroke: 'var(--viz-axis)' };
export const GRID_STROKE = 'var(--viz-grid)';
export const CURSOR = { fill: 'var(--viz-cursor)' };

// 3 → "3", 2.5 → "2.5"
export const fmtNum = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
