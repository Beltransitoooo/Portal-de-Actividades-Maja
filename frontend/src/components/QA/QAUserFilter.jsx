export const QAUserFilter = ({ teamUsers, selectedUser, onSelectUser }) => {
    return (
        <aside className="w-full lg:w-64 shrink-0 lg:mt-2">
            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 sticky top-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Filtro por Usuario
                </h3>
                
                <div className="flex flex-col gap-1">
                    {/* Opción para ver todos los tickets */}
                    <button
                        onClick={() => onSelectUser(null)}
                        className={`flex items-center gap-3 p-2 rounded-sm transition-all text-left border-l-2 ${selectedUser === null ? 'bg-slate-50 border-[#00A3FF]' : 'border-transparent hover:bg-slate-50'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedUser === null ? 'bg-[#00A3FF] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            ALL
                        </div>
                        <div>
                            <p className={`text-xs font-bold ${selectedUser === null ? 'text-[#0B132B]' : 'text-gray-500'}`}>
                                Todos los tickets
                            </p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                                Vista Global
                            </p>
                        </div>
                    </button>

                    <hr className="my-2 border-gray-100" />

                    {/* Lista del equipo */}
                    {teamUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onSelectUser(user.id)}
                            className={`flex items-center gap-3 p-2 rounded-sm transition-all text-left border-l-2 ${selectedUser === user.id ? 'bg-slate-50 border-[#00A3FF]' : 'border-transparent hover:bg-slate-50'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm ${selectedUser === user.id ? 'bg-[#0B132B] text-white' : 'bg-gray-800 text-gray-200'}`}>
                                {user.id}
                            </div>
                            <div>
                                <p className={`text-xs font-bold ${selectedUser === user.id ? 'text-[#0B132B]' : 'text-gray-600'}`}>
                                    {user.name}
                                </p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                                    {user.role}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};