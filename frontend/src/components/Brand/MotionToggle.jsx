import { Pause, Play } from 'lucide-react';
import { useMotionPaused, setMotionPaused } from '../../hooks/useMotionPaused';

// Botón para pausar o reanudar las animaciones decorativas (tejido 3D y estrella MAJA)
export const MotionToggle = ({ className = '' }) => {
    const paused = useMotionPaused();
    return (
        <button
            type="button"
            onClick={() => setMotionPaused(!paused)}
            aria-pressed={paused}
            className={`no-print h-8 px-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 text-white/85 text-[12px] font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors ${className}`}
        >
            {paused ? <Play className="w-3.5 h-3.5" aria-hidden="true" /> : <Pause className="w-3.5 h-3.5" aria-hidden="true" />}
            {paused ? 'Reanudar animación' : 'Pausar animación'}
        </button>
    );
};
