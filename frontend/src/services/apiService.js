import { fetchWithAuth } from './authService';

// Ajusta estas rutas ("/usuarios", "/tickets") según los endpoints reales de tu FastAPI
export const getTeamUsers = async () => {
    try {
        const response = await fetchWithAuth('/name_users'); // <- Endpoint de usuarios
        if (!response.ok) throw new Error('Error al obtener usuarios');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getQATasks = async () => {
    try {
        const response = await fetchWithAuth('/actividades'); // <- Endpoint de actividades/tickets
        if (!response.ok) throw new Error('Error al obtener actividades');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};