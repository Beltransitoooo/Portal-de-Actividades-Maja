import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { QAHeader } from '../components/QA/QAHeader';
import { QAUserFilter } from '../components/QA/QAUserFilter';
import { QAKpiPanel } from '../components/QA/QAKpiPanel';
import { QACalendar } from '../components/QA/QACalendar';
import { QANewTicketModal } from '../components/QA/QANewTicketModal';
import { QATicketPanel } from '../components/QA/QATicketPanel';
import { fetchWithAuth } from '../services/authService'; // <-- Importamos tu servicio de autenticación

export const QADashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Estados para los datos reales
    const [teamUsers, setTeamUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Paleta de colores corporativos para asignar a los usuarios
    const colorPalettes = [
        { main: 'bg-[#00A3FF]', light: 'bg-blue-50', border: 'border-[#00A3FF]' },
        { main: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500' },
        { main: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-500' },
        { main: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-500' },
        { main: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-500' }
    ];

    // Función auxiliar para extraer iniciales (ej. "Luis Martínez" -> "LM")
    const getInitials = (name) => {
        if (!name) return 'US';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Cargar datos reales al montar la pantalla
    useEffect(() => {
        const loadRealData = async () => {
            setIsLoading(true);
            try {
                // 1. Obtener usuarios de la base de datos
                const resUsers = await fetchWithAuth('/usuarios'); 
                if (resUsers.ok) {
                    const usersData = await resUsers.json();
                    
                    // Transformar los datos del backend al formato que necesita nuestro diseño
                    const formattedUsers = usersData.map((user, index) => ({
                        // Usamos las iniciales como ID para que el avatar se vea bien en el UI
                        id: getInitials(user.name_users || user.usuario), 
                        name: user.name_users || user.usuario,
                        role: user.es_admin ? 'Administrador' : 'QA Tester',
                        theme: colorPalettes[index % colorPalettes.length], // Asigna color según su posición
                        email: user.usuario // Guardamos el email original por si acaso
                    }));
                    setTeamUsers(formattedUsers);
                }

                // 2. Obtener actividades (Si el endpoint aún no existe, fallará de forma segura y dejará el arreglo vacío)
                const resTasks = await fetchWithAuth('/actividades');
                if (resTasks.ok) {
                    const tasksData = await resTasks.json();
                    setTasks(tasksData);
                } else {
                    console.warn('El endpoint de actividades aún no devuelve datos válidos.');
                }
            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRealData();
    }, []);

    const handleCreateTicket = async (newTicketData) => {
        // TODO: Aquí enviarás el POST a tu backend para guardar la actividad real.
        // Por ahora lo simulamos actualizando la vista local:
        const newTask = {
            id: `QA-${Math.floor(Math.random() * 1000) + 2000}`, 
            ...newTicketData,
            dueDate: newTicketData.dueDate || newTicketData.startDate,
        };
        setTasks([...tasks, newTask]);
    };

    const filteredTasks = selectedUser ? tasks.filter(task => task.assignee === selectedUser) : tasks;

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <DashboardLayout>
            <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-6">
                
                {/* Filtro Lateral */}
                <QAUserFilter 
                    teamUsers={teamUsers} 
                    selectedUser={selectedUser} 
                    onSelectUser={setSelectedUser} 
                />

                <div className="flex-1 min-w-0">
                    <QAHeader 
                        onNewTicketClick={() => setIsModalOpen(true)}
                        currentDate={currentDate}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />
                    
                    <QAKpiPanel filteredTasks={filteredTasks} />
                    
                    {/* Si está cargando, mostramos un mensaje sutil; si no, el calendario */}
                    {isLoading ? (
                        <div className="w-full h-64 flex items-center justify-center bg-white border border-gray-200 mt-6 rounded-sm">
                            <p className="text-sm font-bold text-gray-400 tracking-widest uppercase animate-pulse">Sincronizando con base de datos...</p>
                        </div>
                    ) : (
                        <QACalendar 
                            tasks={filteredTasks} 
                            currentDate={currentDate} 
                            teamUsers={teamUsers}
                            onTicketClick={(ticket) => setSelectedTicket(ticket)} 
                        />
                    )}
                </div>
            </div>

            <QANewTicketModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateTicket} 
                teamUsers={teamUsers} // <- Recomendación: Pásale los usuarios reales al modal para que el select sea dinámico
            />
            
            <QATicketPanel 
                ticket={selectedTicket} 
                onClose={() => setSelectedTicket(null)} 
            />
        </DashboardLayout>
    );
};