import { useState, useId, useEffect } from 'react';
import { KeyRound, Copy, Check, UserPlus, ShieldCheck, ShieldAlert, Users, RotateCcw, Power, Layers } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/Shared/PageHeader';
import { Modal } from '../components/Shared/Modal';
import { useQAData } from '../hooks/useQAData';
import { createResetLink, createLeader, updateLeader, listAreas, createArea, setUserArea } from '../services/qaApi';
import { toUserMessage } from '../services/authService';
import { formatDateTimeMx } from '../utils/dates';

const sectionClass = 'bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:p-6';

// Enlace de restablecimiento: se muestra una sola vez y solo el administrador lo ve
const ResetLinkDialog = ({ person, link, onClose }) => {
    const [copied, setCopied] = useState(false);
    const fieldId = useId();
    const url = `${window.location.origin}/restablecer?token=${link.token}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Sin permiso para el portapapeles: se selecciona el texto para copiarlo a mano
            document.getElementById(fieldId)?.select();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <Modal isOpen onClose={onClose} eyebrow="Restablecer contraseña" title={person.name} maxWidth="max-w-lg">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                    Comparte este enlace solo con <span className="font-bold text-[#07152F]">{person.name}</span> por un canal de confianza. Sirve una sola vez y vence el <span className="font-bold text-[#07152F]">{formatDateTimeMx(link.expira)}</span>.
                </p>
                <div>
                    <label htmlFor={fieldId} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Enlace</label>
                    <div className="flex gap-2">
                        <input id={fieldId} type="text" readOnly value={url} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 h-10 bg-slate-50 border border-gray-200 rounded-lg px-3 text-xs text-[#07152F] font-mono focus:border-[#0e71af]" />
                        <button type="button" onClick={copy} className="h-10 px-4 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shrink-0">
                            {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                    <p role="status" className="sr-only">{copied ? 'Enlace copiado' : ''}</p>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">Al generar un enlace nuevo, el anterior deja de funcionar. Las sesiones que ya estén abiertas no se cierran.</p>
                <div className="flex justify-end">
                    <button type="button" onClick={onClose} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#07152F] px-4 py-2 transition-colors">Cerrar</button>
                </div>
            </div>
        </Modal>
    );
};

// Equipo (solo administradores): enlaces de restablecimiento y catálogo de líderes técnicos.
export const QATeam = () => {
    const { teamUsers, leaders, me, isLoading, loadError, reload } = useQAData();
    const [resetDialog, setResetDialog] = useState(null);
    const [busyUserId, setBusyUserId] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [newLeader, setNewLeader] = useState('');
    const [leaderError, setLeaderError] = useState(null);
    const [savingLeader, setSavingLeader] = useState(false);
    const leaderFieldId = useId();
    const areaFieldId = useId();
    const [areas, setAreas] = useState([]);
    const [areasKey, setAreasKey] = useState(0);
    const [newArea, setNewArea] = useState('');
    const [areaError, setAreaError] = useState(null);
    const [savingArea, setSavingArea] = useState(false);

    useEffect(() => {
        let active = true;
        listAreas()
            .then(data => { if (active) setAreas(data); })
            .catch(error => { if (active) setAreaError(toUserMessage(error, 'No se pudieron cargar las áreas.')); });
        return () => { active = false; };
    }, [areasKey]);

    const changeUserArea = async (person, value) => {
        setBusyUserId(person.raw_id);
        setTeamError(null);
        try {
            await setUserArea(person.raw_id, value === '' ? null : Number(value));
            reload();
        } catch (error) {
            setTeamError(toUserMessage(error, 'No se pudo cambiar el área.'));
        } finally {
            setBusyUserId(null);
        }
    };

    const addArea = async (event) => {
        event.preventDefault();
        if (newArea.trim().length < 2) { setAreaError('Escribe el nombre del área.'); return; }
        setSavingArea(true);
        setAreaError(null);
        try {
            await createArea(newArea.trim());
            setNewArea('');
            setAreasKey(k => k + 1);
        } catch (error) {
            setAreaError(toUserMessage(error, 'No se pudo crear el área.'));
        } finally {
            setSavingArea(false);
        }
    };

    const generateLink = async (person) => {
        setBusyUserId(person.raw_id);
        setTeamError(null);
        try {
            const link = await createResetLink(person.raw_id);
            setResetDialog({ person, link });
        } catch (error) {
            setTeamError(toUserMessage(error, 'No se pudo generar el enlace.'));
        } finally {
            setBusyUserId(null);
        }
    };

    const addLeader = async (event) => {
        event.preventDefault();
        if (newLeader.trim().length < 2) { setLeaderError('Escribe el nombre completo del líder técnico.'); return; }
        setSavingLeader(true);
        setLeaderError(null);
        try {
            await createLeader(newLeader.trim());
            setNewLeader('');
            reload();
        } catch (error) {
            setLeaderError(toUserMessage(error, 'No se pudo agregar el líder técnico.'));
        } finally {
            setSavingLeader(false);
        }
    };

    const toggleLeader = async (leader) => {
        setLeaderError(null);
        try {
            await updateLeader(leader.id, { activo: !leader.activo });
            reload();
        } catch (error) {
            setLeaderError(toUserMessage(error, 'No se pudo actualizar el líder técnico.'));
        }
    };

    const forbidden = !isLoading && !loadError && me && !me.es_admin;

    return (
        <DashboardLayout>
            <div className="max-w-[1100px] mx-auto flex flex-col gap-6 animate-fade-in">
                <PageHeader
                    title="Equipo"
                    subtitle="Administra el acceso del equipo y los líderes técnicos que se pueden asignar a las actividades."
                    crumb="Administración"
                />

                {isLoading ? (
                    <div className="w-full h-48 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
                        <p role="status" className="text-[10px] font-bold text-gray-500 tracking-widest uppercase animate-pulse">Cargando equipo...</p>
                    </div>
                ) : loadError ? (
                    <div role="alert" className="w-full flex flex-col items-center text-center bg-white border border-gray-100 rounded-xl shadow-sm py-14 px-6">
                        <p className="text-sm font-bold text-[#07152F]">No se pudo cargar la información</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">{loadError}</p>
                        <button type="button" onClick={reload} className="mt-5 h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md transition-colors flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            Reintentar
                        </button>
                    </div>
                ) : forbidden ? (
                    <div className="w-full flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl shadow-sm py-16 px-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4 text-gray-500">
                            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-bold text-[#07152F]">Esta sección es solo para administradores</p>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-[320px]">Si necesitas un enlace para restablecer tu contraseña, pídeselo a un administrador del portal.</p>
                    </div>
                ) : (
                    <>
                        {/* Integrantes */}
                        <section aria-labelledby="integrantes-titulo" className={sectionClass}>
                            <h2 id="integrantes-titulo" className="text-sm font-black text-[#07152F] uppercase tracking-wider flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                                Integrantes
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Asigna el área de cada persona: sin área solo ve las actividades que creó o que tiene asignadas. ¿Alguien olvidó su contraseña? Genera un enlace de un solo uso y compártelo con esa persona.</p>

                            {teamError && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-3 rounded font-medium">{teamError}</div>}

                            <ul className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                                {teamUsers.map(person => (
                                    <li key={person.raw_id} className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white">
                                        <span className={`w-9 h-9 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ${person.theme.main}`} aria-hidden="true">{person.id}</span>
                                        <div className="flex-1 min-w-[180px]">
                                            <p className="text-sm font-bold text-[#07152F] truncate">{person.name}</p>
                                            <p className="text-[11px] text-gray-500 truncate">{person.email}</p>
                                        </div>
                                        <label className="sr-only" htmlFor={`area-${person.raw_id}`}>Área de {person.name}</label>
                                        <select
                                            id={`area-${person.raw_id}`}
                                            value={person.areaId ?? ''}
                                            onChange={(e) => changeUserArea(person, e.target.value)}
                                            disabled={busyUserId === person.raw_id}
                                            className={`h-9 px-2 bg-white border rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-60 ${person.areaId == null && !person.isAdmin ? 'border-amber-300 text-amber-800' : 'border-gray-200 text-[#07152F]'}`}
                                        >
                                            <option value="">Sin área</option>
                                            {areas.map(area => <option key={area.id} value={area.id}>{area.nombre}</option>)}
                                        </select>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${person.isAdmin ? 'text-[#0b5a8c] bg-[#1296E8]/10 border-[#1296E8]/20' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                                            {person.role}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => generateLink(person)}
                                            disabled={busyUserId === person.raw_id}
                                            className="h-9 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#07152F] flex items-center gap-2 transition-colors disabled:opacity-60"
                                        >
                                            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                                            {busyUserId === person.raw_id ? 'Generando...' : 'Generar enlace'}
                                            <span className="sr-only"> de restablecimiento para {person.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Áreas */}
                        <section aria-labelledby="areas-titulo" className={sectionClass}>
                            <h2 id="areas-titulo" className="text-sm font-black text-[#07152F] uppercase tracking-wider flex items-center gap-2 mb-1">
                                <Layers className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                                Áreas
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Cada persona ve las actividades de su área. Crea aquí las áreas y asígnalas en la lista de integrantes.</p>

                            {areaError && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-3 rounded font-medium">{areaError}</div>}

                            <ul className="flex flex-wrap gap-2 mb-4">
                                {areas.length === 0 && <li className="text-xs text-gray-500">Todavía no hay áreas.</li>}
                                {areas.map(area => (
                                    <li key={area.id} className="h-8 px-3 bg-slate-50 border border-gray-200 rounded-lg text-[11px] font-bold text-[#07152F] flex items-center">
                                        {area.nombre}
                                        <span className="ml-2 text-[10px] font-semibold text-gray-500">{teamUsers.filter(u => u.areaId === area.id).length}</span>
                                    </li>
                                ))}
                            </ul>

                            <form onSubmit={addArea} noValidate className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[220px]">
                                    <label htmlFor={areaFieldId} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nueva área</label>
                                    <input id={areaFieldId} type="text" maxLength={60} value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Ej: QA" className="w-full h-10 bg-white border border-gray-200 focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 rounded-lg px-3 text-sm text-[#07152F] transition-colors" />
                                </div>
                                <button type="submit" disabled={savingArea} className="h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                                    {savingArea ? 'Creando...' : 'Crear área'}
                                </button>
                            </form>
                        </section>

                        {/* Líderes técnicos */}
                        <section aria-labelledby="lideres-titulo" className={sectionClass}>
                            <h2 id="lideres-titulo" className="text-sm font-black text-[#07152F] uppercase tracking-wider flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-4 h-4 text-[#0072b2]" aria-hidden="true" />
                                Líderes técnicos
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Personas que se pueden elegir como líder técnico en una actividad. Al desactivar a alguien deja de aparecer en la lista, pero las actividades que ya lo tienen lo conservan.</p>

                            {leaderError && <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs p-3 mb-3 rounded font-medium">{leaderError}</div>}

                            <ul className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden mb-4">
                                {leaders.length === 0 && <li className="px-4 py-4 text-xs text-gray-500 bg-white">Todavía no hay líderes técnicos.</li>}
                                {leaders.map(leader => (
                                    <li key={leader.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${leader.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true"></span>
                                        <p className={`flex-1 text-sm font-bold truncate ${leader.activo ? 'text-[#07152F]' : 'text-gray-500'}`}>{leader.nombre}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${leader.activo ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                                            {leader.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <button type="button" onClick={() => toggleLeader(leader)} className="h-9 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#07152F] flex items-center gap-2 transition-colors">
                                            <Power className="w-3.5 h-3.5" aria-hidden="true" />
                                            {leader.activo ? 'Desactivar' : 'Activar'}
                                            <span className="sr-only"> a {leader.nombre}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <form onSubmit={addLeader} noValidate className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[220px]">
                                    <label htmlFor={leaderFieldId} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Agregar líder técnico</label>
                                    <input id={leaderFieldId} type="text" maxLength={100} value={newLeader} onChange={(e) => setNewLeader(e.target.value)} placeholder="Nombre y apellido" className="w-full h-10 bg-white border border-gray-200 focus:border-[#0e71af] focus:ring-2 focus:ring-[#0e71af]/30 rounded-lg px-3 text-sm text-[#07152F] transition-colors" />
                                </div>
                                <button type="submit" disabled={savingLeader} className="h-10 px-5 bg-[#07152F] hover:bg-[#0e71af] disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                    <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                                    {savingLeader ? 'Agregando...' : 'Agregar'}
                                </button>
                            </form>
                        </section>
                    </>
                )}
            </div>

            {resetDialog && <ResetLinkDialog person={resetDialog.person} link={resetDialog.link} onClose={() => setResetDialog(null)} />}
        </DashboardLayout>
    );
};
