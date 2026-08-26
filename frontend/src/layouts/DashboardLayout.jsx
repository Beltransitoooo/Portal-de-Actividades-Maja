import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = ({ children }) => {
    const [username, setUsername] = useState('Usuario');

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUsername(storedUser);
        }
    }, []);

    const initials = username.split('@')[0].substring(0, 2).toUpperCase();

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans relative">
            <Header username={username} initials={initials} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar username={username} initials={initials} />
                
                <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10">
                    {/* Brillo de fondo para el main */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#041D3B]/5 to-transparent pointer-events-none -z-10"></div>
                    {children}
                </main>
            </div>
        </div>
    );
};