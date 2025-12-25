import { Teacher, Class, AttendanceSession, AttendanceRecord } from '@/types';

// Teachers
export const getTeachers = (): Teacher[] => {
  const data = localStorage.getItem('teachers');
  return data ? JSON.parse(data) : [];
};

export const saveTeacher = (teacher: Teacher): void => {
  const teachers = getTeachers();
  teachers.push(teacher);
  localStorage.setItem('teachers', JSON.stringify(teachers));
};

export const findTeacherByEmail = (email: string): Teacher | undefined => {
  const teachers = getTeachers();
  return teachers.find(t => t.email === email);
};

// Auth
export const getCurrentTeacher = (): Teacher | null => {
  const data = localStorage.getItem('currentTeacher');
  return data ? JSON.parse(data) : null;
};

export const setCurrentTeacher = (teacher: Teacher | null): void => {
  if (teacher) {
    localStorage.setItem('currentTeacher', JSON.stringify(teacher));
  } else {
    localStorage.removeItem('currentTeacher');
  }
};

// Classes
export const getClasses = (teacherId?: string): Class[] => {
  const data = localStorage.getItem('classes');
  const classes: Class[] = data ? JSON.parse(data) : [];
  return teacherId ? classes.filter(c => c.teacherId === teacherId) : classes;
};

export const saveClass = (classData: Class): void => {
  const classes = getClasses();
  classes.push(classData);
  localStorage.setItem('classes', JSON.stringify(classes));
};

export const getClassById = (id: string): Class | undefined => {
  const classes = getClasses();
  return classes.find(c => c.id === id);
};

export const updateClass = (id: string, updates: Partial<Class>): void => {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    classes[index] = { ...classes[index], ...updates };
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};

export const deleteClass = (id: string): void => {
  const classes = getClasses();
  const filtered = classes.filter(c => c.id !== id);
  localStorage.setItem('classes', JSON.stringify(filtered));
};

// Attendance Sessions
export const getSessions = (classId?: string): AttendanceSession[] => {
  const data = localStorage.getItem('sessions');
  const sessions: AttendanceSession[] = data ? JSON.parse(data) : [];
  return classId ? sessions.filter(s => s.classId === classId) : sessions;
};

export const saveSession = (session: AttendanceSession): void => {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

export const getSessionById = (id: string): AttendanceSession | undefined => {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
};

export const getSessionByCode = (code: string): AttendanceSession | undefined => {
  const sessions = getSessions();
  return sessions.find(s => s.sessionCode === code);
};

export const updateSession = (id: string, updates: Partial<AttendanceSession>): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }
};

// Attendance Records
export const getRecords = (sessionId?: string): AttendanceRecord[] => {
  const data = localStorage.getItem('records');
  const records: AttendanceRecord[] = data ? JSON.parse(data) : [];
  return sessionId ? records.filter(r => r.sessionId === sessionId) : records;
};

export const saveRecord = (record: AttendanceRecord): void => {
  const records = getRecords();
  // Check duplicate
  const exists = records.find(r => r.sessionId === record.sessionId && r.studentId === record.studentId);
  if (exists) {
    throw new Error('Sinh viên đã điểm danh rồi!');
  }
  records.push(record);
  localStorage.setItem('records', JSON.stringify(records));
};

export const getRecordsBySessionId = (sessionId: string): AttendanceRecord[] => {
  return getRecords(sessionId);
};