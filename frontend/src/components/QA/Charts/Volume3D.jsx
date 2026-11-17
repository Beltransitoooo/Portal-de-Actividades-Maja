import { faces, textOn } from './chartPalette';

/**
 * Barra 3D ortográfica para Recharts (`shape={<Bar3D />}`).
 * La cara frontal conserva la escala exacta del eje (la lectura no cambia); la profundidad
 * solo agrega la cara superior (con luz) y la lateral (en sombra). Sirve para columnas,
 * barras horizontales (`horizontal`), valores negativos y segmentos apilados.
 */
export const Bar3D = (props) => {
    const { x, y, width, height, fill, horizontal = false } = props;
    const w = Math.abs(width || 0);
    const h = Math.abs(height || 0);
    // Un valor 0 no dibuja nada (ni la "tapa" superior): solo el largo en el eje del valor cuenta
    if ((horizontal ? w : h) < 0.5) return null;
    const left = Math.min(x, x + width);
    const top = Math.min(y, y + height);
    const thickness = horizontal ? h : w;
    const d = Math.max(3, Math.min(9, thickness * 0.38));
    const dy = d * 0.72;
    const f = faces(fill);
    return (
        <g>
            <polygon points={`${left + w},${top} ${left + w + d},${top - dy} ${left + w + d},${top + h - dy} ${left + w},${top + h}`} fill={f.side} />
            <polygon points={`${left},${top} ${left + d},${top - dy} ${left + w + d},${top - dy} ${left + w},${top}`} fill={f.top} />
            <rect x={left} y={top} width={w} height={h} fill={f.front} />
        </g>
    );
};

/**
 * Medidor 3D (barra de progreso con volumen) para las listas de carga.
 * `pct` 0–100; `track` muestra la canaleta vacía también con volumen.
 */
export const Meter3D = ({ pct, color, trackColor, height = 12, label }) => {
    const f = faces(color);
    const t = faces(trackColor);
    const fill = Math.max(0, Math.min(100, pct));
    const depth = Math.round(height * 0.45);
    const prism = (c, width) => (
        <span className="absolute left-0 bottom-0 block" style={{ width: `${width}%`, height }}>
            <span className="absolute inset-0" style={{ background: c.front }}></span>
            {/* Cara superior: paralelogramo inclinado hacia atrás */}
            <span className="absolute left-0 right-0 origin-bottom-left" style={{ bottom: '100%', height: depth, background: c.top, transform: 'skewX(-45deg)' }}></span>
            {/* Cara lateral */}
            <span className="absolute top-0 bottom-0 origin-top-left" style={{ left: '100%', width: depth, background: c.side, transform: 'skewY(-45deg)' }}></span>
        </span>
    );
    return (
        <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} className="relative block" style={{ height: height + depth, marginRight: depth }}>
            {prism(t, 100)}
            {fill > 0 && prism(f, fill)}
        </span>
    );
};

// Punto de una elipse (ángulo 0 = derecha; crece en sentido horario en pantalla)
const pt = (cx, cy, rx, ry, a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];

/**
 * Pastel 3D: disco extruido con una inclinación moderada.
 * La inclinación acorta las rebanadas de atrás, por eso cada porcentaje va impreso
 * (y en la leyenda/tabla): el número, no el área, es la lectura exacta.
 * `slices`: [{ label, value, pct, fill }].
 */
export const Pie3D = ({ slices, size = 200, tilt = 0.56, depth = 18, ariaLabel }) => {
    const total = slices.reduce((s, x) => s + x.value, 0);
    if (!total) return null;
    const rx = size / 2 - 4;
    const ry = rx * tilt;
    const cx = size / 2;
    const cy = ry + 6;
    const h = depth;
    const height = cy + ry + h + 6;

    // Ángulos desde arriba (-90°) en sentido horario
    const arcs = slices.reduce((list, sl) => {
        const a1 = list.length ? list[list.length - 1].a2 : -Math.PI / 2;
        const a2 = a1 + (sl.value / total) * Math.PI * 2;
        return [...list, { ...sl, a1, a2, f: faces(sl.fill) }];
    }, []);

    const arcPath = (a1, a2) => {
        // Un arco SVG no puede cerrar un círculo completo: se parte en dos
        if (a2 - a1 >= Math.PI * 2 - 1e-6) {
            const mid = a1 + Math.PI;
            return `${arcPath(a1, mid)} ${arcPath(mid, a2).replace(/^M[^A]+/, '')}`;
        }
        const [x1, y1] = pt(cx, cy, rx, ry, a1);
        const [x2, y2] = pt(cx, cy, rx, ry, a2);
        return `M ${x1} ${y1} A ${rx} ${ry} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
    };

    // Paredes visibles: la parte de cada rebanada en la mitad frontal (seno > 0) en [0, π] y [2π, 3π)
    const walls = [];
    for (const s of arcs) {
        for (const [lo, hi] of [[0, Math.PI], [2 * Math.PI, 3 * Math.PI]]) {
            const a = Math.max(s.a1, lo);
            const b = Math.min(s.a2, hi);
            if (b - a > 1e-4) {
                const [x1, y1] = pt(cx, cy, rx, ry, a);
                const [x2, y2] = pt(cx, cy, rx, ry, b);
                walls.push(
                    <path
                        key={`${s.label}-${lo}`}
                        d={`M ${x1} ${y1} A ${rx} ${ry} 0 0 1 ${x2} ${y2} L ${x2} ${y2 + h} A ${rx} ${ry} 0 0 0 ${x1} ${y1 + h} Z`}
                        fill={s.f.side}
                    />
                );
            }
        }
    }

    return (
        <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} role="img" aria-label={ariaLabel}>
            {walls}
            {arcs.map(s => {
                const full = s.a2 - s.a1 >= Math.PI * 2 - 1e-6;
                const d = full
                    ? `${arcPath(s.a1, s.a2)} Z`
                    : `M ${cx} ${cy} L ${pt(cx, cy, rx, ry, s.a1).join(' ')} ${arcPath(s.a1, s.a2).replace(/^M[^A]+/, '')} Z`;
                return <path key={s.label} d={d} fill={s.f.front} stroke={s.f.top} strokeWidth="1"><title>{`${s.label}: ${s.value} (${s.pct}%)`}</title></path>;
            })}
            {arcs.map(s => {
                if (s.pct < 7) return null;
                const mid = (s.a1 + s.a2) / 2;
                const [lx, ly] = s.a2 - s.a1 >= Math.PI * 2 - 1e-6 ? [cx, cy] : pt(cx, cy, rx * 0.6, ry * 0.6, mid);
                return (
                    <text key={`t-${s.label}`} x={lx} y={ly} dy="0.35em" textAnchor="middle" style={{ fill: textOn(s.fill), fontSize: 11, fontWeight: 800 }}>
                        {`${Number.isInteger(s.pct) ? s.pct : s.pct.toFixed(1)}%`}
                    </text>
                );
            })}
        </svg>
    );
};
