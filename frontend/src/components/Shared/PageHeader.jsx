import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Encabezado común de los módulos: migas, título en registro de dorsal con el corte tartán y controles.
export const PageHeader = ({ title, subtitle, crumb = 'QA & Testing', children }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
        <div className="min-w-0">
            <nav aria-label="Ruta" className="flex items-center gap-1.5 text-[12px] font-medium text-[#5b6a80] mb-2.5">
                <Link to="/dashboard" className="hover:text-[#0e71af] transition-colors flex items-center gap-0.5" title="Regresar a selección de módulo">
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    Módulos
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-[#0e71af] font-semibold">{crumb}</span>
            </nav>

            <div className="flex items-stretch gap-3">
                <span aria-hidden="true" className="w-1.5 bg-tartan rounded-[1px] -skew-x-[14deg] shrink-0"></span>
                <h1 className="font-dorsal text-[44px] lg:text-[54px] text-[#07152F] uppercase pr-2">
                    {title}
                </h1>
            </div>

            {subtitle && <p className="text-[15px] text-[#475569] mt-3 max-w-[60ch] leading-relaxed">{subtitle}</p>}
        </div>

        {children && <div className="flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </div>
);
