import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDashboardData } from '../services/qaData';
import { toUserMessage } from '../services/authService';

// Carga (y recarga) equipo, actividades, líderes, horas y perfil para las vistas de QA.
// isLoading solo es verdadero en la primera carga: al refrescar tras un cambio, la pantalla
// conserva lo que ya mostraba (ventanas abiertas, filtros) en lugar de volver a un spinner.
export const useQAData = () => {
    const [data, setData] = useState({ teamUsers: [], tasks: [], leaders: [], me: null });
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const loadedOnce = useRef(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!loadedOnce.current) setIsLoading(true);
            setLoadError(null);
            try {
                const result = await fetchDashboardData();
                if (!active) return;
                setData(result);
                loadedOnce.current = true;
            } catch (error) {
                if (active) setLoadError(toUserMessage(error, 'No se pudo sincronizar con la base de datos.'));
            } finally {
                if (active) setIsLoading(false);
            }
        };
        load();
        // Evita actualizar estado si la vista se desmonta o se lanza otra carga
        return () => { active = false; };
    }, [reloadKey]);

    const reload = useCallback(() => setReloadKey(k => k + 1), []);

    // Permite cambios optimistas sobre las actividades (se revierten si el servidor responde con error)
    const setTasks = useCallback((updater) => {
        setData(prev => ({ ...prev, tasks: typeof updater === 'function' ? updater(prev.tasks) : updater }));
    }, []);

    return { ...data, setTasks, isLoading, loadError, reload };
};
