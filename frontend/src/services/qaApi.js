import { fetchWithAuth, readErrorMessage } from './authService';

// Llamada JSON al API: devuelve el cuerpo (null en 204) o lanza un Error con el mensaje del servidor.
const call = async (path, { method = 'GET', body, fallback = 'No se pudo completar la acción.' } = {}) => {
    const response = await fetchWithAuth(path, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        throw new Error(await readErrorMessage(response, fallback));
    }
    return response.status === 204 ? null : response.json();
};

// ---- Perfil ----
export const getMe = () => call('/usuarios/me', { fallback: 'No se pudo cargar tu perfil.' });

// ---- Actividades ----
export const createActivity = (body) => call('/actividades/', { method: 'POST', body, fallback: 'Error al crear la actividad.' });
export const updateActivity = (id, body) => call(`/actividades/${id}`, { method: 'PUT', body, fallback: 'No se pudo actualizar la actividad.' });
export const deleteActivity = (id) => call(`/actividades/${id}`, { method: 'DELETE', fallback: 'No se pudo eliminar la actividad.' });

// ---- Líderes técnicos (catálogo) ----
export const listLeaders = () => call('/lideres-tecnicos/', { fallback: 'No se pudieron cargar los líderes técnicos.' });
export const createLeader = (nombre) => call('/lideres-tecnicos/', { method: 'POST', body: { nombre }, fallback: 'No se pudo agregar el líder técnico.' });
export const updateLeader = (id, body) => call(`/lideres-tecnicos/${id}`, { method: 'PUT', body, fallback: 'No se pudo actualizar el líder técnico.' });

// ---- Horas por día ----
export const listHours = () => call('/horas/', { fallback: 'No se pudieron cargar las horas registradas.' });
export const addHours = (activityId, body) => call(`/actividades/${activityId}/horas`, { method: 'POST', body, fallback: 'No se pudieron registrar las horas.' });
export const deleteHours = (activityId, entryId) => call(`/actividades/${activityId}/horas/${entryId}`, { method: 'DELETE', fallback: 'No se pudo eliminar el registro.' });

// ---- Comentarios y evidencias ----
export const listComments = (activityId) => call(`/actividades/${activityId}/comentarios`, { fallback: 'No se pudieron cargar los comentarios.' });
export const addComment = (activityId, body) => call(`/actividades/${activityId}/comentarios`, { method: 'POST', body, fallback: 'No se pudo publicar el comentario.' });
export const deleteComment = (activityId, commentId) => call(`/actividades/${activityId}/comentarios/${commentId}`, { method: 'DELETE', fallback: 'No se pudo eliminar el comentario.' });

// ---- Historial ----
export const listHistory = (activityId) => call(`/actividades/${activityId}/historial`, { fallback: 'No se pudo cargar el historial.' });

// ---- Restablecimiento de contraseña ----
export const createResetLink = (userId) => call(`/usuarios/${userId}/restablecimiento`, { method: 'POST', fallback: 'No se pudo generar el enlace.' });
export const resetPassword = (token, contrasena) => call('/auth/restablecer', { method: 'POST', body: { token, contrasena }, fallback: 'No se pudo restablecer la contraseña.' });
