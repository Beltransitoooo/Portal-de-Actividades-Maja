import { useState, useEffect, useId, useCallback } from 'react';
import { Send, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import { listComments, addComment, deleteComment } from '../../../services/qaApi';
import { toUserMessage } from '../../../services/authService';
import { formatDateTimeMx } from '../../../utils/dates';

const isHttpUrl = (value) => /^https?:\/\//i.test(value || '');
const hostOf = (value) => { try { return new URL(value).hostname; } catch { return value; } };

// Comentarios y evidencias (enlaces a capturas, videos, documentos) de una actividad.
export const Comments = ({ ticket, me }) => {
    const [items, setItems] = useState(null); // null = cargando
    const [loadError, setLoadError] = useState(null);
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const ids = { text: useId(), url: useId() };

    const load = useCallback(async () => {
        try {
            setItems(await listComments(ticket.db_id));
            setLoadError(null);
        } catch (err) {
            setLoadError(toUserMessage(err, 'No se pudieron cargar los comentarios.'));
        }
    }, [ticket.db_id]);

    useEffect(() => {
        let active = true;
        listComments(ticket.db_id)
            .then(data => { if (active) setItems(data); })
            .catch(err => { if (active) setLoadError(toUserMessage(err, 'No se pudieron cargar los comentarios.')); });
        return () => { active = false; };
    }, [ticket.db_id]);

    const submit = async (event) => {
        event.preventDefault();
        if (!text.trim()) { setError('Escribe un comentario.'); return; }
        if (url.trim() && !isHttpUrl(url.trim())) { setError('El enlace debe empezar con http:// o https://'); return; }
        setSaving(true);
        setError(null);
        try {
            await addComment(ticket.db_id, { texto: text.trim(), url: url.trim() || null });
            setText('');
            setUrl('');
            await load();
        } catch (err) {
            setError(toUserMessage(err, 'No se pudo publicar el comentario.'));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (comment) => {
        setError(null);
        try {
            await deleteComment(ticket.db_id, comment.id);
            await load();
        } catch (err) {
            setError(toUserMessage(err, 'No se pudo eliminar el comentario.'));
        }
    };

    const inputClass = 'w-full bg-white border border-gray-200 focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 rounded-lg px-3 text-xs text-[#07152F] transition-colors';

    return (
        <div className="flex flex-col gap-5">
            <form onSubmit={submit} noValidate className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                <div>
                    <label htmlFor={ids.text} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Comentario</label>
                    <textarea id={ids.text} rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Notas, hallazgos o acuerdos sobre esta actividad" className={`${inputClass} p-3 resize-none`} />
                </div>
                <div>
                    <label htmlFor={ids.url} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Enlace de evidencia (opcional)</label>
                    <input id={ids.url} type="url" inputMode="url" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={`${inputClass} h-10`} />
                </div>
                {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{error}</div>}
                <button type="submit" disabled={saving} className="h-10 bg-[#07152F] hover:bg-[#0e71af] disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    {saving ? 'Publicando...' : 'Publicar'}
                </button>
            </form>

            {loadError ? (
                <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 rounded font-medium">{loadError}</div>
            ) : items === null ? (
                <p role="status" className="text-xs text-gray-500">Cargando comentarios...</p>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-2 bg-slate-50 border border-gray-100 rounded-xl p-6">
                    <MessageSquare className="w-6 h-6 text-gray-500" aria-hidden="true" />
                    <p className="text-xs text-gray-500 max-w-[260px]">Sin comentarios todavía. Deja aquí las capturas, hallazgos y acuerdos de la actividad.</p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {items.map(item => (
                        <li key={item.id} className="border border-gray-100 rounded-xl p-3 bg-white">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#07152F] truncate">{item.usuario_nombre || 'Persona eliminada'}</p>
                                    <p className="text-[10px] text-gray-500 tabular-nums">{formatDateTimeMx(item.creado)}</p>
                                </div>
                                {me && (me.es_admin || item.usuario_id === me.id) && (
                                    <button type="button" onClick={() => remove(item)} aria-label={`Eliminar comentario de ${item.usuario_nombre || 'persona eliminada'}`} className="min-h-6 min-w-6 p-1.5 text-gray-500 hover:text-red-700 rounded transition-colors shrink-0">
                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-[#07152F] mt-2 whitespace-pre-wrap break-words">{item.texto}</p>
                            {isHttpUrl(item.url) && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0b5a8c] hover:underline min-h-6">
                                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                    {hostOf(item.url)}
                                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
