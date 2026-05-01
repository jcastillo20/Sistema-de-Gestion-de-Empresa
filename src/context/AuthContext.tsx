import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import { Usuario, Permiso } from '../types';

interface AuthContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  availableModules: Record<string, boolean>;
  displayNameInfo: { sede: string; perfil: string };
  refreshConfig: () => Promise<void>;
  isLoading: boolean;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [availableModules, setAvailableModules] = useState<Record<string, boolean>>({});
  const [displayNameInfo, setDisplayNameInfo] = useState({ sede: '', perfil: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<string>('');

  useEffect(() => {
    if (user) {
      setViewMode(user.perfil.toUpperCase());
    } else {
      setViewMode('');
    }
  }, [user?.perfil]);

  const loadConfig = async () => {
    if (!user) {
      setAvailableModules({});
      setDisplayNameInfo({ sede: '', perfil: '' });
      setIsLoading(false);
      return;
    }

    try {
      const [configs, sedes, allPermisos] = await Promise.all([
        apiService.getConfiguracion(),
        apiService.getSedes(),
        apiService.getPermisos()
      ]);

      // Refresh user permissions from the database
      const userPerms = allPermisos
        .filter(p => p.perfil === user.perfil)
        .reduce((acc, p) => {
          acc[p.modulo.toLowerCase()] = p;
          return acc;
        }, {} as Record<string, Permiso>);

      // Calculamos módulos permitidos reactivamente
      const modules: Record<string, boolean> = {
        'dashboard': true // Dashboard siempre visible
      };

      const menuIds = [
        'pacientes', 'terapeutas', 'horarios', 'paquetes_catalogo', 
        'paquetes_control', 'finanzas', 'usuarios', 'configuracion', 'auditoria'
      ];

      menuIds.forEach(id => {
        let hasAccess = false;
        if (user.perfil === 'SUPERADMIN' || user.perfil === 'ADMINISTRADOR') {
          hasAccess = true;
        } else {
          hasAccess = userPerms[id]?.acceso === true;
        }
        modules[id] = hasAccess;
      });

      setAvailableModules(modules);

      // Lógica unificada para determinar si el usuario es global
      const isGlobalUser = user.sede?.toUpperCase() === 'ALL' || 
                         user.perfil?.toUpperCase() === 'SUPERADMIN' ||
                         user.perfil?.toUpperCase() === 'ADMINISTRADOR' || 
                         userPerms?.dashboard?.verTodo === true;

      const sedeName = isGlobalUser 
        ? 'Todas las Sedes' 
        : sedes.find(s => s.idSede === user.sede || s.nombreSede === user.sede)?.nombreSede || user.sede;
      
      const perfilConfig = configs.find(c => c.valor === user.perfil || c.id === user.perfil);
      const perfilName = perfilConfig?.etiqueta?.replace('Perfil: ', '') || user.perfil;
      
      setDisplayNameInfo({ sede: sedeName, perfil: perfilName });
      
      // Update permissions in user object if they changed
      if (JSON.stringify(user.permisos) !== JSON.stringify(userPerms)) {
        setUser(prev => prev ? { ...prev, permisos: userPerms } : null);
      }
    } catch (error) {
      console.error("Error loading auth config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    window.addEventListener('configUpdated', loadConfig);
    return () => window.removeEventListener('configUpdated', loadConfig);
  }, [user?.id, user?.perfil]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      availableModules, 
      displayNameInfo, 
      refreshConfig: loadConfig,
      isLoading,
      viewMode,
      setViewMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
