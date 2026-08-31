const API_URL = 'http://localhost:8000'; // Ajusta a tu URL base

export const loginApi = async (usuario, contrasena) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, contrasena }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    return await response.json();
};

// Helper centralizado para peticiones autenticadas
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Sesión expirada');
    }

    return response;
};