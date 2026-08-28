export const AuthInput = ({ type, value, onChange, placeholder }) => (
    <input
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border-2 border-transparent py-4 px-6 rounded-2xl mt-4 shadow-[0_10px_10px_-5px_rgba(11,19,43,0.08)] text-sm text-[#0B132B] placeholder-gray-400 focus:outline-none focus:border-x-[#00A3FF] transition-all duration-300"
    />
);