import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, Stethoscope, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { APP_CONFIG } from '../constants';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock authentication
    setTimeout(() => {
      if (username === 'administracion' && password === '12345') {
        onLogin({
          id: '1',
          nombres: 'Administrador',
          nombreUsuario: 'administracion',
          perfil: 'ADMIN',
          sede: 'SEDE CENTRAL',
          // Los permisos ahora vienen con el usuario desde el "Backend"
          permisos: {
            all: { acceso: true, verTodo: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true, filtrarPersonas: false },
          }
        });
      } else if (username === 'secretaria' && password === '12345') {
        onLogin({
          id: '2',
          nombres: 'Ana Secretaria',
          nombreUsuario: 'asecretaria',
          perfil: 'SECRETARIA',
          sede: 'SEDE NORTE',
          permisos: {
            dashboard: { acceso: true, verTodo: false, puedeCrear: false, puedeEditar: false, puedeEliminar: false, filtrarPersonas: true },
            pacientes: { acceso: true, verTodo: false, puedeCrear: true, puedeEditar: true, puedeEliminar: false, filtrarPersonas: true },
            agenda: { acceso: true, verTodo: false, puedeCrear: true, puedeEditar: true, puedeEliminar: true, filtrarPersonas: true },
            paquetes: { acceso: true, verTodo: false, puedeCrear: true, puedeEditar: true, puedeEliminar: false, filtrarPersonas: true },
            finanzas: { acceso: true, verTodo: false, puedeCrear: true, puedeEditar: false, puedeEliminar: false, filtrarPersonas: true },
            terapeutas: { acceso: true, verTodo: false, puedeCrear: false, puedeEditar: false, puedeEliminar: false, filtrarPersonas: true },
            usuarios: { acceso: false, verTodo: false, puedeCrear: false, puedeEditar: false, puedeEliminar: false, filtrarPersonas: true },
            configuracion: { acceso: false, verTodo: false, puedeCrear: false, puedeEditar: false, puedeEliminar: false, filtrarPersonas: true },
          }
        });
      } else {
        setError('Usuario o contraseña incorrectos');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/20"
          >
            <Stethoscope size={32} />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-slate-900 tracking-tight"
          >
            {APP_CONFIG.NAME}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 mt-2"
          >
            {APP_CONFIG.DESCRIPTION}
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="ej. jcastillo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500 font-medium"
              >
                {error}
              </motion.p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ChevronRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CliniGest. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
