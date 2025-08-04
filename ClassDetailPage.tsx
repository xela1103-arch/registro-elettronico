
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';
import type { Student, ClassInfo } from './constants';
import { useAppContext } from './AppContext';

const EmptyState: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        <div className="w-32 h-32 mb-6 text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-11A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17v-7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 17v-5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 17v-3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Una classe vuota, un mondo di possibilità</h3>
        <p className="max-w-xs mb-6">Aggiungi il tuo primo studente per iniziare a popolare la classe.</p>
        <button
            onClick={onAddClick}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300"
        >
            {ICONS.plus}
            <span>Aggiungi Studente</span>
        </button>
    </div>
);

const FeaturePlaceholder: React.FC<{ icon: React.ReactNode; title: string; message: string }> = ({ icon, title, message }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-20 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        <div className="w-24 h-24 mb-6 text-indigo-400 opacity-60">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="max-w-xs">{message}</p>
    </div>
);

const TabButton: React.FC<{ label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full shrink-0 transition-all duration-300 ${isActive ? 'bg-cyan-500 text-white shadow shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

const ClassDetailPage: React.FC = () => {
    const { classes, students: allStudents, onAddStudent, handleUpdateStudent: onUpdateStudent, onDeleteStudent, isDevUser, handleLogout: onLogout } = useAppContext();
    const { classId } = useParams<{ classId: string }>();
    const classInfo = classes.find(c => c.id === classId);
    const students = allStudents.filter(s => s.classId === classId);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'Studenti';
    const setActiveTab = (tab: string) => setSearchParams({ tab });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentAge, setNewStudentAge] = useState('');
    const [newStudentAvatar, setNewStudentAvatar] = useState<string>('');
    const [editedStudentName, setEditedStudentName] = useState('');
    const [editedStudentAge, setEditedStudentAge] = useState('');

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
        if (newStudentName.trim() && newStudentAge && classId) {
            const ageNumber = parseInt(newStudentAge, 10);
            if (!isNaN(ageNumber) && ageNumber > 0) {
                onAddStudent({ name: newStudentName.trim(), age: ageNumber, classId, avatarUrl: newStudentAvatar });
                setIsAddModalOpen(false);
                setNewStudentName('');
                setNewStudentAge('');
                setNewStudentAvatar('');
            }
        }
    };

    const openEditModal = (student: Student) => {
        setStudentToEdit(student);
        setEditedStudentName(student.name);
        setEditedStudentAge(student.age.toString());
    };

    const handleConfirmEdit = () => {
        if (studentToEdit && editedStudentName.trim() && editedStudentAge) {
            const ageNumber = parseInt(editedStudentAge, 10);
            if (!isNaN(ageNumber) && ageNumber > 0) {
                onUpdateStudent(studentToEdit.id, { name: editedStudentName.trim(), age: ageNumber });
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

    if (!classInfo) {
        return <Layout title="Errore" showBack isDevUser={isDevUser} onLogout={onLogout}>Classe non trovata.</Layout>;
    }

    const TABS = [
        { name: 'Studenti', icon: React.cloneElement(ICONS.group_outline, { width: 20, height: 20 }) },
        { name: 'Orario', icon: React.cloneElement(ICONS.clock, { width: 20, height: 20 }) },
        { name: 'Materiale', icon: React.cloneElement(ICONS.folder, { width: 20, height: 20 }) },
        { name: 'Note', icon: React.cloneElement(ICONS.file_text, { width: 20, height: 20 }) },
    ];
    
    return (
        <>
            <Layout 
                title=""
                showBack
                backPath="/classes"
                isDevUser={isDevUser}
                onLogout={onLogout}
            >
                <header className="mb-6 animate-fadeIn">
                    <h1 className="text-3xl font-bold text-slate-100">{classInfo.name}</h1>
                    <p className="text-slate-400 mt-1">{students.length} {students.length === 1 ? 'studente' : 'studenti'}</p>
                </header>

                <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
                    {TABS.map(tab => <TabButton key={tab.name} label={tab.name} icon={tab.icon} isActive={activeTab === tab.name} onClick={() => setActiveTab(tab.name)} />)}
                </div>
                
                <div className="mt-4">
                    {activeTab === 'Studenti' && (
                        students.length > 0 ? (
                            <div className="space-y-3">
                                {students.map((student, index) => (
                                    <div key={student.id} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl flex items-center justify-between p-3 animate-slideInUp" style={{ animationDelay: `${index * 50}ms`}}>
                                        <Link to={`/student/${student.id}`} className="flex-grow min-w-0 flex items-center space-x-4">
                                            <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-100 truncate">{student.name}</p>
                                                <p className="text-sm text-slate-400">{student.age} anni</p>
                                            </div>
                                        </Link>
                                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
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
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center p-3 py-6 text-slate-400 hover:border-cyan-500 hover:bg-slate-800/80 cursor-pointer transition-all animate-slideInUp" 
                                    style={{ animationDelay: `${students.length * 50}ms`}}
                                >
                                    {React.cloneElement(ICONS.plus, { width: 20, height: 20 })}
                                    <span className="ml-2 font-semibold">Aggiungi Studente</span>
                                </div>
                            </div>
                        ) : <EmptyState onAddClick={() => setIsAddModalOpen(true)} />
                    )}
                    {activeTab === 'Orario' && <FeaturePlaceholder icon={ICONS.clock} title="Orario in arrivo" message="Questa sezione mostrerà l'orario delle lezioni della classe. Stiamo lavorando per renderla disponibile presto!" />}
                    {activeTab === 'Materiale' && <FeaturePlaceholder icon={ICONS.folder} title="Materiale Didattico" message="Qui potrai caricare e condividere file, link e risorse con i tuoi studenti. Funzionalità in arrivo." />}
                    {activeTab === 'Note' && <FeaturePlaceholder icon={ICONS.file_text} title="Note Disciplinari" message="Un registro per le note disciplinari e le comunicazioni importanti. Questa funzione sarà presto disponibile." />}
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
                            <label htmlFor="student-avatar-upload" className="absolute bottom-0 right-0 bg-cyan-500 text-white rounded-full p-2.5 border-4 border-slate-800 cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg">
                                {React.cloneElement(ICONS.camera, {width: 20, height: 20})}
                            </label>
                        </div>
                        <input id="student-avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAddAvatarChange} />
                         <p className="text-sm text-slate-400 mt-3">Tocca l'icona per scegliere una foto</p>
                    </div>

                    <div>
                        <label htmlFor="studentNameInput" className="block text-sm font-medium text-slate-300 mb-2">Nome e Cognome</label>
                        <input id="studentNameInput" type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Es: Mario Rossi" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                     <div>
                        <label htmlFor="studentAgeInput" className="block text-sm font-medium text-slate-300 mb-2">Età</label>
                        <input id="studentAgeInput" type="number" value={newStudentAge} onChange={(e) => setNewStudentAge(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()} placeholder="Es: 15" className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div className="flex justify-end space-x-3"><button onClick={() => { setIsAddModalOpen(false); setNewStudentAvatar(''); }} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button><button onClick={handleConfirmAdd} disabled={!newStudentName.trim() || !newStudentAge} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Aggiungi</button></div>
                </div>
            </Modal>

            <Modal isOpen={!!studentToEdit} onClose={() => setStudentToEdit(null)} title="Modifica Studente" closeOnOverlayClick={false}>
                {studentToEdit && (
                     <div className="space-y-6">
                        <div>
                            <label htmlFor="editStudentName" className="block text-sm font-medium text-slate-300 mb-2">Nome e Cognome</label>
                            <input id="editStudentName" type="text" value={editedStudentName} onChange={(e) => setEditedStudentName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="editStudentAge" className="block text-sm font-medium text-slate-300 mb-2">Età</label>
                            <input id="editStudentAge" type="number" value={editedStudentAge} onChange={(e) => setEditedStudentAge(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setStudentToEdit(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleConfirmEdit} disabled={!editedStudentName.trim() || !editedStudentAge} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Salva</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="Conferma Eliminazione" variant="danger" closeOnOverlayClick={false}>
                {studentToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">Sei sicuro di voler eliminare lo studente <span className="font-semibold text-slate-100">"{studentToDelete.name}"</span>? <br/>Questa azione è irreversibile.</p>
                        <div className="flex justify-end space-x-3"><button onClick={() => setStudentToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button><button onClick={handleConfirmDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Elimina</button></div>
                    </div>
                )}
            </Modal>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; opacity: 0; }
                .animate-scaleIn { animation: scaleIn 0.15s ease-out forwards; transform-origin: top right; }
            `}</style>
        </>
    );
};

export default ClassDetailPage;