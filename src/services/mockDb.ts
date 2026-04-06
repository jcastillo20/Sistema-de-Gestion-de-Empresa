import { User, Patient, Therapist, Sede, AuditLog } from '../types';

interface DatabaseSchema {
  users: User[];
  patients: Patient[];
  therapists: Therapist[];
  sedes: Sede[];
  auditLogs: AuditLog[];
}

const defaultData: DatabaseSchema = {
  users: [
    {
      id: '1',
      name: 'Super Admin',
      email: 'admin@clinigest.pro',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  ],
  patients: [],
  therapists: [],
  sedes: [
    { id: '1', name: 'Sede Central', address: 'Av. Principal 123', isActive: true }
  ],
  auditLogs: []
};

export const initDb = () => {
  const db = localStorage.getItem('clinigest_db');
  if (!db) {
    localStorage.setItem('clinigest_db', JSON.stringify(defaultData));
  }
};

export const getDb = (): DatabaseSchema => {
  initDb();
  return JSON.parse(localStorage.getItem('clinigest_db') || '{}');
};

export const saveDb = (data: DatabaseSchema) => {
  localStorage.setItem('clinigest_db', JSON.stringify(data));
};
