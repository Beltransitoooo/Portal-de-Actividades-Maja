import { useState } from 'react';
import { AuthInput } from './AuthInput';
import { useGoogleLogin } from '@react-oauth/google';
import { AUTH_CARD, AUTH_BUTTON, AUTH_TITLE, AUTH_LINK } from '../layouts/authStyles';

const GoogleIcon = () => (
    <svg aria-hidden="true" className="w-[18px] h-[18px]" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.6 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
);

export const LoginForm = ({ email, setEmail, password, setPassword, onSubmit, onToggle, onGoogleSuccess, onGoogleError, loading, error }) => {
    const [showRecoveryNotice, setShowRecoveryNotice] = useState(false);

    // El manejo de sesión y errores lo centraliza la página Login (misma instancia de useAuth)
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => onGoogleSuccess(tokenResponse.access_token),
        onError: () => onGoogleError(),
    });

    return (
        <div className={AUTH_CARD}>
            <h1 className={AUTH_TITLE}>Acceso</h1>
            <p className="text-[14px] text-[#475569] mt-2 mb-6">Entra con tu cuenta de MAJA.</p>

            {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-[13px] p-3 mb-4 rounded-md">{error}</div>}

            <form onSubmit={onSubmit} className="flex flex-col">
                <AuthInput type="email" label="Correo electrónico" placeholder="nombre@majasportswear.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <AuthInput type="password" label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

                <div className="mt-3">
                    <button
                        type="button"
                        onClick={() => setShowRecoveryNotice(v => !v)}
                        aria-expanded={showRecoveryNotice}
                        className={AUTH_LINK}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                    {showRecoveryNotice && (
                        <p role="status" className="mt-2 text-[13px] text-[#475569] leading-relaxed">
                            Pide a un administrador del portal que te genere un enlace de restablecimiento. Es de un solo uso y con vigencia limitada.
                        </p>
                    )}
                </div>

                <button type="submit" disabled={loading} className={`${AUTH_BUTTON} mt-6`}>
                    {loading ? 'Entrando...' : 'Iniciar sesión'}
                </button>
            </form>

            <div className="flex items-center gap-3 my-6" aria-hidden="true">
                <span className="h-px flex-1 bg-[#e2e8f0]"></span>
                <span className="text-[12px] text-[#5b6a80]">o</span>
                <span className="h-px flex-1 bg-[#e2e8f0]"></span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
                <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    className="h-12 w-full rounded-[12px] border border-[#d6dee9] bg-white flex items-center justify-center gap-2.5 text-[14px] font-semibold text-[#07152F] hover:border-[#0e71af] transition-colors"
                >
                    <GoogleIcon />
                    Iniciar sesión con Google
                </button>
                {/* Apple requiere integración en el backend: visible pero deshabilitado */}
                <button
                    type="button"
                    disabled
                    title="Próximamente"
                    aria-label="Iniciar sesión con Apple (próximamente)"
                    className="h-12 w-full rounded-[12px] border border-dashed border-[#d6dee9] text-[13px] font-semibold text-[#5b6a80] cursor-not-allowed"
                >
                    Apple: próximamente
                </button>
            </div>

            <p className="mt-7 text-center text-[13px] text-[#475569]">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={onToggle} className={AUTH_LINK}>Regístrate</button>
            </p>
        </div>
    );
};
