export const PanelToast = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="mx-6 mt-4 p-3 bg-emerald-500 text-white rounded-sm shadow-md flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};