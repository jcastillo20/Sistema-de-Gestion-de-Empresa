import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ReceptionDashboard from './dashboards/ReceptionDashboard';
import TherapistDashboard from './dashboards/TherapistDashboard';
import { ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { user, displayNameInfo, viewMode } = useAuth();

  if (!user) return null;

  // Determinar qué dashboard cargar basado en el viewMode (que por defecto es el perfil)
  const renderDashboard = () => {
    const activeView = viewMode.toUpperCase();

    if (activeView === 'SUPERADMIN' || activeView === 'ADMINISTRADOR') {
      return <AdminDashboard currentUser={user} />;
    }

    if (activeView === 'RECEPCIONISTA') {
      return <ReceptionDashboard currentUser={user} />;
    }

    if (activeView === 'TERAPEUTA') {
      return <TherapistDashboard currentUser={user} />;
    }

    // Default Fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-[var(--sys-radius-3xl)] border border-slate-100">
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-500 font-medium max-w-md mt-2">
          Tu perfil ({displayNameInfo.perfil}) no tiene un panel de control asignado. Contacta con el administrador del sistema.
        </p>
      </div>
    );
  };

  return (
    <div className="clini-animate-fade pb-10">
      <div className="clini-page-header mb-8">
        <div>
          <h2 className="clini-title-main font-black">
            Hola, {user.nombres?.split(' ')[0] || 'Usuario'} 👋
          </h2>
          <p className="clini-subtitle">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {displayNameInfo.sede}
          </p>
        </div>
      </div>
      
      {renderDashboard()}
    </div>
  );
}
