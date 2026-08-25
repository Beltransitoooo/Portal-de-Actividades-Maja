// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) navigate('/dashboard');
    };

    return (
        <AuthLayout>
            <div className="bg-maja-card p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-maja-border w-full max-w-md">
                
                <div className="text-center mb-10 lg:hidden">
                    <h1 className="text-4xl font-extrabold text-maja-primary tracking-tight">MAJA</h1>
                    <p className="text-xs text-maja-text mt-2 uppercase tracking-[0.3em] font-semibold">Sportswear</p>
                </div>

                <div className="mb-8 hidden lg:block">
                    <h2 className="text-2xl font-bold text-maja-primary">Bienvenido de vuelta</h2>
                    <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-maja-primary mb-2">Usuario</label>
                        <input 
                            type="text" value={username} onChange={(e) => setUsername(e.target.value)} required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maja-accent"
                            placeholder="Ingresa tu usuario"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-maja-primary mb-2">Contraseña</label>
                        <input 
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maja-accent"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-maja-primary hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl">
                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};