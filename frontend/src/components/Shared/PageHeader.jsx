import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Encabezado común de los módulos: migas, título con el acento diagonal MAJA y zona de controles.
export const PageHeader = ({ title, subtitle, crumb = 'QA & Testing', children }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-5 animate-fade-in">
        <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                <Link to="/dashboard" className="hover:text-[#0e71af] transition-colors flex items-center gap-1" title="Regresar a selección de módulo">
                    <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                    Módulos
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-[#0e71af]">{crumb}</span>
            </div>

            <div className="flex items-stretch gap-3">
                <span aria-hidden="true" className="w-1.5 bg-[#0072b2] rounded-sm -skew-x-12 shrink-0"></span>
                <h1 className="text-3xl lg:text-4xl font-black italic text-[#07152F] tracking-tight uppercase leading-none pr-2">
                    {title}
                </h1>
            </div>

            {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium max-w-xl">{subtitle}</p>}
        </div>

        {children && <div className="flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </div>
);
