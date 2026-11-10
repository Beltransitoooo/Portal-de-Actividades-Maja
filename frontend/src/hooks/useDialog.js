import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Comportamiento accesible para diálogos modales:
// - Enfoca el diálogo al abrir y devuelve el foco al elemento previo al cerrar.
// - Escape cierra el diálogo.
// - Tab / Shift+Tab se mantienen dentro del diálogo (focus trap).
// Devuelve la ref que debe asignarse al contenedor con role="dialog" (con tabIndex={-1}).
export const useDialog = (isOpen, onClose) => {
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previouslyFocused = document.activeElement;
        dialogRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
            if (focusables.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialogRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [isOpen]);

    return dialogRef;
};
