import logoMaja from '../assets/Logo_MAJA.png';

export const AuthLayout = ({ children }) => {
    return (
        <div className="flex h-screen w-full font-sans">
            
            {/* LADO IZQUIERDO */}
            <div className="hidden lg:flex w-1/2 bg-[#0B132B] text-white flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[120%] h-[150%] bg-[#060B19] transform rotate-12 translate-x-[40%] -translate-y-[10%] z-0"></div>
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Logo MAJA Proporcionado */}
                <div className="relative z-10 p-12 lg:p-16">
                    <div className="flex items-center gap-5">
                        <img src={logoMaja} alt="Logo MAJA" className="w-12 h-12 object-contain" />
                        <div className="flex flex-col mt-1">
                            <h1 className="font-black text-5xl tracking-widest italic leading-none">MAJA</h1>
                            <span className="font-light text-[10px] tracking-[0.55em] text-[#00A3FF] mt-1.5 pl-0.5">SPORTSWEAR</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 p-12 lg:p-16 mb-8">
                    <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-5">
                        EL IMPULSO <br/>
                        <span className="text-[#00A3FF]">QUE NECESITAS.</span>
                    </h2>
                    <p className="text-gray-400 text-sm lg:text-base max-w-md leading-relaxed">
                        Gestión de alto rendimiento para equipos que no se detienen.
                    </p>
                </div>
            </div>

            {/* LADO DERECHO: Fondo gris corporativo */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 relative z-10 overflow-hidden shadow-[inset_20px_0_40px_rgba(0,0,0,0.05)]">
                
                {/* Malla oscura sutil para textura */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#0B132B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/40 rounded-full blur-[100px] pointer-events-none z-0"></div>

                {/* Contenedor del Formulario (Más ancho) */}
                <div className="relative z-20 w-full max-w-[460px]">
                    {children}
                </div>
            </div>
        </div>
    );
};