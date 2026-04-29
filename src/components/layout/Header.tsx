import React, { useState } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  Building2, 
  ChevronDown, 
  User as UserIcon, 
  Mail, 
  LogOut,
  LayoutDashboard,
  Users as UsersIcon,
  Stethoscope as StethoscopeIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Header({ isSidebarCollapsed, setIsSidebarCollapsed }: HeaderProps) {
  const { user, setUser, displayNameInfo, viewMode, setViewMode } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isViewSelectorOpen, setIsViewSelectorOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.perfil.toUpperCase() === 'SUPERADMIN' || user.perfil.toUpperCase() === 'ADMINISTRADOR';

  const viewOptions = [
    { id: 'ADMINISTRADOR', label: 'Dashboard Admin', icon: LayoutDashboard, color: 'text-primary' },
    { id: 'RECEPCIONISTA', label: 'Vista Recepción', icon: UsersIcon, color: 'text-emerald-500' },
    { id: 'TERAPEUTA', label: 'Vista Terapeuta', icon: StethoscopeIcon, color: 'text-amber-500' },
  ];

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="clini-header sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md"
        >
          {isSidebarCollapsed ? <Menu size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />}
        </button>
        
        <div className="clini-header-sede-badge flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <Building2 size={16} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {displayNameInfo.sede || 'Cargando...'}
          </span>
        </div>

        {isAdmin && (
          <div className="relative ml-2">
            <button 
              onClick={() => setIsViewSelectorOpen(!isViewSelectorOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all"
            >
              <LayoutDashboard size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Modo: {viewOptions.find(o => o.id === viewMode)?.label?.split(' ')?.at(1) || viewMode}
              </span>
              <ChevronDown size={12} className={cn("transition-transform", isViewSelectorOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isViewSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsViewSelectorOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50"
                  >
                    <p className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Ver Dashboard como:</p>
                    {viewOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setViewMode(opt.id);
                          setIsViewSelectorOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          viewMode === opt.id ? "bg-primary text-white" : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <opt.icon size={16} className={viewMode === opt.id ? "text-white" : opt.color} />
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div 
        className="relative"
        onMouseLeave={() => setIsUserMenuOpen(false)}
      >
        <button 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-3 p-1.5 pr-4 rounded-[var(--sys-radius-2xl)] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            {user.nombres.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none gap-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{user.nombres}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{displayNameInfo.perfil}</span>
          </div>
          <ChevronDown size={14} className={cn("text-slate-300 transition-transform duration-300", isUserMenuOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 z-50 overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary relative">
                  <UserIcon size={32} />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white" />
                </div>
                <div>
                  <h3 className="clini-title-main text-lg leading-tight">{user.nombres} {user.apellidoPaterno}</h3> 
                  <span className="inline-block mt-1 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                    {displayNameInfo.perfil}
                  </span>
                </div>
                
                <div className="w-full space-y-2 pt-2">
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50/50 text-slate-600 border border-slate-100">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-bold truncate">{user.correo}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50/50 text-slate-600 border border-slate-100">
                    <UserIcon size={16} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">(@{user.nombreUsuario})</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/[0.03] text-primary border border-primary/20">
                    <Building2 size={16} className="text-primary/40 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{displayNameInfo.sede}</span>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 font-black text-xs uppercase tracking-widest transition-all group"
                  >
                    <LogOut size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
