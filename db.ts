

import type { User, ClassInfo, Student, Lesson, Notice, Message, GradeItem, SessionRecord, ActivityRecord } from './constants';
import { bufferToBase64URL } from './webauthnHelpers';

const DB_NAME = 'ElectronicRegistryDB';
const DB_VERSION = 5;

export interface AllData {
    classes: ClassInfo[];
    students: Student[];
    lessons: Lesson[];
    notices: Notice[];
    messages: Message[];
    grades: GradeItem[];
}

export interface WebAuthnCredential {
    credentialId: string; // base64url encoded
    userId: string;
    publicKey: string; // base64url encoded
    name: string;
    createdAt: number;
}


// Define store names in one place
export const STORES = {
    USERS: 'users',
    CLASSES: 'classes',
    STUDENTS: 'students',
    LESSONS: 'lessons',
    NOTICES: 'notices',
    MESSAGES: 'messages',
    GRADES: 'grades',
    SESSIONS: 'sessionHistory',
    ACTIVITIES: 'activityLog',
    USER_SETTINGS: 'userSettings',
    WEBAUTHN: 'webauthnCredentials',
};

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => {
                console.error("IndexedDB error:", request.error);
                reject(request.error);
            };
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = e => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (e.oldVersion < 3) {
                    if (!db.objectStoreNames.contains(STORES.USERS)) {
                        const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
                        usersStore.createIndex('by_email', 'email', { unique: true });
                    }
                    if (!db.objectStoreNames.contains(STORES.CLASSES)) {
                        const store = db.createObjectStore(STORES.CLASSES, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
                        const store = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                        store.createIndex('by_accessCode', 'accessCode', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.LESSONS)) {
                        const store = db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.NOTICES)) {
                        const store = db.createObjectStore(STORES.NOTICES, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
                        const store = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.GRADES)) {
                        const store = db.createObjectStore(STORES.GRADES, { keyPath: 'id' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                        store.createIndex('by_studentId', 'studentId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                        const store = db.createObjectStore(STORES.SESSIONS, { keyPath: 'sessionId' });
                        store.createIndex('by_teacherId', 'teacherId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.ACTIVITIES)) {
                        const store = db.createObjectStore(STORES.ACTIVITIES, { keyPath: 'id' });
                        store.createIndex('by_sessionId', 'sessionId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
                        db.createObjectStore(STORES.USER_SETTINGS, { keyPath: 'key' });
                    }
                }
                
                // Migration to remove webauthn (if it existed in a broken state before)
                if (e.oldVersion < 4) {
                    if (db.objectStoreNames.contains('webauthnCredentials')) {
                        db.deleteObjectStore('webauthnCredentials');
                    }
                }
                
                // Migration to add webauthn
                if (e.oldVersion < 5) {
                    if (!db.objectStoreNames.contains(STORES.WEBAUTHN)) {
                        const credStore = db.createObjectStore(STORES.WEBAUTHN, { keyPath: 'credentialId' });
                        credStore.createIndex('by_userId', 'userId', { unique: false });
                    }
                    // Add a plaintext_email field for WebAuthn login lookup
                    const usersStore = request.transaction!.objectStore(STORES.USERS);
                    if (!usersStore.indexNames.contains('by_plaintext_email')) {
                        usersStore.createIndex('by_plaintext_email', 'plaintext_email', { unique: false });
                    }
                }
            };
        });
    }
    return dbPromise;
};

// Generic request wrapper
export const dbRequest = <T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest | IDBRequest<IDBValidKey>): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        const db = await getDb();
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = action(store);
        tx.oncomplete = () => resolve(req.result as T);
        tx.onerror = () => reject(tx.error);
    });
};

const dbRequestCursor = <T>(storeName: string, indexName: string, query: IDBValidKey | IDBKeyRange): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await getDb();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const req = index.getAll(query);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result as T[]);
    });
}

// Hashing function
export const hashString = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

// User Functions
export const dbGetUserByEmail = (email: string): Promise<User | undefined> => dbRequest(STORES.USERS, 'readonly', store => store.index('by_email').get(email));
export const dbGetUserById = (id: string): Promise<User | undefined> => dbRequest(STORES.USERS, 'readonly', store => store.get(id));
export const dbAddUser = (user: User): Promise<IDBValidKey> => dbRequest(STORES.USERS, 'readwrite', store => store.add(user));
export const dbPutUser = (user: User): Promise<IDBValidKey> => dbRequest(STORES.USERS, 'readwrite', store => store.put(user));
export const dbDeleteUser = (id: string): Promise<void> => dbRequest(STORES.USERS, 'readwrite', store => store.delete(id));
export const dbGetStudentByAccessCode = async (accessCode: string): Promise<{ student: Student, teacherId: string } | null> => {
    const studentsWithCode = await dbRequestCursor<Student & { teacherId: string }>(STORES.STUDENTS, 'by_accessCode', accessCode.trim().toUpperCase());
    if (studentsWithCode && studentsWithCode.length > 0) {
        const student = studentsWithCode[0];
        return { student, teacherId: student.teacherId };
    }
    return null;
};
export const dbGetPlainTextEmailForUser = async (userId: string): Promise<string | null> => {
    const user = await dbGetUserById(userId);
    // This is a workaround because the User type in the app context holds the plaintext email,
    // but the DB version holds the hashed one. In a real app, you wouldn't store plaintext email.
    // We're retrieving it from a simulated plaintext field.
    return (user as any)?.plaintext_email || null;
}


// WebAuthn Credential Functions
export const dbAddCredential = (cred: WebAuthnCredential) => dbRequest(STORES.WEBAUTHN, 'readwrite', store => store.add(cred));
export const dbGetCredentialsForUser = (userId: string) => dbRequestCursor<WebAuthnCredential>(STORES.WEBAUTHN, 'by_userId', IDBKeyRange.only(userId));
export const dbDeleteCredential = (credId: string) => dbRequest(STORES.WEBAUTHN, 'readwrite', store => store.delete(credId));
export const dbGetCredentialById = (credId: string): Promise<WebAuthnCredential | undefined> => dbRequest(STORES.WEBAUTHN, 'readonly', store => store.get(credId));
export const dbHasAnyCredentials = async (): Promise<boolean> => {
    const count = await dbRequest<number>(STORES.WEBAUTHN, 'readonly', store => store.count());
    return count > 0;
};


// Settings Functions
export const dbGetSetting = async <T>(key: string): Promise<T | undefined> => {
    try {
        const result = await dbRequest<{ key: string, value: T }>(STORES.USER_SETTINGS, 'readonly', store => store.get(key));
        return result?.value;
    } catch (error) {
        // It's fine if the setting doesn't exist yet, we'll use a default.
        return undefined;
    }
};

export const dbSetSetting = (key: string, value: any): Promise<IDBValidKey> => {
    return dbRequest(STORES.USER_SETTINGS, 'readwrite', store => store.put({ key, value }));
};


// Generic Data Functions
const getDataForTeacher = <T>(storeName: string, teacherId: string): Promise<T[]> => dbRequestCursor<T>(storeName, 'by_teacherId', teacherId);

export const dbGetAllDataForTeacher = async (teacherId: string): Promise<AllData> => {
    const [classes, students, lessons, notices, messages, grades] = await Promise.all([
        getDataForTeacher<ClassInfo>(STORES.CLASSES, teacherId),
        getDataForTeacher<Student>(STORES.STUDENTS, teacherId),
        getDataForTeacher<Lesson>(STORES.LESSONS, teacherId),
        getDataForTeacher<Notice>(STORES.NOTICES, teacherId),
        getDataForTeacher<Message>(STORES.MESSAGES, teacherId),
        getDataForTeacher<GradeItem>(STORES.GRADES, teacherId),
    ]);
    return { classes, students, lessons, notices, messages, grades };
};

export const dbPut = (storeName: string, item: any): Promise<IDBValidKey> => {
    if (storeName === STORES.ACTIVITIES) {
        try {
            const channel = new BroadcastChannel('session-updates');
            channel.postMessage({ type: 'NEW_ACTIVITY', activity: item });
            channel.close();
        } catch (e) {
            console.error('BroadcastChannel failed:', e);
        }
    }
    return dbRequest(storeName, 'readwrite', store => store.put(item));
};

export const dbDelete = (storeName: string, key: string): Promise<void> => dbRequest(storeName, 'readwrite', store => store.delete(key));

export const dbGetGradesForTeacher = (teacherId: string): Promise<GradeItem[]> => getDataForTeacher(STORES.GRADES, teacherId);

export const dbGetSessionsForTeacher = (teacherId: string): Promise<SessionRecord[]> => getDataForTeacher<SessionRecord>(STORES.SESSIONS, teacherId);
export const dbGetActivitiesForSession = (sessionId: string): Promise<ActivityRecord[]> => dbRequestCursor(STORES.ACTIVITIES, 'by_sessionId', IDBKeyRange.only(sessionId));
export const dbGetSessionById = (sessionId: string): Promise<SessionRecord | undefined> => dbRequest(STORES.SESSIONS, 'readonly', store => store.get(sessionId));
export const dbGetStudentById = (studentId: string): Promise<Student | undefined> => dbRequest(STORES.STUDENTS, 'readonly', store => store.get(studentId));

export const dbDeleteAllDataForTeacher = async (teacherId: string) => {
    // First, collect all IDs that need to be deleted.
    const sessionsToDelete = await dbRequestCursor<SessionRecord>(STORES.SESSIONS, 'by_teacherId', teacherId);
    const sessionIdsToDelete = sessionsToDelete.map(s => s.sessionId);

    let activityIdsToDelete: string[] = [];
    for (const sessionId of sessionIdsToDelete) {
        const activities = await dbRequestCursor<ActivityRecord>(STORES.ACTIVITIES, 'by_sessionId', sessionId);
        activityIdsToDelete.push(...activities.map(a => a.id));
    }

    // Now, perform all deletions in a single 'readwrite' transaction.
    const db = await getDb();
    const allStores = [
        STORES.CLASSES, STORES.STUDENTS, STORES.LESSONS, STORES.NOTICES,
        STORES.MESSAGES, STORES.GRADES, STORES.SESSIONS, STORES.ACTIVITIES, STORES.USERS, STORES.WEBAUTHN
    ];
    const tx = db.transaction(allStores, 'readwrite');

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        // Delete WebAuthn credentials
        const webauthnStore = tx.objectStore(STORES.WEBAUTHN);
        const webauthnIndex = webauthnStore.index('by_userId');
        const webauthnReq = webauthnIndex.openKeyCursor(IDBKeyRange.only(teacherId));
        webauthnReq.onsuccess = () => {
            const cursor = webauthnReq.result;
            if (cursor) {
                webauthnStore.delete(cursor.primaryKey);
                cursor.continue();
            }
        };
        
        // Delete activities
        const activitiesStore = tx.objectStore(STORES.ACTIVITIES);
        for (const id of activityIdsToDelete) {
            activitiesStore.delete(id);
        }

        // Delete sessions
        const sessionsStore = tx.objectStore(STORES.SESSIONS);
        for (const id of sessionIdsToDelete) {
            sessionsStore.delete(id);
        }

        // Delete other teacher-specific data
        const mainStoresToClear = [STORES.CLASSES, STORES.STUDENTS, STORES.LESSONS, STORES.NOTICES, STORES.MESSAGES, STORES.GRADES];
        for (const storeName of mainStoresToClear) {
            const store = tx.objectStore(storeName);
            const index = store.index('by_teacherId');
            const req = index.openKeyCursor(IDBKeyRange.only(teacherId));
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
        }

        // Finally, delete the user
        tx.objectStore(STORES.USERS).delete(teacherId);
    });
};

export const dbDeleteSessionsAndActivities = (sessionIds: string[]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (sessionIds.length === 0) {
            return resolve();
        }

        const db = await getDb();
        const tx = db.transaction([STORES.SESSIONS, STORES.ACTIVITIES], 'readwrite');
        const sessionsStore = tx.objectStore(STORES.SESSIONS);
        const activitiesStore = tx.objectStore(STORES.ACTIVITIES);
        const activitiesIndex = activitiesStore.index('by_sessionId');

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        for (const sessionId of sessionIds) {
            sessionsStore.delete(sessionId);
            const request = activitiesIndex.openKeyCursor(IDBKeyRange.only(sessionId));
            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    activitiesStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
        }
    });
};