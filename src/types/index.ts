export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SEDE_ADMIN' | 'RECEPTIONIST' | 'THERAPIST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  sedeId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  sedeId: string;
  createdAt: string;
}

export interface Therapist {
  id: string;
  userId: string; // Link to User account
  specialties: string[];
  sedeIds: string[];
  isActive: boolean;
}

export interface Sede {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN';
  tableName: string;
  recordId?: string;
  timestamp: string;
  details?: string;
}
