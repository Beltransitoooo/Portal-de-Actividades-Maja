import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = ({ children }) => {
    const [userState, setUserState] = useState({
        username: 'Usuario',
        initials: 'US'
    });

    const getInitials = (name) => {
        if (!name) return 'US';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('username') || 'Usuario';
        setUserState({
            username: storedUser,
            initials: getInitials(storedUser)
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-[#0B132B]">
            {/* Header global con el nuevo UserDropdown */}
            <Header username={userState.username} initials={userState.initials} />

            <div className="flex flex-1 min-h-[calc(100vh-64px)]">
                {/* Sidebar global limpio (sin la tarjeta repetida de usuario abajo) */}
                <Sidebar />

                {/* Contenido principal */}
                <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};