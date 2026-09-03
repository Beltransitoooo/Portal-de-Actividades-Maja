const API_URL = 'http://localhost:8000'; // Ajusta la URL si tu backend corre en otro puerto

// Exportación nombrada para loginApi
export const loginApi = async (usuario, contrasena) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Error en el inicio de sesión');
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
        const err = await response.json().catch(() => ({}));
        
        // Manejo de errores de validación de FastAPI (Pydantic 422)
        if (Array.isArray(err.detail)) {
            const mensajes = err.detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
            throw new Error(mensajes);
        }

        throw new Error(err.detail || 'Error al registrar usuario');
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

    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
};