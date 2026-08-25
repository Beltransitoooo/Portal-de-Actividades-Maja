import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import { registerService } from '../services/authService';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("La contraseña debe tener al menos 8 caracteres y una letra mayúscula.");
            return;
        }

        try {
            setLoading(true);
            await registerService(email, password);
            alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <RegisterForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
            />
        </AuthLayout>
    );
};