// src/layouts/AuthLayout.jsx
export const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex w-full font-sans bg-gray-50">
            
            {/* Panel Lateral Oscuro y Dinámico */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden bg-maja-primary">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/40 to-transparent z-0"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-maja-accent rounded-full mix-blend-screen filter blur-[100px] opacity-40 z-0 animate-pulse"></div>
                <div className="absolute top-20 -right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-[80px] opacity-20 z-0"></div>
                
                <div className="relative z-10 text-center px-12">
                    <h1 className="text-6xl font-extrabold text-white tracking-tighter mb-4 drop-shadow-lg">MAJA</h1>
                    <p className="text-xl text-gray-300 font-light tracking-widest uppercase mb-12">Sportswear</p>
                    <h2 className="text-3xl text-white font-medium mb-4">Sistema Gestor de Tareas</h2>
                    <p className="text-gray-400 max-w-md mx-auto">Optimiza tu flujo de trabajo, asigna actividades y lleva el control total del éxito de tu equipo.</p>

                    <div className="mt-16 flex gap-3 justify-center items-center">
                        <span className="h-2 w-8 bg-maja-accent rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(2,132,199,0.5)]"></span>
                        <span className="h-2 w-2 bg-gray-500 rounded-full hover:bg-gray-400 cursor-pointer transition-colors"></span>
                    </div>
                </div>
            </div>

            {/* Contenedor Derecho donde se inyectará el formulario (children) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                {children}
            </div>
            
        </div>
    );
};