import { Link } from 'react-router-dom';
import { ShieldCheck, ShoppingBag, Code2, MoveRight } from 'lucide-react';
import { HomeLayout } from '../layouts/HomeLayout';

export const Dashboard = () => {
    return (
        <HomeLayout>
            <div className="flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- HEADER EDITORIAL --- */}
                <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-[10px] font-mono font-bold text-[#0072b2] tracking-[0.3em] uppercase mb-6 block flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-[#0072b2]"></span>
                            Maja Workspace
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black italic text-[#0B132B] tracking-tighter leading-[1.1]">
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
                        className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(0,163,255,0.12)] hover:border-transparent group-hover/grid:grayscale hover:!grayscale-0 hover:scale-[1.02] hover:z-20 overflow-hidden"
                    >
                        {/* BACKGROUND DINÁMICO QA (Precisión / Checks) */}
                        <div className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
                            {/* Tint general muy suave */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#00A3FF]/[0.03]"></div>
                            {/* Radial Glow */}
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00A3FF]/10 rounded-full blur-3xl motion-safe:group-hover/card:-translate-y-4 motion-safe:group-hover/card:-translate-x-4 transition-transform duration-700 ease-out"></div>
                            {/* Patrón Técnico / Precisión */}
                            <svg className="absolute inset-0 w-full h-full text-[#0072b2] opacity-[0.07] motion-safe:scale-110 motion-safe:group-hover/card:scale-100 transition-transform duration-700 ease-out" xmlns="http://www.w3.org/2000/svg">
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
                            <span className="font-mono text-sm font-semibold text-gray-500 group-hover/card:text-[#0072b2] transition-colors duration-500">01</span>
                            <div className="w-10 h-10 flex items-center justify-center text-gray-500 group-hover/card:text-[#0072b2] motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <ShieldCheck className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </div>
                        </div>

                        <div className="flex-grow"></div>

                        {/* Bottom */}
                        <div className="relative z-10">
                            <h2 className="text-6xl font-black text-[#0B132B] tracking-tighter mb-6 group-hover/card:text-[#0072b2] transition-colors duration-500">QA</h2>
                            <div className="flex items-end justify-between">
                                <p className="text-xs text-[#0B132B]/60 font-medium max-w-[160px] leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                    Aseguramiento de calidad, incidencias y métricas.
                                </p>
                                <div className="text-gray-500 group-hover/card:text-[#0072b2] motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                    <MoveRight className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 02. E-COMMERCE */}
                    <div className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(6,182,212,0.12)] hover:border-transparent group-hover/grid:grayscale hover:!grayscale-0 hover:scale-[1.02] hover:z-20 overflow-hidden cursor-default">
                        
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
                            <h2 className="text-4xl font-black text-[#0B132B] tracking-tighter w-min leading-none group-hover/card:text-cyan-700 transition-colors duration-500">
                                E-COM
                            </h2>
                            <div className="flex flex-col items-end gap-2">
                                <span className="font-mono text-sm font-semibold text-gray-500 group-hover/card:text-cyan-700 transition-colors duration-500">02</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">Próximamente</span>
                            </div>
                        </div>

                        <div className="flex-grow flex items-center relative z-10">
                            <p className="text-xs text-[#0B132B]/60 font-medium max-w-[180px] leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                Gestión de catálogo, ventas en línea y analíticas de mercado.
                            </p>
                        </div>

                        {/* Bottom */}
                        <div className="relative z-10 flex items-end justify-between">
                            <div className="text-gray-500 group-hover/card:text-cyan-700 motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                <MoveRight className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center text-gray-500 group-hover/card:text-cyan-700 motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <ShoppingBag className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    {/* 03. DESARROLLO */}
                    <div className="relative h-[420px] bg-white p-10 flex flex-col group/card motion-safe:transition-all motion-safe:duration-500 ease-out hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.12)] hover:border-transparent group-hover/grid:grayscale hover:!grayscale-0 hover:scale-[1.02] hover:z-20 overflow-hidden cursor-default">
                        
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
                            <div className="w-10 h-10 flex items-center justify-center text-gray-500 group-hover/card:text-indigo-500 motion-safe:group-hover/card:scale-110 transition-all duration-500">
                                <Code2 className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                            </div>
                            <p className="text-xs text-[#0B132B]/60 font-medium max-w-[150px] text-right leading-relaxed group-hover/card:text-[#0B132B]/80 transition-colors duration-500">
                                Administración de despliegues, repositorios y sprints.
                            </p>
                        </div>

                        <div className="flex-grow"></div>

                        {/* Bottom */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-mono text-sm font-semibold text-gray-500 group-hover/card:text-indigo-500 transition-colors duration-500">03</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">Próximamente</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h2 className="text-4xl font-black text-[#0B132B] tracking-tighter leading-none group-hover/card:text-indigo-500 transition-colors duration-500">
                                    DEV
                                </h2>
                                <div className="text-gray-500 group-hover/card:text-indigo-500 motion-safe:transform motion-safe:group-hover/card:translate-x-3 transition-all duration-500">
                                    <MoveRight className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </HomeLayout>
    );
};