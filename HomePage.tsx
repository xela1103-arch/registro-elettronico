
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Modal from './Modal';
import { ICONS } from './constants';
import type { Lesson, Notice, User, NoticeType, LessonType, Attachment, ClassInfo } from './constants';
import { useAppContext } from './AppContext';

const lessonTypeStyles: { [key in LessonType]: { icon: React.ReactElement, colors: string, border: string } } = {
    'Lezione': { icon: ICONS.book, colors: 'bg-blue-900/50 text-blue-300', border: 'border-l-blue-400 hover:border-l-blue-500' },
    'Laboratorio': { icon: ICONS.lab_beaker, colors: 'bg-purple-900/50 text-purple-300', border: 'border-l-purple-400 hover:border-l-purple-500' },
    'Verifica': { icon: ICONS.file_text, colors: 'bg-yellow-900/50 text-yellow-300', border: 'border-l-yellow-400 hover:border-l-yellow-500' },
    'Recupero': { icon: ICONS.activity, colors: 'bg-green-900/50 text-green-300', border: 'border-l-green-400 hover:border-l-green-500' },
};
  
const LessonCard: React.FC<{ lesson: Lesson, onDelete: (id: string) => void, onEdit: (lesson: Lesson) => void }> = ({ lesson, onDelete, onEdit }) => {
    const type = lesson.type || 'Lezione';
    const { icon, colors, border } = lessonTypeStyles[type];

    return (
        <div className={`bg-slate-800/60 backdrop-blur-lg p-4 rounded-xl shadow-md border-l-4 flex items-center justify-between transition-all duration-300 hover:shadow-lg group ${border}`}>
            <div className="flex items-center space-x-4 flex-grow min-w-0">
                <div className={`p-3 rounded-lg flex-shrink-0 ${colors}`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate">{lesson.subject}</p>
                    <p className="text-sm text-slate-400 truncate">{lesson.className}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                <div className="text-right">
                    <p className="font-semibold text-slate-200">{lesson.time.split(' - ')[0]}</p>
                    <p className="text-xs font-medium text-slate-400">{type}</p>
                </div>
                <div className="flex items-center space-x-1 lg:opacity-0 group-hover:lg:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(lesson)} className="text-cyan-400 hover:text-cyan-300 p-2 rounded-full bg-slate-900/50 hover:bg-cyan-500/10 transition-colors" aria-label={`Modifica lezione ${lesson.subject}`}>
                        {React.cloneElement(ICONS.edit, { width: 18, height: 18 })}
                    </button>
                    <button onClick={() => onDelete(lesson.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full bg-slate-900/50 hover:bg-red-500/10 transition-colors" aria-label={`Elimina lezione ${lesson.subject}`}>
                        {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                    </button>
                </div>
            </div>
        </div>
    );
};
  
const noticeTypeStyles: { [key in NoticeType]: { icon: React.ReactElement, colors: string } } = {
    'Generale': { icon: ICONS.info, colors: 'bg-blue-900/50 text-blue-300' },
    'Importante': { icon: ICONS.warning, colors: 'bg-yellow-900/50 text-yellow-300' },
    'Urgente': { icon: ICONS.bell_filled, colors: 'bg-red-900/50 text-red-300' },
    'Evento': { icon: ICONS.calendar, colors: 'bg-purple-900/50 text-purple-300' },
};

const NoticeCard: React.FC<{ notice: Notice, onDelete: (id: string) => void, onEdit: (notice: Notice) => void }> = ({ notice, onDelete, onEdit }) => {
    const type = notice.type || 'Generale';
    const { icon, colors } = noticeTypeStyles[type];

    return (
        <div className="bg-slate-800/60 backdrop-blur-lg p-4 rounded-xl shadow-md flex items-start space-x-4 transition-all duration-300 hover:shadow-lg group">
          <div className={`p-3 rounded-lg flex-shrink-0 mt-1 ${colors}`}>
            {icon}
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-slate-100 break-words">{notice.title}</p>
            {notice.description && <p className="text-sm text-slate-300 mt-1 break-words">{notice.description}</p>}
            <p className="text-sm text-slate-400 mt-2">{notice.date}</p>
            {notice.attachments && notice.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2">Allegati:</h4>
                    <div className="space-y-2">
                        {notice.attachments.map((att, index) => (
                            <a 
                                key={index} 
                                href={att.url} 
                                download={att.name}
                                className="flex items-center space-x-2 text-cyan-400 hover:underline bg-slate-700/50 p-2 rounded-lg"
                            >
                                {React.cloneElement(att.type.startsWith('image/') ? ICONS.image : ICONS.file_text, { width: 20, height: 20, className: 'text-cyan-400' })}
                                <span className="text-sm font-medium truncate">{att.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
          </div>
           <div className="flex-shrink-0 flex items-center space-x-1 lg:opacity-0 group-hover:lg:opacity-100 transition-opacity">
                <button onClick={() => onEdit(notice)} className="text-cyan-400 hover:text-cyan-300 p-2 rounded-full bg-slate-900/50 hover:bg-cyan-500/10 transition-colors" aria-label={`Modifica avviso ${notice.title}`}>
                    {React.cloneElement(ICONS.edit, { width: 18, height: 18 })}
                </button>
                <button onClick={() => onDelete(notice.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full bg-slate-900/50 hover:bg-red-500/10 transition-colors" aria-label={`Elimina avviso ${notice.title}`}>
                    {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                </button>
            </div>
        </div>
    );
};

const TypeOptionButton: React.FC<{
    label: string;
    icon: React.ReactElement;
    color: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, icon, color, isSelected, onClick }) => {
    const colorClasses: {[key: string]: {bg: string, text: string, ring: string}} = {
        blue: { bg: 'bg-blue-900/50', text: 'text-blue-300', ring: 'ring-blue-400' },
        yellow: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', ring: 'ring-yellow-400' },
        red: { bg: 'bg-red-900/50', text: 'text-red-300', ring: 'ring-red-400' },
        purple: { bg: 'bg-purple-900/50', text: 'text-purple-300', ring: 'ring-purple-400' },
        green: { bg: 'bg-green-900/50', text: 'text-green-300', ring: 'ring-green-400' },
    };
    const styles = colorClasses[color] || colorClasses.blue;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected ? `ring-2 ${styles.ring} border-transparent shadow-lg bg-slate-700/50` : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                    {icon}
                </div>
                <span className={`font-semibold ${styles.text}`}>{label}</span>
            </div>
        </button>
    );
};

const fileToDataUrl = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, url: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const HomePage: React.FC = () => {
    const { currentUser, handleLogout: onLogout, isDevUser, lessons, notices, onAddLesson, onDeleteLesson, onUpdateLesson, onAddNotice, onDeleteNotice, onUpdateNotice, classes } = useAppContext();
    const navigate = useNavigate();
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [newLesson, setNewLesson] = useState({ subject: '', time: '', className: '', type: 'Lezione' as LessonType});
    
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [newNotice, setNewNotice] = useState({ title: '', date: '', description: '', type: 'Generale' as NoticeType });
    const [newNoticeFiles, setNewNoticeFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
    
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'lesson' | 'notice' } | null>(null);
    
    const hasClasses = classes.length > 0;

    const handleOpenAddLessonModal = () => {
        setEditingLesson(null);
        setNewLesson({ subject: '', time: '', className: '', type: 'Lezione' as LessonType });
        setIsLessonModalOpen(true);
    };

    const handleOpenEditLessonModal = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setNewLesson({ subject: lesson.subject, time: lesson.time, className: lesson.className, type: lesson.type });
        setIsLessonModalOpen(true);
    };

    const handleSaveLesson = () => {
        if (newLesson.subject.trim() && newLesson.time.trim() && newLesson.className.trim()) {
            if (editingLesson) {
                onUpdateLesson(editingLesson.id, newLesson);
            } else {
                onAddLesson(newLesson);
            }
            setIsLessonModalOpen(false);
        }
    };
    
    const handleLessonClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = e.target.value;
        const previousValue = newLesson.className;

        const formatWithOrdinal = (name: string): string => {
            return name.replace(/\b(\d{1,2})\b(?!ª)/g, '$1ª');
        };

        if (currentValue.length < previousValue.length) { // Deleting
            if (previousValue.match(/\d{1,2}ª$/) && currentValue === previousValue.slice(0, -1)) {
                const newValue = previousValue.replace(/\d{1,2}ª$/, '');
                setNewLesson(prev => ({ ...prev, className: newValue }));
            } else {
                setNewLesson(prev => ({ ...prev, className: currentValue }));
            }
        } else { // Adding or changing
            const formattedValue = formatWithOrdinal(currentValue);
            setNewLesson(prev => ({ ...prev, className: formattedValue }));
        }
    };

    const handleOpenAddNoticeModal = () => {
        setEditingNotice(null);
        setNewNotice({ title: '', date: '', description: '', type: 'Generale' as NoticeType });
        setNewNoticeFiles([]);
        setExistingAttachments([]);
        setIsNoticeModalOpen(true);
    };

    const handleOpenEditNoticeModal = (notice: Notice) => {
        setEditingNotice(notice);
        setNewNotice({ title: notice.title, date: notice.date, description: notice.description || '', type: notice.type });
        setNewNoticeFiles([]);
        setExistingAttachments(notice.attachments || []);
        setIsNoticeModalOpen(true);
    };

    const handleSaveNotice = async () => {
        if (newNotice.title.trim()) {
            const newAttachments = await Promise.all(newNoticeFiles.map(fileToDataUrl));
            const finalAttachments = [...existingAttachments, ...newAttachments];

            if (editingNotice) {
                onUpdateNotice(editingNotice.id, { ...newNotice, attachments: finalAttachments });
            } else {
                onAddNotice({ ...newNotice, attachments: finalAttachments });
            }
            
            setIsNoticeModalOpen(false);
        }
    };
    
    const handleNoticeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewNoticeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveNoticeFile = (indexToRemove: number) => {
        setNewNoticeFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveExistingAttachment = (indexToRemove: number) => {
        setExistingAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleOpenDeleteModal = (id: string, type: 'lesson' | 'notice') => {
        setItemToDelete({ id, type });
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'lesson') {
            onDeleteLesson(itemToDelete.id);
        } else if (itemToDelete.type === 'notice') {
            onDeleteNotice(itemToDelete.id);
        }
        setItemToDelete(null);
    };

    if (!currentUser) return null;

    return (
        <>
            <Layout title="" showHeader={false}>
                <header className="flex items-center justify-between mb-8 animate-fadeIn">
                    <div className="flex items-center space-x-4">
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-slate-700" />
                        <div>
                        <p className="text-slate-400 text-sm">Bentornato,</p>
                        <h1 className="text-2xl font-bold text-slate-100">{currentUser.firstName}! 👋</h1>
                        </div>
                    </div>
                    {isDevUser && (
                    <button onClick={onLogout} className="p-3 rounded-full bg-slate-800/60 shadow-sm border border-slate-700 text-slate-300 hover:bg-slate-700/80 transition-colors">
                        {ICONS.logout}
                    </button>
                    )}
                </header>

                <section className="mb-8 animate-slideInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h2 className="text-lg font-bold text-slate-200">Prossime Lezioni</h2>
                        <button 
                            onClick={handleOpenAddLessonModal} 
                            disabled={!hasClasses} 
                            title={!hasClasses ? "Devi prima creare una classe" : "Aggiungi una nuova lezione"} 
                            className={`text-cyan-400 p-2 rounded-full hover:bg-cyan-400/10 transition-colors ${!hasClasses ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {React.cloneElement(ICONS.plus, { width: 20, height: 20 })}
                        </button>
                    </div>
                    {lessons.length > 0 ? (
                        <div className="space-y-3">
                        {lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onDelete={(id) => handleOpenDeleteModal(id, 'lesson')} onEdit={handleOpenEditLessonModal} />)}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 text-slate-400 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md">
                            <svg className="w-16 h-16 text-green-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /></svg>
                            <h3 className="font-semibold text-lg text-slate-200">Tutto completato per oggi!</h3>
                            <p className="text-sm">Nessuna lezione imminente. Ottimo lavoro!</p>
                        </div>
                    )}
                </section>

                <section className="animate-slideInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h2 className="text-lg font-bold text-slate-200">Bacheca Avvisi</h2>
                        <div className="flex items-center space-x-2">
                             <button onClick={handleOpenAddNoticeModal} className="text-cyan-400 p-2 rounded-full hover:bg-cyan-400/10 transition-colors">
                                {React.cloneElement(ICONS.plus, { width: 20, height: 20 })}
                            </button>
                            <button onClick={() => navigate('/communications?tab=avvisi')} className="text-sm font-semibold text-cyan-400 hover:underline">Vedi tutto</button>
                        </div>
                    </div>
                    {notices.length > 0 ? (
                        <div className="space-y-3">
                        {notices.slice(0, 3).map((notice) => <NoticeCard key={notice.id} notice={notice} onDelete={(id) => handleOpenDeleteModal(id, 'notice')} onEdit={handleOpenEditNoticeModal} />)}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 text-slate-400 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md">
                            <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                            <h3 className="font-semibold text-lg text-slate-200">Bacheca pulita!</h3>
                            <p className="text-sm">Nessun nuovo avviso da segnalare.</p>
                        </div>
                    )}
                </section>
            </Layout>
             <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title={editingLesson ? 'Modifica Lezione' : 'Programma una Nuova Lezione'} closeOnOverlayClick={false}>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di Lezione</label>
                        <div className="grid grid-cols-2 gap-2">
                            <TypeOptionButton label="Lezione" icon={ICONS.book} color="blue" isSelected={newLesson.type === 'Lezione'} onClick={() => setNewLesson({ ...newLesson, type: 'Lezione'})} />
                            <TypeOptionButton label="Laboratorio" icon={ICONS.lab_beaker} color="purple" isSelected={newLesson.type === 'Laboratorio'} onClick={() => setNewLesson({ ...newLesson, type: 'Laboratorio'})} />
                            <TypeOptionButton label="Verifica" icon={ICONS.file_text} color="yellow" isSelected={newLesson.type === 'Verifica'} onClick={() => setNewLesson({ ...newLesson, type: 'Verifica'})} />
                            <TypeOptionButton label="Recupero" icon={ICONS.activity} color="green" isSelected={newLesson.type === 'Recupero'} onClick={() => setNewLesson({ ...newLesson, type: 'Recupero'})} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lessonSubject" className="block text-sm font-medium text-slate-300 mb-1">Materia</label>
                        <input id="lessonSubject" type="text" placeholder="Es: Biologia" value={newLesson.subject} onChange={e => setNewLesson({...newLesson, subject: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="lessonClass" className="block text-sm font-medium text-slate-300 mb-1">Classe</label>
                            <input id="lessonClass" type="text" placeholder="Es: Classe 3ª B" value={newLesson.className} onChange={handleLessonClassNameChange} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                         <div>
                            <label htmlFor="lessonTime" className="block text-sm font-medium text-slate-300 mb-1">Orario</label>
                            <input id="lessonTime" type="text" placeholder="Es: 09:00 - 10:00" value={newLesson.time} onChange={e => setNewLesson({...newLesson, time: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setIsLessonModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                        <button onClick={handleSaveLesson} disabled={!newLesson.subject.trim() || !newLesson.className.trim() || !newLesson.time.trim()} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:shadow-xl">
                            {React.cloneElement(editingLesson ? ICONS.edit : ICONS.plus, { width: 18, height: 18})}
                            <span>{editingLesson ? 'Salva Modifiche' : 'Aggiungi Lezione'}</span>
                        </button>
                    </div>
                </div>
            </Modal>
             <Modal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} title={editingNotice ? 'Modifica Avviso' : 'Crea un Nuovo Avviso'} closeOnOverlayClick={false}>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di Avviso</label>
                        <div className="flex items-center space-x-2">
                            <TypeOptionButton label="Generale" icon={ICONS.info} color="blue" isSelected={newNotice.type === 'Generale'} onClick={() => setNewNotice({ ...newNotice, type: 'Generale'})} />
                            <TypeOptionButton label="Importante" icon={ICONS.warning} color="yellow" isSelected={newNotice.type === 'Importante'} onClick={() => setNewNotice({ ...newNotice, type: 'Importante'})} />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <TypeOptionButton label="Urgente" icon={ICONS.bell_filled} color="red" isSelected={newNotice.type === 'Urgente'} onClick={() => setNewNotice({ ...newNotice, type: 'Urgente'})} />
                            <TypeOptionButton label="Evento" icon={ICONS.calendar} color="purple" isSelected={newNotice.type === 'Evento'} onClick={() => setNewNotice({ ...newNotice, type: 'Evento'})} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="noticeTitle" className="block text-sm font-medium text-slate-300 mb-1">Titolo</label>
                        <input 
                            id="noticeTitle" 
                            type="text" 
                            placeholder="Es: Riunione genitori-insegnanti" 
                            value={newNotice.title} 
                            onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                            className="w-full text-lg font-semibold px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="noticeDescription" className="block text-sm font-medium text-slate-300 mb-1">Dettagli (opzionale)</label>
                        <textarea 
                            id="noticeDescription" 
                            rows={4} 
                            placeholder="Aggiungi ulteriori informazioni, link o istruzioni qui..." 
                            value={newNotice.description} 
                            onChange={e => setNewNotice({...newNotice, description: e.target.value})} 
                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="noticeDate" className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                            <input 
                                id="noticeDate" 
                                type="text" 
                                placeholder="Es: Domani, 16:30" 
                                value={newNotice.date} 
                                onChange={e => setNewNotice({...newNotice, date: e.target.value})} 
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Allegati</label>
                            <label htmlFor="notice-attachment-input-home" className="w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition">
                                {React.cloneElement(ICONS.paperclip, { width: 20, height: 20})}
                                <span>Allega file</span>
                            </label>
                             <input id="notice-attachment-input-home" type="file" multiple className="hidden" onChange={handleNoticeFileChange} />
                        </div>
                    </div>
                    
                    {existingAttachments.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-400 mb-2">Allegati esistenti</h4>
                            <div className="space-y-2 max-h-28 overflow-y-auto pr-2">
                                {existingAttachments.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-slate-700/60 p-2 rounded-lg text-sm">
                                    <span className="text-slate-200 truncate pr-2">{file.name}</span>
                                    <button onClick={() => handleRemoveExistingAttachment(index)} className="text-red-500 hover:text-red-400 p-1 rounded-full flex-shrink-0">
                                        {React.cloneElement(ICONS.trash, { width: 16, height: 16 })}
                                    </button>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {newNoticeFiles.length > 0 && (
                         <div className={editingNotice && existingAttachments.length > 0 ? "mt-4" : ""}>
                            <h4 className="text-sm font-semibold text-slate-400 mb-2">Nuovi allegati</h4>
                            <div className="space-y-2 max-h-28 overflow-y-auto pr-2">
                                {newNoticeFiles.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-slate-700/60 p-2 rounded-lg text-sm">
                                    <span className="text-slate-200 truncate pr-2">{file.name}</span>
                                    <div className="flex items-center flex-shrink-0">
                                    <span className="text-xs text-slate-400 mr-2">({(file.size / 1024).toFixed(1)} KB)</span>
                                    <button onClick={() => handleRemoveNoticeFile(index)} className="text-red-500 hover:text-red-400 p-1 rounded-full">
                                        {React.cloneElement(ICONS.trash, { width: 16, height: 16 })}
                                    </button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button 
                            onClick={() => setIsNoticeModalOpen(false)} 
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                            Annulla
                        </button>
                        <button 
                            onClick={handleSaveNotice} 
                            disabled={!newNotice.title.trim()}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:shadow-xl"
                        >
                            {React.cloneElement(editingNotice ? ICONS.edit : ICONS.bell_outline, { width: 18, height: 18})}
                            <span>{editingNotice ? 'Salva Modifiche' : 'Pubblica Avviso'}</span>
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Conferma Eliminazione"
                variant="danger"
                closeOnOverlayClick={false}
            >
                <div className="space-y-6 text-center">
                    <p className="text-slate-300">
                        Sei sicuro di voler eliminare questo elemento?
                        <br/>
                        L'azione non può essere annullata.
                    </p>
                    <div className="flex justify-center space-x-4 pt-2">
                        <button onClick={() => setItemToDelete(null)} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">
                            Annulla
                        </button>
                        <button onClick={handleConfirmDelete} className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center space-x-2">
                             {React.cloneElement(ICONS.trash, { width: 16, height: 16 })}
                             <span>Elimina</span>
                        </button>
                    </div>
                </div>
            </Modal>
            <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; }
            `}</style>
        </>
    );
};

export default HomePage;
