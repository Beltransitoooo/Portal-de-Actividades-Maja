import { AuthInput } from './AuthInput';

export const RegisterForm = ({ nameUsers, setNameUsers, email, setEmail, password, setPassword, onSubmit, onToggle, loading, error }) => (
    <div className="w-full max-w-[400px] bg-gradient-to-b from-white to-slate-50 rounded-[40px] p-8 lg:p-10 border-[5px] border-white shadow-[0_30px_30px_-20px_rgba(11,19,43,0.15)] mx-auto">
        
        <h3 className="text-center font-black text-3xl text-[#0B132B] tracking-tight mb-6 uppercase">
            Registro
        </h3>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-4 rounded-md">{error}</div>}

        <form onSubmit={onSubmit} className="flex flex-col">
            <AuthInput type="text" value={nameUsers} onChange={(e) => setNameUsers(e.target.value)} placeholder="Nombre completo" />
            <AuthInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" />
            <AuthInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />

            <button type="submit" disabled={loading} className="block w-full font-bold bg-gradient-to-tr from-[#0B132B] to-[#1a264a] text-white py-4 mx-auto mt-8 rounded-2xl shadow-[0_20px_10px_-15px_rgba(11,19,43,0.4)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_23px_10px_-20px_rgba(11,19,43,0.5)] active:scale-95 disabled:opacity-70 text-xs tracking-widest uppercase">
                {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
        </form>

        <div className="mt-8 text-center">
            <button type="button" onClick={onToggle} className="text-[11px] text-[#00A3FF] font-bold hover:underline">
                ¿Ya tienes cuenta? Inicia sesión
            </button>
        </div>
    </div>
);