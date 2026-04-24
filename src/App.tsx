/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Terapeutas from './pages/Terapeutas';
import Horarios from './pages/Horarios';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import { 
  LayoutGrid, 
  Users, 
  Stethoscope, 
  Calendar, 
  UserCog, 
  Settings, 
  LogOut,
  Building2,
  Menu,
  ChevronLeft,
  Mail,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';
import { apiService } from './services/apiService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [clinicName, setClinicName] = useState('CliniGest Pro');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [displayNameInfo, setDisplayNameInfo] = useState({ sede: '', perfil: '' });
  const [clinicLogo, setClinicLogo] = useState('');

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  useEffect(() => {
    const loadConfig = async () => {
      const [configs, sedes] = await Promise.all([
        apiService.getConfiguracion(),
        apiService.getSedes()
      ]);
      
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

      if (user) {
        // Lógica unificada para determinar si el usuario es global
        const isGlobalUser = user.sede?.toUpperCase() === 'ALL' || 
                           user.perfil?.toUpperCase() === 'SUPERADMIN' ||
                           user.perfil?.toUpperCase() === 'ADMINISTRADOR' || 
                           user.permisos?.dashboard?.verTodo === true;

        const sedeName = isGlobalUser 
          ? 'Todas las Sedes' 
          : sedes.find(s => s.idSede === user.sede || s.nombreSede === user.sede)?.nombreSede || user.sede;
        
        const perfilName = configs.find(c => c.valor === user.perfil || c.id === user.perfil)?.etiqueta?.replace('Perfil: ', '') || user.perfil;
        setDisplayNameInfo({ sede: sedeName, perfil: perfilName });
      }
    };

    loadConfig(); // Cargar la configuración inicial al montar el componente

    // Escuchar el evento 'configUpdated' para recargar la configuración
    window.addEventListener('configUpdated', loadConfig);

    return () => {
      window.removeEventListener('configUpdated', loadConfig);
    };
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'terapeutas', label: 'Terapeutas', icon: Stethoscope },
    { id: 'horarios', label: 'Horarios', icon: Calendar },
    { id: 'usuarios', label: 'Usuarios', icon: UserCog },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Lateral */}
      <aside className={cn("clini-sidebar", isSidebarCollapsed ? "clini-sidebar-collapsed" : "clini-sidebar-expanded")}>
        <div className="clini-sidebar-logo-container">
          <div className="clini-sidebar-logo-icon-wrapper">
            {clinicLogo ? (
              <img src={clinicLogo} alt="Logo" className="clini-sidebar-logo-image" />
            ) : (
              <Building2 size={24} />
            )}
          </div>
          {!isSidebarCollapsed && (
            <h1 className="clini-sidebar-logo-text">{clinicName}</h1>
          )}
        </div>

        <nav className="clini-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = user.permisos?.[item.id]?.acceso !== false;
            if (!hasAccess) return null;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn( // Added 'group' class to clini-sidebar-item
                  "clini-sidebar-item group",
                  activePage === item.id 
                    ? "clini-sidebar-item-active" 
                    : "clini-sidebar-item-inactive",
                  isSidebarCollapsed && "clini-sidebar-item-collapsed"
                )}
                title={isSidebarCollapsed ? item.label : ""}
              >
                <Icon size={20} className={cn("shrink-0", activePage === item.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                {!isSidebarCollapsed && (
                  <span className="truncate animate-in fade-in duration-300">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="clini-sidebar-footer">
          <button 
            onClick={handleLogout}
            className={cn("clini-sidebar-logout", isSidebarCollapsed && "clini-sidebar-item-collapsed")}
            title="Cerrar Sesión"
          >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <header className="clini-header">
          <div className="clini-header-left">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
            
            <div className="clini-header-sede-badge">
              <Building2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {displayNameInfo.sede || 'Cargando...'}
              </span>
            </div>
          </div>

          <div 
            className="relative"
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="clini-header-user-btn"
            >
              <div className="clini-user-avatar-header">
                {user.nombres.charAt(0)}
              </div>
              <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isUserMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 z-50 overflow-hidden"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <p className="clini-title-main text-lg">{user.nombres} {user.apellidoPaterno}</p> 
                      <span className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {displayNameInfo.perfil}
                      </span>
                    </div>
                    
                    <div className="w-full space-y-3 pt-2">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-600">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <span className="text-xs truncate">{user.correo}</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-600">
                        <UserIcon size={16} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-medium italic">(@{user.nombreUsuario})</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                        <Building2 size={16} className="text-primary/40 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">{displayNameInfo.sede}</span>
                      </div>
                    </div>

                    <div className="w-full pt-4 border-t border-slate-50">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 font-bold text-sm transition-all group"
                      >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-7 lg:px-8 lg:py-8 bg-slate-50/20 relative transition-all duration-300">
          {activePage === 'dashboard' && <Dashboard currentUser={user} />}
          {activePage === 'pacientes' && <Pacientes currentUser={user} />}
          {activePage === 'terapeutas' && <Terapeutas currentUser={user} />}
          {activePage === 'horarios' && <Horarios currentUser={user} />}
          {activePage === 'usuarios' && <Usuarios currentUser={user} />}
          {activePage === 'configuracion' && <Configuracion currentUser={user} />}
        </main>
      </div>
    </div>
  );
}
