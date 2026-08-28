import { AuthInput } from './AuthInput';

export const LoginForm = ({ email, setEmail, password, setPassword, onSubmit, onToggle, loading, error }) => (
    <div className="w-full max-w-[400px] bg-gradient-to-b from-white to-slate-50 rounded-[40px] p-8 lg:p-10 border-[5px] border-white shadow-[0_30px_30px_-20px_rgba(11,19,43,0.15)] mx-auto">
        
        <h3 className="text-center font-black text-3xl text-[#0B132B] tracking-tight mb-6 uppercase">
            Acceso
        </h3>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-4 rounded-md">{error}</div>}

        <form onSubmit={onSubmit} className="flex flex-col">
            <AuthInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" />
            <AuthInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
            
            <div className="mt-3 ml-2">
                <a href="#" className="text-[11px] text-[#00A3FF] font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" disabled={loading} className="block w-full font-bold bg-gradient-to-tr from-[#0B132B] to-[#1a264a] text-white py-4 mx-auto mt-6 rounded-2xl shadow-[0_20px_10px_-15px_rgba(11,19,43,0.4)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_23px_10px_-20px_rgba(11,19,43,0.5)] active:scale-95 disabled:opacity-70 text-xs tracking-widest uppercase">
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
        </form>

        {/* Sección Social adaptada de Uiverse */}
        <div className="mt-8">
            <span className="block text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">O ingresa con</span>
            <div className="w-full flex justify-center gap-4 mt-4">
                <button className="bg-gradient-to-tr from-gray-800 to-gray-600 border-[4px] border-white p-2 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-90">
                    <svg className="fill-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                </button>
                <button className="bg-gradient-to-tr from-gray-800 to-gray-600 border-[4px] border-white p-2 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-90">
                    <svg className="fill-white w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>
                </button>
            </div>
        </div>

        <div className="mt-8 text-center">
            <button type="button" onClick={onToggle} className="text-[11px] text-[#00A3FF] font-bold hover:underline">
                ¿No tienes cuenta? Regístrate
            </button>
        </div>
    </div>
);