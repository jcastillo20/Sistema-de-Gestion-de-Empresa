/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APP_CONFIG = {
  NAME: 'CliniGest',
  FULL_NAME: 'CliniGest - Sistema de Gestión Clínica',
  DESCRIPTION: 'Sistema integral de gestión clínica para terapeutas, pacientes, citas y finanzas.',
  VERSION: '3.0.0',
  COMPANY: 'CliniGest Integral',
  RUC: '20123456789',
  EMAIL: 'contacto@clinigest.com',
  PHONE: '+51 987 654 321',
};

export const THEME = {
  COLORS: {
    PRIMARY: '#4f46e5', // indigo-600
    SECONDARY: '#64748b', // slate-500
    SUCCESS: '#10b981', // emerald-500
    WARNING: '#f59e0b', // amber-500
    DANGER: '#ef4444', // red-500
    INFO: '#3b82f6', // blue-500
    BACKGROUND: '#f8fafc', // slate-50
    SURFACE: '#ffffff', // white
  },
  RADIUS: '1rem',
};

export const API_CONFIG = {
  BASE_URL: process.env.APP_URL || 'http://localhost:3000/api',
  USE_MOCK: true,
  TIMEOUT: 10000,
};

// Perfiles que pueden ver la columna SEDE en todas las tablas y cambiarla en formularios
export const PROFILES_WITH_SEDE_ACCESS = ['SUPERADMIN', 'ADMINISTRADOR', 'GERENTE'];

export const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: 'agenda', label: 'Agenda', path: '/agenda', icon: 'Calendar' },
  { id: 'pacientes', label: 'Pacientes', path: '/pacientes', icon: 'Users' },
  { id: 'terapeutas', label: 'Terapeutas', path: '/terapeutas', icon: 'UserRound' },
  { id: 'horarios', label: 'Horarios', path: '/horarios', icon: 'Calendar' },
  { id: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: 'ShieldCheck' },
  { id: 'paquetes', label: 'Paquetes', path: '/paquetes', icon: 'Package' },
  { id: 'finanzas', label: 'Finanzas', path: '/finanzas', icon: 'CreditCard' },
  { id: 'configuracion', label: 'Configuración', path: '/configuracion', icon: 'Settings' },
];

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-]{7,15}$/,
  DNI: /^\d{8}$/,
  TEXT_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
};

export const DOCUMENT_TYPES = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carnet de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export const APPOINTMENT_STATUS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 text-blue-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700' },
  COMPLETADA: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700' },
  REPROGRAMADA: { label: 'Reprogramada', color: 'bg-indigo-100 text-indigo-700' },
};

export const PAYMENT_STATUS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  PAGADO: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  PARCIAL: { label: 'Parcial', color: 'bg-blue-100 text-blue-700' },
  ANULADO: { label: 'Anulado', color: 'bg-slate-100 text-slate-600' },
};
