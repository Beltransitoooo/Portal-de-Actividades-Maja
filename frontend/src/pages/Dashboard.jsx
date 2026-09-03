// src/pages/Dashboard.jsx (o como se llame tu vista de módulos)
import { Link } from 'react-router-dom';
import { HomeLayout } from '../layouts/HomeLayout'; // Importamos el layout sin Sidebar

export const Dashboard = () => {
    return (
        <HomeLayout>
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#00A3FF]"></span>
                    <span className="text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest">Portal Principal</span>
                </div>
                <h1 className="text-4xl font-black text-[#0B132B] tracking-tight mb-3">Selección de Módulo</h1>
                <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
                    Bienvenido al sistema integrado de MAJA. Selecciona el área de trabajo a la que deseas acceder para continuar con tus operaciones.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TARJETA DE QA */}
                <Link to="/qa" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-xl hover:border-[#00A3FF]/30 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="text-xl">🎯</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-[#0B132B]">QA</h2>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-[#00A3FF] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">Aseguramiento de calidad, reporte de incidencias y métricas de software.</p>
                </Link>

                {/* TARJETA E-COMMERCE */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6">
                        <span className="text-xl">🛍️</span>
                    </div>
                    <h2 className="text-xl font-black text-[#0B132B] mb-2">E-COMMERCE</h2>
                    <p className="text-xs text-gray-500 leading-relaxed">Gestión de catálogo, ventas en línea y analíticas de mercado.</p>
                </div>

                {/* TARJETA DESARROLLO */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6">
                        <span className="text-xl">⚡</span>
                    </div>
                    <h2 className="text-xl font-black text-[#0B132B] mb-2">DESARROLLO</h2>
                    <p className="text-xs text-gray-500 leading-relaxed">Administración de despliegues, repositorios y sprints técnicos.</p>
                </div>
            </div>
        </HomeLayout>
    );
};