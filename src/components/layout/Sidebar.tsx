import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Package, 
  Settings, 
  Building2, 
  ClipboardList, 
  ShieldCheck, 
  Stethoscope,
  ChevronRight,
  LogOut,
  BookOpen,
  UserCog
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { ConfiguracionDinamica } from '../../types';

/**
 * MAPA DE ICONOS PARA MÓDULOS
 * Vincula la 'clave' de la configuración con el componente visual de Lucide
 */
const ICON_MAP: Record<string, any> = {
  'MOD_PACIENTES': Users,
  'MOD_TERAPEUTAS': Stethoscope,
  'MOD_HORARIOS': Calendar,
  'MOD_USUARIOS': UserCog,
  'MOD_CONFIG': Settings,
  'MOD_AGENDA': Calendar,
  'MOD_FINANZAS': CreditCard,
  'MOD_PAQUETES_CATALOGO': BookOpen,
  'MOD_PAQUETES_CONTROL': Package,
  'MOD_AUDITORIA': ClipboardList,
};

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  clinicName: string;
  clinicLogo: string;
}

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  isCollapsed, 
  setIsCollapsed,
  clinicName,
  clinicLogo
}: SidebarProps) {
  const { availableModules, setUser } = useAuth();
  const [dynamicModules, setDynamicModules] = useState<ConfiguracionDinamica[]>([]);

  useEffect(() => {
    const loadModules = async () => {
      const config = await apiService.getConfiguracion();
      const modules = config
        .filter(c => c.clave.startsWith('MOD_'))
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setDynamicModules(modules);
    };
    loadModules();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  // Obtener categorías únicas presentes en los módulos dinámicos (usando descripcion como agrupador del menú)
  const categories = (Array.from(new Set(dynamicModules.map(m => m.descripcion || 'OTROS'))) as string[]).sort();

  const renderSection = (category: string) => {
    // Filtrar módulos por descripción (agrupador menú) que además el usuario tenga habilitados por permiso
    const items = dynamicModules.filter(item => 
      (item.descripcion || 'OTROS') === category && 
      availableModules[item.valor] !== false
    );
    
    if (items.length === 0) return null;

    return (
      <div key={category} className="mb-6">
        {!isCollapsed && (
          <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {category}
          </p>
        )}
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = ICON_MAP[item.clave] || LayoutDashboard;
            const pageId = item.valor.toLowerCase();

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(pageId)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                  activePage === pageId 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
                title={isCollapsed ? item.etiqueta : ""}
              >
                <Icon size={18} className={cn(
                  "transition-transform duration-300",
                  activePage === pageId ? "scale-110" : "group-hover:scale-110"
                )} />
                {!isCollapsed && (
                  <span className="text-[11px] font-black uppercase tracking-tight">{item.etiqueta}</span>
                )}
                {activePage === pageId && !isCollapsed && (
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-100 flex flex-col transition-all duration-500 ease-in-out z-20",
        isCollapsed ? "w-24" : "w-72"
      )}
    >
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer" onClick={() => setActivePage('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 overflow-hidden shadow-lg shadow-primary/20">
            {clinicLogo ? (
              <img src={clinicLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={24} />
            )}
          </div>
          {!isCollapsed && (
            <h1 className="font-black text-slate-800 text-lg tracking-tighter uppercase leading-none truncate">
              {clinicName}
            </h1>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar">
        {/* Siempre mostramos el dashboard al inicio */}
        <div className="mb-6">
           <button
              onClick={() => setActivePage('dashboard')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                activePage === 'dashboard' 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <LayoutDashboard size={18} />
              {!isCollapsed && (
                <span className="text-[11px] font-black uppercase tracking-tight">Resumen Global</span>
              )}
            </button>
        </div>

        {categories.map(category => renderSection(category))}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-50">
        {!isCollapsed && (
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 mb-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Core</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">v2.1 Secured</p>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Salir del Sistema</span>}
        </button>
      </div>
    </aside>
  );
}
