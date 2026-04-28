import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePermissions(currentUser: any, module: string) {
  const { user } = useAuth();
  
  // Usamos el user del context si existe, sino el que pasaron por props
  const targetUser = user || currentUser;

  const permissions = useMemo(() => {
    const defaultPermissions = {
      acceso: false,
      verTodo: false,
      puedeCrear: false,
      puedeEditar: false,
      puedeEliminar: false,
      filtrarPersonas: true
    };

    if (!targetUser) {
      return defaultPermissions;
    }

    // If user is super admin, grant all by default
    if (targetUser.perfil === 'SUPER_ADMIN' || targetUser.perfil === 'SUPERADMIN') {
      return {
        acceso: true,
        verTodo: true,
        puedeCrear: true,
        puedeEditar: true,
        puedeEliminar: true,
        filtrarPersonas: false
      };
    }

    // Perfil ADMINISTRADOR (Global)
    if (targetUser.perfil === 'ADMINISTRADOR') {
      const modulePerms = targetUser.permisos?.[module.toLowerCase()];
      if (modulePerms) return modulePerms;
      
      return {
        ...defaultPermissions,
        acceso: true,
        verTodo: true,
        puedeCrear: true,
        puedeEditar: true,
        puedeEliminar: true
      };
    }

    if (!targetUser.permisos) {
      return defaultPermissions;
    }

    const modulePerms = targetUser.permisos[module.toLowerCase()];
    if (modulePerms) return modulePerms;
    
    return defaultPermissions;
  }, [targetUser, module]);

  return permissions;
}
