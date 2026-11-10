import { useState, useId } from 'react';
import { Ban } from 'lucide-react';
import { Modal } from '../Shared/Modal';

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

// Pide el motivo antes de marcar una actividad como Bloqueada (el servidor también lo exige).
export const BlockReasonDialog = ({ task, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    const [touched, setTouched] = useState(false);
    const fieldId = useId();
    const errorId = useId();

    const trimmed = reason.trim();
    const invalid = trimmed.length < MIN_LENGTH;

    const submit = (event) => {
        event.preventDefault();
        setTouched(true);
        if (!invalid) onConfirm(trimmed);
    };

    return (
        <Modal isOpen onClose={onCancel} eyebrow={task.id} title="Motivo del bloqueo">
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <p className="text-xs text-gray-500">
                    <span className="font-bold text-[#07152F]">{task.title}</span> pasará a Bloqueada. Explica qué la detiene para que el equipo pueda ayudar.
                </p>

                <div>
                    <label htmlFor={fieldId} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        ¿Qué la está bloqueando?
                    </label>
                    <textarea
                        id={fieldId}
                        autoFocus
                        rows={4}
                        maxLength={MAX_LENGTH}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        aria-invalid={touched && invalid}
                        aria-describedby={touched && invalid ? errorId : undefined}
                        placeholder="Ej: Falta acceso al ambiente de pruebas"
                        className="w-full bg-slate-50 border border-gray-200 p-3 text-xs text-[#07152F] focus:outline-none focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 transition-colors rounded-lg resize-none"
                    />
                    <div className="flex justify-between mt-1.5">
                        {touched && invalid
                            ? <p id={errorId} role="alert" className="text-[11px] font-semibold text-red-700">Escribe al menos {MIN_LENGTH} caracteres.</p>
                            : <span></span>}
                        <span className="text-[10px] text-gray-500 tabular-nums">{reason.length}/{MAX_LENGTH}</span>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-1">
                    <button type="button" onClick={onCancel} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#07152F] px-4 py-2 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 text-[10px] font-bold tracking-widest uppercase shadow-md transition-colors rounded-lg flex items-center gap-2">
                        <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                        Bloquear actividad
                    </button>
                </div>
            </form>
        </Modal>
    );
};
