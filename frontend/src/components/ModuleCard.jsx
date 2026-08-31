// src/components/ModuleCard.jsx
export const ModuleCard = ({ title, description, icon, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#00A3FF] transition-all cursor-pointer group flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-[#00A3FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            
            <h3 className="text-lg font-black text-[#0B132B] uppercase tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    );
};