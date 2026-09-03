import { useState, useEffect } from 'react';
import { PanelToast } from './TicketPanel/PanelToast';
import { TicketMetaInfo } from './TicketPanel/TicketMetaInfo';
import { TimeTracker } from './TicketPanel/TimeTracker';

export const QATicketPanel = ({ ticket, onClose }) => {
    const [horasTrabajadas, setHorasTrabajadas] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (ticket) {
            setHorasTrabajadas(ticket.minHours || '');
            setToastMessage(null);
        }
    }, [ticket]);

    if (!ticket) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left relative">
                
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black bg-[#0B132B] text-white px-2 py-1 rounded-sm tracking-widest">
                            {ticket.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${
                            ticket.priority === 'CRÍTICA' ? 'text-red-600 bg-red-50 border-red-200' : 
                            ticket.priority === 'ALTA' ? 'text-orange-600 bg-orange-50 border-orange-200' : 
                            'text-green-600 bg-green-50 border-green-200'
                        }`}>
                            {ticket.priority || 'NORMAL'}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <PanelToast message={toastMessage} onClose={() => setToastMessage(null)} />

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-black text-[#0B132B] uppercase tracking-tight mb-2">{ticket.title}</h2>
                        <p className="text-sm text-gray-500">{ticket.description || 'Sin descripción detallada.'}</p>
                    </div>

                    <TicketMetaInfo assignee={ticket.assignee} type={ticket.type} />

                    <TimeTracker 
                        ticketId={ticket.db_id || ticket.id} // Aquí usamos el ID real de tu BD si existe
                        maxHours={ticket.maxHours}
                        horasTrabajadas={horasTrabajadas}
                        setHorasTrabajadas={setHorasTrabajadas}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                        onSuccess={(msg) => {
                            setToastMessage(msg);
                            setTimeout(() => setToastMessage(null), 3500);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};