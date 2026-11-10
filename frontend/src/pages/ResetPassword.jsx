import { useState, useEffect, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
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

const cardClass = 'w-full max-w-[400px] bg-gradient-to-b from-white to-slate-50 rounded-[40px] p-8 lg:p-10 border-[5px] border-white shadow-[0_30px_30px_-20px_rgba(11,19,43,0.15)] mx-auto';

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
                    <div className="text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-4" aria-hidden="true" />
                        <h1 className="font-black text-2xl text-[#0B132B] tracking-tight uppercase mb-3">Contraseña actualizada</h1>
                        <p className="text-sm text-gray-600 mb-6">Ya puedes iniciar sesión con tu contraseña nueva.</p>
                        <Link to="/" className="block w-full font-bold bg-gradient-to-tr from-[#0B132B] to-[#1a264a] text-white py-4 rounded-2xl text-xs tracking-widest uppercase">
                            Ir a iniciar sesión
                        </Link>
                    </div>
                ) : !token ? (
                    <div className="text-center">
                        <CircleAlert className="w-10 h-10 text-red-700 mx-auto mb-4" aria-hidden="true" />
                        <h1 className="font-black text-2xl text-[#0B132B] tracking-tight uppercase mb-3">Enlace incompleto</h1>
                        <p className="text-sm text-gray-600 mb-6">Abre el enlace completo que te compartió el administrador. Si ya lo usaste o no funciona, pide uno nuevo.</p>
                        <Link to="/" className="text-[11px] text-[#0072b2] font-bold hover:underline">Volver a iniciar sesión</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-center font-black text-3xl text-[#0B132B] tracking-tight mb-2 uppercase">Nueva contraseña</h1>
                        <p className="text-center text-xs text-gray-600 mb-4">Elige una contraseña para volver a entrar al portal.</p>

                        {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-4 rounded-md">{error}</div>}

                        <form onSubmit={submit} noValidate className="flex flex-col">
                            <AuthInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña nueva" autoComplete="new-password" />
                            <AuthInput type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite la contraseña" autoComplete="new-password" />

                            <ul id={rulesId} aria-label="Requisitos de la contraseña" className="mt-4 ml-2 flex flex-col gap-1">
                                {checks.map(rule => (
                                    <li key={rule.text} className={`flex items-center gap-2 text-[11px] font-semibold ${rule.ok ? 'text-emerald-700' : 'text-gray-600'}`}>
                                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${rule.ok ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                                        {rule.text}
                                        <span className="sr-only">{rule.ok ? ' (cumplido)' : ' (pendiente)'}</span>
                                    </li>
                                ))}
                            </ul>

                            <button type="submit" disabled={saving} className="block w-full font-bold bg-gradient-to-tr from-[#0B132B] to-[#1a264a] text-white py-4 mx-auto mt-6 rounded-2xl shadow-[0_20px_10px_-15px_rgba(11,19,43,0.4)] transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-70 text-xs tracking-widest uppercase">
                                {saving ? 'Guardando...' : 'Guardar contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </AuthLayout>
    );
};
