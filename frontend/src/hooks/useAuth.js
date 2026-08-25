// src/hooks/useAuth.js
import { useState } from 'react';
import { loginService } from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginService(username, password);
            // Guardamos el token en localStorage para mantener la sesión
            localStorage.setItem('token', data.access_token);
            return true; // Retornamos true si fue exitoso
        } catch (err) {
            setError(err.message);
            return false; // Retornamos false si falló
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};