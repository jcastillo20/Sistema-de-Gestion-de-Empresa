/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Terapeutas from './pages/Terapeutas';
import Horarios from './pages/Horarios';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import CatalogoPaquetes from './pages/paquetes/CatalogoPaquetes';
import ControlPaquetes from './pages/paquetes/ControlPaquetes';
import Finanzas from './pages/Finanzas';
import Agenda from './pages/Agenda';
import AuditoriaPage from './pages/Auditoria';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { useAuth } from './context/AuthContext';
import { apiService } from './services/apiService';

// New Pages
import GestionHorarios from './pages/terapeutas/GestionHorarios';
import PlanificarHorario from './pages/horarios/PlanificarHorario';
import DetallePaquetes from './pages/pacientes/DetallePaquetes';
import NuevaVenta from './pages/ventas/NuevaVenta';

export default function App() {
  const { user, setUser, isLoading, availableModules } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [clinicName, setClinicName] = useState('CliniGest Pro');
  const [clinicLogo, setClinicLogo] = useState('');

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const syncThemeConfig = async () => {
    try {
      const configs = await apiService.getConfiguracion();
      
      const name = configs.find(c => c.clave === 'CLINICA_NOMBRE')?.valor;
      if (name) setClinicName(name);

      const logo = configs.find(c => c.clave === 'CLINICA_LOGO')?.valor;
      if (logo) setClinicLogo(logo);

      // Aplicar colores dinámicos al entorno global
      const primary = configs.find(c => c.clave === 'COLOR_PRIMARIO')?.valor;
      if (primary) {
        document.documentElement.style.setProperty('--primary-color', primary);
        const primaryRgb = hexToRgb(primary);
        if (primaryRgb) document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
      }
      const secondary = configs.find(c => c.clave === 'COLOR_SECUNDARIO')?.valor;
      if (secondary) {
        document.documentElement.style.setProperty('--secondary-color', secondary);
        const secondaryRgb = hexToRgb(secondary);
        if (secondaryRgb) document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);
      }
      const accent = configs.find(c => c.clave === 'COLOR_ACCENT')?.valor;
      if (accent) {
        document.documentElement.style.setProperty('--accent-color', accent);
        const accentRgb = hexToRgb(accent);
        if (accentRgb) document.documentElement.style.setProperty('--accent-rgb', accentRgb);
      }
    } catch (error) {
      console.error("Error syncing theme config:", error);
    }
  };

  useEffect(() => {
    syncThemeConfig();
    window.addEventListener('configUpdated', syncThemeConfig);
    return () => window.removeEventListener('configUpdated', syncThemeConfig);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Entorno...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-primary/10 selection:text-primary">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        clinicName={clinicName}
        clinicLogo={clinicLogo}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={setIsSidebarCollapsed} 
        />

        <main className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-7 lg:px-8 lg:py-8 bg-slate-50/20 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes currentUser={user} />} />
            <Route path="/pacientes/:id/paquetes" element={<DetallePaquetes />} />
            <Route path="/terapeutas" element={<Terapeutas currentUser={user} />} />
            <Route path="/terapeutas/:id/horarios" element={<GestionHorarios />} />
            <Route path="/horarios" element={<Horarios currentUser={user} />} />
            <Route path="/horarios/nuevo" element={<PlanificarHorario />} />
            <Route path="/paquetes_catalogo" element={<CatalogoPaquetes currentUser={user} />} />
            <Route path="/paquetes_control" element={<ControlPaquetes currentUser={user} />} />
            <Route path="/ventas/nueva" element={<NuevaVenta />} />
            <Route path="/ventas/editar/:id" element={<NuevaVenta />} />
            <Route path="/agenda" element={<Agenda currentUser={user} />} />
            <Route path="/finanzas" element={<Finanzas currentUser={user} />} />
            <Route path="/usuarios" element={<Usuarios currentUser={user} />} />
            <Route path="/configuracion" element={<Configuracion currentUser={user} />} />
            <Route path="/auditoria" element={<AuditoriaPage currentUser={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

