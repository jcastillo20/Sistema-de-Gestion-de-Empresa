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
import { cn } from './lib/utils';
import { apiService } from './services/apiService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [clinicName, setClinicName] = useState('CliniGest Pro');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await apiService.getConfiguracion();
      const name = config.find(c => c.clave === 'CLINICA_NOMBRE')?.valor;
      if (name) setClinicName(name);
    };
    loadConfig();
  }, []);

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
      <aside className={cn(
        "bg-white border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-6 border-b border-slate-50 flex items-center gap-3 h-16 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            <Building2 size={24} />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="font-bold text-slate-900 truncate animate-in fade-in duration-300">{clinicName}</h1>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = user.permisos?.[item.id]?.acceso !== false;
            if (!hasAccess) return null;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  activePage === item.id 
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isSidebarCollapsed && "justify-center px-0"
                )}
                title={isSidebarCollapsed ? item.label : ""}
              >
                <Icon size={20} className={cn("shrink-0", activePage === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                {!isSidebarCollapsed && (
                  <span className="truncate animate-in fade-in duration-300">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all",
              isSidebarCollapsed && "justify-center px-0"
            )}
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
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-700 rounded-2xl border border-indigo-100">
              <Building2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {user.permisos?.dashboard?.verTodo ? 'Todas las Sedes' : user.sede}
              </span>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-100">
                {user.nombres.charAt(0)}
              </div>
              <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isUserMenuOpen && "rotate-180")} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UserIcon size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{user.nombres} {user.apellidoPaterno}</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
                      {user.perfil}
                    </span>
                  </div>
                  
                  <div className="w-full space-y-3 pt-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-600">
                      <Mail size={16} className="text-slate-400 shrink-0" />
                      <span className="text-xs truncate">{user.correo}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-600">
                      <UserIcon size={16} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-medium italic">({user.nombreUsuario})</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50/50 text-indigo-700">
                      <Building2 size={16} className="text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">{user.sede}</span>
                    </div>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 font-bold text-sm transition-all"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
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
