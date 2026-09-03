import { fetchWithAuth } from './authService';

export const getActividades = async () => {
    try {
        const response = await fetchWithAuth('/actividades/');
        if (!response.ok) throw new Error('Error al listar actividades');
        return await response.json();
    } catch (error) {
        console.error("API Error (getActividades):", error);
        return [];
    }
};

export const createActividad = async (actividadData) => {
    const payload = {
        titulo: actividadData.titulo,
        descripcion: actividadData.descripcion || '',
        completada: false,
        asignado_a_id: actividadData.asignado_a_id ? Number(actividadData.asignado_a_id) : null
    };

    const response = await fetchWithAuth('/actividades/', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al crear la actividad');
    }

    return await response.json();
};

export const updateActividad = async (actividadId, datosActualizar) => {
    const response = await fetchWithAuth(`/actividades/${actividadId}`, {
        method: 'PUT',
        body: JSON.stringify(datosActualizar)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al actualizar la actividad');
    }

    return await response.json();
};