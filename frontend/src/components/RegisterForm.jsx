import { AuthInput } from './AuthInput';
import { AUTH_CARD, AUTH_BUTTON, AUTH_TITLE, AUTH_LINK } from '../layouts/authStyles';

export const RegisterForm = ({ nameUsers, setNameUsers, email, setEmail, password, setPassword, onSubmit, onToggle, loading, error }) => (
    <div className={AUTH_CARD}>
        <h1 className={AUTH_TITLE}>Registro</h1>
        <p className="text-[14px] text-[#475569] mt-2 mb-6">Crea tu cuenta con tu correo de MAJA.</p>

        {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-[13px] p-3 mb-4 rounded-md">{error}</div>}

        <form onSubmit={onSubmit} className="flex flex-col">
            <AuthInput type="text" label="Nombre completo" value={nameUsers} onChange={(e) => setNameUsers(e.target.value)} autoComplete="name" />
            <AuthInput type="email" label="Correo" placeholder="nombre@majasportswear.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <AuthInput type="password" label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />

            <button type="submit" disabled={loading} className={`${AUTH_BUTTON} mt-7`}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[#475569]">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={onToggle} className={AUTH_LINK}>Inicia sesión</button>
        </p>
    </div>
);
