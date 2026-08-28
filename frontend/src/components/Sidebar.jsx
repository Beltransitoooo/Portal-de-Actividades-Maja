export const Sidebar = ({ username, initials }) => {
    // Función para sacar el nombre sin el @gmail.com
    const displayName = username.split('@')[0];

    return (
        <aside className="w-72 bg-white flex flex-col justify-between hidden sm:flex border-r border-gray-200 relative overflow-hidden shadow-sm z-10">
            
            {/* Fondo Mallado (Mesh) usando un patrón de puntos */}
            <div 
                className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                    backgroundSize: '16px 16px' 
                }}
            ></div>

            {/* Contenido Superior */}
            <div className="p-6 mt-2 relative z-10">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Navegación</p>
                </div>
            </div>
            
            {/* Tarjeta de Perfil Inferior */}
            <div className="p-4 mx-4 mb-6 rounded-2xl bg-white border border-gray-100 shadow-md relative overflow-hidden group z-10">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-[#041D3B] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate" title={username}>
                            {displayName}
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase mt-0.5">
                            Nivel Administrativo
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};