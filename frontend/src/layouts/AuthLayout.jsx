import { useRef } from 'react';
import { SpinningStar } from '../components/Brand/SpinningStar';
import { MotionToggle } from '../components/Brand/MotionToggle';

// Acceso: a la izquierda la marca (con la estrella MAJA del logo girando); a la derecha el formulario.
// En pantallas chicas la marca se vuelve una franja arriba.
export const AuthLayout = ({ children }) => {
    const logoRef = useRef(null);
    return (
        <div className="min-h-screen w-full font-sans flex flex-col lg:flex-row plano-pagina">
            <header className="relative overflow-hidden bg-pista textura-punto text-white isolate lg:w-[52%] lg:min-h-screen flex flex-col justify-between">
                <MotionToggle className="absolute right-5 top-5 sm:right-8 sm:top-8 z-10" />
                {/* Logo: la estrella gira cada 3 s y da una vuelta al pasar el cursor por todo el logo */}
                <div ref={logoRef} className="relative self-start flex items-center gap-3 p-6 sm:p-10 lg:p-14">
                    <span aria-hidden="true" className="w-1.5 h-9 -mt-[17px] bg-tartan -skew-x-[14deg] rounded-[1px]"></span>
                    {/* 50 px de caja = 28 px de estrella visible, el alto de las letras de "MAJA" (el PNG trae margen transparente); -mt la centra con "MAJA", no con "MAJA + Sportswear" */}
                    <SpinningStar size={50} triggerRef={logoRef} className="-mt-[17px] -mx-[8px]" />
                    <p className="flex flex-col leading-none">
                        <span className="font-dorsal text-[40px]">MAJA</span>
                        <span className="font-condensada text-[13px] text-white/65 mt-1">Sportswear</span>
                    </p>
                </div>

                <div className="relative px-6 sm:px-10 lg:px-14 pb-8 lg:pb-16">
                    <p className="font-dorsal uppercase text-[46px] sm:text-[64px] lg:text-[88px] max-w-[11ch]">
                        El impulso que necesitas.
                    </p>
                    <p className="text-[15px] text-white/75 mt-5 max-w-[42ch] leading-relaxed">
                        Portal de actividades del equipo: carga, avances y entregas en un solo lugar.
                    </p>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:p-10 lg:p-16">
                <main className="w-full max-w-[420px]">
                    {children}
                </main>
            </div>
        </div>
    );
};
