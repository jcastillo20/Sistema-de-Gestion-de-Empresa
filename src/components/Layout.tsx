import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserRound, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { APP_CONFIG, NAVIGATION } from '../constants';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
  appConfig?: any;
}

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Calendar,
  Users,
  UserRound,
  ShieldCheck,
  Package,
  CreditCard,
  Settings,
};

export default function Layout({ user, onLogout, children, appConfig = {} }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logoUrl = appConfig.LOGO_BASE64 || '';
  const clinicName = appConfig.NOMBRE_CLINICA || 'CliniGest Pro';

  // Handle auto-close on mobile when navigating
  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = NAVIGATION.filter(item => {
    // Dashboard is always visible
    if (item.id === 'dashboard') return true;
    
    // Super Admin has access to everything
    if (user.perfil === 'SUPER_ADMIN') return true;
    
    const userPerms = user.permisos || {};
    const modulePerms = userPerms[item.id] || userPerms['all'];
    
    // Only show if explicitly allowed
    return modulePerms?.acceso === true;
  }).map(item => ({
    ...item,
    icon: ICON_MAP[item.icon || 'LayoutDashboard'] || LayoutDashboard,
  }));

  const activeTab = menuItems.find(item => item.path === location.pathname)?.id || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={18} />
                )}
              </div>
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-slate-900 text-lg truncate"
                  >
                    {clinicName}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sede Indicator (Mobile/Collapsed) */}
          {!isSidebarOpen && (
            <div className="px-6 py-4 border-b border-slate-50 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500" title={user.sede} />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0 transition-colors",
                  activeTab === item.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {activeTab === item.id && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
              )}
            >
              <LogOut size={20} className="shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm truncate">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out min-w-0",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 hidden md:flex">
              <Building2 size={14} className="text-primary" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {user.perfil === 'SUPER_ADMIN' || user.perfil === 'ADMINISTRADOR' ? 'Todas las Sedes' : user.sede}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 sm:mx-2"></div>
            
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 sm:gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[120px]">{user.nombres}</p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[120px] uppercase font-bold tracking-wider">{user.perfil}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm shrink-0">
                  {user.nombres.charAt(0)}
                </div>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                            {user.nombres.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{user.nombres} {user.apellidoPaterno}</p>
                            <p className="text-xs text-slate-500 truncate">{user.correo}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <div className="px-3 py-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Información de Perfil</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Rol:</span>
                              <span className="font-bold text-primary">{user.perfil}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Sede:</span>
                              <span className="font-bold text-slate-700">{user.sede}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Usuario:</span>
                              <span className="font-bold text-slate-700">@{user.nombreUsuario}</span>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-slate-50 my-2" />
                        
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
                        >
                          <LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
