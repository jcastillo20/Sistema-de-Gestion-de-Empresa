import { apiService } from '../services/apiService';

export const getExportContext = async (currentUser: any) => {
  const userName = currentUser ? `${currentUser.nombres || ''} ${currentUser.apellidoPaterno || ''}`.trim() || 'Usuario del Sistema' : 'Usuario del Sistema';
  const userSede = currentUser ? (currentUser.sede === 'ALL' ? 'Corporativo (Todas las sedes)' : currentUser.sede || 'N/A') : 'N/A';

  try {
    const config = await apiService.getConfiguracion();
    return {
      branding: {
        nombre: config.find(c => c.clave === 'CLINICA_NOMBRE')?.valor,
        logo: config.find(c => c.clave === 'CLINICA_LOGO')?.valor,
        primaryColor: config.find(c => c.clave === 'COLOR_PRIMARIO')?.valor,
        accentColor: config.find(c => c.clave === 'COLOR_ACCENT')?.valor,
      },
      context: {
        user: userName,
        sede: userSede
      }
    };
  } catch (error) {
    console.error("Error fetching branding config for export:", error);
    return {
      branding: { nombre: 'ST CLÍNICA', primaryColor: '#4f46e5' },
      context: { 
        user: userName, 
        sede: userSede
      }
    };
  }
};
