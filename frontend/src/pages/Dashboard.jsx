// src/pages/Dashboard.jsx
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TaskCard } from '../components/TaskCard';

// Datos de prueba (mocks) simulando lo que nos enviará FastAPI
const mockTasks = [
    { id: 1, titulo: 'Revisar inventario de almacén', descripcion: 'Checar el stock de la nueva colección de verano y actualizar las cifras en el sistema.', completada: false },
    { id: 2, titulo: 'Actualizar catálogo web', descripcion: 'Subir las nuevas fotografías de las prendas deportivas al servidor principal.', completada: true },
    { id: 3, titulo: 'Llamada con proveedores', descripcion: 'Confirmar los tiempos de entrega de los cargamentos de tela transpirable.', completada: false },
    { id: 4, titulo: 'Auditoría de sucursales', descripcion: 'Programar las visitas a las sucursales del norte del país.', completada: false },
];

export const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-maja-primary">Resumen de Actividades</h1>
                <p className="text-gray-500 mt-2 text-sm font-medium">Gestiona tus tareas pendientes y monitorea el progreso del equipo.</p>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockTasks.map(task => (
                    <TaskCard 
                        key={task.id}
                        titulo={task.titulo}
                        descripcion={task.descripcion}
                        completada={task.completada}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
};