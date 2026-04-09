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

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await apiService.getConfiguracion();
        const logoConfig = config.find(c => c.clave === 'CLINICA_LOGO')?.valor;
        const nameConfig = config.find(c => c.clave === 'CLINICA_NOMBRE')?.valor;
        const primaryColor = config.find(c => c.clave === 'COLOR_PRIMARIO')?.valor;

        if (primaryColor) {
          document.documentElement.style.setProperty('--primary-color', primaryColor);
          const primaryRgb = hexToRgb(primaryColor);
          if (primaryRgb) document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
        }
        if (logoConfig) setLogo(logoConfig);
        if (nameConfig) setClinicName(nameConfig);
      } catch (err) {
        console.error('Error loading branding:', err);
      }
    };
    loadBranding();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const allUsers = await apiService.getUsuarios();
      const user = allUsers.find(
        u => u.nombreUsuario === username && u.contrasena === password
      );

      if (user) {
        if (!user.estado) {
          setError('El usuario se encuentra inactivo.');
        } else {
          try {
            const [allPermisos, allConfigs] = await Promise.all([
              apiService.getPermisos(),
              apiService.getConfiguracion()
            ]);
            
            // Map PRF-XX ID to actual Profile Name from Config
            const profileConfig = allConfigs.find(c => c.id === user.perfil || c.valor === user.perfil);
            const profileName = profileConfig ? (profileConfig.valor || profileConfig.etiqueta) : user.perfil;

            const userPermissions = allPermisos.filter(p => p.perfil === profileName);
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
    } catch (err) {
      setError('Error de conexión con el servicio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> {/* Added fragment for safety */}
      <div className="clini-login-page">
        <div className="clini-login-card">
          <div className="clini-login-content">
          {/* Logo Section */}
          <div className="clini-login-logo-section">
            <div className="clini-login-logo-container">
                {logo ? (
                  <img src={logo} alt="Logo" className="clini-login-logo-image" />
                ) : (
                  <LogIn className="clini-login-logo-icon" />
                )}
            </div>
            <div className="clini-login-title-group">
              <h1 className="clini-title-main">{clinicName}</h1>
              <p className="clini-login-subtitle">Sistema de Gestión Clínica</p>
            </div>
          </div>

            <form onSubmit={handleSubmit} className="clini-login-form">
              {error && (
                <div className="clini-alert-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="clini-form-group">
                <label className="clini-label-form">Usuario</label>
                <div className="clini-input-group">
                  <div className="clini-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="clini-input-field-icon-left"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div className="clini-form-group">
                <label className="clini-label-form">Contraseña</label>
                <div className="clini-input-group">
                  <div className="clini-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="clini-input-field-icon-left-right-action"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="clini-input-action"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="clini-login-submit-button"
              >
                {isLoading ? (
                  <div className="clini-loading-spinner" />
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="clini-login-footer">
              <p className="clini-login-copyright">
                © 2024 ST Clínica - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </> 




  );
}
