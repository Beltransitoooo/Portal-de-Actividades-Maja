import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-[#0B132B]">
            {/* Header global; el usuario y sus iniciales los resuelve UserDropdown */}
            <Header />

            <div className="flex flex-col lg:flex-row flex-1 lg:min-h-[calc(100vh-64px)]">
                {/* Sidebar global limpio (sin la tarjeta repetida de usuario abajo) */}
                <Sidebar />

                {/* Contenido principal */}
                <main className="flex-1 p-4 lg:p-6 min-w-0 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
