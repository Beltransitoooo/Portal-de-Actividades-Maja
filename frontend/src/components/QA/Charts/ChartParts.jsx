import { useState, useId } from 'react';
import { Table2, BarChart3, Download } from 'lucide-react';
import { toCsv, downloadCsv } from '../../../utils/csv';
import { fmtNum as fmt } from './chartTheme';

/**
 * Tarjeta de gráfica con su vista de tabla (equivalente accesible: todos los valores sin depender
 * del color ni del tooltip). `columns`: [{ key, label, align, format }]; `rows`: objetos.
 * Con `csvName`, descarga los mismos datos de la tabla en CSV.
 */
export const ChartCard = ({ title, subtitle, legend, note, columns, rows, children, className = '', csvName }) => {
    const [showTable, setShowTable] = useState(false);
    const headingId = useId();

    return (
        <figure aria-labelledby={headingId} className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-3 min-w-0 ${className}`}>
            {/* Si la tarjeta es angosta, los botones bajan a su propia línea en vez de encimarse con el título */}
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1 basis-[180px]">
                    <h3 id={headingId} className="text-[16px] font-bold tracking-tight text-[#07152F]">{title}</h3>
                    {subtitle && <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed max-w-[62ch]">{subtitle}</p>}
                </div>
                {columns && (
                    <div className="no-print shrink-0 flex items-center gap-1.5">
                    {csvName && (
                        <button
                            type="button"
                            onClick={() => downloadCsv(`${csvName}.csv`, toCsv(
                                columns.map(c => ({ label: c.label, value: (r) => (c.format ? c.format(r[c.key], r) : r[c.key]) })),
                                rows,
                            ))}
                            disabled={rows.length === 0}
                            aria-label={`Descargar CSV: ${title}`}
                            title="Descargar los datos en CSV"
                            className="h-8 px-2.5 flex items-center gap-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 hover:text-[#07152F] hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                            CSV
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowTable(v => !v)}
                        aria-pressed={showTable}
                        className="h-8 px-3 flex items-center gap-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 hover:text-[#07152F] hover:border-gray-300 transition-colors"
                    >
                        {showTable ? <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> : <Table2 className="w-3.5 h-3.5" aria-hidden="true" />}
                        {showTable ? 'Ver gráfica' : 'Ver tabla'}
                    </button>
                    </div>
                )}
            </div>

            {legend && !showTable && <Legend items={legend} />}

            {showTable ? (
                rows.length === 0 ? (
                    <p className="text-xs text-gray-500">Sin datos en el periodo.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <caption className="sr-only">{title}</caption>
                            <thead>
                                <tr className="border-b border-gray-200">
                                    {columns.map(c => (
                                        <th key={c.key} scope="col" className={`py-2 px-2 text-[12px] font-bold text-gray-500 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>{c.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0">
                                        {columns.map(c => (
                                            <td key={c.key} className={`py-1.5 px-2 text-[#07152F] ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                                                {c.format ? c.format(r[c.key], r) : r[c.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : children}

            {note && <figcaption className="text-[10px] text-gray-500 leading-relaxed">{note}</figcaption>}
        </figure>
    );
};

// Leyenda: la marca lleva el color; el texto, la tinta normal
export const Legend = ({ items }) => (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Leyenda">
        {items.map(item => (
            <li key={item.label} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                {item.shape === 'line'
                    ? <span aria-hidden="true" className="w-3.5 h-0.5 rounded-full" style={{ background: item.color }}></span>
                    : <span aria-hidden="true" className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }}></span>}
                {item.icon && <item.icon className="w-3 h-3" aria-hidden="true" />}
                {item.label}
            </li>
        ))}
    </ul>
);

/**
 * Tooltip: el valor manda y el nombre de la serie acompaña; cada fila lleva una línea corta del color
 * de la serie. `rows(payload)` permite agregar filas calculadas (p. ej. diferencia o jornada).
 */
export const ChartTooltip = ({ active, payload, label, unit = 'h', title, extra }) => {
    if (!active || !payload || payload.length === 0) return null;
    const heading = title ? title(payload[0].payload, label) : label;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 min-w-[150px]">
            <p className="text-[10px] font-bold text-gray-500 mb-1">{heading}</p>
            <ul className="flex flex-col gap-0.5">
                {payload.map(p => (
                    <li key={p.dataKey} className="flex items-center gap-2 text-xs">
                        <span aria-hidden="true" className="w-3 h-0.5 rounded-full shrink-0" style={{ background: p.color || p.payload?.fill }}></span>
                        <span className="font-black text-[#07152F] tabular-nums">{fmt(Number(p.value) || 0)}{unit && ` ${unit}`}</span>
                        <span className="text-gray-500">{p.name}</span>
                    </li>
                ))}
                {extra && extra(payload[0].payload).map(row => (
                    <li key={row} className="text-[11px] text-gray-500 pt-0.5">{row}</li>
                ))}
            </ul>
        </div>
    );
};

// Mensaje dentro de una tarjeta cuando el periodo no tiene datos para esa gráfica
export const EmptyChart = ({ children }) => (
    <div className="h-[200px] flex items-center justify-center text-center text-xs text-gray-500 bg-slate-50 rounded-lg px-6">
        {children}
    </div>
);
