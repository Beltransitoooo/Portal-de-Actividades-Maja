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
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', username); 
            return true;
        } catch (err) {
            setError(err.message);
            return false; 
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};