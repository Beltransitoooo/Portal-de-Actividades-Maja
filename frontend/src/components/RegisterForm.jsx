import { Link } from 'react-router-dom';
import { FormInput } from './FormInput';
import { ErrorMessage } from './ErrorMessage';

export const RegisterForm = ({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
    <div className="bg-maja-card p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-maja-border w-full max-w-md">
        <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-maja-primary">Crea tu cuenta</h2>
            <p className="text-sm text-gray-500 mt-1">Únete al sistema de MAJA Sportswear.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput 
                label="Correo Electrónico" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ejemplo@correo.com"
            />
            <FormInput 
                label="Contraseña" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mínimo 8 caracteres, 1 mayúscula"
            />
            
            <ErrorMessage message={error} />
            
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-maja-accent hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl mt-6"
            >
                {loading ? 'Registrando...' : 'Registrarme'}
            </button>
            
            <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/" className="text-maja-accent font-bold hover:underline">
                        Inicia Sesión
                    </Link>
                </p>
            </div>
        </form>
    </div>
);