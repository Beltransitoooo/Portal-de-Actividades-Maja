export const ModuleCard = ({ title, description, icon, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative bg-white rounded-2xl p-6 cursor-pointer overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-[#041D3B]/30"
        >
            {/* Animación de borde superior MAJA */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#041D3B] transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            
            <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 bg-gray-50 text-[#041D3B] rounded-xl flex items-center justify-center text-3xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <div className="text-gray-300 group-hover:text-[#041D3B] transition-colors group-hover:translate-x-1 transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            <h3 className="font-extrabold text-gray-900 tracking-tight text-xl mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{description}</p>
        </div>
    );
};