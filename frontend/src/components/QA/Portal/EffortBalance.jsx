import { PieChart } from 'lucide-react';
import { PALETTE, faces, textOn } from '../Charts/chartPalette';
import { useIsDark } from '../../../hooks/useIsDark';

export const EffortBalance = ({ balanceData = null }) => {
    const p = useIsDark() ? PALETTE.dark : PALETTE.light;
    const segments = balanceData ? [
        { label: 'Funcionales', pct: balanceData.funcionales, color: p[0] },
        { label: 'Pruebas', pct: balanceData.automatizacion, color: p[1] },
        { label: 'Bugs / Perf.', pct: balanceData.performance, color: p[2] },
    ] : [];
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h2 className="text-[17px] font-bold tracking-tight text-[#0B132B] flex items-center gap-2 mb-8">
                <PieChart className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                Balance de esfuerzo por tipo
            </h2>

            {!balanceData ? (
                /* ESTADO VACÍO (Empty State) */
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-gray-100 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 mb-4 shadow-sm text-gray-500">
                        <PieChart className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-[#0B132B]">Sin actividades para calcular</p>
                    <p className="text-xs text-gray-500 mt-1.5 max-w-[280px]">
                        El balance por tipo aparecerá aquí cuando el equipo registre actividades.
                    </p>
                </div>
            ) : (
            <div className="flex-1 flex flex-col justify-center">
                {/* BARRA DE ESFUERZO EN 3D: tres segmentos con volumen, colores de la paleta del panel */}
                <div className="relative flex mb-8 pt-[8px] pr-[8px]" role="img" aria-label={`Funcionales ${balanceData.funcionales}%, Pruebas ${balanceData.automatizacion}%, Bugs / Perf. ${balanceData.performance}%`}>
                    {segments.map((seg, i) => seg.pct > 0 && (
                        <div key={seg.label} className="relative h-7" style={{ width: `${seg.pct}%`, marginLeft: i ? 3 : 0 }} title={`${seg.label}: ${seg.pct}%`}>
                            <span aria-hidden="true" className="absolute left-0 right-0 bottom-full h-[8px] origin-bottom-left" style={{ background: faces(seg.color).top, transform: 'skewX(-45deg)' }}></span>
                            {i === segments.length - 1 || segments.slice(i + 1).every(s => !s.pct) ? (
                                <span aria-hidden="true" className="absolute top-0 bottom-0 left-full w-[8px] origin-top-left" style={{ background: faces(seg.color).side, transform: 'skewY(-45deg)' }}></span>
                            ) : null}
                            <span className="absolute inset-0 flex items-center justify-center" style={{ background: seg.color }}>
                                {seg.pct > 10 && <span className="text-[11px] font-bold" style={{ color: textOn(seg.color) }}>{seg.pct}%</span>}
                            </span>
                        </div>
                    ))}
                </div>

                {/* LEYENDAS */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2.5 h-2.5 rounded-[3px] mb-2" style={{ background: segments[0].color }}></div>
                        <span className="text-xs font-bold text-[#0B132B]">Funcionales</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2.5 h-2.5 rounded-[3px] mb-2" style={{ background: segments[1].color }}></div>
                        <span className="text-xs font-bold text-[#0B132B]">Pruebas</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-2.5 h-2.5 rounded-[3px] mb-2" style={{ background: segments[2].color }}></div>
                        <span className="text-xs font-bold text-[#0B132B]">Bugs / Perf.</span>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
