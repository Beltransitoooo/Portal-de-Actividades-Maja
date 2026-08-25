// src/components/TaskCard.jsx
export const TaskCard = ({ titulo, descripcion, completada }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-maja-border hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-maja-primary text-lg leading-tight">{titulo}</h3>
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                    completada 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                    {completada ? 'Completada' : 'Pendiente'}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                {descripcion || "Sin descripción proporcionada."}
            </p>
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button className="text-sm text-maja-accent hover:text-blue-800 font-semibold transition-colors">
                    Ver detalles &rarr;
                </button>
            </div>
        </div>
    );
};