import { useId } from 'react';

// Campo de acceso con etiqueta visible (el placeholder solo da un ejemplo y desaparece al escribir)
export const AuthInput = ({ type, value, onChange, label, placeholder, autoComplete, describedBy }) => {
    const id = useId();
    return (
        <div className="flex flex-col gap-1.5 mt-4 first:mt-0">
            <label htmlFor={id} className="text-[13px] font-semibold text-[#334155]">{label}</label>
            <input
                id={id}
                type={type}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-describedby={describedBy}
                className="w-full h-12 bg-[#f5f8fc] border border-[#d6dee9] rounded-[12px] px-4 text-[15px] text-[#07152F] placeholder:text-[#8a97a8] focus:outline-none focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/25 focus:bg-white transition-colors"
            />
        </div>
    );
};
