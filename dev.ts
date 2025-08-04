

import * as db from './db';
import type { User, ClassInfo, Student, Lesson, Notice, GradeItem, Message, SessionRecord, ActivityRecord } from './constants';

export const populateDevData = async (teacherId: string) => {
    const classes: ClassInfo[] = [
        { id: 'dev-class-1', name: 'Classe 1ª A - Scienze' },
        { id: 'dev-class-2', name: 'Classe 3ª B - Informatica' },
        { id: 'dev-class-3', name: 'Classe 5ª C - Lettere' },
    ];
    
    const students: Student[] = [
        // Students for class 1
        { id: 'dev-student-1', name: 'Mario Rossi', age: 14, classId: 'dev-class-1', className: 'Classe 1ª A - Scienze', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=Mario', subject: 'N/A', contact: { phone: '333111222', email: 'mario.r@email.com', address: 'Via Roma 1' }, parents: [{name: 'Luca Rossi', contact: '333000111'}], accessCode: 'MARCLA-1234'},
        { id: 'dev-student-2', name: 'Giulia Bianchi', age: 14, classId: 'dev-class-1', className: 'Classe 1ª A - Scienze', avatarUrl: 'https://avatar.iran.liara.run/public/girl?username=Giulia', subject: 'N/A', contact: { phone: '333333444', email: 'giulia.b@email.com', address: 'Via Milano 2' }, parents: [{name: 'Anna Bianchi', contact: '333222333'}]},
        
        // Students for class 2
        { id: 'dev-student-3', name: 'Luca Verdi', age: 16, classId: 'dev-class-2', className: 'Classe 3ª B - Informatica', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=Luca', subject: 'N/A', contact: { phone: '345678901', email: 'luca.v@email.com', address: 'Corso Como 10' }, parents: [], accessCode: 'LUCCLA-5678'},
        { id: 'dev-student-4', name: 'Sofia Neri', age: 16, classId: 'dev-class-2', className: 'Classe 3ª B - Informatica', avatarUrl: 'https://avatar.iran.liara.run/public/girl?username=Sofia', subject: 'N/A', contact: { phone: '345123456', email: 'sofia.n@email.com', address: 'Piazza Duomo 5' }, parents: [{name: 'Marco Neri', contact: '345987654'}]},

        // Students for class 3
        { id: 'dev-student-5', name: 'Matteo Gialli', age: 18, classId: 'dev-class-3', className: 'Classe 5ª C - Lettere', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=Matteo', subject: 'N/A', contact: { phone: '366112233', email: 'matteo.g@email.com', address: 'Viale Monza 100' }, parents: []},
    ];

    const lessons: Lesson[] = [
        { id: 'dev-lesson-1', subject: 'Biologia Molecolare', time: '09:00 - 10:00', className: 'Classe 1ª A - Scienze', type: 'Lezione' },
        { id: 'dev-lesson-2', subject: 'Programmazione Python', time: '10:00 - 12:00', className: 'Classe 3ª B - Informatica', type: 'Laboratorio' },
        { id: 'dev-lesson-3', subject: 'Verifica su Dante', time: '12:00 - 13:00', className: 'Classe 5ª C - Lettere', type: 'Verifica' },
    ];
    
    const notices: Notice[] = [
        { id: 'dev-notice-1', title: 'Riunione Genitori-Insegnanti', date: 'Domani, 17:00', description: 'Si terrà la riunione periodica per discutere dell\'andamento scolastico.', type: 'Importante'},
        { id: 'dev-notice-2', title: 'Evento Sportivo', date: 'Venerdì', description: 'Torneo di pallavolo interclasse in palestra.', type: 'Evento'},
    ];

    const grades: GradeItem[] = [
        { id: 'dev-grade-1', studentId: 'dev-student-1', type: 'Compito', subject: 'Biologia', date: '2024-05-10', grade: 8},
        { id: 'dev-grade-2', studentId: 'dev-student-1', type: 'Esame', subject: 'Chimica', date: '2024-05-20', grade: 7},
        { id: 'dev-grade-3', studentId: 'dev-student-2', type: 'Compito', subject: 'Biologia', date: '2024-05-10', grade: 6},
        { id: 'dev-grade-7', studentId: 'dev-student-2', type: 'Esame', subject: 'Fisica', date: '2024-05-18', grade: 5},
        { id: 'dev-grade-4', studentId: 'dev-student-3', type: 'Compito', subject: 'Algoritmi', date: '2024-05-15', grade: 9},
        { id: 'dev-grade-5', studentId: 'dev-student-3', type: 'Esame', subject: 'Database', date: '2024-05-25', grade: 8},
        { id: 'dev-grade-6', studentId: 'dev-student-4', type: 'Compito', subject: 'HTML/CSS', date: '2024-05-15', grade: 5},
    ];

    const messages: Message[] = [
        { id: 'dev-message-1', className: 'Classe 1ª A - Scienze', lastMessageTime: '10:30', avatarUrl: `https://avatar.iran.liara.run/public/42`, classId: 'dev-class-1' },
        { id: 'dev-message-2', className: 'Classe 3ª B - Informatica', lastMessageTime: 'Ieri', avatarUrl: `https://avatar.iran.liara.run/public/25`, classId: 'dev-class-2' },
    ];

    const dataToStore = [
        ...classes.map(item => ({ store: db.STORES.CLASSES, data: { ...item, teacherId } })),
        ...students.map(item => ({ store: db.STORES.STUDENTS, data: { ...item, teacherId } })),
        ...lessons.map(item => ({ store: db.STORES.LESSONS, data: { ...item, teacherId } })),
        ...notices.map(item => ({ store: db.STORES.NOTICES, data: { ...item, teacherId } })),
        ...grades.map(item => ({ store: db.STORES.GRADES, data: { ...item, teacherId } })),
        ...messages.map(item => ({ store: db.STORES.MESSAGES, data: { ...item, teacherId } })),
    ];

    await Promise.all(dataToStore.map(item => db.dbPut(item.store, item.data)));
}

export const handleDevLogin = async (loginHandler: (user: User, setSession?: boolean) => Promise<void>) => {
    const devUserId = 'dev-user-01';
    let devUserWithPassword = await db.dbGetUserById(devUserId);

    if (!devUserWithPassword) {
        const devEmail = 'dev@example.com';
        const devPassword = 'dev';

        const hashedEmail = await db.hashString(devEmail);
        const hashedPassword = await db.hashString(devPassword);

        const userToCreate: User = {
            id: devUserId,
            firstName: 'Sviluppatore',
            lastName: 'Demo',
            email: hashedEmail,
            password: hashedPassword,
            dateOfBirth: '1990-01-01',
            avatarUrl: `https://avatar.iran.liara.run/public/boy?username=Dev`,
            phone: '123-456-7890',
            address: '123 Via Codice, Sviluppopoli',
        };
        await db.dbAddUser(userToCreate);
        await populateDevData(userToCreate.id);
        devUserWithPassword = userToCreate;
    }
    
    if (devUserWithPassword) {
        const { password, ...userFromDb } = devUserWithPassword;
        const userForState = {
            ...userFromDb,
            email: 'dev@example.com' // provide plaintext email
        };
        await loginHandler(userForState, true);
    }
};
  
export const handleResetDevData = async (teacherId: string): Promise<db.AllData> => {
    await db.dbDeleteAllDataForTeacher(teacherId);

    const devEmail = 'dev@example.com';
    const devPassword = 'dev';

    const hashedEmail = await db.hashString(devEmail);
    const hashedPassword = await db.hashString(devPassword);

    const userToCreate: User = {
        id: teacherId,
        firstName: 'Sviluppatore',
        lastName: 'Demo',
        email: hashedEmail,
        password: hashedPassword,
        dateOfBirth: '1990-01-01',
        avatarUrl: `https://avatar.iran.liara.run/public/boy?username=Dev`,
        phone: '123-456-7890',
        address: '123 Via Codice, Sviluppopoli',
    };
    await db.dbAddUser(userToCreate);
    await populateDevData(userToCreate.id);

    return await db.dbGetAllDataForTeacher(userToCreate.id);
};

export const handleDevStudentLogin = async (studentLoginHandler: (sessionRecord: SessionRecord, student: Student, setSession?: boolean, broadcastLoginEvent?: boolean) => Promise<void>) => {
    const devTeacherId = 'dev-user-01';
    
    let devTeacher = await db.dbGetUserById(devTeacherId);
    if (!devTeacher) {
        const devUser: User = {
            id: 'dev-user-01', password: 'dev', firstName: 'Sviluppatore', lastName: 'Demo', email: 'dev@example.com',
            dateOfBirth: '1990-01-01', avatarUrl: `https://avatar.iran.liara.run/public/boy?username=Dev`, phone: '123-456-7890', address: '123 Via Codice, Sviluppopoli'
        };
        await db.dbAddUser(devUser);
    }

    const devClass: ClassInfo = { id: 'dev-class-01', name: 'Classe di Prova' };
    const existingClass = await db.dbRequest(db.STORES.CLASSES, 'readonly', store => store.get(devClass.id));
    if(!existingClass) {
        await db.dbPut(db.STORES.CLASSES, { ...devClass, teacherId: devTeacherId });
    }

    let devStudent: Student | null = await db.dbGetStudentById('dev-student-01');
    if (!devStudent) {
        const newDevStudent: Student = {
            id: 'dev-student-01', name: 'Studente di Prova', age: 16, classId: devClass.id, className: devClass.name,
            avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=Test',
            subject: 'Testing', contact: { phone: '555-0101', email: 'test.student@example.com', address: '456 Via Bug, Iterazioneburgo' },
            parents: [{ name: 'Genitore Prova 1', contact: '555-0102' }],
            accessCode: 'DEV-STUDENT-CODE'
        };
        await db.dbPut(db.STORES.STUDENTS, { ...newDevStudent, teacherId: devTeacherId });
        devStudent = newDevStudent;
    }

    if (devStudent) {
        const sessionId = `session-dev-${Date.now()}`;
        const loginTimestamp = Date.now();

        const newSessionRecord: SessionRecord = {
            sessionId,
            studentId: devStudent.id,
            teacherId: devTeacherId,
            loginTimestamp: loginTimestamp,
        };
        await db.dbPut(db.STORES.SESSIONS, newSessionRecord);

        const newActivity: ActivityRecord = {
            id: `activity-dev-login-${Date.now()}`,
            sessionId,
            studentId: devStudent.id,
            timestamp: loginTimestamp,
            type: 'LOGIN',
        };
        await db.dbPut(db.STORES.ACTIVITIES, newActivity);
        
        await studentLoginHandler(newSessionRecord, devStudent, true);
    } else {
        console.error("Failed to create or find dev student.");
    }
};