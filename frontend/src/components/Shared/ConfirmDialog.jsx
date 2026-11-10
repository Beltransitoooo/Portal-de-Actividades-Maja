import { Modal } from './Modal';

// Confirmación para acciones que no se pueden deshacer.
export const ConfirmDialog = ({ title, eyebrow, message, confirmLabel = 'Confirmar', danger = false, busy = false, error, onConfirm, onCancel }) => (
    <Modal isOpen onClose={onCancel} eyebrow={eyebrow} title={title}>
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
            {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{error}</div>}
            <div className="flex justify-end items-center gap-3 pt-1">
                <button type="button" onClick={onCancel} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#07152F] px-4 py-2 transition-colors">
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={busy}
                    className={`text-white px-6 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md transition-colors rounded-lg disabled:opacity-60 ${danger ? 'bg-red-700 hover:bg-red-800' : 'bg-[#07152F] hover:bg-[#0e71af]'}`}
                >
                    {busy ? 'Procesando...' : confirmLabel}
                </button>
            </div>
        </div>
    </Modal>
);
