import { ChevronDown } from 'lucide-react';
import { PageHeader } from '../../Shared/PageHeader';

export const PortalHeader = ({ selectedSprint, setSelectedSprint, optionsSprints, periodRange }) => {
    return (
        <PageHeader
            title="Panel de rendimiento"
            subtitle="Visualiza el progreso, la carga de trabajo y el estado de las actividades del equipo."
        >
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                    Período de trabajo
                </span>

                <div className="focus-ring-within relative group rounded-lg">
                    {/* Control visual; el select nativo transparente va encima */}
                    <div className="flex items-center gap-3 bg-white border border-gray-200 group-hover:border-[#00A3FF]/30 group-hover:shadow-md shadow-sm rounded-lg px-4 py-2.5 text-xs font-bold text-[#0B132B] transition-all duration-200">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>

                        {selectedSprint ? selectedSprint.toUpperCase() : 'SELECCIONA...'}

                        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" aria-hidden="true" />
                    </div>

                    <select
                        value={selectedSprint}
                        onChange={(e) => setSelectedSprint(e.target.value)}
                        aria-label="Período de trabajo"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                    >
                        {optionsSprints.map((sprint, index) => (
                            <option key={index} value={sprint}>
                                {sprint.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {periodRange && (
                    <span className="text-[10px] font-semibold text-gray-500 tracking-wider px-1">
                        {periodRange}
                    </span>
                )}
            </div>
        </PageHeader>
    );
};
