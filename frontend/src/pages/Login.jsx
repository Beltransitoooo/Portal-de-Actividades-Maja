import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [nameUsers, setNameUsers] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const { login, register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLogin) {
            const success = await login(email, password);
            if (success) navigate('/dashboard');
        } else {
            const success = await register(nameUsers, email, password);
            if (success) {
                localStorage.setItem('username', nameUsers);
                navigate('/dashboard');
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setNameUsers('');
        setEmail('');
        setPassword('');
    };

    return (
        <AuthLayout>
            {isLogin ? (
                <LoginForm 
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    onSubmit={handleSubmit} onToggle={toggleMode}
                    loading={loading} error={error}
                />
            ) : (
                <RegisterForm 
                    nameUsers={nameUsers} setNameUsers={setNameUsers}
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    onSubmit={handleSubmit} onToggle={toggleMode}
                    loading={loading} error={error}
                />
            )}
        </AuthLayout>
    );
};