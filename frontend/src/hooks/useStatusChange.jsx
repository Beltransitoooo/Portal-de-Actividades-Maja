import { useState } from 'react';
import { BlockReasonDialog } from '../components/QA/BlockReasonDialog';

// Cambio de estado con una regla de negocio: pasar a "Bloqueada" exige indicar el motivo.
// apply(task, newStatus, motivo) hace el cambio real. Devuelve [solicitarCambio, dialogoDeMotivo];
// el consumidor debe renderizar el diálogo en su JSX.
export const useStatusChange = (apply) => {
    const [pending, setPending] = useState(null);

    const request = (task, newStatus) => {
        if (newStatus === task.status) return;
        if (newStatus === 'BLOQUEADA') {
            setPending({ task, newStatus });
        } else {
            apply(task, newStatus, null);
        }
    };

    const dialog = pending ? (
        <BlockReasonDialog
            task={pending.task}
            onCancel={() => setPending(null)}
            onConfirm={(reason) => {
                apply(pending.task, pending.newStatus, reason);
                setPending(null);
            }}
        />
    ) : null;

    return [request, dialog];
};
