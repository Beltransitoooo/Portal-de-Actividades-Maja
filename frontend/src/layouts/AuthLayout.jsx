export const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex w-full font-sans bg-white">
            
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-maja-primary relative overflow-hidden p-16">
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                ></div>
                
                <div className="absolute -right-32 top-0 w-96 h-full bg-maja-accent transform skew-x-12 opacity-10"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">MAJA</h1>
                    <p className="text-sm text-maja-accent font-bold tracking-[0.4em] uppercase mt-1">Sportswear</p>
                </div>

                <div className="relative z-10 mb-20">
                    <h2 className="text-6xl font-extrabold text-white leading-none mb-6 tracking-tight">
                        EL IMPULSO <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-maja-accent to-blue-200">
                            QUE NECESITAS.
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-md text-lg font-medium">
                        Gestión de alto rendimiento para equipos que no se detienen.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
            
        </div>
    );
};