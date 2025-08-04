
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';
import type { ClassInfo, Student } from './constants';
import { useAppContext } from './AppContext';

const formatWithOrdinal = (name: string): string => {
    return name.replace(/\b(\d{1,2})\b(?!ª)/g, '$1ª');
};

const cardColors = [
    { bg: 'from-cyan-500/80 to-blue-600/80', shadow: 'shadow-cyan-500/20' },
    { bg: 'from-indigo-500/80 to-purple-600/80', shadow: 'shadow-indigo-500/20' },
    { bg: 'from-emerald-500/80 to-teal-600/80', shadow: 'shadow-emerald-500/20' },
    { bg: 'from-rose-500/80 to-pink-600/80', shadow: 'shadow-rose-500/20' },
    { bg: 'from-amber-500/80 to-orange-600/80', shadow: 'shadow-amber-500/20' },
];

const EmptyState: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        <div className="w-40 h-40 mb-4 opacity-50">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{stopColor:"#22d3ee", stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:"#0f172a", stopOpacity:0}} />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#grad1)" />
              <path d="M70 50 L130 50 Q150 50 150 70 L150 130 Q150 150 130 150 L70 150 Q50 150 50 130 L50 70 Q50 50 70 50 Z" stroke="#334155" strokeWidth="4" fill="none"/>
              <path d="M50 75 L150 75" stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
              <path d="M80 100h40" stroke="#52525b" strokeWidth="3" strokeLinecap="round"/>
              <path d="M80 120h20" stroke="#52525b" strokeWidth="3" strokeLinecap="round"/>
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Un nuovo inizio</h3>
        <p className="max-w-xs mb-6">Le tue classi appariranno qui. Inizia creando la prima.</p>
        <button
            onClick={onAddClick}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300"
        >
            {ICONS.plus}
            <span>Crea la Prima Classe</span>
        </button>
    </div>
);

const ClassCard: React.FC<{
    cls: ClassInfo;
    studentCount: number;
    index: number;
    onEdit: (cls: ClassInfo) => void;
    onDelete: (cls: ClassInfo) => void;
}> = ({ cls, studentCount, index, onEdit, onDelete }) => {
    const color = cardColors[index % cardColors.length];
    
    return (
        <div className="group perspective h-full">
            <div className={`relative bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col transform-style-3d group-hover:shadow-2xl group-hover:shadow-cyan-500/10 group-hover:-translate-y-2 group-hover:rotate-x-2 group-hover:rotate-y-1`}>
                
                <div className="absolute inset-0 bg-dot-pattern opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className={`absolute -top-10 -right-10 h-32 w-32 bg-gradient-to-br ${color.bg} rounded-full opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-150`}></div>

                <div className="flex-grow relative z-10">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-3 min-w-0">
                            <div className="mt-1 flex-shrink-0 text-cyan-400 opacity-70">
                               {React.cloneElement(ICONS.book, { width: 24, height: 24 })}
                            </div>
                            <div className="min-w-0">
                               <h3 className="font-bold text-slate-100 text-xl break-words">{cls.name}</h3>
                               <div className="flex items-center space-x-2 text-slate-400 mt-2 text-sm">
                                   {React.cloneElement(ICONS.students_custom, { width: 18, height: 18 })}
                                   <span>{studentCount || 0} studenti</span>
                               </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 z-20 flex items-center space-x-1 opacity-100 lg:opacity-0 group-hover:lg:opacity-100 transition-opacity duration-300">
                            <button onClick={() => onEdit(cls)} className="text-slate-400 hover:text-cyan-400 p-2 rounded-full bg-slate-900/50 hover:bg-cyan-500/10 transition-colors" aria-label="Modifica">
                                {React.cloneElement(ICONS.edit, { width: 18, height: 18 })}
                            </button>
                            <button onClick={() => onDelete(cls)} className="text-slate-400 hover:text-red-400 p-2 rounded-full bg-slate-900/50 hover:bg-red-500/10 transition-colors" aria-label="Elimina">
                                {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 relative z-10 flex justify-between items-end">
                    <Link 
                        to={`/class/${cls.id}`} 
                        className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-semibold text-cyan-300 transition-all duration-300 bg-slate-700/50 rounded-full shadow-lg group-hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 hover:shadow-cyan-500/20"
                    >
                        <span className="absolute top-0 right-full w-full h-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -skew-x-45 group-hover:translate-x-[250%] transition-transform duration-700 ease-out"></span>
                        <span className="relative z-10 flex items-center space-x-2">
                           <span>Visualizza</span>
                           <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};


const ClassesPage: React.FC = () => {
    const { classes, students, onAddClass, onDeleteClass, onUpdateClass, isDevUser, handleLogout: onLogout } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [addClassError, setAddClassError] = useState<string | null>(null);
    const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<ClassInfo | null>(null);
    const [editedClassName, setEditedClassName] = useState('');
    const [editClassError, setEditClassError] = useState<string | null>(null);

    const studentsPerClass = useMemo(() => students.reduce((acc, student) => {
        acc[student.classId] = (acc[student.classId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>), [students]);

    const handleNewClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddClassError(null);
        setNewClassName(formatWithOrdinal(e.target.value));
    };

    const handleEditedClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditClassError(null);
        setEditedClassName(formatWithOrdinal(e.target.value));
    };
    
    const handleOpenAddFlow = () => {
        if (isBookOpen) return;
        setIsBookOpen(true);
        setTimeout(() => {
            setNewClassName('');
            setAddClassError(null);
            setIsAddModalOpen(true);
        }, 300);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setIsBookOpen(false);
            setNewClassName('');
            setAddClassError(null);
        }, 200);
    };

    const handleConfirmAddClass = async () => {
        if (newClassName.trim()) {
            const success = await onAddClass(newClassName.trim());
            if (success) {
                handleCloseAddModal();
            } else {
                setAddClassError('Una classe con questo nome esiste già.');
            }
        }
    };

    const handleConfirmDelete = () => {
        if (classToDelete) {
            onDeleteClass(classToDelete.id);
            setClassToDelete(null);
        }
    };
    
    const openEditModal = (cls: ClassInfo) => {
        setClassToEdit(cls);
        setEditedClassName(cls.name);
        setEditClassError(null);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditClassError(null);
    };

    const handleConfirmEditClass = async () => {
        if (classToEdit && editedClassName.trim()) {
            const success = await onUpdateClass(classToEdit.id, editedClassName.trim());
            if (success) {
                setIsEditModalOpen(false);
            } else {
                setEditClassError('Una classe con questo nome esiste già.');
            }
        }
    };

    return (
        <>
            <Layout 
                title=""
                isDevUser={isDevUser}
                onLogout={onLogout}
            >
                <header className="mb-8 animate-fadeIn">
                    <h1 className="text-4xl font-bold text-slate-100 tracking-tighter">Le tue Classi</h1>
                    <p className="text-slate-400 mt-1 text-lg">Organizza, gestisci e accedi facilmente a tutte le tue classi.</p>
                </header>
                
                {classes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {classes.map((cls, index) => (
                           <div key={cls.id} className="animate-slideInUp" style={{ animationDelay: `${index * 75}ms`}}>
                                <ClassCard
                                    cls={cls}
                                    studentCount={studentsPerClass[cls.id] || 0}
                                    index={index}
                                    onEdit={() => openEditModal(cls)}
                                    onDelete={() => setClassToDelete(cls)}
                                />
                           </div>
                        ))}
                        <div className="animate-slideInUp add-card-container" style={{ animationDelay: `${classes.length * 75}ms`}}>
                            <div
                                onClick={handleOpenAddFlow}
                                className={`group relative h-full rounded-2xl p-5 overflow-hidden cursor-pointer bg-slate-900 border border-slate-800 transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 ${ isBookOpen ? 'is-opening' : ''}`}
                                aria-label="Aggiungi una nuova classe"
                            >
                                <div className="absolute -inset-10 bg-gradient-to-r from-cyan-600 via-purple-600 to-rose-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-3xl animate-spin-slow"></div>

                                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                                    <div className="book-icon-container mb-4">
                                        <div className="book">
                                            <div className="book-cover">
                                                <div className="plus-symbol">+</div>
                                            </div>
                                            <div className="book-page"></div>
                                        </div>
                                    </div>

                                    <h3 className="add-card-title font-bold text-slate-100 text-lg transition-colors duration-300">
                                        Apri un Nuovo Capitolo
                                    </h3>
                                    <p className="add-card-subtitle text-sm text-slate-400 mt-1 transition-opacity duration-300 opacity-70">
                                        Crea una nuova classe
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState onAddClick={handleOpenAddFlow} />
                )}
            </Layout>

            <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Intitola il Nuovo Capitolo" closeOnOverlayClick={false}>
                <div className="relative overflow-hidden text-center">
                    <div className="absolute -inset-8 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, white 1px, transparent 1.5px), radial-gradient(circle at 80% 70%, white 1px, transparent 1.5px)', backgroundSize: '80px 80px, 100px 100px' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-900/40 via-purple-900/40 to-transparent rounded-full blur-3xl animate-spin-slow-very"></div>

                     <div className="relative z-10 mx-auto w-20 h-20 mb-2 text-cyan-400/50" style={{ filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.4))' }}>
                        <div className="animate-float-slow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15s1-1 4-1 5 2 8 2 4-1 4-1 .5-4-2.5-8.5-4-3-4-3-1.5 4-5 6.5s-4 4-4 4"/></svg>
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-slate-400 mb-6">Dai un nome alla tua nuova classe per iniziare.</p>
                        
                        <input 
                            id="classNameInput" 
                            type="text" 
                            value={newClassName} 
                            onChange={handleNewClassNameChange} 
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddClass()} 
                            placeholder="Es. Letteratura 3ª A" 
                            className={`w-full px-4 py-4 rounded-lg bg-black/50 border-2 text-slate-100 placeholder-slate-500 text-center font-serif text-lg focus:outline-none focus:ring-2 focus:border-cyan-500 transition-all duration-300 ${addClassError ? 'border-red-500/50 ring-red-500/20' : 'border-slate-700 focus:ring-cyan-500/50'}`} 
                        />
                        {addClassError && <p className="text-red-400 text-sm mt-3">{addClassError}</p>}
                        
                        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                             <button 
                                onClick={handleConfirmAddClass} 
                                disabled={!newClassName.trim()} 
                                className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transform transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {React.cloneElement(ICONS.plus, {width: 20, height: 20})}
                                <span>Crea Classe</span>
                            </button>
                            <button 
                                onClick={handleCloseAddModal} 
                                className="w-full sm:w-auto px-5 py-3 rounded-xl text-base font-medium text-slate-300 bg-slate-700/80 hover:bg-slate-700 transition-colors"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Modifica Nome Classe" closeOnOverlayClick={false}>
                {classToEdit && (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="editClassNameInput" className="block text-sm font-medium text-slate-300 mb-2">Nome Classe</label>
                            <input id="editClassNameInput" type="text" value={editedClassName} onChange={handleEditedClassNameChange} onKeyDown={(e) => e.key === 'Enter' && handleConfirmEditClass()} className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${editClassError ? 'border-red-500/50 ring-red-500/20' : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'}`} />
                            {editClassError && <p className="text-red-400 text-sm mt-2">{editClassError}</p>}
                        </div>
                        <div className="flex justify-end space-x-3"><button onClick={handleCloseEditModal} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button><button onClick={handleConfirmEditClass} disabled={!editedClassName.trim()} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Salva</button></div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!classToDelete} onClose={() => setClassToDelete(null)} title="Conferma Eliminazione" variant="danger" closeOnOverlayClick={false}>
                {classToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">Sei sicuro di voler eliminare la classe <span className="font-semibold text-slate-100">"{classToDelete.name}"</span>? <br/>Questa azione è irreversibile e rimuoverà anche tutti gli studenti associati.</p>
                        <div className="flex justify-end space-x-3"><button onClick={() => setClassToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button><button onClick={handleConfirmDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Elimina</button></div>
                    </div>
                )}
            </Modal>
            <style>{`
                .perspective { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; transform: translateZ(0); }
                .group:hover .rotate-x-2 { transform: rotateX(2deg); }
                .group:hover .rotate-y-1 { transform: rotateY(1deg); }
                .bg-dot-pattern { background-image: radial-gradient(#334155 1px, transparent 1px); background-size: 16px 16px; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; opacity: 0; }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .book-icon-container { perspective: 1000px; height: 80px; width: 80px; display: flex; align-items: center; justify-content: center; }
                .book { position: relative; width: 50px; height: 70px; transform-style: preserve-3d; transform: rotateY(-30deg) rotateX(15deg); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .book-cover, .book-page { position: absolute; width: 100%; height: 100%; top: 0; left: 0; transform-origin: left center; border-radius: 4px; }
                .book-cover { background: #0f172a; border: 3px solid #64748b; color: #64748b; transform: translateZ(3px); transition: all 0.5s ease; display: flex; align-items: center; justify-content: center; }
                .plus-symbol { font-size: 36px; font-weight: 200; line-height: 1; transition: transform 0.5s ease; }
                .book-page { background: #1e293b; border: 2px solid #334155; border-left: none; }
                .book-page::before { content: ''; position: absolute; top: 8px; right: 8px; bottom: 8px; left: 8px; border: 1px dashed #475569; border-radius: 2px; }
                .add-card-container.is-opening .book, .add-card-container:not(.is-opening):hover .book { transform: rotateY(-120deg) rotateX(10deg) translateX(-15px); }
                .add-card-container.is-opening .book-cover, .add-card-container:not(.is-opening):hover .book-cover { border-color: #22d3ee; color: #22d3ee; }
                .add-card-container.is-opening .plus-symbol, .add-card-container:not(.is-opening):hover .plus-symbol { transform: rotate(225deg); }
                .add-card-container.is-opening .add-card-title, .add-card-container:not(.is-opening):hover .add-card-title { color: #67e8f9; }
                .add-card-container.is-opening .add-card-subtitle, .add-card-container:not(.is-opening):hover .add-card-subtitle { opacity: 1; }
                @keyframes spin-slow-very { from { transform: translate(-50%, -50%) rotate(0deg) scale(1.2); } to { transform: translate(-50%, -50%) rotate(360deg) scale(1.3); } }
                .animate-spin-slow-very { animation: spin-slow-very 45s linear infinite alternate; }
                @keyframes float-slow { 0% { transform: translateY(0px) rotate(-5deg); } 50% { transform: translateY(-15px) rotate(5deg); } 100% { transform: translateY(0px) rotate(-5deg); } }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
            `}</style>
        </>
    );
};

export default ClassesPage;