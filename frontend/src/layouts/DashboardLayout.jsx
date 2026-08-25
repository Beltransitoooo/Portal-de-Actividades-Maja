// src/layouts/DashboardLayout.jsx
import { useNavigate } from 'react-router-dom';

export const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-maja-bg flex font-sans">
            
            {/* Sidebar (Menú lateral oscuro) */}
            <aside className="w-64 bg-maja-primary text-white hidden md:flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-3xl font-extrabold tracking-tight">MAJA</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-1">Sportswear</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <a href="#" className="block py-3 px-4 bg-maja-accent rounded-xl font-medium transition-colors shadow-md">
                        Mis Actividades
                    </a>
                    <a href="#" className="block py-3 px-4 hover:bg-slate-800 text-gray-300 rounded-xl transition-colors">
                        Equipo
                    </a>
                </nav>
                
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left py-3 px-4 hover:bg-slate-800 rounded-xl transition-colors text-red-400 font-medium flex items-center gap-2"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Barra superior (Topbar) */}
                <header className="bg-white border-b border-maja-border h-20 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="md:hidden font-extrabold text-2xl text-maja-primary">MAJA</div>
                    <div className="hidden md:block"></div> {/* Espaciador */}
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-maja-primary">Usuario Maja</p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>
                        <div className="w-10 h-10 bg-maja-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">
                            UM
                        </div>
                    </div>
                </header>
                
                {/* Área de la página (aquí va el Dashboard) */}
                <div className="flex-1 overflow-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};