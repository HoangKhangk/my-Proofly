export interface Teacher {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface Geofence {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface Class {
  id: string;
  teacherId: string;
  className: string;
  classCode: string;
  description: string;
  location?: Location;
  geofence?: Geofence;
  createdAt: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  studentId: string;
  email: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  teacherId: string;
  sessionCode: string;
  sessionName: string;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  students?: StudentInfo[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  attendedAt: string;
  location?: Location;
  distanceFromClass?: number;
  isWithinGeofence?: boolean;
  geofenceStatus?: 'inside' | 'outside' | 'warning';
}