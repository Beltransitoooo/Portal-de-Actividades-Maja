import { Search, FilterX } from 'lucide-react';
import { STATUS_CONFIG } from '../../services/qaData';

const PRIORITIES = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'];
const TYPES = [
    { value: 'Tarea', label: 'Tarea' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Pruebas', label: 'Pruebas' },
];

const selectClass = 'h-9 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-[#07152F] shadow-sm cursor-pointer hover:border-gray-300 focus:outline-none focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 transition-colors';

// Barra de búsqueda y filtros. showStatus agrega el filtro por estado detallado (el Gestor ya tiene el suyo).
export const ActivityFilters = ({ filters, setFilter, reset, activeCount, showStatus = false, resultCount }) => (
    <div role="search" aria-label="Buscar y filtrar actividades" className="no-print flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
                type="search"
                value={filters.q}
                onChange={(e) => setFilter('q', e.target.value)}
                aria-label="Buscar por título, código, responsable o líder"
                placeholder="Buscar actividad, código o persona"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs font-medium text-[#07152F] placeholder-gray-500 shadow-sm focus:border-[#0e71af] transition-colors"
            />
        </div>

        <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} aria-label="Filtrar por prioridad" className={selectClass}>
            <option value="TODAS">Prioridad: todas</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
        </select>

        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} aria-label="Filtrar por tipo de actividad" className={selectClass}>
            <option value="TODOS">Tipo: todos</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {showStatus && (
            <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filtrar por estado" className={selectClass}>
                <option value="TODAS">Estado: todos</option>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
        )}

        {activeCount > 0 && (
            <button type="button" onClick={reset} className="h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#0b5a8c] hover:bg-[#1296E8]/10 flex items-center gap-1.5 transition-colors">
                <FilterX className="w-3.5 h-3.5" aria-hidden="true" />
                Limpiar
            </button>
        )}

        {typeof resultCount === 'number' && activeCount > 0 && (
            <span role="status" className="text-[10px] font-semibold text-gray-500">{resultCount} resultado{resultCount !== 1 ? 's' : ''}</span>
        )}
    </div>
);
