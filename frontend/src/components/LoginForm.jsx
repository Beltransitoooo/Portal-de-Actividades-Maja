import { Link } from 'react-router-dom';
import { FormInput } from './FormInput';
import { ErrorMessage } from './ErrorMessage';

export const LoginForm = ({ username, setUsername, password, setPassword, handleSubmit, loading, error }) => (
    <div className="w-full">
        <div className="text-center mb-16 lg:hidden">
            <h1 className="text-5xl font-black text-maja-primary tracking-tighter italic">MAJA</h1>
            <p className="text-xs text-maja-accent mt-2 uppercase tracking-[0.4em] font-bold">Sportswear</p>
        </div>

        <div className="mb-12 hidden lg:block">
            <h2 className="text-4xl font-black text-maja-primary tracking-tight uppercase">Acceso</h2>
            <p className="text-lg text-gray-500 mt-2">Ingresa tus credenciales para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <FormInput 
                label="Usuario (Correo)" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="ejemplo@maja.com"
            />
            <FormInput 
                label="Contraseña" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
            />
            
            <ErrorMessage message={error} />
            
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-maja-primary hover:bg-maja-accent text-white font-bold tracking-widest uppercase py-4 rounded-none transition-all duration-300 disabled:opacity-70 mt-4"
            >
                {loading ? 'Validando...' : 'Iniciar Sesión'}
            </button>

            <div className="text-center mt-8">
                <p className="text-sm text-gray-500 font-medium">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-maja-accent font-bold hover:text-maja-primary transition-colors underline decoration-2 underline-offset-4">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </form>
    </div>
);