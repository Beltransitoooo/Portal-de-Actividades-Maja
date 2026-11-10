import { useState, useCallback } from 'react';

export const DEFAULT_FILTERS = { q: '', priority: 'TODAS', type: 'TODOS', status: 'TODAS' };

// Quita acentos y mayúsculas para que "revision" encuentre "Revisión"
const normalize = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Búsqueda y filtros compartidos por el Gestor y el Cronograma (se aplican en pantalla sobre los datos cargados)
export const useActivityFilters = () => {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const setFilter = useCallback((key, value) => setFilters(prev => ({ ...prev, [key]: value })), []);
    const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

    const matches = useCallback((task) => {
        if (filters.priority !== 'TODAS' && task.priority !== filters.priority) return false;
        if (filters.type !== 'TODOS' && task.type !== filters.type) return false;
        if (filters.status !== 'TODAS' && task.status !== filters.status) return false;
        const query = normalize(filters.q).trim();
        if (!query) return true;
        const haystack = normalize([task.id, task.db_id, task.title, task.description, task.assigneeName, task.leaderName, task.blockReason].join(' '));
        return query.split(/\s+/).every(word => haystack.includes(word));
    }, [filters]);

    const activeCount = Object.keys(DEFAULT_FILTERS).filter(key => filters[key] !== DEFAULT_FILTERS[key]).length;

    return { filters, setFilter, reset, matches, activeCount };
};
