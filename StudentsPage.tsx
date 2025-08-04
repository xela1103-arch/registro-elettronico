
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ICONS } from './constants';
import type { Student, ClassInfo } from './constants';
import Layout from './Layout';
import Modal from './Modal';
import * as db from './db';
import { useAppContext } from './AppContext';

const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; message: string; onAddClick?: () => void; }> = ({ icon, title, message, onAddClick }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        {icon && <div className="w-24 h-24 mb-6 text-slate-600">{icon}</div>}
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="max-w-xs mb-6">{message}</p>
        {onAddClick && (
            <button
                onClick={onAddClick}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300"
            >
                {ICONS.plus}
                <span>Aggiungi Studente</span>
            </button>
        )}
    </div>
);


const StudentsPage: React.FC = () => {
    const { students: allStudents, classes: allClasses, onAddStudent, handleUpdateStudent: onUpdateStudent, onDeleteStudent, isDevUser, handleLogout: onLogout } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get('q') || '';
    const activeClassId = searchParams.get('class') || 'all';
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const setSearchTerm = (term: string) => { const newParams = new URLSearchParams(searchParams); if (term) newParams.set('q', term); else newParams.delete('q'); setSearchParams(newParams, { replace: true }); };
    const setActiveClassId = (id: string) => { const newParams = new URLSearchParams(searchParams); if(id === 'all') newParams.delete('class'); else newParams.set('class', id); setSearchParams(newParams, { replace: true }); };
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentAge, setNewStudentAge] = useState('');
    const [newStudentClassId, setNewStudentClassId] = useState<string>(allClasses[0]?.id || '');
    const [newStudentAvatar, setNewStudentAvatar] = useState<string>('');
    const [editedName, setEditedName] = useState('');
    const [editedAge, setEditedAge] = useState('');
    
    useEffect(() => {
        const loadViewMode = async () => {
            const savedMode = await db.dbGetSetting<'list' | 'grid'>('studentViewMode');
            if (savedMode && (savedMode === 'list' || savedMode === 'grid')) {
                setViewMode(savedMode);
            }
        };
        loadViewMode();
    }, []);

    useEffect(() => {
        if (allClasses.length > 0 && !newStudentClassId) {
            setNewStudentClassId(allClasses[0].id);
        }
    }, [allClasses, newStudentClassId]);

    const handleAddAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewStudentAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmAdd = () => {
        if (newStudentName.trim() && newStudentAge && newStudentClassId) {
            const ageNumber = parseInt(newStudentAge, 10);
            if (!isNaN(ageNumber) && ageNumber > 0) {
                onAddStudent({ name: newStudentName.trim(), age: ageNumber, classId: newStudentClassId, avatarUrl: newStudentAvatar });
                setIsAddModalOpen(false);
                setNewStudentName('');
                setNewStudentAge('');
                setNewStudentAvatar('');
            }
        }
    };

    const openEditModal = (student: Student) => {
        setStudentToEdit(student);
        setEditedName(student.name);
        setEditedAge(student.age.toString());
    };

    const handleConfirmEdit = () => {
        if (studentToEdit && editedName.trim() && editedAge) {
            const ageNumber = parseInt(editedAge, 10);
            if (!isNaN(ageNumber) && ageNumber > 0) {
                onUpdateStudent(studentToEdit.id, { name: editedName.trim(), age: ageNumber });
                setStudentToEdit(null);
            }
        }
    };
    
    const openDeleteModal = (student: Student) => {
        setStudentToDelete(student);
    };

    const handleConfirmDelete = () => {
        if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
        }
    };
    
    const filteredStudents = allStudents.filter(student => {
        const matchesClass = activeClassId === 'all' || student.classId === activeClassId;
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesClass && matchesSearch;
    });

    const noResultsForSearch = searchTerm && filteredStudents.length === 0;
    
    const toggleViewMode = () => {
        const newMode = viewMode === 'list' ? 'grid' : 'list';
        setViewMode(newMode);
        db.dbSetSetting('studentViewMode', newMode);
    };

    const viewModeToggle = (
        <button onClick={toggleViewMode} className="text-slate-300 p-2 -mr-2 transition-colors hover:text-cyan-400">
            {viewMode === 'list' ? ICONS.grid : ICONS.list}
        </button>
    );

    return (
        <>
            <Layout title="" isDevUser={isDevUser} onLogout={onLogout} rightAccessory={viewModeToggle}>
                <header className="mb-6 animate-fadeIn">
                    <h1 className="text-3xl font-bold text-slate-100">Elenco Studenti</h1>
                    <p className="text-slate-400 mt-1">Cerca, modifica e gestisci tutti i tuoi studenti.</p>
                </header>

                <div className="sticky top-[72px] bg-slate-900/80 backdrop-blur-sm z-10 py-2 -mx-4 px-4">
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400">{ICONS.search}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Cerca studenti..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                        />
                    </div>

                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                         <button onClick={() => setActiveClassId('all')} className={`px-4 py-2 text-sm font-semibold rounded-full shrink-0 transition-colors ${activeClassId === 'all' ? 'bg-cyan-500 text-white shadow shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Tutti</button>
                        {allClasses.map(cls => (
                             <button key={cls.id} onClick={() => setActiveClassId(cls.id)} className={`px-4 py-2 text-sm font-semibold rounded-full shrink-0 transition-colors ${activeClassId === cls.id ? 'bg-cyan-500 text-white shadow shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                {cls.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    {allStudents.length === 0 ? (
                        <EmptyState 
                            title="Nessuno studente qui" 
                            message={allClasses.length > 0 ? "Aggiungi studenti alle tue classi per vederli apparire qui." : "Devi prima creare una classe per poter aggiungere studenti."}
                            onAddClick={allClasses.length > 0 ? () => setIsAddModalOpen(true) : undefined} 
                        />
                    ) : noResultsForSearch ? (
                        <EmptyState title={`Nessun risultato per "${searchTerm}"`} message="Prova a cercare con un nome diverso." />
                    ) : filteredStudents.length === 0 ? (
                        <EmptyState title="Classe vuota" message="Questa classe non ha ancora studenti. Aggiungili dalla pagina della classe!" />
                    ) : (
                        <>
                            {viewMode === 'list' && (
                                <div className="space-y-3">
                                    {filteredStudents.map((student, index) => (
                                        <div key={student.id} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl flex items-center justify-between group p-3 animate-slideInUp" style={{ animationDelay: `${index * 50}ms`}}>
                                            <Link to={`/student/${student.id}`} className="flex-grow min-w-0 flex items-center space-x-4">
                                                <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-100 truncate">{student.name}</p>
                                                    <p className="text-sm text-slate-400">{student.age} anni</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center space-x-1 flex-shrink-0">
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="text-slate-400 hover:text-cyan-400 hover:bg-slate-700 p-2 rounded-full transition-colors"
                                                    aria-label="Modifica studente"
                                                >
                                                    {React.cloneElement(ICONS.edit, { width: 18, height: 18 })}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(student)}
                                                    className="text-slate-400 hover:text-red-400 hover:bg-slate-700 p-2 rounded-full transition-colors"
                                                    aria-label="Elimina studente"
                                                >
                                                    {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => { if (allClasses.length > 0) setIsAddModalOpen(true); }}
                                        className={`bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-700 flex items-center p-3 text-slate-400 transition-all animate-slideInUp ${
                                            allClasses.length > 0 
                                            ? 'hover:border-cyan-500 hover:bg-slate-800/80 cursor-pointer group' 
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                        style={{ animationDelay: `${filteredStudents.length * 50}ms`}}
                                        title={allClasses.length > 0 ? "Aggiungi Nuovo Studente" : "Crea prima una classe per aggiungere studenti"}
                                    >
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-700/50 group-hover:bg-cyan-900/50 transition-colors mr-4">
                                            {React.cloneElement(ICONS.plus, { className: "h-6 w-6 text-slate-500 group-hover:text-cyan-400 transition-colors" })}
                                        </div>
                                        <p className="font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">Aggiungi Nuovo Studente</p>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredStudents.map((student, index) => (
                                        <div key={student.id} className="group relative bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-4 text-center flex flex-col items-center animate-slideInUp" style={{ animationDelay: `${index * 50}ms`}}>
                                            <Link to={`/student/${student.id}`} className="flex flex-col items-center w-full mb-auto">
                                                <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full flex-shrink-0 object-cover mb-4 border-2 border-slate-600 group-hover:border-cyan-400 transition-colors" />
                                                <p className="font-semibold text-slate-100 truncate w-full">{student.name}</p>
                                                <p className="text-sm text-slate-400">{student.age} anni</p>
                                            </Link>
                                            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="text-slate-300 hover:text-cyan-300 bg-slate-900/50 hover:bg-slate-700/80 p-2 rounded-full transition-colors"
                                                    aria-label="Modifica studente"
                                                >
                                                    {React.cloneElement(ICONS.edit, { width: 16, height: 16 })}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(student)}
                                                    className="text-slate-300 hover:text-red-400 bg-slate-900/50 hover:bg-slate-700/80 p-2 rounded-full transition-colors"
                                                    aria-label="Elimina studente"
                                                >
                                                    {React.cloneElement(ICONS.trash, { width: 16, height: 16 })}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => { if (allClasses.length > 0) setIsAddModalOpen(true); }}
                                        className={`group relative h-full min-h-[180px] rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-800/40 border-2 border-dashed border-slate-700 text-slate-400 transition-all duration-300 animate-slideInUp ${
                                            allClasses.length > 0
                                            ? 'hover:border-cyan-500 hover:bg-slate-800/80 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                        style={{ animationDelay: `${filteredStudents.length * 50}ms`}}
                                        title={allClasses.length > 0 ? "Aggiungi Nuovo Studente" : "Crea prima una classe per aggiungere studenti"}
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-700/50 group-hover:bg-cyan-900/50 group-hover:scale-110 transition-all duration-300 mb-4">
                                            {React.cloneElement(ICONS.plus, { className: "h-8 w-8 text-slate-500 group-hover:text-cyan-400 transition-colors" })}
                                        </div>
                                        <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">Aggiungi Studente</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Layout>

            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setNewStudentAvatar(''); }} title="Aggiungi Nuovo Studente" closeOnOverlayClick={false}>
                <div className="space-y-6">
                     <div className="flex flex-col items-center">
                        <div className="relative w-28 h-28">
                            <div className="w-full h-full rounded-full bg-slate-700/50 flex items-center justify-center text-slate-500 overflow-hidden border-2 border-slate-600">
                                {newStudentAvatar ? (
                                    <img src={newStudentAvatar} alt="Anteprima Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                )}
                            </div>
                            <label htmlFor="student-avatar-upload-studentspage" className="absolute bottom-0 right-0 bg-cyan-500 text-white rounded-full p-2.5 border-4 border-slate-800 cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg">
                                {React.cloneElement(ICONS.camera, {width: 20, height: 20})}
                            </label>
                        </div>
                        <input id="student-avatar-upload-studentspage" type="file" className="hidden" accept="image/*" onChange={handleAddAvatarChange} />
                         <p className="text-sm text-slate-400 mt-3">Tocca l'icona per scegliere una foto</p>
                    </div>

                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-slate-300 mb-2">Nome e Cognome</label>
                        <input id="studentName" type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Es: Mario Rossi" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="studentAge" className="block text-sm font-medium text-slate-300 mb-2">Età</label>
                        <input id="studentAge" type="number" value={newStudentAge} onChange={(e) => setNewStudentAge(e.target.value)} placeholder="Es: 15" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="studentClass" className="block text-sm font-medium text-slate-300 mb-2">Classe</label>
                        <select id="studentClass" value={newStudentClassId} onChange={(e) => setNewStudentClassId(e.target.value)} disabled={allClasses.length === 0} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                           {allClasses.length > 0 ? allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option>Nessuna classe disponibile</option>}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => { setIsAddModalOpen(false); setNewStudentAvatar(''); }} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                        <button onClick={handleConfirmAdd} disabled={!newStudentName.trim() || !newStudentAge || !newStudentClassId} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Aggiungi</button>
                    </div>
                </div>
            </Modal>


            <Modal isOpen={!!studentToEdit} onClose={() => setStudentToEdit(null)} title="Modifica Studente" closeOnOverlayClick={false}>
                {studentToEdit && (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="editStudentName" className="block text-sm font-medium text-slate-300 mb-2">Nome e Cognome</label>
                            <input id="editStudentName" type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="editStudentAge" className="block text-sm font-medium text-slate-300 mb-2">Età</label>
                            <input id="editStudentAge" type="number" value={editedAge} onChange={(e) => setEditedAge(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setStudentToEdit(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleConfirmEdit} disabled={!editedName.trim() || !editedAge} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Salva</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="Conferma Eliminazione" variant="danger" closeOnOverlayClick={false}>
                {studentToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">Sei sicuro di voler eliminare lo studente <span className="font-semibold text-slate-100">"{studentToDelete.name}"</span>? <br/>Questa azione è irreversibile.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setStudentToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleConfirmDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Elimina</button>
                        </div>
                    </div>
                )}
            </Modal>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; opacity: 0; }
                .animate-scaleIn { animation: scaleIn 0.1s ease-out forwards; transform-origin: top right; }
             `}</style>
        </>
    );
};

export default StudentsPage;
