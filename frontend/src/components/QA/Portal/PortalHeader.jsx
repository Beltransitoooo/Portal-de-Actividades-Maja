import { Link } from 'react-router-dom';

export const PortalHeader = ({ selectedSprint, setSelectedSprint, optionsSprints }) => {
    return (
        <div className="flex flex-col mb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                <Link 
                    to="/dashboard" 
                    className="hover:text-[#00A3FF] transition-colors flex items-center gap-1"
                    title="Regresar a Selección de Módulo"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Módulos
                </Link>
                <span>/</span>
                <span className="text-[#00A3FF]">QA & Testing</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h1 className="text-3xl font-black text-[#0B132B] tracking-tight uppercase border-l-4 border-[#00A3FF] pl-4">
                    Panel de Rendimiento
                </h1>

                <div className="relative inline-block">
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Período de Trabajo
                    </label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-sm shadow-sm hover:border-gray-300 transition-all">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sprint Actual:</span>
                        <select 
                            value={selectedSprint}
                            onChange={(e) => setSelectedSprint(e.target.value)}
                            className="bg-transparent text-[10px] font-black text-[#0B132B] uppercase tracking-widest focus:outline-none cursor-pointer pr-2"
                        >
                            {optionsSprints.map((sprint, idx) => (
                                <option key={idx} value={sprint}>{sprint}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};