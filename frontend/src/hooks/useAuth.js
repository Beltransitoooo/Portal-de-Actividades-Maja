import { useState } from 'react';
import { clearSessionStorage } from '../utils/theme';
import { loginApi, registerApi, loginWithGoogleApi, toUserMessage } from '../services/authService';

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
            setError(toUserMessage(err, 'Error en el inicio de sesión'));
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

            localStorage.setItem('username', data.name_users || nameUsers);
            setLoading(false);
            return true;
        } catch (err) {
            setError(toUserMessage(err, 'Error al registrar usuario'));
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        clearSessionStorage();
        window.location.href = '/';
    };

    const loginWithGoogle = async (googleToken) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginWithGoogleApi(googleToken);

            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('token_type', data.token_type);
            localStorage.setItem('es_admin', String(data.es_admin));
            if (data.area_id) localStorage.setItem('area_id', String(data.area_id));

            const displayName = data.name_users || 'Usuario de Google';
            localStorage.setItem('username', displayName);

            setLoading(false);
            return true;
        } catch (err) {
            setError(toUserMessage(err, 'Error en el inicio de sesión con Google'));
            setLoading(false);
            return false;
        }
    };

    return { login, register, loginWithGoogle, logout, loading, error, setError };
};
