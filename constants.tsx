

import React from 'react';

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  firstName: string;
  lastName:string;
  email: string;
  password?: string;
  dateOfBirth: string; // YYYY-MM-DD
  avatarUrl: string;
  phone: string;
  address: string;
  isDevMode?: boolean;
}

export interface Parent {
  name: string;
  contact: string;
}

export interface Student {
  id:string;
  name: string;
  age: number;
  classId: string;
  className: string;
  avatarUrl: string;
  subject: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  parents: Parent[];
  accessCode?: string;
}

export interface GradeItem {
  id: string;
  studentId: string;
  type: 'Compito' | 'Esame';
  subject: string;
  date: string;
  grade: number;
}

export type LessonType = 'Lezione' | 'Laboratorio' | 'Verifica' | 'Recupero';

export interface Lesson {
  id: string;
  subject: string;
  time: string;
  className: string;
  type: LessonType;
}

export type NoticeType = 'Generale' | 'Importante' | 'Urgente' | 'Evento';

export interface Attachment {
  name: string;
  url: string; // data URL
  type: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: NoticeType;
  attachments?: Attachment[];
}

export interface Message {
    id: string;
    className: string;
    lastMessageTime: string;
    avatarUrl: string;
    classId: string;
}

export interface ClassInfo {
  id: string;
  name: string;
}

export interface SessionRecord {
  sessionId: string;
  studentId: string;
  teacherId: string;
  loginTimestamp: number;
  logoutTimestamp?: number;
}

export type ActivityType = 'LOGIN' | 'LOGOUT' | 'AVATAR_UPDATE' | 'VIEW_RESULTS' | 'VIEW_INFO';

export interface ActivityRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: number;
  type: ActivityType;
  payload?: {
    oldValue?: string; // e.g., old avatar URL
    newValue?: string; // e.g., new avatar URL
  };
}


// --- SVG ICONS ---

export const ICONS = {
  home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  group_outline: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  group_filled: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  bell_outline: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  bell_filled: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  back: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  book: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-11A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  language: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  theme: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  help: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  feedback: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="m12 8-1.5 3-3 .5 2.5 2-1 3.5 3-2 3 2-1-3.5 2.5-2-3-.5Z"/></svg>,
  info: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  eye: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  eye_off: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  lock: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  phone: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  map_pin: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  shield: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  user_profile: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  user_profile_filled: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  kebab_menu: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  folder: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  file_text: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  email: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  medal: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6l4 6-8 4-4-6 8-4z"></path><path d="M12 6v12"></path><path d="M18 12b6 6 0 0 1-12 0"></path></svg>,
  calendar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  clipboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
  key: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>,
  activity: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  camera: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  warning: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  paperclip: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
  lab_beaker: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>,
  image: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  download: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  grid: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  list: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  fingerprint: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12h.01"/><path d="M6 12h.01"/><path d="M18 12h.01"/><path d="M10 17a5.3 5.3 0 0 1 4 0"/><path d="M8.5 20.5a8.9 8.9 0 0 1 7 0"/><path d="M5 16.24a12.51 12.51 0 0 1 14 0"/><path d="M2 12.5a16.5 16.5 0 0 1 20 0"/></svg>,
  rocket: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.18-.65-.87-2.07-1.33-3.18-.05z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.87 12.87 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 4 1 4 1"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62-1-4-1-4"></path></svg>,
  chevron_left: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>,
  chevron_right: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>,
  play: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"></path></svg>,
  pause: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>,
  zoom_out: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>,
  zoom_in: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>,
  rotate_cw: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  magic_wand: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 10v-2"/><path d="M12.3 7.7 14 6"/><path d="M7 14H5"/><path d="M19 14h-2"/><path d="M16.7 16.3 18 15"/><path d="m12 22 3-3 3-3-6-6-3 3-3 3 6 6Z"/><path d="m22 12-3-3-3-3-6 6 3 3 3 3 6-6Z"/></svg>,
  classes_custom: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 5120 5120" fill="currentColor" stroke="none" preserveAspectRatio="xMidYMid meet"><g transform="translate(0, 5120) scale(1, -1)"><path d="M1130 5107 c-134 -38 -220 -146 -228 -287 -9 -166 91 -295 257 -331 116 -25 249 32 318 134 40 60 53 104 53 187 0 118 -76 233 -186 281 -56 25 -156 33 -214 16z"/><path d="M2162 4937 c-58 -33 -57 -22 -60 -509 -1 -247 0 -448 3 -448 3 0 32 16 63 37 31 20 81 47 110 59 l52 24 0 315 0 315 1115 0 1115 0 0 -800 0 -800 -1115 0 -1115 0 0 125 c0 78 -4 125 -10 125 -6 0 -58 -30 -116 -66 l-106 -67 4 -131 c3 -142 13 -171 64 -194 18 -9 354 -12 1285 -12 l1261 0 34 34 34 34 0 952 0 952 -34 34 -34 34 -1263 0 c-994 -1 -1269 -3 -1287 -13z"/><path d="M724 4370 c-92 -19 -191 -93 -240 -180 -46 -80 -47 -98 -48 -744 -1 -606 -1 -615 20 -642 38 -51 71 -69 129 -69 58 0 91 18 129 69 21 27 21 41 26 629 3 331 7 603 8 605 8 9 51 -1 56 -14 3 -9 6 -375 6 -815 l0 -799 43 0 c87 0 203 -42 278 -101 20 -16 40 -29 43 -29 3 0 6 140 6 310 l0 310 40 0 40 0 0 -360 c0 -360 0 -361 24 -408 74 -145 75 -326 5 -465 -11 -20 -16 -37 -12 -37 5 0 36 -5 70 -10 60 -10 64 -9 101 17 35 26 111 63 155 77 16 5 17 69 17 1159 0 1152 1 1177 31 1177 4 0 15 -7 23 -16 14 -13 16 -56 16 -316 0 -287 1 -302 21 -338 26 -46 84 -80 136 -80 43 0 50 4 418 233 254 158 275 177 275 257 0 87 -69 153 -157 152 -39 -1 -67 -15 -213 -105 l-167 -104 -9 191 c-9 170 -12 197 -34 241 -36 75 -110 148 -183 181 -56 25 -73 28 -182 28 l-119 1 -90 -227 c-49 -126 -91 -226 -93 -224 -2 1 6 43 18 91 l20 88 -36 70 -37 69 31 57 c23 44 28 60 19 69 -16 16 -174 16 -184 1 -3 -6 6 -38 22 -71 l28 -59 -32 -58 c-36 -66 -38 -90 -17 -192 9 -40 14 -73 13 -75 -2 -1 -43 103 -92 232 l-90 234 -95 -1 c-53 -1 -115 -5 -137 -9z"/><path d="M2940 4348 c-20 -14 -113 -86 -208 -162 l-173 -137 29 -24 c16 -13 41 -42 56 -64 l28 -39 184 144 c101 80 193 157 204 171 26 33 25 66 -2 97 -34 38 -75 43 -118 14z"/><path d="M713 2212 c-144 -59 -233 -198 -220 -342 25 -282 359 -411 563 -218 72 68 105 144 105 244 0 63 -5 86 -29 137 -59 125 -158 190 -297 194 -58 2 -92 -2 -122 -15z"/><path d="M2535 2215 c-63 -23 -137 -86 -172 -144 -105 -175 -38 -393 146 -480 47 -22 70 -26 141 -26 71 0 94 4 140 26 256 122 256 487 0 608 -67 31 -191 39 -255 16z"/><path d="M4217 2220 c-259 -66 -348 -380 -159 -568 183 -183 503 -89 562 167 35 149 -46 313 -187 378 -58 27 -158 37 -216 23z"/><path d="M1637 1536 c-76 -32 -123 -69 -158 -124 -115 -182 -52 -411 140 -501 47 -22 70 -26 141 -26 103 0 170 27 239 96 69 69 96 136 96 239 0 102 -28 173 -95 240 -94 94 -246 126 -363 76z"/><path d="M3320 1539 c-56 -16 -141 -80 -177 -133 -138 -202 -33 -471 206 -526 151 -35 312 46 380 190 22 46 26 69 26 145 0 107 -22 163 -95 235 -68 68 -128 94 -225 97 -44 1 -96 -3 -115 -8z"/><path d="M312 1439 c-108 -21 -213 -103 -263 -205 -28 -57 -34 -81 -41 -185 -5 -66 -7 -174 -6 -242 l3 -122 162 -3 163 -2 2 201 c3 176 5 203 20 212 12 8 21 7 32 -2 14 -11 16 -43 16 -212 l0 -199 229 0 229 0 22 34 c54 89 229 204 335 220 22 4 53 9 68 12 l28 6 -20 31 c-57 94 -73 279 -33 394 12 34 22 65 22 68 0 9 -922 3 -968 -6z"/><path d="M2237 1380 c41 -122 30 -279 -28 -392 l-19 -38 32 0 c94 -1 232 -55 325 -128 l50 -40 45 37 c64 52 171 99 260 112 l77 12 -19 36 c-66 131 -68 302 -5 454 7 16 -15 17 -367 17 l-374 0 23 -70z"/><path d="M3890 1437 c0 -8 6 -30 14 -49 45 -107 41 -267 -9 -376 -14 -30 -25 -58 -25 -62 0 -4 21 -10 48 -14 132 -18 255 -85 349 -192 l57 -64 198 0 198 0 0 189 c0 104 3 196 6 205 3 9 14 16 23 16 38 0 41 -18 41 -217 l0 -193 163 2 162 3 -1 212 c-1 128 -7 233 -14 263 -26 108 -125 216 -243 263 -50 21 -71 22 -509 25 -395 3 -458 1 -458 -11z"/><path d="M1300 770 c-108 -16 -187 -56 -254 -130 -82 -91 -93 -138 -100 -413 l-5 -227 165 0 164 0 0 199 c0 164 3 201 15 211 12 10 18 10 30 0 12 -10 15 -47 15 -211 l0 -199 435 0 435 0 0 205 c0 174 2 207 15 211 8 4 22 1 30 -6 12 -10 15 -47 15 -206 l0 -194 166 0 167 0 -5 227 c-6 253 -11 278 -75 371 -44 65 -106 114 -181 144 -56 22 -68 22 -501 26 -478 4 -570 -2 -655 -42 -108 -49 -191 -153 -220 -272 -10 -43 -15 -51 -15 -29 -2 45 -26 118 -56 164 -64 102 -163 165 -285 181 -88 11 -860 11 -940 0z"/></g></svg>,
  students_custom: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 5120 5120" fill="currentColor" stroke="none" preserveAspectRatio="xMidYMid meet"><g transform="translate(0, 5120) scale(1, -1)"><path d="M2405 5106 c-507 -101 -810 -611 -653 -1096 87 -270 295 -471 575 -557 78 -23 104 -26 233 -26 129 0 155 3 233 26 291 89 495 293 584 584 23 78 26 104 26 233 0 129 -3 155 -26 233 -89 291 -296 498 -584 583 -110 32 -282 41 -388 20z"/><path d="M1800 3244 c-124 -60 -275 -157 -355 -228 l-50 -44 25 -10 c383 -146 1130 -422 1142 -422 11 0 913 334 1133 420 l30 12 -49 44 c-74 68 -228 166 -356 228 -63 31 -121 56 -128 56 -7 0 -49 -20 -95 -44 -327 -177 -722 -179 -1062 -6 -54 27 -103 50 -109 50 -6 0 -63 -25 -126 -56z"/><path d="M879 2777 c-62 -41 -69 -69 -69 -274 l0 -183 45 0 c211 0 400 -152 444 -358 14 -69 15 -514 0 -584 -16 -77 -74 -180 -129 -232 -82 -77 -205 -126 -315 -126 l-45 0 0 -170 c0 -183 7 -216 51 -257 14 -12 339 -139 784 -306 l760 -285 3 1131 c1 622 -1 1134 -5 1138 -5 4 -322 124 -706 268 -515 192 -710 261 -741 261 -28 0 -55 -8 -77 -23z"/><path d="M3415 2535 l-700 -263 -3 -1136 -2 -1136 77 29 c778 288 1453 547 1472 564 44 41 51 74 51 257 l0 170 -45 0 c-211 0 -400 152 -444 358 -15 69 -15 514 0 584 19 88 58 158 124 223 88 87 201 135 320 135 l45 0 0 183 c0 205 -7 233 -69 274 -65 44 -71 42 -826 -242z"/><path d="M663 2005 c-102 -31 -176 -96 -222 -195 -22 -46 -26 -69 -26 -140 0 -76 4 -93 33 -152 38 -77 92 -130 171 -166 46 -22 74 -27 162 -30 128 -5 176 13 209 78 18 36 20 58 20 270 0 212 -2 234 -20 270 -31 61 -78 80 -192 79 -51 0 -112 -6 -135 -14z"/><path d="M4188 2000 c-23 -12 -46 -36 -58 -60 -18 -36 -20 -59 -20 -270 0 -212 2 -234 20 -270 33 -65 81 -83 210 -78 95 3 112 6 172 36 77 38 130 92 167 171 22 47 26 70 26 141 0 71 -4 94 -26 141 -37 79 -90 133 -167 171 -61 30 -75 33 -177 36 -95 2 -115 -1 -147 -18z"/></g></svg>,
  profile_custom: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 5120 5120" fill="currentColor" stroke="none" preserveAspectRatio="xMidYMid meet"><g transform="translate(0, 5120) scale(1, -1)"><path d="M2430 5114 c-318 -41 -573 -161 -793 -373 -487 -469 -539 -1230 -121 -1767 401 -516 1135 -662 1699 -337 598 287 755 845 649 1406 -99 519 -517 941 -1037 1048 -99 20 -318 33 -397 23z"/><path d="M1490 2350 c-443 -78 -849 -353 -1102 -746 -53 -83 -118 -224 -118 -257 0 -66 190 -334 370 -521 439 -457 981 -729 1605 -807 130 -17 492 -16 620 0 506 65 956 254 1345 565 121 96 358 341 452 466 105 141 188 275 188 306 0 30 -56 153 -105 229 -171 267 -409 485 -676 618 -195 97 -438 164 -561 155 -42 -3 -70 -13 -110 -38 -144 -91 -190 -116 -270 -151 -199 -87 -402 -125 -618 -116 -276 11 -508 85 -739 237 -50 33 -103 62 -118 66 -16 3 -35 7 -43 9 -8 2 -62 -5 -120 -15z"/></g></svg>,
  communications_custom: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 5120 5120" fill="currentColor" stroke="none" preserveAspectRatio="xMidYMid meet"><g transform="translate(0, 5120) scale(1, -1)"><path d="M3987 4962 c-33 -20 -45 -50 -102 -267 -49 -186 -54 -228 -27 -263 36 -47 135 -42 162 7 22 42 120 441 114 465 -8 35 -59 76 -92 76 -15 0 -39 -8 -55 -18z"/><path d="M2709 4750 c-57 -10 -118 -40 -155 -78 -16 -16 -327 -409 -692 -873 l-663 -845 -397 -229 c-218 -125 -434 -252 -479 -282 -146 -95 -242 -223 -294 -393 -20 -62 -24 -96 -23 -200 0 -109 4 -135 28 -205 101 -297 361 -485 669 -485 72 0 124 9 245 42 7 2 112 -169 267 -437 282 -488 315 -534 423 -587 63 -31 73 -33 172 -33 93 0 112 3 162 27 68 31 147 103 183 163 58 100 69 234 27 341 -11 27 -86 164 -167 304 -81 140 -149 259 -152 266 -2 6 57 46 132 89 74 42 142 87 150 98 29 42 19 87 -50 207 -63 110 -72 130 -59 130 3 0 360 70 793 154 432 85 879 173 994 195 114 23 220 47 235 55 46 24 113 95 134 143 25 57 34 145 19 199 -6 23 -77 156 -157 295 -80 140 -159 277 -175 306 l-30 51 110 165 c60 91 112 179 116 195 7 36 6 38 -122 259 -52 90 -107 172 -121 184 -25 20 -35 21 -127 15 -55 -3 -149 -8 -210 -12 l-110 -6 -185 323 c-102 178 -202 343 -224 366 -66 73 -170 109 -267 93z m109 -218 c27 -20 1191 -2033 1199 -2074 12 -62 -36 -112 -116 -120 l-33 -3 -614 1063 c-473 819 -612 1067 -605 1080 12 22 62 68 81 75 22 8 61 -1 88 -21z m270 -1247 c314 -544 570 -990 569 -992 -5 -4 -1740 -344 -1742 -341 -19 25 -525 914 -523 919 9 26 1112 1419 1118 1412 4 -4 264 -453 578 -998z m704 381 l69 -119 -58 -88 c-32 -49 -62 -88 -66 -86 -4 1 -59 91 -122 200 -130 224 -130 204 5 210 41 2 81 3 89 3 7 -1 45 -54 83 -120z m-2308 -1366 c135 -233 244 -425 243 -426 -6 -6 -770 -445 -803 -462 -291 -148 -650 31 -714 356 -34 170 41 371 176 476 70 53 837 496 846 488 3 -4 117 -198 252 -432z m400 -693 l45 -77 -22 -14 c-127 -78 -149 -88 -158 -75 -25 37 -91 161 -88 163 25 20 166 93 170 88 4 -4 28 -42 53 -85z m-144 -549 c270 -469 284 -501 262 -577 -44 -143 -233 -191 -335 -83 -22 24 -508 855 -521 892 -4 11 43 43 162 112 92 53 169 97 172 97 3 0 120 -198 260 -441z"/><path d="M1267 2069 c-29 -17 -49 -68 -43 -105 12 -60 90 -94 147 -64 53 29 61 121 12 160 -28 22 -86 26 -116 9z"/><path d="M905 1859 c-22 -12 -67 -37 -99 -56 -32 -19 -72 -37 -87 -40 -37 -7 -84 12 -104 44 -21 31 -77 55 -110 47 -62 -15 -94 -101 -58 -154 69 -104 182 -154 305 -136 54 8 252 115 291 157 38 41 37 90 -2 130 -36 36 -79 38 -136 8z"/><path d="M4710 4397 c-336 -187 -327 -181 -339 -224 -18 -65 23 -123 87 -123 53 0 616 310 644 355 40 64 -5 145 -80 145 -29 0 -97 -33 -312 -153z"/><path d="M4435 3586 c-46 -46 -43 -112 6 -148 14 -10 117 -44 229 -74 163 -44 212 -53 239 -47 71 17 100 109 50 159 -21 20 -69 37 -228 80 -230 61 -261 65 -296 30z"/></g></svg>,
};


// --- MOCK DATA ---
// All mock data has been removed to allow the user to input their own data from a clean slate.

export const MOCK_STUDENTS: Student[] = [];

export const MOCK_CLASSES: ClassInfo[] = [];

export const MOCK_LESSONS: Lesson[] = [];

export const MOCK_NOTICES: Notice[] = [];

export const MOCK_MESSAGES: Message[] = [];

export const MOCK_GRADES: GradeItem[] = [];