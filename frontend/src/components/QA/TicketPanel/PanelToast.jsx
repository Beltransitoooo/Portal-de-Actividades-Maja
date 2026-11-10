import { Check, X } from 'lucide-react';

export const PanelToast = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div role="status" className="mx-6 mt-4 p-3 bg-emerald-700 text-white rounded-lg shadow-md flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar mensaje" className="text-white/80 hover:text-white">
                <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    );
};
