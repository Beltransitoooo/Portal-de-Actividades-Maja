export const FormInput = ({ label, type = "text", value, onChange, placeholder, required = true }) => (
    <div className="relative group">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-maja-primary transition-colors duration-300">
            {label}
        </label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            required={required} 
            className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-200 text-maja-primary focus:outline-none focus:border-maja-accent transition-colors text-lg font-medium placeholder:text-gray-300 rounded-none"
            placeholder={placeholder}
        />
    </div>
);