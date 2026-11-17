import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { FabricHero } from '../../Brand/FabricHero';
import { RaceBib } from '../../Brand/RaceBib';
import { MotionToggle } from '../../Brand/MotionToggle';
import { getQuarterWeeks, toLocalDateStr } from '../../../utils/dates';

const short = (s) => { const [, m, d] = s.split('-'); return `${d}/${m}`; };

// Encabezado del Panel: tejido 3D detrás, título en registro de dorsal y el sprint actual como dorsal de carrera
export const PerformanceHero = () => {
    const today = toLocalDateStr(new Date());
    const weeks = getQuarterWeeks(new Date());
    const sprint = weeks.find(w => today >= w.start && today <= w.end) || weeks[0];
    // "Q4 - Semana 7" → trimestre "Q4" y número de dorsal "07"
    const quarter = sprint.label.match(/Q\d/)?.[0] ?? '';
    const week = String(sprint.label.match(/Semana (\d+)/)?.[1] ?? '').padStart(2, '0');

    return (
        <section className="relative overflow-hidden rounded-[22px] bg-pista text-white isolate">
            <FabricHero />
            {/* Velo para que el texto siempre se lea sobre la tela */}
            <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0a1630 0%, rgb(10 22 48 / 0.82) 34%, rgb(10 22 48 / 0) 66%)' }}></div>

            <MotionToggle className="absolute right-4 bottom-4 z-10" />
            <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-8 px-6 sm:px-9 py-8 sm:py-10">
                <div className="min-w-0">
                    <nav aria-label="Ruta" className="flex items-center gap-1.5 text-[12px] font-medium text-white/60 mb-3">
                        <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-0.5">
                            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                            Módulos
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span className="text-electrico font-semibold">QA & Testing</span>
                    </nav>
                    <h1 className="font-dorsal uppercase text-[52px] sm:text-[72px] lg:text-[84px] text-white">
                        Panel de<br />rendimiento
                    </h1>
                    <p className="text-[15px] text-white/75 mt-4 max-w-[46ch] leading-relaxed">
                        Carga, entregas y desviaciones del equipo, sprint a sprint.
                    </p>
                </div>

                <RaceBib
                    label={`Sprint actual: ${sprint.label}, del ${short(sprint.start)} al ${short(sprint.end)}`}
                    top={`Sprint ${quarter}, semana`}
                    number={week}
                    bottom={`${short(sprint.start)} – ${short(sprint.end)}`}
                />
            </div>
        </section>
    );
};
