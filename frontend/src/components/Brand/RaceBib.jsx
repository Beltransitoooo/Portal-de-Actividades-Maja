// Dorsal de carrera: el sprint actual se lleva como el número de un corredor.
// Cuatro perforaciones de seguro en las esquinas; ligeramente inclinado, como prendido en la camiseta.
// Es un objeto físico: se ve igual en tema claro y oscuro (colores fijos, fuera de las equivalencias de .dark).
const INK_2 = { color: '#475569' };
export const RaceBib = ({ number, top, bottom, label }) => (
    <figure
        aria-label={label}
        className="relative w-[168px] shrink-0 -rotate-[4deg] rounded-[6px] bg-[#f7f9fc] text-[#07152f] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] px-4 pt-3 pb-3.5 select-none"
    >
        {[['left-2 top-2'], ['right-2 top-2'], ['left-2 bottom-2'], ['right-2 bottom-2']].map(([pos]) => (
            <span key={pos} aria-hidden="true" className={`absolute ${pos} w-2 h-2 rounded-full bg-[#0a1630]/80 ring-2 ring-[#dfe5ee]`}></span>
        ))}
        <p aria-hidden="true" className="text-[11px] font-semibold text-center font-condensada" style={INK_2}>{top}</p>
        <p aria-hidden="true" className="font-dorsal text-center text-[76px] tracking-tight mt-0.5" style={{ color: '#07152f' }}>{number}</p>
        <span aria-hidden="true" className="block h-[3px] mx-3 mt-1.5 bg-[#e4572e] -skew-x-12"></span>
        <p aria-hidden="true" className="text-[11px] font-semibold text-center mt-1.5 tabular-nums" style={INK_2}>{bottom}</p>
    </figure>
);
