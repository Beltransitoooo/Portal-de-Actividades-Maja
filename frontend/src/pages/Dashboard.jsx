import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook de navegación
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModuleCard } from '../components/ModuleCard';

export const Dashboard = () => {
    const navigate = useNavigate(); // 2. Inicializamos el hook

    const modules = [
        { 
            id: 'qa', 
            title: 'QA', 
            description: 'Aseguramiento de calidad, reporte de incidencias y métricas de software.', 
            icon: '🎯' 
        },
        { 
            id: 'ecommerce', 
            title: 'E-COMMERCE', 
            description: 'Gestión de catálogo, ventas en línea y analíticas de mercado.', 
            icon: '🛍️' 
        },
        { 
            id: 'desarrollo', 
            title: 'DESARROLLO', 
            description: 'Administración de despliegues, repositorios y sprints técnicos.', 
            icon: '⚡' 
        }
    ];

    const handleModuleClick = (moduleName) => {
        // 3. Añadimos la lógica de redirección
        if (moduleName === 'qa') {
            navigate('/qa');
        } else {
            console.log(`El módulo ${moduleName} aún está en construcción.`);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto mt-4">
                
                {/* Encabezado Principal Totalmente Rediseñado */}
                <div className="mb-12 relative">
                    {/* Etiqueta Badge superior */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 mb-4 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase">Portal Principal</span>
                    </div>
                    
                    {/* Título con gradiente */}
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#041D3B] to-blue-600 tracking-tight mb-4">
                        Selección de Módulo
                    </h1>
                    
                    <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
                        Bienvenido al sistema integrado de MAJA. Selecciona el área de trabajo a la que deseas acceder para continuar con tus operaciones.
                    </p>
                </div>

                {/* Grid de Módulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((mod) => (
                        <ModuleCard 
                            key={mod.id}
                            title={mod.title}
                            description={mod.description}
                            icon={mod.icon}
                            onClick={() => handleModuleClick(mod.id)} // Llama a nuestra función actualizada
                        />
                    ))}
                </div>

            </div>
        </DashboardLayout>
    );
};