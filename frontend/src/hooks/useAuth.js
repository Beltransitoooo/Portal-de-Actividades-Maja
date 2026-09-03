import { useState } from 'react';
import { loginApi, registerApi } from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (usuario, contrasena) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginApi(usuario, contrasena);
            
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('token_type', data.token_type);
            localStorage.setItem('es_admin', String(data.es_admin));
            if (data.area_id) localStorage.setItem('area_id', String(data.area_id));
            
            let displayName = data.name_users;
            if (!displayName) {
                displayName = usuario.includes('@') ? usuario.split('@')[0] : usuario;
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            }
            localStorage.setItem('username', displayName);

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return false;
        }
    };

    const register = async (nameUsers, usuario, contrasena) => {
        setLoading(true);
        setError(null);
        try {
            // Mapeo exacto del esquema UsuarioCreate de FastAPI: name_users, usuario, contrasena
            const data = await registerApi({
                name_users: nameUsers,
                usuario: usuario,
                contrasena: contrasena
            });

            // Auto-login o guardado de datos tras registro
            localStorage.setItem('username', data.name_users || nameUsers);
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return { login, register, logout, loading, error };
};