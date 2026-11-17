import { useState, useEffect, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { AUTH_CARD, AUTH_BUTTON, AUTH_TITLE, AUTH_LINK } from '../layouts/authStyles';
import { AuthInput } from '../components/AuthInput';
import { resetPassword } from '../services/qaApi';
import { toUserMessage } from '../services/authService';

const SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

// Mismas reglas que valida el servidor (que es quien manda): se avisa antes de enviar
const rules = (password) => [
    { ok: password.length >= 8, text: 'Al menos 8 caracteres' },
    { ok: /[A-Z]/.test(password), text: 'Una letra mayúscula' },
    { ok: SPECIAL.test(password), text: 'Un carácter especial (!@#$%^&*)' },
];

const cardClass = AUTH_CARD;

// Pantalla pública a la que llega la persona con el enlace que le comparte un administrador.
export const ResetPassword = () => {
    const [params] = useSearchParams();
    // El token se lee una vez y se quita de la barra de direcciones (no queda en el historial ni en capturas)
    const [token] = useState(() => params.get('token') || '');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const rulesId = useId();

    useEffect(() => {
        if (token) window.history.replaceState(null, '', '/restablecer');
    }, [token]);

    const checks = rules(password);
    const allOk = checks.every(c => c.ok);

    const submit = async (event) => {
        event.preventDefault();
        if (!allOk) { setError('La contraseña no cumple con los requisitos.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        setSaving(true);
        setError(null);
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (err) {
            setError(toUserMessage(err, 'No se pudo restablecer la contraseña.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthLayout>
            <div className={cardClass}>
                {done ? (
                    <div>
                        <CheckCircle2 className="w-10 h-10 text-emerald-700 mb-4" aria-hidden="true" />
                        <h1 className={`${AUTH_TITLE} mb-3`}>Contraseña actualizada</h1>
                        <p className="text-[14px] text-[#475569] mb-6">Ya puedes iniciar sesión con tu contraseña nueva.</p>
                        <Link to="/" className={`${AUTH_BUTTON} flex items-center justify-center`}>
                            Ir a iniciar sesión
                        </Link>
                    </div>
                ) : !token ? (
                    <div>
                        <CircleAlert className="w-10 h-10 text-red-700 mb-4" aria-hidden="true" />
                        <h1 className={`${AUTH_TITLE} mb-3`}>Enlace incompleto</h1>
                        <p className="text-[14px] text-[#475569] mb-6">Abre el enlace completo que te compartió el administrador. Si ya lo usaste o no funciona, pide uno nuevo.</p>
                        <Link to="/" className={AUTH_LINK}>Volver a iniciar sesión</Link>
                    </div>
                ) : (
                    <>
                        <h1 className={AUTH_TITLE}>Nueva contraseña</h1>
                        <p className="text-[14px] text-[#475569] mt-2 mb-6">Elige una contraseña para volver a entrar al portal.</p>

                        {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-[13px] p-3 mb-4 rounded-md">{error}</div>}

                        <form onSubmit={submit} noValidate className="flex flex-col">
                            <AuthInput type="password" label="Contraseña nueva" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" describedBy={rulesId} />
                            <AuthInput type="password" label="Repite la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />

                            <ul id={rulesId} aria-label="Requisitos de la contraseña" className="mt-4 flex flex-col gap-1.5">
                                {checks.map(rule => (
                                    <li key={rule.text} className={`flex items-center gap-2 text-[13px] font-semibold ${rule.ok ? 'text-emerald-700' : 'text-[#475569]'}`}>
                                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${rule.ok ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                                        {rule.text}
                                        <span className="sr-only">{rule.ok ? ' (cumplido)' : ' (pendiente)'}</span>
                                    </li>
                                ))}
                            </ul>

                            <button type="submit" disabled={saving} className={`${AUTH_BUTTON} mt-6`}>
                                {saving ? 'Guardando...' : 'Guardar contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </AuthLayout>
    );
};
