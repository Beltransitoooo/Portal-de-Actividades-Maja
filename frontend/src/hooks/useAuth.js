import { useState } from 'react';
import { loginApi } from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (usuario, contrasena) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginApi(usuario, contrasena);
            
            // Guardamos los datos de la nueva respuesta en localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('token_type', data.token_type);
            localStorage.setItem('es_admin', String(data.es_admin));
            localStorage.setItem('area_id', String(data.area_id));
            localStorage.setItem('username', usuario);

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('es_admin');
        localStorage.removeItem('area_id');
        localStorage.removeItem('username');
    };

    return { login, logout, loading, error };
};