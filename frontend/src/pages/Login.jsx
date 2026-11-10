import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { Loader } from '../components/Loader';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [nameUsers, setNameUsers] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estados exclusivos para controlar la vista del Loader
    const [showLoader, setShowLoader] = useState(false);
    const [loaderText, setLoaderText] = useState('');

    const { login, register, loginWithGoogle, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            setShowLoader(true);
            setLoaderText('Autenticando...');

            const success = await login(email, password);

            if (success) {
                // Si es exitoso, obligamos al loader a quedarse 2 segundos antes de redirigir
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                // Si hay error (contraseña incorrecta), quitamos el loader de inmediato
                setShowLoader(false);
            }
        } else {
            setShowLoader(true);
            setLoaderText('Creando perfil...');

            const registered = await register(nameUsers, email, password);

            if (!registered) {
                setShowLoader(false);
                return;
            }

            // El registro no devuelve token: se inicia sesión con las mismas credenciales
            setLoaderText('Iniciando sesión...');
            const loggedIn = await login(email, password);

            if (loggedIn) {
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                // La cuenta sí se creó; se lleva al usuario al formulario de acceso
                setShowLoader(false);
                setIsLogin(true);
                setPassword('');
                setError('Tu cuenta se creó, pero no se pudo iniciar sesión automáticamente. Inicia sesión para continuar.');
            }
        }
    };

    const handleGoogleSuccess = async (googleToken) => {
        setShowLoader(true);
        setLoaderText('Autenticando...');

        const success = await loginWithGoogle(googleToken);

        if (success) {
            navigate('/dashboard');
        } else {
            setShowLoader(false);
        }
    };

    const handleGoogleError = () => {
        setError('No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setNameUsers('');
        setEmail('');
        setPassword('');
        setError(null);
    };

    return (
        <AuthLayout>
            {/* Contenedor relativo para posicionar el loader encima de los formularios */}
            <div className="relative w-full max-w-[400px]">

                {/* Overlay del Loader que cubre exactamente la tarjeta del formulario */}
                {showLoader && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-[40px] shadow-lg">
                        <Loader />
                        <p role="status" className="mt-8 text-xs font-bold tracking-[0.2em] text-[#0B132B] uppercase animate-pulse">
                            {loaderText}
                        </p>
                    </div>
                )}

                {/* Formularios */}
                {isLogin ? (
                    <LoginForm
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        onSubmit={handleSubmit} onToggle={toggleMode}
                        onGoogleSuccess={handleGoogleSuccess} onGoogleError={handleGoogleError}
                        loading={showLoader} error={error}
                    />
                ) : (
                    <RegisterForm
                        nameUsers={nameUsers} setNameUsers={setNameUsers}
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}
                        onSubmit={handleSubmit} onToggle={toggleMode}
                        loading={showLoader} error={error}
                    />
                )}
            </div>
        </AuthLayout>
    );
};
