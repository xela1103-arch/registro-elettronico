
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ICONS } from './constants';
import type { GradeItem, Student } from './constants';
import Layout from './Layout';
import Modal from './Modal';
import { useAppContext } from './AppContext';

const getGradeColor = (grade: number | null): { text: string; bg: string; border: string; gradient: string } => {
    if (grade === null) return { text: 'text-slate-400', bg: 'bg-slate-700/50', border: 'border-slate-600', gradient: 'from-slate-700 to-slate-800' };
    if (grade >= 8) return { text: 'text-green-300', bg: 'bg-green-500/10', border: 'border-green-500/30', gradient: 'from-green-500/80 to-teal-600/80' };
    if (grade >= 6) return { text: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', gradient: 'from-blue-500/80 to-cyan-600/80' };
    return { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', gradient: 'from-orange-500/80 to-red-600/80' };
};

const StatCard: React.FC<{ title: string; average: string | null; icon: React.ReactNode }> = ({ title, average, icon }) => {
    const numericAverage = average ? parseFloat(average) : null;
    const colors = getGradeColor(numericAverage);

    return (
        <div className={`relative p-5 rounded-2xl overflow-hidden shadow-lg bg-slate-800 border border-slate-700`}>
            <div className={`absolute -inset-24 opacity-20 -z-1 bg-gradient-to-br ${colors.gradient} animate-spin-slow`}></div>
            <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>{icon}</div>
                <h3 className="font-semibold text-slate-300">{title}</h3>
            </div>
            <p className={`text-4xl font-bold ${colors.text}`}>{average || 'N/A'}</p>
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; count: number; }> = ({ label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`relative w-full py-3 text-center font-semibold rounded-lg transition-all duration-300 ${
            isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-transparent text-slate-300 hover:bg-slate-700'
        }`}
    >
        {label}
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {count}
        </span>
    </button>
);

const GradeCard: React.FC<{ item: GradeItem; onEdit: (grade: GradeItem) => void; onDelete: (id: string) => void; }> = ({ item, onEdit, onDelete }) => {
    const colors = getGradeColor(item.grade);

    return (
        <div className="group relative bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/10 flex flex-col h-full">
            
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 opacity-100 transition-opacity duration-300 lg:opacity-0 group-hover:lg:opacity-100">
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-full bg-slate-900/50 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label={`Modifica voto per ${item.subject}`}
                >
                    {React.cloneElement(ICONS.edit, { width: 18, height: 18 })}
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-full bg-slate-900/50 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Elimina voto per ${item.subject}`}
                >
                    {React.cloneElement(ICONS.trash, { width: 18, height: 18 })}
                </button>
            </div>

            <div className="flex-grow pr-12">
                <p className="font-bold text-slate-100 text-lg break-words">{item.subject}</p>
                <p className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="mt-auto pt-4 flex justify-end">
                <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center text-3xl font-extrabold rounded-full border-4 ${colors.border} ${colors.bg} ${colors.text}`}>
                    {item.grade}
                </div>
            </div>
        </div>
    );
};


const GradesPage: React.FC = () => {
    const { students: allStudents, grades: allGrades, onAddGrade, onUpdateGrade, onDeleteGrade, isDevUser, handleLogout: onLogout } = useAppContext();
    const { studentId } = useParams<{ studentId: string }>();
    const student = useMemo(() => allStudents.find(s => s.id === studentId), [allStudents, studentId]);

    const [activeTab, setActiveTab] = useState<'compiti' | 'esami'>('compiti');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
    const [formData, setFormData] = useState({ subject: '', grade: '', type: 'Compito' as GradeItem['type'], date: new Date().toISOString().split('T')[0] });

    const grades = useMemo(() => allGrades.filter(g => g.studentId === studentId), [allGrades, studentId]);
    const homeworks = useMemo(() => grades.filter(g => g.type === 'Compito'), [grades]);
    const exams = useMemo(() => grades.filter(g => g.type === 'Esame'), [grades]);
    
    const calculateAverage = (items: GradeItem[]) => {
        if (items.length === 0) return null;
        const sum = items.reduce((acc, item) => acc + item.grade, 0);
        return (sum / items.length).toFixed(1);
    };

    const homeworksAverage = useMemo(() => calculateAverage(homeworks), [homeworks]);
    const examsAverage = useMemo(() => calculateAverage(exams), [exams]);

    const gradesToShow = activeTab === 'compiti' ? homeworks : exams;

    const openAddModal = () => {
        setEditingGrade(null);
        setFormData({ subject: '', grade: '', type: activeTab === 'compiti' ? 'Compito' : 'Esame', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openEditModal = (grade: GradeItem) => {
        setEditingGrade(grade);
        setFormData({ subject: grade.subject, grade: String(grade.grade), type: grade.type, date: grade.date });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!studentId || !formData.subject || !formData.grade) return;
        const gradeValue = Number(formData.grade);
        if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 10) return;
        
        const gradeData = { studentId, subject: formData.subject, grade: gradeValue, type: formData.type, date: formData.date };

        if (editingGrade) {
            onUpdateGrade(editingGrade.id, gradeData);
        } else {
            onAddGrade(gradeData);
        }
        setIsModalOpen(false);
    };
    
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDeleteGrade(itemToDelete);
            setItemToDelete(null);
        }
    };


    if (!student) {
        return <Layout title="Valutazioni" showBack>Studente non trovato.</Layout>;
    }
    
    return (
        <div className="relative h-full flex flex-col">
            <Layout title="" showBack backPath={`/student/${studentId}`} isDevUser={isDevUser} onLogout={onLogout}>
                
                <header className="flex items-center space-x-4 mb-6 animate-fadeIn">
                    <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"/>
                    <div>
                        <p className="text-sm text-slate-400">Valutazioni di</p>
                        <h1 className="text-2xl font-bold text-slate-100">{student.name}</h1>
                    </div>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-slideInUp">
                    <StatCard title="Media Compiti" average={homeworksAverage} icon={ICONS.clipboard} />
                    <StatCard title="Media Esami" average={examsAverage} icon={ICONS.medal} />
                </section>
                
                <div className="flex items-center justify-between gap-4 mb-6 animate-slideInUp" style={{animationDelay: '100ms'}}>
                    <div className="flex-grow p-1 bg-slate-800/80 rounded-xl flex items-center space-x-1">
                        <TabButton label="Compiti" isActive={activeTab === 'compiti'} onClick={() => setActiveTab('compiti')} count={homeworks.length} />
                        <TabButton label="Esami" isActive={activeTab === 'esami'} onClick={() => setActiveTab('esami')} count={exams.length} />
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="flex-shrink-0 flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:scale-105 transition-all transform"
                        aria-label={`Aggiungi ${activeTab === 'compiti' ? 'compito' : 'esame'}`}
                    >
                        {React.cloneElement(ICONS.plus, { width: 20, height: 20 })}
                        <span className="hidden sm:inline">Aggiungi</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                    {gradesToShow.length > 0 ? (
                        gradesToShow.map((grade, index) => (
                             <div key={grade.id} className="animate-slideInUp" style={{ animationDelay: `${150 + index * 50}ms` }}>
                                <GradeCard item={grade} onEdit={openEditModal} onDelete={() => setItemToDelete(grade.id)} />
                            </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-16 px-4 bg-slate-800/60 rounded-2xl animate-fadeIn">
                            <h3 className="text-lg font-semibold text-slate-300">Nessuna valutazione qui</h3>
                            <p className="text-slate-400 mt-1">Aggiungi una nuova valutazione per questa categoria.</p>
                        </div>
                    )}
                </div>
            </Layout>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGrade ? 'Modifica Voto' : 'Aggiungi Voto'} closeOnOverlayClick={false}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Materia</label>
                        <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Voto (1-10)</label>
                        <input type="number" value={formData.grade} min="1" max="10" step="0.5" onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as GradeItem['type']})} className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="Compito">Compito</option>
                            <option value="Esame">Esame</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Data</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full mt-1 px-4 py-2.5 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-100 [color-scheme:dark]" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                        <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">Salva</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Conferma Eliminazione" variant="danger">
                {itemToDelete && (
                    <div className="space-y-6">
                        <p className="text-slate-300 text-sm">Sei sicuro di voler eliminare questo voto? L'azione non può essere annullata.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setItemToDelete(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors">Annulla</button>
                            <button onClick={handleConfirmDelete} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Elimina</button>
                        </div>
                    </div>
                )}
            </Modal>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; opacity: 0; }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 15s linear infinite; }
            `}</style>
        </div>
    );
};

export default GradesPage;
