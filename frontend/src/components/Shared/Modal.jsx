import { useId } from 'react';
import { useDialog } from '../../hooks/useDialog';

// Diálogo modal reutilizable con el estilo del modal "Crear nueva tarea".
// Cierra con Escape o clic en el fondo, mantiene el foco dentro y lo devuelve al cerrar.
export const Modal = ({ isOpen, onClose, title, eyebrow, children, maxWidth = 'max-w-md' }) => {
    const dialogRef = useDialog(isOpen, onClose);
    const titleId = useId();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B132B]/40 backdrop-blur-sm p-4 animate-fade-in"
            onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`bg-white w-full ${maxWidth} shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col max-h-[90vh] rounded-xl outline-none`}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#0e71af]"></div>

                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                    <div>
                        {eyebrow && <p className="text-[10px] text-[#0e71af] font-bold tracking-widest uppercase mb-1">{eyebrow}</p>}
                        <h2 id={titleId} className="text-xl font-black text-[#07152F] uppercase tracking-tight">{title}</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-red-700 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
