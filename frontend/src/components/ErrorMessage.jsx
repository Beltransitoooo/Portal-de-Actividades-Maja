export const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 font-medium">
            {message}
        </div>
    );
};