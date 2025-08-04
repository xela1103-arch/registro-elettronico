
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './Layout';
import { useSearchParams } from 'react-router-dom';
import Modal from './Modal';
import { ICONS } from './constants';
import type { Message, Notice, ClassInfo, NoticeType, Attachment } from './constants';
import { useAppContext } from './AppContext';


const noticeTypeStyles: { [key in NoticeType]: { icon: React.ReactNode, colors: string } } = {
    'Generale': { icon: ICONS.info, colors: 'bg-blue-900/50 text-blue-300' },
    'Importante': { icon: ICONS.warning, colors: 'bg-yellow-900/50 text-yellow-300' },
    'Urgente': { icon: ICONS.bell_filled, colors: 'bg-red-900/50 text-red-300' },
    'Evento': { icon: ICONS.calendar, colors: 'bg-purple-900/50 text-purple-300' },
};

// --- DESKTOP-ONLY SUB-COMPONENTS ---

const SelectionPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 animate-fadeIn">
        <div className="w-48 h-48 mb-6 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-300">Seleziona un elemento</h3>
        <p className="mt-2 max-w-xs">Scegli un messaggio o un avviso dalla lista per visualizzarne i dettagli qui.</p>
    </div>
);

const DesktopListItem: React.FC<{
    item: Message | Notice;
    type: 'messaggi' | 'avvisi';
    isActive: boolean;
    onClick: () => void;
}> = ({ item, type, isActive, onClick }) => {
    const noticeType = type === 'avvisi' ? (item as Notice).type || 'Generale' : undefined;
    const style = noticeType ? noticeTypeStyles[noticeType] : undefined;

    const title = type === 'messaggi' ? (item as Message).className : (item as Notice).title;
    const subtext = type === 'messaggi' ? `Ultimo messaggio: ${(item as Message).lastMessageTime}` : (item as Notice).date;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-b border-slate-800/80 transition-all duration-200 relative overflow-hidden ${isActive ? 'bg-slate-700/60' : 'hover:bg-slate-800/80'}`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 transition-transform duration-300 ease-out ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></div>
            <div className="relative">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-100 truncate pr-4">{title}</p>
                    {type === 'avvisi' && style && (
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.colors}`}>
                            {noticeType}
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-400 truncate">{subtext}</p>
            </div>
        </button>
    );
};

const NoticeDetailView: React.FC<{ notice: Notice; onDelete: () => void; }> = ({ notice, onDelete }) => {
    const type = notice.type || 'Generale';
    const { icon, colors } = noticeTypeStyles[type];

    return (
        <div className="p-6 lg:p-8 animate-fadeIn">
            <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center space-x-3 text-lg font-bold px-4 py-2 rounded-lg ${colors}`}>
                    {icon}
                    <span>{type}</span>
                </div>
                <button onClick={onDelete} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                    {React.cloneElement(ICONS.trash, { width: 20, height: 20 })}
                </button>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 mb-2 break-words">{notice.title}</h1>
            <p className="text-slate-400 mb-6 font-semibold">{notice.date}</p>
            
            {notice.description && <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-8">{notice.description}</p>}

            {notice.attachments && notice.attachments.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Allegati</h3>
                    <div className="space-y-3">
                        {notice.attachments.map((att, index) => (
                             <a 
                                key={index} 
                                href={att.url} 
                                download={att.name}
                                className="flex items-center space-x-4 text-cyan-400 bg-slate-800 p-3 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700"
                            >
                                <div className="flex-shrink-0 text-cyan-400/80">
                                    {React.cloneElement(att.type.startsWith('image/') ? ICONS.image : ICONS.file_text, { width: 24, height: 24 })}
                                </div>
                                <div className="min-w-0">
                                    <span className="font-semibold text-slate-100 truncate block">{att.name}</span>
                                    <span className="text-sm text-slate-400">Clicca per scaricare</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MessageDetailView: React.FC<{ message: Message; onDelete: () => void; }> = ({ message, onDelete }) => (
    <div className="p-6 lg:p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
             <div className="flex items-center space-x-4">
                <img src={message.avatarUrl} alt={message.className} className="w-16 h-16 rounded-full"/>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">{message.className}</h1>
                    <p className="text-slate-400">Chat di gruppo</p>
                </div>
             </div>
             <button onClick={onDelete} className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                {React.cloneElement(ICONS.trash, { width: 20, height: 20 })}
            </button>
        </div>
        <div className="h-96 flex items-center justify-center bg-slate-800/80 rounded-lg border border-slate-700">
            <p className="text-slate-500">L'interfaccia di chat sarà disponibile qui.</p>
        </div>
    </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; message: string; }> = ({ icon, title, message }) => (
    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-16 px-4 bg-slate-800/60 border border-slate-700 rounded-2xl animate-fadeIn">
        <div className="w-24 h-24 mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="max-w-xs">{message}</p>
    </div>
);

const MessageItem: React.FC<{ item: Message; index: number; onDelete: (id: string) => void; }> = ({ item, index, onDelete }) => (
    <div 
        className="flex items-center space-x-4 p-4 bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg hover:bg-slate-700/60 transition-all duration-300 cursor-pointer animate-slideInUp group"
        style={{ animationDelay: `${index * 75}ms` }}
    >
        <img src={item.avatarUrl} alt={item.className} className="w-14 h-14 rounded-full" />
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-slate-100 text-base truncate">{item.className}</p>
            <p className="text-sm text-slate-400">Ultimo messaggio: {item.lastMessageTime}</p>
        </div>
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-500/10">
            {ICONS.trash}
        </button>
    </div>
);

const NoticeItem: React.FC<{ item: Notice; index: number; onDelete: (id: string) => void; }> = ({ item, index, onDelete }) => {
    const type = item.type || 'Generale';
    const { icon, colors } = noticeTypeStyles[type];

    return (
    <div 
        className="flex items-start space-x-4 p-4 bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg hover:bg-slate-700/60 transition-all duration-300 cursor-pointer animate-slideInUp group"
        style={{ animationDelay: `${index * 75}ms` }}
    >
        <div className={`p-3 rounded-full mt-1 flex-shrink-0 ${colors}`}>
            {icon}
        </div>
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-slate-100 text-base">{item.title}</p>
            {item.description && <p className="text-sm text-slate-300 mt-1 break-words">{item.description}</p>}
            <p className="text-sm text-slate-400 mt-2">{item.date}</p>
            {item.attachments && item.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2">Allegati:</h4>
                    <div className="space-y-2">
                        {item.attachments.map((att, index) => (
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
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-500/10 flex-shrink-0">
            {ICONS.trash}
        </button>
    </div>
    );
};

const NoticeTypeOption: React.FC<{
    type: NoticeType;
    icon: React.ReactElement;
    color: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ type, icon, color, isSelected, onClick }) => {
    const colorClasses: {[key: string]: {bg: string, text: string, ring: string}} = {
        blue: { bg: 'bg-blue-900/50', text: 'text-blue-300', ring: 'ring-blue-400' },
        yellow: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', ring: 'ring-yellow-400' },
        red: { bg: 'bg-red-900/50', text: 'text-red-300', ring: 'ring-red-400' },
        purple: { bg: 'bg-purple-900/50', text: 'text-purple-300', ring: 'ring-purple-400' },
    };
    const styles = colorClasses[color] || colorClasses.blue;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected ? `ring-2 ${styles.ring} border-transparent shadow-lg bg-slate-700/50` : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                    {icon}
                </div>
                <span className={`font-semibold ${styles.text}`}>{type}</span>
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


const CommunicationsPage: React.FC = () => {
    const { isDevUser, handleLogout: onLogout, messages, notices, classes, onAddMessage, onDeleteMessage, onAddNotice, onDeleteNotice } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'messaggi' | 'avvisi') || 'messaggi';
    const searchTerm = searchParams.get('q') || '';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const setActiveTab = (tabName: 'messaggi' | 'avvisi') => { const newParams = new URLSearchParams(searchParams); newParams.set('tab', tabName); setSearchParams(newParams, { replace: true }); };
    const setSearchTerm = (term: string) => { const newParams = new URLSearchParams(searchParams); if (term) newParams.set('q', term); else newParams.delete('q'); setSearchParams(newParams, { replace: true }); };

    // Form state for new items
    const [newNotice, setNewNotice] = useState({ title: '', date: '', description: '', type: 'Generale' as NoticeType });
    const [newNoticeFiles, setNewNoticeFiles] = useState<File[]>([]);
    const [newMessageClassId, setNewMessageClassId] = useState<string>(classes[0]?.id || '');

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredMessages = messages.filter(msg => msg.className.toLowerCase().includes(lowerCaseSearchTerm));
    const filteredNotices = notices.filter(notice => 
        notice.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        (notice.description && notice.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
    
    useEffect(() => {
        setSelectedItemId(null);
    }, [activeTab, searchTerm]);
    
    const selectedItem = useMemo(() => {
        if (!selectedItemId) return null;
        const source = activeTab === 'messaggi' ? messages : notices;
        return source.find(item => item.id === selectedItemId) || null;
    }, [selectedItemId, messages, notices, activeTab]);

    const handleAdd = async () => {
        if (activeTab === 'avvisi') {
            if (newNotice.title.trim()) {
                const attachments = await Promise.all(newNoticeFiles.map(fileToDataUrl));
                onAddNotice({ ...newNotice, attachments });
                setNewNotice({ title: '', date: '', description: '', type: 'Generale' });
                setNewNoticeFiles([]);
                setIsModalOpen(false);
            }
        } else {
            const selectedClass = classes.find(c => c.id === newMessageClassId);
            if (selectedClass) {
                const newMessage: Omit<Message, 'id'> = {
                    classId: selectedClass.id,
                    className: selectedClass.name,
                    lastMessageTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit'}),
                    avatarUrl: `https://avatar.iran.liara.run/public/${Math.random() > 0.5 ? 'girl' : 'boy'}?username=${selectedClass.name.replace(/\s+/g, '')}`
                };
                onAddMessage(newMessage);
                setIsModalOpen(false);
            }
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

    const MobileTabButton: React.FC<{ tabName: 'messaggi' | 'avvisi'; label: string; }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`w-full py-3 text-center font-semibold rounded-lg transition-all duration-300 ${
                activeTab === tabName
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );
    
    const noResultsForSearch = searchTerm && ((activeTab === 'messaggi' && filteredMessages.length === 0) || (activeTab === 'avvisi' && filteredNotices.length === 0));
    
    const itemList = activeTab === 'messaggi' ? filteredMessages : filteredNotices;
    
    const listComponent = (
        <div className="space-y-3">
            {itemList.length > 0 ? (
                itemList.map((item, index) => 
                    activeTab === 'messaggi' 
                    ? <MessageItem key={item.id} item={item as Message} index={index} onDelete={() => onDeleteMessage(item.id)} />
                    : <NoticeItem key={item.id} item={item as Notice} index={index} onDelete={() => onDeleteNotice(item.id)} />
                )
            ) : (
                <EmptyState
                    icon={activeTab === 'messaggi' 
                        ? <svg className="text-blue-400 opacity-50" xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
                        : <svg className="text-teal-400 opacity-50" xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    }
                    title={activeTab === 'messaggi' ? "Silenzio radio!" : "Tutto tranquillo"}
                    message={activeTab === 'messaggi' ? "Nessun nuovo messaggio." : "Nessun avviso in bacheca."}
                />
            )}
        </div>
    );

    return (
        <>
            <Layout title="" isDevUser={isDevUser} onLogout={onLogout} showHeader={false}>
                
                {/* --- MOBILE VIEW --- */}
                <div className="lg:hidden">
                    <header className="mb-6 animate-fadeIn p-4 -mx-4">
                        <h1 className="text-3xl font-bold text-slate-100">Rimani Connesso</h1>
                        <p className="text-slate-400 mt-1">Tutti i tuoi messaggi e avvisi in un unico posto.</p>
                    </header>
                    <div className="p-1 bg-slate-900/50 rounded-xl flex items-center space-x-1 mb-6 sticky top-0 z-10 py-2 shadow-sm">
                        <MobileTabButton tabName="messaggi" label="Messaggi" />
                        <MobileTabButton tabName="avvisi" label="Avvisi" />
                    </div>
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-slate-400">{ICONS.search}</span></div>
                        <input type="text" placeholder={`Cerca in ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"/>
                    </div>
                    {noResultsForSearch ? <EmptyState icon={<svg className="text-yellow-400" xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>} title={`Nessun risultato per "${searchTerm}"`} message="Controlla l'ortografia o prova con un'altra parola." /> : listComponent}
                </div>

                {/* --- DESKTOP VIEW --- */}
                <div className="hidden lg:flex h-[calc(100vh-80px)] bg-slate-800/30 rounded-2xl border border-slate-700/50">
                    {/* Left Sidebar */}
                    <div className="w-72 flex-shrink-0 p-4 flex flex-col space-y-4">
                        <h1 className="text-2xl font-bold text-slate-100 px-2">Comunicazioni</h1>
                        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transform transition-all">
                            {React.cloneElement(ICONS.plus, {width: 20, height: 20})}<span>Nuovo</span>
                        </button>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400">{ICONS.search}</span></div>
                            <input type="text" placeholder="Cerca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <button onClick={() => setActiveTab('messaggi')} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeTab === 'messaggi' ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-700/50'}`}>
                                {React.cloneElement(ICONS.communications_custom, {width: 20, height: 20})}<span>Messaggi</span><span className="ml-auto text-xs font-mono bg-slate-700/80 px-2 py-0.5 rounded-full">{filteredMessages.length}</span>
                            </button>
                             <button onClick={() => setActiveTab('avvisi')} className={`flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg font-semibold transition-colors ${activeTab === 'avvisi' ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-700/50'}`}>
                               {React.cloneElement(ICONS.bell_outline, {width: 20, height: 20})}<span>Avvisi</span><span className="ml-auto text-xs font-mono bg-slate-700/80 px-2 py-0.5 rounded-full">{filteredNotices.length}</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Middle List */}
                    <div className="w-96 flex-shrink-0 border-l border-r border-slate-700/80 flex flex-col bg-slate-800/60">
                        <div className="p-4 border-b border-slate-700/80 flex-shrink-0">
                            <h2 className="text-xl font-bold text-slate-100 capitalize">{activeTab}</h2>
                            <p className="text-sm text-slate-400">{itemList.length} elementi trovati</p>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            {noResultsForSearch ? <div className="p-8 text-center text-slate-400">Nessun risultato.</div> : itemList.map(item => <DesktopListItem key={item.id} item={item} type={activeTab} isActive={selectedItemId === item.id} onClick={() => setSelectedItemId(item.id)} />)}
                        </div>
                    </div>

                    {/* Right Detail View */}
                    <div className="flex-1 overflow-y-auto">
                        {selectedItem ? (
                            activeTab === 'messaggi'
                            ? <MessageDetailView message={selectedItem as Message} onDelete={() => onDeleteMessage(selectedItem.id)} />
                            : <NoticeDetailView notice={selectedItem as Notice} onDelete={() => onDeleteNotice(selectedItem.id)} />
                        ) : <SelectionPlaceholder />}
                    </div>
                </div>
                
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-24 right-6 lg:hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-100 z-20"
                    aria-label="Nuova comunicazione"
                >
                    {ICONS.plus}
                </button>
            </Layout>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Crea nuovo ${activeTab === 'messaggi' ? 'messaggio' : 'avviso'}`} closeOnOverlayClick={false}>
                {activeTab === 'messaggi' ? (
                     <div className="space-y-4">
                        <p className="text-sm text-slate-300">Seleziona la classe con cui avviare una conversazione.</p>
                        <select value={newMessageClassId} onChange={e => setNewMessageClassId(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={classes.length === 0}>
                            {classes.length > 0 ? (
                                classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            ) : (
                                <option>Nessuna classe disponibile</option>
                            )}
                        </select>
                         <div className="flex justify-end space-x-3 pt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600">Annulla</button>
                            <button onClick={handleAdd} disabled={classes.length === 0} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-colors">Invia</button>
                        </div>
                     </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di Avviso</label>
                            <div className="flex items-center space-x-2">
                                <NoticeTypeOption type="Generale" icon={ICONS.info} color="blue" isSelected={newNotice.type === 'Generale'} onClick={() => setNewNotice({ ...newNotice, type: 'Generale'})} />
                                <NoticeTypeOption type="Importante" icon={ICONS.warning} color="yellow" isSelected={newNotice.type === 'Importante'} onClick={() => setNewNotice({ ...newNotice, type: 'Importante'})} />
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <NoticeTypeOption type="Urgente" icon={ICONS.bell_filled} color="red" isSelected={newNotice.type === 'Urgente'} onClick={() => setNewNotice({ ...newNotice, type: 'Urgente'})} />
                                <NoticeTypeOption type="Evento" icon={ICONS.calendar} color="purple" isSelected={newNotice.type === 'Evento'} onClick={() => setNewNotice({ ...newNotice, type: 'Evento'})} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="noticeTitleComms" className="block text-sm font-medium text-slate-300 mb-1">Titolo</label>
                            <input 
                                id="noticeTitleComms" 
                                type="text" 
                                placeholder="Es: Riunione genitori-insegnanti" 
                                value={newNotice.title} 
                                onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                                className="w-full text-lg font-semibold px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="noticeDescriptionComms" className="block text-sm font-medium text-slate-300 mb-1">Dettagli (opzionale)</label>
                            <textarea 
                                id="noticeDescriptionComms" 
                                rows={4} 
                                placeholder="Aggiungi ulteriori informazioni, link o istruzioni qui..." 
                                value={newNotice.description} 
                                onChange={e => setNewNotice({...newNotice, description: e.target.value})} 
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="noticeDateComms" className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                                <input 
                                    id="noticeDateComms" 
                                    type="text" 
                                    placeholder="Es: Domani, 16:30" 
                                    value={newNotice.date} 
                                    onChange={e => setNewNotice({...newNotice, date: e.target.value})} 
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Allegati</label>
                                <label htmlFor="notice-attachment-input-comms" className="w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition">
                                    {React.cloneElement(ICONS.paperclip, { width: 20, height: 20})}
                                    <span>Allega file</span>
                                </label>
                                 <input id="notice-attachment-input-comms" type="file" multiple className="hidden" onChange={handleNoticeFileChange} />
                            </div>
                        </div>

                        {newNoticeFiles.length > 0 && (
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
                        )}

                        <div className="flex justify-end space-x-3 pt-2">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors"
                            >
                                Annulla
                            </button>
                            <button 
                                onClick={handleAdd} 
                                disabled={!newNotice.title.trim()}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:shadow-xl"
                            >
                                {React.cloneElement(ICONS.bell_outline, { width: 18, height: 18})}
                                <span>Pubblica Avviso</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.4s ease-out forwards; opacity: 0; }
            `}</style>
        </>
    );
};

export default CommunicationsPage;
