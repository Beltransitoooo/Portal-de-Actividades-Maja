import { useState } from 'react'; // <-- ESTA ES LA LÍNEA QUE FALTABA
import { DashboardLayout } from '../layouts/DashboardLayout';
import { QAHeader } from '../components/QA/QAHeader';
import { QAUserFilter } from '../components/QA/QAUserFilter';
import { QAKpiPanel } from '../components/QA/QAKpiPanel';
import { QACalendar } from '../components/QA/QACalendar';
import { QANewTicketModal } from '../components/QA/QANewTicketModal';
import { QATicketPanel } from '../components/QA/QATicketPanel'; // Importación del panel lateral

export const QADashboard = () => {
    // Estados principales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTicket, setSelectedTicket] = useState(null); // Estado del panel lateral

    // Mock de usuarios
    const teamUsers = [
        { id: 'AB', name: 'Angel Beltrán', role: 'Frontend' },
        { id: 'LM', name: 'Luis Martínez', role: 'Backend' },
        { id: 'JD', name: 'Jane Doe', role: 'QA Tester' }
    ];
    
    // Mock de tareas iniciales
    const [tasks, setTasks] = useState([
        { id: 'QA-1042', title: 'Fallo en pasarela Stripe', startDate: '2026-08-25', dueDate: '2026-08-25', priority: 'CRÍTICA', assignee: 'AB', type: 'BUG', description: 'El endpoint de Stripe devuelve 500.' },
        { id: 'QA-1043', title: 'Alineación de logo en navbar', startDate: '2026-08-25', dueDate: '2026-08-26', priority: 'BAJA', assignee: 'LM', type: 'TAREA', description: 'Alinear a la izquierda según nuevo diseño.' },
        { id: 'QA-1044', title: 'Error 500 al registrar usuario', startDate: '2026-08-28', dueDate: '2026-08-28', priority: 'ALTA', assignee: 'AB', type: 'BUG', description: 'No se envían las cabeceras CORS.' },
        { id: 'QA-1045', title: 'Actividad de prueba multinivel', startDate: '2026-09-01', dueDate: '2026-09-06', priority: 'MEDIA', assignee: 'JD', type: 'PRUEBAS', maxHours: '12', description: 'Validar los 4 entornos de prueba.' },
    ]);

    // Función para crear nueva incidencia y mapear TODOS los campos del modal
    const handleCreateTicket = (newTicketData) => {
        const newTask = {
            id: `QA-${Math.floor(Math.random() * 1000) + 2000}`, 
            title: newTicketData.title,
            startDate: newTicketData.startDate, 
            dueDate: newTicketData.dueDate || newTicketData.startDate,
            priority: newTicketData.priority,
            assignee: newTicketData.assignee,
            type: newTicketData.type,
            area: newTicketData.area,
            techLead: newTicketData.techLead,
            minHours: newTicketData.minHours,
            maxHours: newTicketData.maxHours,
            description: newTicketData.description
        };
        setTasks([...tasks, newTask]);
    };

    // Filtro por usuario
    const filteredTasks = selectedUser 
        ? tasks.filter(task => task.assignee === selectedUser) 
        : tasks;

    // Control del mes
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-6">
                
                {/* Panel lateral izquierdo (Filtros) */}
                <QAUserFilter teamUsers={teamUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} />

                {/* Contenido Central */}
                <div className="flex-1 min-w-0">
                    <QAHeader 
                        onNewTicketClick={() => setIsModalOpen(true)}
                        currentDate={currentDate}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />
                    <QAKpiPanel filteredTasks={filteredTasks} />
                    
                    <QACalendar 
                        tasks={filteredTasks} 
                        currentDate={currentDate} 
                        onTicketClick={(ticket) => setSelectedTicket(ticket)} 
                    />
                </div>
            </div>

            {/* Modal de Creación */}
            <QANewTicketModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateTicket} 
            />

            {/* Modal/Panel Lateral de Detalles */}
            <QATicketPanel 
                ticket={selectedTicket} 
                onClose={() => setSelectedTicket(null)} 
            />
        </DashboardLayout>
    );
};