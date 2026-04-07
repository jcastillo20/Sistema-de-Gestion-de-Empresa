import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { MOCK_USUARIOS } from '../services/mockDb';
import { apiService } from '../services/apiService';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState('');
  const [clinicName, setClinicName] = useState('ST Clínica');

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await apiService.getConfiguracion();
        const logoConfig = config.find(c => c.clave === 'CLINICA_LOGO')?.valor;
        const nameConfig = config.find(c => c.clave === 'CLINICA_NOMBRE')?.valor;
        if (logoConfig) setLogo(logoConfig);
        if (nameConfig) setClinicName(nameConfig);
      } catch (err) {
        console.error('Error loading branding:', err);
      }
    };
    loadBranding();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(async () => {
      const user = MOCK_USUARIOS.find(
        u => u.nombreUsuario === username && u.contrasena === password
      );

      if (user) {
        if (!user.estado) {
          setError('El usuario se encuentra inactivo.');
        } else {
          try {
            // Refresh permissions from apiService (which handles localStorage)
            const allPermisos = await apiService.getPermisos();
            const userPermissions = allPermisos.filter(p => 
              p.perfil.toUpperCase() === user.perfil.toUpperCase()
            );
            const permissionsMap: any = {};
            userPermissions.forEach(p => {
              // Normalize module name to lowercase to match NAVIGATION IDs
              permissionsMap[p.modulo.toLowerCase()] = p;
            });
            
            onLogin({ ...user, permisos: permissionsMap });
          } catch (err) {
            console.error('Error fetching permissions during login:', err);
            onLogin({ ...user, permisos: {} });
          }
        }
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <LogIn className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{clinicName}</h1>
                <p className="text-slate-500 text-sm">Sistema de Gestión Clínica</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field input-with-icon"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field input-with-icon pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-400">
                © 2024 ST Clínica - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
