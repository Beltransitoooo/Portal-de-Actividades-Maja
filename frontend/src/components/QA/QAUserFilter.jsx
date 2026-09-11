export const QAUserFilter = ({ teamUsers, selectedUser, onSelectUser }) => {
    const totalGlobalTasks = teamUsers.reduce((sum, user) => sum + (user.tasksCount || 0), 0);
    const avgGlobalProgress = teamUsers.length > 0 
        ? Math.round(teamUsers.reduce((sum, user) => sum + (user.progressPct || 0), 0) / teamUsers.length) 
        : 0;

    return (
        <aside className="w-full flex flex-col h-full min-h-0 animate-fade-in">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col h-full min-h-0">
                
                <div className="flex items-center justify-between mb-5 shrink-0">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Equipo & Progreso
                    </h3>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                
                {/* Zona de Scroll contenida */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    
                    <button
                        onClick={() => onSelectUser(null)}
                        className={`relative p-3 rounded-lg transition-all text-left w-full group overflow-hidden shrink-0 ${
                            selectedUser === null 
                            ? 'bg-[#1296E8]/5 border border-[#1296E8]/20 shadow-sm' 
                            : 'border border-transparent hover:bg-slate-50'
                        }`}
                    >
                        {selectedUser === null && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1296E8] rounded-l-lg"></div>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${selectedUser === null ? 'bg-[#1296E8] text-white shadow-md' : 'bg-slate-100 text-gray-500 group-hover:bg-slate-200'}`}>
                                ALL
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${selectedUser === null ? 'text-[#07152F]' : 'text-gray-600'}`}>Vista Global</p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest truncate">Todos los tickets</p>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-1.5 pl-11">
                            <div className="flex items-center justify-between text-[10px] font-semibold">
                                <span className="text-gray-500">{totalGlobalTasks} actividades</span>
                                <span className="text-[#1296E8]">{avgGlobalProgress}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-[#1296E8] rounded-full transition-all duration-700" style={{ width: `${avgGlobalProgress}%` }}></div>
                            </div>
                        </div>
                    </button>

                    <hr className="my-2 border-gray-100 shrink-0" />

                    {teamUsers.map(user => {
                        const tasksCount = user.tasksCount !== undefined ? user.tasksCount : 0;
                        const progressPct = user.progressPct !== undefined ? user.progressPct : 0;
                        const isCompleted = progressPct === 100;

                        return (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className={`relative p-3 rounded-lg transition-all text-left w-full group shrink-0 ${
                                    selectedUser === user.id 
                                    ? `bg-slate-50 border ${user.theme?.border || 'border-gray-200'} shadow-sm` 
                                    : 'border border-transparent hover:bg-slate-50'
                                }`}
                            >
                                {selectedUser === user.id && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${user.theme?.main || 'bg-slate-800'}`}></div>
                                )}
                                
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-opacity ${user.theme?.main || 'bg-slate-800'} ${selectedUser !== user.id && selectedUser !== null ? 'opacity-50 group-hover:opacity-100' : ''}`}>
                                        {user.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate transition-colors ${selectedUser === user.id ? 'text-[#07152F]' : 'text-gray-600 group-hover:text-[#07152F]'}`}>
                                            {user.name}
                                        </p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest truncate">
                                            {user.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col gap-1.5 pl-11">
                                    <div className="flex items-center justify-between text-[10px] font-semibold">
                                        <span className="text-gray-500">{tasksCount} act.</span>
                                        <span className={isCompleted && tasksCount > 0 ? 'text-emerald-500' : 'text-gray-400'}>
                                            {progressPct}%
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted && tasksCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                                            style={{ width: `${progressPct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};