import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Configuracion from './pages/Configuracion';
import Pacientes from './pages/Pacientes';
import Terapeutas from './pages/Terapeutas';
import Usuarios from './pages/Usuarios';
import Horarios from './pages/Horarios';
import { apiService } from './services/apiService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appConfig, setAppConfig] = useState<any>({});

  useEffect(() => {
    const initApp = async () => {
      try {
        const config = await apiService.getConfiguracion();
        const configMap: any = {};
        config.forEach(c => {
          configMap[c.clave] = c.valor;
        });
        setAppConfig(configMap);

        // Apply primary color
        if (configMap.COLOR_PRIMARIO) {
          document.documentElement.style.setProperty('--primary-color', configMap.COLOR_PRIMARIO);
        }

        const savedUser = localStorage.getItem('clini_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Refresh permissions
          const allPermisos = await apiService.getPermisos();
          const userPermissions = allPermisos.filter(p => 
            p.perfil.toUpperCase() === parsedUser.perfil.toUpperCase()
          );
          const permissionsMap: any = {};
          userPermissions.forEach(p => {
            // Normalize module name to lowercase to match NAVIGATION IDs
            permissionsMap[p.modulo.toLowerCase()] = p;
          });
          setUser({ ...parsedUser, permisos: permissionsMap });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initApp();
    
    window.addEventListener('configUpdated', initApp);
    return () => window.removeEventListener('configUpdated', initApp);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('clini_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('clini_user');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} appConfig={appConfig}>
                <Routes>
                  <Route path="/" element={<Dashboard currentUser={user} />} />
                  <Route path="/agenda" element={<div className="p-8 text-slate-500">Módulo de Agenda en desarrollo...</div>} />
                  <Route path="/pacientes" element={<Pacientes currentUser={user} />} />
                  <Route path="/terapeutas" element={<Terapeutas currentUser={user} />} />
                  <Route path="/horarios" element={<Horarios currentUser={user} />} />
                  <Route path="/usuarios" element={<Usuarios currentUser={user} />} />
                  <Route path="/paquetes" element={<div className="p-8 text-slate-500">Módulo de Paquetes en desarrollo...</div>} />
                  <Route path="/finanzas" element={<div className="p-8 text-slate-500">Módulo de Finanzas en desarrollo...</div>} />
                  <Route path="/configuracion" element={<Configuracion currentUser={user} />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
