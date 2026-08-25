// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    // Verificamos si existe un token guardado en el navegador
    const token = localStorage.getItem('token');

    // Si no hay token, lo regresamos al login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Si hay token, lo dejamos pasar al componente (Dashboard)
    return children;
};