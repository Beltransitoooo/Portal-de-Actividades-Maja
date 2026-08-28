import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
    const [nameUsers, setNameUsers] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(nameUsers, email, password);
        if (success) {
            // Guardamos el nombre para desplegarlo en el dashboard tras iniciar sesión
            localStorage.setItem('username', nameUsers);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 p-8 w-full max-w-md shadow-sm rounded-sm">
                
                <h2 className="text-xl font-black text-[#041D3B] tracking-widest uppercase mb-2">
                    Crear Cuenta
                </h2>
                <p className="text-xs text-gray-500 mb-6">Ingresa tus datos para registrarte en el portal MAJA.</p>

                {error && (
                    <div className="bg-red-50 border-l-2 border-red-500 text-red-700 text-xs p-3 mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* CAMPO: NOMBRE DE USUARIO */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            required
                            value={nameUsers}
                            onChange={(e) => setNameUsers(e.target.value)}
                            placeholder="Ej. Angel Beltrán"
                            className="w-full bg-slate-50 border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#041D3B]"
                        />
                    </div>

                    {/* CAMPO: CORREO */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@majasportswear.com"
                            className="w-full bg-slate-50 border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#041D3B]"
                        />
                    </div>

                    {/* CAMPO: CONTRASEÑA */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#041D3B]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#041D3B] text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#0a2e5a] transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>
                </form>

            </div>
        </div>
    );
};