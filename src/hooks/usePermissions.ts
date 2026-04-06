import { useMemo } from 'react';

export function usePermissions(user: any, module: string) {
  const permissions = useMemo(() => {
    const defaultPermissions = {
      acceso: false,
      verTodo: false,
      puedeCrear: false,
      puedeEditar: false,
      puedeEliminar: false,
      filtrarPersonas: true
    };

    if (!user) {
      return defaultPermissions;
    }

    // If user is super admin, grant all by default
    if (user.perfil === 'SUPER_ADMIN') {
      return {
        acceso: true,
        verTodo: true,
        puedeCrear: true,
        puedeEditar: true,
        puedeEliminar: true,
        filtrarPersonas: false
      };
    }

    // ADMINISTRADOR sees all sedes by default, but respects other permissions
    if (user.perfil === 'ADMINISTRADOR') {
      const modulePerms = user.permisos?.[module.toLowerCase()];
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

    if (!user.permisos) {
      return defaultPermissions;
    }

    const modulePerms = user.permisos[module.toLowerCase()];
    if (modulePerms) return modulePerms;
    
    return defaultPermissions;
  }, [user, module]);

  return permissions;
}
