import { clearSessionStorage } from '../utils/theme';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Se define con VITE_API_URL al construir la imagen

// Extrae un mensaje legible de una respuesta de error de FastAPI (incluye validaciones 422 de Pydantic)
export const readErrorMessage = async (response, fallback) => {
    const err = await response.json().catch(() => ({}));
    if (Array.isArray(err.detail)) {
        return err.detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
    }
    return typeof err.detail === 'string' && err.detail ? err.detail : fallback;
};

// Convierte cualquier error (incluidos fallos de red) en un mensaje para el usuario
export const toUserMessage = (error, fallback) => {
    if (error instanceof TypeError) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    }
    return error?.message || fallback;
};

// Exportación nombrada para loginApi
export const loginApi = async (usuario, contrasena) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Error en el inicio de sesión'));
    }

    return await response.json();
};

// Exportación nombrada para registerApi
export const registerApi = async (userData) => {
    const response = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Error al registrar usuario'));
    }

    return await response.json();
};

// Helper con autenticación
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    // Sesión expirada o token inválido: se limpia la sesión y se regresa al login
    if (response.status === 401 && token) {
        clearSessionStorage();
        window.location.assign('/');
    }

    return response;
};


export const loginWithGoogleApi = async (token) => {
    // IMPORTANTE: Confirma con tu dev de backend si la ruta es exactamente /auth/google
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }) // Enviamos el token de Google al backend
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Error en el inicio de sesión con Google'));
    }

    return await response.json();
};
