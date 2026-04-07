import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Bell, 
  Save, 
  Plus,
  Trash2,
  Edit2,
  History,
  Palette,
  Image as ImageIcon,
  Type,
  Calendar,
  Clock,
  Search,
  Check,
  X,
  Stethoscope,
  LayoutGrid,
  Lock,
  Eye,
  Activity
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Sede, ConfiguracionDinamica, Auditoria, Permiso, Especialidad } from '@/src/types';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { usePermissions } from '../hooks/usePermissions';
import { apiService } from '../services/apiService';

interface ConfiguracionProps {
  currentUser: any;
}

export default function Configuracion({ currentUser }: ConfiguracionProps) {
  const permissions = usePermissions(currentUser, 'configuracion');
  const [activeSection, setActiveSection] = useState('');
  const [config, setConfig] = useState<ConfiguracionDinamica[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [auditoria, setAuditoria] = useState<Auditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  
  const [isEspecialidadModalOpen, setIsEspecialidadModalOpen] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  
  const [isPermisoModalOpen, setIsPermisoModalOpen] = useState(false);
  const [permisosEditados, setPermisosEditados] = useState<Permiso[]>([]);

  if (!permissions.acceso) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Shield size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h3>
        <p className="text-slate-500 max-w-md">
          No tienes los permisos necesarios para acceder al módulo de configuración. 
          Por favor, contacta con el administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configData, sedesData, permisosData, auditoriaData, especialidadesData] = await Promise.all([
        apiService.getConfiguracion(),
        apiService.getSedes(),
        apiService.getPermisos(),
        apiService.getAuditoria(),
        apiService.getEspecialidades()
      ]);
      setConfig(configData);
      setSedes(sedesData);
      setPermisos(permisosData);
      setPermisosEditados(JSON.parse(JSON.stringify(permisosData)));
      setAuditoria(auditoriaData);
      setEspecialidades(especialidadesData);
      
      if (!activeSection && configData.length > 0) {
        // Find the first category by order
        const sortedCats = Array.from(new Set(configData.map(c => c.categoria))).sort((a, b) => {
          const orderA = configData.find(c => c.categoria === a)?.orden || 99;
          const orderB = configData.find(c => c.categoria === b)?.orden || 99;
          return orderA - orderB;
        });
        setActiveSection(sortedCats[0]);
      }
    } catch (error) {
      console.error('Error loading config data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (clave: string, value: any) => {
    setConfig(prev => prev.map(c => c.clave === clave ? { ...c, valor: value } : c));
  };

  const handleSaveConfig = async (categoria: string) => {
    try {
      const itemsToSave = config.filter(c => c.categoria === categoria && c.tipoControl !== 'MODULE_LINK');
      for (const item of itemsToSave) {
        await apiService.updateConfig(item.clave, item.valor, currentUser.nombreUsuario);
      }
      
      // Special logic for Agenda
      if (categoria === 'AGENDA') {
        const typeDuracion = config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor;
        const globalDuracion = config.find(c => c.clave === 'DURACION_SESION_GLOBAL')?.valor;
        
        if (typeDuracion === 'GLOBAL' && globalDuracion) {
          await apiService.bulkUpdateEspecialidades({ duracionSesion: globalDuracion }, currentUser.nombreUsuario);
        }
      }
      
      // Update global theme if color changed
      const primaryColor = config.find(c => c.clave === 'COLOR_PRIMARIO')?.valor;
      if (primaryColor) {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
      }
      
      setAlertConfig({
        title: 'Configuración Guardada',
        message: 'Los cambios se han aplicado correctamente.',
        type: 'success'
      });
      setIsAlertOpen(true);
      window.dispatchEvent(new CustomEvent('configUpdated'));
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar la configuración.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleImageUpload = (clave: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleConfigChange(clave, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SEDE HANDLERS ---
  const handleSedeSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    // Extract attention hours from state if needed, or use defaults
    const horarioAtencion = selectedSede?.horarioAtencion || [
      { dia: 'Lunes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Martes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Miércoles', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Jueves', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Viernes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Sábado', activo: true, horaInicio: '08:00', horaFin: '14:00' },
      { dia: 'Domingo', activo: false, horaInicio: '00:00', horaFin: '00:00' },
    ];

    try {
      if (selectedSede) {
        await apiService.updateSede(selectedSede.idSede, { ...data, horarioAtencion }, currentUser.nombreUsuario);
      } else {
        await apiService.createSede({ ...data, horarioAtencion }, currentUser.nombreUsuario);
      }
      setIsSedeModalOpen(false);
      setSelectedSede(null);
      loadData();
      setAlertConfig({ title: 'Éxito', message: 'Sede guardada correctamente.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar la sede.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleSedeDelete = async (sede: Sede) => {
    try {
      await apiService.deleteSede(sede.idSede, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado de la sede ha sido modificado.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado de la sede.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  // --- ESPECIALIDAD HANDLERS ---
  const handleEspecialidadSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    const typeDuracion = config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor;
    const globalDuracion = config.find(c => c.clave === 'DURACION_SESION_GLOBAL')?.valor;
    
    try {
      const payload = {
        ...data,
        duracionSesion: typeDuracion === 'GLOBAL' ? Number(globalDuracion) : Number(data.duracionSesion),
        estado: true
      };
      
      if (typeDuracion === 'POR_ESPECIALIDAD' && (!payload.duracionSesion || payload.duracionSesion <= 0)) {
        setAlertConfig({ title: 'Error', message: 'La duración de la sesión es obligatoria por especialidad.', type: 'error' });
        setIsAlertOpen(true);
        return;
      }

      if (selectedEspecialidad) {
        await apiService.updateEspecialidad(selectedEspecialidad.id, payload, currentUser.nombreUsuario);
      } else {
        await apiService.createEspecialidad(payload, currentUser.nombreUsuario);
      }
      setIsEspecialidadModalOpen(false);
      setSelectedEspecialidad(null);
      loadData();
      setAlertConfig({ title: 'Éxito', message: 'Especialidad guardada correctamente.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar la especialidad.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleEspecialidadDelete = async (especialidad: Especialidad) => {
    try {
      await apiService.deleteEspecialidad(especialidad.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado de la especialidad ha sido modificado.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado de la especialidad.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  // --- PERMISOS HANDLERS ---
  const handleTogglePermiso = (perfil: string, modulo: string, field: keyof Permiso) => {
    setPermisosEditados(prev => prev.map(p => {
      if (p.perfil === perfil && p.modulo === modulo) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
  };

  const handleSavePermisos = async () => {
    try {
      for (const p of permisosEditados) {
        const original = permisos.find(orig => orig.perfil === p.perfil && orig.modulo === p.modulo);
        if (JSON.stringify(original) !== JSON.stringify(p)) {
          await apiService.updatePermiso(p.perfil, p.modulo, p, currentUser.nombreUsuario);
        }
      }
      setAlertConfig({ title: 'Permisos Guardados', message: 'Los roles y accesos han sido actualizados.', type: 'success' });
      setIsAlertOpen(true);
      window.dispatchEvent(new CustomEvent('configUpdated'));
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudieron guardar los permisos.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handlePermisoSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    const newPermiso: Permiso = {
      perfil: data.perfil,
      modulo: data.modulo.toUpperCase(),
      acceso: data.acceso === 'on',
      puedeCrear: data.puedeCrear === 'on',
      puedeEditar: data.puedeEditar === 'on',
      puedeEliminar: data.puedeEliminar === 'on',
      verTodo: data.verTodo === 'on',
      filtrarPersonas: data.filtrarPersonas === 'on'
    };
    try {
      await apiService.createPermiso(newPermiso, currentUser.nombreUsuario);
      setIsPermisoModalOpen(false);
      window.dispatchEvent(new CustomEvent('configUpdated'));
      loadData();
    } catch (error) {
      console.error('Error creating permiso:', error);
    }
  };

  // --- DYNAMIC ENGINE ---
  const categories = (Array.from(new Set(config.map(c => c.categoria))) as string[]).sort((a, b) => {
    const orderA = config.find(c => c.categoria === a)?.orden || 99;
    const orderB = config.find(c => c.categoria === b)?.orden || 99;
    return orderA - orderB;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'BRANDING': return Palette;
      case 'SEDES': return Building2;
      case 'ESPECIALIDADES': return Stethoscope;
      case 'SEGURIDAD': return Shield;
      case 'NOTIFICACIONES': return Bell;
      case 'AUDITORIA': return History;
      case 'AGENDA': return Calendar;
      default: return Settings;
    }
  };

  const renderControl = (item: ConfiguracionDinamica) => {
    // Conditional visibility for Agenda
    if (item.clave === 'DURACION_SESION_GLOBAL') {
      const typeDuracion = config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor;
      if (typeDuracion !== 'GLOBAL') return null;
    }

    switch (item.tipoControl) {
      case 'TEXT':
        return (
          <input 
            type="text" 
            value={item.valor}
            onChange={(e) => handleConfigChange(item.clave, e.target.value)}
            className="input-field"
          />
        );
      case 'NUMBER':
        return (
          <input 
            type="number" 
            value={item.valor}
            onChange={(e) => handleConfigChange(item.clave, Number(e.target.value))}
            className="input-field"
          />
        );
      case 'COLOR':
        return (
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={item.valor}
              onChange={(e) => handleConfigChange(item.clave, e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
            />
            <input 
              type="text" 
              value={item.valor}
              onChange={(e) => handleConfigChange(item.clave, e.target.value)}
              className="input-field w-32 font-mono uppercase"
            />
          </div>
        );
      case 'CHECKBOX':
        return (
          <button 
            onClick={() => handleConfigChange(item.clave, !item.valor)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              item.valor ? "bg-primary" : "bg-slate-200"
            )}
          >
            <span className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              item.valor ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        );
      case 'IMAGE':
        return (
          <div className="space-y-3">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
              {item.valor ? (
                <img src={item.valor} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="text-slate-300" size={32} />
              )}
            </div>
            <label className="text-xs font-semibold text-primary hover:underline cursor-pointer">
              Cambiar Imagen
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(item.clave, e)} />
            </label>
          </div>
        );
      case 'SELECT':
        return (
          <select 
            value={item.valor}
            onChange={(e) => handleConfigChange(item.clave, e.target.value)}
            className="input-field"
          >
            {item.opciones?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const currentConfigItems = config.filter(c => c.categoria === activeSection);
  const hasFormFields = currentConfigItems.some(c => c.tipoControl !== 'MODULE_LINK');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configuración del Sistema</h2>
        <p className="text-slate-500">Administra los parámetros globales de forma dinámica.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 sticky top-24">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveSection(cat)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium",
                    activeSection === cat 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} />
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 min-h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : config.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <Settings size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sin Configuración</h3>
              <p className="text-slate-500 max-w-md">
                No se han encontrado parámetros de configuración en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">{activeSection}</h3>
                {hasFormFields && permissions.puedeEditar && currentUser.perfil !== 'ADMINISTRADOR_SEDE' && (
                  <button onClick={() => handleSaveConfig(activeSection)} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {currentConfigItems.map((item) => (
                  <div key={item.id} className="space-y-4">
                    {item.tipoControl === 'MODULE_LINK' ? (
                      <div className="pt-4">
                        {item.valor === 'SEDES' && (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              {permissions.puedeCrear && currentUser.perfil !== 'ADMINISTRADOR_SEDE' && (
                                <button 
                                  onClick={() => {
                                    setSelectedSede(null);
                                    setIsSedeModalOpen(true);
                                  }} 
                                  className="btn-primary flex items-center gap-2"
                                >
                                  <Plus size={18} />
                                  Nueva Sede
                                </button>
                              )}
                            </div>
                            <DataTable 
                              title="Gestión de Sedes"
                              data={permissions.verTodo ? sedes : sedes.filter(s => s.idSede === currentUser.sede)}
                              columns={[
                                { header: 'Nombre', accessor: 'nombreSede', sortable: true, sortKey: 'nombreSede' },
                                { header: 'Dirección', accessor: 'direccion' },
                                { 
                                  header: 'Estado', 
                                  accessor: (s: Sede) => (
                                    <span className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                      s.estado ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                    )}>
                                      {s.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                  )
                                }
                              ]}
                              onEdit={permissions.puedeEditar ? (s) => {
                                setSelectedSede(s);
                                setIsSedeModalOpen(true);
                              } : undefined}
                              onDelete={permissions.puedeEliminar && currentUser.perfil !== 'ADMINISTRADOR_SEDE' ? handleSedeDelete : undefined}
                            />
                          </div>
                        )}
                        {item.valor === 'ESPECIALIDADES' && (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              {permissions.puedeCrear && currentUser.perfil !== 'ADMINISTRADOR_SEDE' && (
                                <button 
                                  onClick={() => {
                                    setSelectedEspecialidad(null);
                                    setIsEspecialidadModalOpen(true);
                                  }} 
                                  className="btn-primary flex items-center gap-2"
                                >
                                  <Plus size={18} />
                                  Nueva Especialidad
                                </button>
                              )}
                            </div>
                            <DataTable 
                              title="Catálogo de Especialidades"
                              data={especialidades}
                              columns={[
                                { header: 'Especialidad', accessor: 'nombre', sortable: true, sortKey: 'nombre' },
                                { 
                                  header: 'Duración (min)', 
                                  accessor: (e: Especialidad) => {
                                    const typeDuracion = config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor;
                                    return typeDuracion === 'GLOBAL' ? (
                                      <span className="text-slate-400 italic">Global</span>
                                    ) : (
                                      `${e.duracionSesion || 0} min`
                                    );
                                  }
                                },
                                { 
                                  header: 'Estado', 
                                  accessor: (e: Especialidad) => (
                                    <span className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                      e.estado ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                    )}>
                                      {e.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                  )
                                }
                              ]}
                              onEdit={permissions.puedeEditar ? (e) => {
                                setSelectedEspecialidad(e);
                                setIsEspecialidadModalOpen(true);
                              } : undefined}
                              onDelete={permissions.puedeEliminar && currentUser.perfil !== 'ADMINISTRADOR_SEDE' ? handleEspecialidadDelete : undefined}
                            />
                          </div>
                        )}
                        {item.valor === 'PERMISOS' && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-700">Matriz de Roles y Accesos</h4>
                              <div className="flex gap-2">
                                {permissions.puedeEditar && currentUser.perfil !== 'ADMINISTRADOR_SEDE' && (
                                  <button onClick={handleSavePermisos} className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs py-2">
                                    <Save size={14} />
                                    Guardar Matriz
                                  </button>
                                )}
                                {permissions.puedeCrear && (
                                  <button onClick={() => setIsPermisoModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs py-2">
                                    <Plus size={14} />
                                    Nuevo
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                  <tr>
                                    <th className="px-4 py-3">Módulo</th>
                                    <th className="px-4 py-3">Perfil</th>
                                    <th className="px-4 py-3 text-center">Acceso</th>
                                    <th className="px-4 py-3 text-center">Ver Todo</th>
                                    <th className="px-4 py-3 text-center">Crear</th>
                                    <th className="px-4 py-3 text-center">Editar</th>
                                    <th className="px-4 py-3 text-center">Eliminar</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {permisosEditados
                                    .filter(p => p.perfil !== 'SUPER_ADMIN')
                                    .map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-4 py-3 font-bold text-slate-900 uppercase">{p.modulo}</td>
                                      <td className="px-4 py-3 text-slate-600">{p.perfil}</td>
                                      {['acceso', 'verTodo', 'puedeCrear', 'puedeEditar', 'puedeEliminar'].map(f => (
                                        <td key={f} className="px-4 py-3 text-center">
                                          <button 
                                            onClick={() => handleTogglePermiso(p.perfil, p.modulo, f as any)}
                                            className={cn(
                                              "p-1 rounded transition-colors", 
                                              p[f as keyof Permiso] ? "text-emerald-600 bg-emerald-50" : "text-slate-300 bg-slate-50", 
                                              currentUser.perfil === 'ADMINISTRADOR_SEDE' && "opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={currentUser.perfil === 'ADMINISTRADOR_SEDE'}
                                          >
                                            {p[f as keyof Permiso] ? <Check size={14} /> : <X size={14} />}
                                          </button>
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        {item.valor === 'AUDITORIA' && (
                          <DataTable 
                            title="Registro de Actividad"
                            data={auditoria}
                            columns={[
                              { 
                                header: 'Fecha', 
                                accessor: (a: Auditoria) => (
                                  <div className="flex items-center gap-2 text-slate-600 text-xs">
                                    <Calendar size={12} />
                                    <span>{new Date(a.fecha).toLocaleDateString()}</span>
                                    <Clock size={12} className="ml-1" />
                                    <span>{new Date(a.fecha).toLocaleTimeString()}</span>
                                  </div>
                                )
                              },
                              { header: 'Usuario', accessor: 'nombreUsuario' },
                              { 
                                header: 'Acción', 
                                accessor: (a: Auditoria) => (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                    a.accion === 'LOGIN' ? "bg-blue-100 text-blue-700" :
                                    a.accion === 'INSERT' ? "bg-emerald-100 text-emerald-700" :
                                    a.accion === 'UPDATE' ? "bg-amber-100 text-amber-700" :
                                    a.accion === 'UPDATE_STATUS' ? "bg-purple-100 text-purple-700" :
                                    "bg-red-100 text-red-700"
                                  )}>
                                    {a.accion}
                                  </span>
                                )
                              },
                              { header: 'Tabla', accessor: 'tabla' },
                              { header: 'ID', accessor: 'idRegistro', className: 'max-w-[100px] truncate' }
                            ]}
                            searchPlaceholder="Buscar en logs..."
                            searchFields={['nombreUsuario', 'tabla', 'idRegistro', 'accion']}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="max-w-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-slate-700">{item.etiqueta}</label>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                              {item.tipoControl}
                            </span>
                          </div>
                        </div>
                        {item.descripcion && <p className="text-xs text-slate-500">{item.descripcion}</p>}
                        {currentUser.perfil === 'ADMINISTRADOR_SEDE' && item.tipoControl !== 'CHECKBOX' ? (
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-sm border border-slate-100">
                            {item.tipoControl === 'COLOR' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: item.valor }} />
                                <span>{item.valor}</span>
                              </div>
                            ) : item.tipoControl === 'IMAGE' ? (
                              <img src={item.valor} alt="Logo" className="h-10 object-contain" />
                            ) : (
                              item.valor
                            )}
                          </div>
                        ) : (
                          renderControl(item)
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isSedeModalOpen}
        onClose={() => setIsSedeModalOpen(false)}
        title={selectedSede ? "Editar Sede" : "Nueva Sede"}
      >
        <form onSubmit={handleSedeSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de Sede</label>
              <input name="nombreSede" type="text" className="input-field" defaultValue={selectedSede?.nombreSede} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <input name="direccion" type="text" className="input-field" defaultValue={selectedSede?.direccion} required />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock size={16} />
              Horario de Atención por Día
            </label>
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Día</th>
                    <th className="px-3 py-2 text-center">Activo</th>
                    <th className="px-3 py-2 text-center">Inicio</th>
                    <th className="px-3 py-2 text-center">Fin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(selectedSede?.horarioAtencion || [
                    { dia: 'Lunes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
                    { dia: 'Martes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
                    { dia: 'Miércoles', activo: true, horaInicio: '08:00', horaFin: '20:00' },
                    { dia: 'Jueves', activo: true, horaInicio: '08:00', horaFin: '20:00' },
                    { dia: 'Viernes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
                    { dia: 'Sábado', activo: true, horaInicio: '08:00', horaFin: '14:00' },
                    { dia: 'Domingo', activo: false, horaInicio: '00:00', horaFin: '00:00' },
                  ]).map((h, idx) => (
                    <tr key={h.dia}>
                      <td className="px-3 py-2 font-medium">{h.dia}</td>
                      <td className="px-3 py-2 text-center">
                        <input 
                          type="checkbox" 
                          defaultChecked={h.activo} 
                          className="rounded border-slate-300 text-primary"
                          onChange={(e) => {
                            if (selectedSede) {
                              const newHorario = [...(selectedSede.horarioAtencion || [])];
                              newHorario[idx] = { ...newHorario[idx], activo: e.target.checked };
                              setSelectedSede({ ...selectedSede, horarioAtencion: newHorario });
                            }
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="time" 
                          defaultValue={h.horaInicio} 
                          disabled={!h.activo}
                          className="w-full bg-transparent border-none text-xs focus:ring-0 disabled:opacity-30"
                          onChange={(e) => {
                            if (selectedSede) {
                              const newHorario = [...(selectedSede.horarioAtencion || [])];
                              newHorario[idx] = { ...newHorario[idx], horaInicio: e.target.value };
                              setSelectedSede({ ...selectedSede, horarioAtencion: newHorario });
                            }
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="time" 
                          defaultValue={h.horaFin} 
                          disabled={!h.activo}
                          className="w-full bg-transparent border-none text-xs focus:ring-0 disabled:opacity-30"
                          onChange={(e) => {
                            if (selectedSede) {
                              const newHorario = [...(selectedSede.horarioAtencion || [])];
                              newHorario[idx] = { ...newHorario[idx], horaFin: e.target.value };
                              setSelectedSede({ ...selectedSede, horarioAtencion: newHorario });
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsSedeModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEspecialidadModalOpen}
        onClose={() => setIsEspecialidadModalOpen(false)}
        title={selectedEspecialidad ? "Editar Especialidad" : "Nueva Especialidad"}
      >
        <form onSubmit={handleEspecialidadSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de Especialidad</label>
            <input name="nombre" type="text" className="input-field" defaultValue={selectedEspecialidad?.nombre} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duración de Sesión (minutos)</label>
            <input 
              name="duracionSesion" 
              type="number" 
              className="input-field disabled:bg-slate-50 disabled:text-slate-400" 
              defaultValue={selectedEspecialidad?.duracionSesion || config.find(c => c.clave === 'DURACION_SESION_GLOBAL')?.valor || 45} 
              required 
              disabled={config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor === 'GLOBAL'}
            />
            {config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor === 'GLOBAL' && (
              <p className="text-[10px] text-slate-400 italic">La duración se gestiona desde la configuración global de Agenda.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEspecialidadModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPermisoModalOpen}
        onClose={() => setIsPermisoModalOpen(false)}
        title="Nuevo Permiso"
      >
        <form onSubmit={handlePermisoSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Perfil</label>
            <select name="perfil" className="input-field" required>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="ADMINISTRADOR_SEDE">Administrador Sede</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="TERAPEUTA">Terapeuta</option>
              <option value="GERENTE">Gerente</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Módulo</label>
            <select name="modulo" className="input-field" required>
              <option value="PACIENTES">Pacientes</option>
              <option value="TERAPEUTAS">Terapeutas</option>
              <option value="HORARIOS">Horarios</option>
              <option value="USUARIOS">Usuarios</option>
              <option value="CONFIGURACION">Configuración</option>
              <option value="AGENDA">Agenda</option>
              <option value="FINANZAS">Finanzas</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['acceso', 'verTodo', 'puedeCrear', 'puedeEditar', 'puedeEliminar'].map(f => (
              <label key={f} className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                <input type="checkbox" name={f} className="rounded border-slate-300 text-primary" /> {f}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsPermisoModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
            <button type="submit" className="btn-primary">Crear</button>
          </div>
        </form>
      </Modal>

      <AlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        type={alertConfig.type} 
      />
    </div>
  );
}