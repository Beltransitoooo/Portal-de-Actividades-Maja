import { Link } from 'react-router-dom';
import { HomeLayout } from '../layouts/HomeLayout';

export const Dashboard = () => {
    return (
        <HomeLayout>
            <div className="flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- HEADER EDITORIAL --- */}
                <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-[10px] font-mono font-bold text-[#00A3FF] tracking-[0.3em] uppercase mb-6 block flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-[#00A3FF]"></span>
                            Maja Workspace
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-[#0B132B] tracking-tighter leading-[1.1]">
                            Selecciona un <br />
                            área de trabajo
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-sm pb-2 font-medium">
                        Elige un espacio para continuar con tus actividades operativas y gestión de equipo.
                    </p>
                </div>

                {/* --- GRID DE MÓDULOS --- */}
                <div className="group/grid grid grid-cols-1 lg:grid-cols-3 border-y border-gray-200 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    
                    {/* 01. QA */}
                    <Link 
                        to="/qa" 
                        className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(0,163,255,0.12)] hover:border-transparent group-hover/grid:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:z-20 overflow-hidden"
                    >
                        {/* BACKGROUND DINÁMICO QA (Precisión / Checks) */}
                        <div className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
                            {/* Tint general muy suave */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#00A3FF]/[0.03]"></div>
                            {/* Radial Glow */}
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00A3FF]/10 rounded-full blur-3xl motion-safe:group-hover/card:-translate-y-4 motion-safe:group-hover/card:-translate-x-4 transition-transform duration-700 ease-out"></div>
                            {/* Patrón Técnico / Precisión */}
                            <svg className="absolute inset-0 w-full h-full text-[#00A3FF] opacity-[0.07] motion-safe:scale-110 motion-safe:group-hover/card:scale-100 transition-transform duration-700 ease-out" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="qa-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <path d="M15 0v30M0 15h30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3"/>
                                        <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#qa-grid)" />
                            </svg>
                        </div>

                        {/* Top */}
                        <div className="flex justify-between items-start relative z-10">
                            <span className="font-mono text-sm font-semibold text-gray-300 group-hover/card:text-[#00A3FF] transition-colors duration-500">01</span>
                            <div className="w-10 h-10 flex items-center justify-center text-gray-300 group-hover/card:text-[#00A3FF] motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-grow"></div>

                        {/* Bottom */}
                        <div className="relative z-10">
                            <h2 className="text-6xl font-black text-[#0B132B] tracking-tighter mb-6 group-hover/card:text-[#00A3FF] transition-colors duration-500">QA</h2>
                            <div className="flex items-end justify-between">
                                <p className="text-xs text-[#0B132B]/60 font-medium max-w-[160px] leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                    Aseguramiento de calidad, incidencias y métricas.
                                </p>
                                <div className="text-gray-300 group-hover/card:text-[#00A3FF] motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 02. E-COMMERCE */}
                    <div className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(6,182,212,0.12)] hover:border-transparent group-hover/grid:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:z-20 overflow-hidden cursor-default">
                        
                        {/* BACKGROUND DINÁMICO E-COM (Flujo / Operaciones) */}
                        <div className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-cyan-500/[0.03]"></div>
                            {/* Radial Glow */}
                            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl motion-safe:group-hover/card:translate-y-4 motion-safe:group-hover/card:translate-x-4 transition-transform duration-700 ease-out"></div>
                            {/* Patrón Flujo Geométrico */}
                            <svg className="absolute -right-20 top-20 w-[150%] h-[150%] text-cyan-500 opacity-[0.05] motion-safe:-rotate-6 motion-safe:group-hover/card:rotate-0 transition-transform duration-1000 ease-out" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M -50 50 Q 50 150 150 50 T 350 50" />
                                <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M -50 80 Q 50 180 150 80 T 350 80" />
                                <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M -50 110 Q 50 210 150 110 T 350 110" />
                                <circle cx="150" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/>
                            </svg>
                        </div>

                        {/* Top */}
                        <div className="flex justify-between items-start relative z-10">
                            <h2 className="text-4xl font-black text-[#0B132B] tracking-tighter w-min leading-none group-hover/card:text-cyan-500 transition-colors duration-500">
                                E-COM
                            </h2>
                            <span className="font-mono text-sm font-semibold text-gray-300 group-hover/card:text-cyan-500 transition-colors duration-500">02</span>
                        </div>

                        <div className="flex-grow flex items-center relative z-10">
                            <p className="text-xs text-[#0B132B]/60 font-medium max-w-[180px] leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                Gestión de catálogo, ventas en línea y analíticas de mercado.
                            </p>
                        </div>

                        {/* Bottom */}
                        <div className="relative z-10 flex items-end justify-between">
                            <div className="text-gray-300 group-hover/card:text-cyan-500 motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center text-gray-300 group-hover/card:text-cyan-500 motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 03. DESARROLLO */}
                    <div className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.12)] hover:border-transparent group-hover/grid:opacity-40 hover:!opacity-100 hover:scale-[1.02] hover:z-20 overflow-hidden cursor-default">
                        
                        {/* BACKGROUND DINÁMICO DEV (Arquitectura / Nodos) */}
                        <div className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-500/[0.03]"></div>
                            {/* Radial Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl motion-safe:group-hover/card:scale-125 transition-transform duration-1000 ease-out"></div>
                            {/* Patrón Arquitectura de Software */}
                            <svg className="absolute inset-0 w-full h-full text-indigo-500 opacity-[0.06] motion-safe:-translate-y-4 motion-safe:group-hover/card:translate-y-0 transition-transform duration-700 ease-out" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="dev-mesh" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                                        <path d="M10 10h30v30h-30z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                        <rect x="8" y="8" width="4" height="4" fill="currentColor" opacity="0.8"/>
                                        <rect x="38" y="8" width="4" height="4" fill="currentColor" opacity="0.8"/>
                                        <rect x="8" y="38" width="4" height="4" fill="currentColor" opacity="0.8"/>
                                        <rect x="38" y="38" width="4" height="4" fill="currentColor" opacity="0.8"/>
                                        <path d="M0 25h10M40 25h10M25 0v10M25 40v10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#dev-mesh)" />
                            </svg>
                        </div>

                        {/* Top */}
                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-10 h-10 flex items-center justify-center text-gray-300 group-hover/card:text-indigo-500 motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <p className="text-xs text-[#0B132B]/60 font-medium max-w-[150px] text-right leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                Administración de despliegues, repositorios y sprints.
                            </p>
                        </div>

                        <div className="flex-grow"></div>

                        {/* Bottom */}
                        <div className="relative z-10">
                            <span className="font-mono text-sm font-semibold text-gray-300 group-hover/card:text-indigo-500 transition-colors duration-500 mb-4 block">03</span>
                            <div className="flex items-end justify-between">
                                <h2 className="text-4xl font-black text-[#0B132B] tracking-tighter leading-none group-hover/card:text-indigo-500 transition-colors duration-500">
                                    DEV
                                </h2>
                                <div className="text-gray-300 group-hover/card:text-indigo-500 motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </HomeLayout>
    );
};