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
  Loader2,
  Palette,
  Image as ImageIcon,
  Type,
  Calendar,
  Clock,
  Search,
  Check,
  X,
  ChevronRight,
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
  const [activeSection, setActiveSection] = useState<'BRANDING' | 'SEDES' | 'ESPECIALIDADES' | 'SEGURIDAD' | 'AGENDA' | 'DICCIONARIOS'>('BRANDING');

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const [config, setConfig] = useState<ConfiguracionDinamica[]>([]);
  const [initialConfig, setInitialConfig] = useState<ConfiguracionDinamica[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [auditoria, setAuditoria] = useState<Auditoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDictionaryKey, setSelectedDictionaryKey] = useState<string | null>(null);
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchMatriz, setSearchMatriz] = useState('');
  const [pendingSection, setPendingSection] = useState<typeof activeSection | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  
  const [isEspecialidadModalOpen, setIsEspecialidadModalOpen] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [editingDictItem, setEditingDictItem] = useState<ConfiguracionDinamica | null>(null);

  const [isPermisoModalOpen, setIsPermisoModalOpen] = useState(false);
  const [permisosEditados, setPermisosEditados] = useState<Permiso[]>([]);

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <Shield size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
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
      setInitialConfig(JSON.parse(JSON.stringify(configData)));
      setSedes(sedesData);
      setPermisos(permisosData);
      setPermisosEditados(JSON.parse(JSON.stringify(permisosData)));
      setAuditoria(auditoriaData);
      setEspecialidades(especialidadesData);

      // Aplicar el tamaño de fuente base inicial si está disponible
      const baseFontSize = configData.find(c => c.clave === 'BASE_FONT_SIZE')?.valor;
      if (baseFontSize) {
        document.documentElement.style.setProperty('--clini-font-size-base', baseFontSize);
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

  // Validador de cambios pendientes en Seguridad
  const handleSectionChange = (section: typeof activeSection) => {
    let isDirty = false;

    // 1. Validar cambios en Matriz de Seguridad
    if (activeSection === 'SEGURIDAD') {
      isDirty = JSON.stringify(permisos) !== JSON.stringify(permisosEditados);
    } 
    // 2. Validar cambios en Categorías Dinámicas (Branding, Agenda, etc.)
    else if (['BRANDING', 'AGENDA'].includes(activeSection)) {
      const currentCategoryItems = config.filter(c => c.categoria === activeSection);
      const initialCategoryItems = initialConfig.filter(c => c.categoria === activeSection);
      isDirty = JSON.stringify(currentCategoryItems) !== JSON.stringify(initialCategoryItems);
    }
    
    if (isDirty) {
      setPendingSection(section);
      setIsNavigationModalOpen(true);
      return;
    }
    
    setActiveSection(section);
  };

  const handleDiscardChanges = () => {
    // Resetear estados locales a la data del servicio
    if (activeSection === 'SEGURIDAD') {
      setPermisosEditados(JSON.parse(JSON.stringify(permisos)));
    } else {
      setConfig(JSON.parse(JSON.stringify(initialConfig)));
    }
    
    if (pendingSection) {
      setActiveSection(pendingSection);
    }
    setIsNavigationModalOpen(false);
    setPendingSection(null);
  };

  const handleSaveConfig = async (categoria: string) => {
    setIsProcessing(true);
    try {
      const itemsToSave = config.filter(c => c.categoria === categoria);
      for (const item of itemsToSave) {
        await apiService.updateConfig(item.clave, item.valor, currentUser.nombreUsuario);
      }

      // Lógica unificada para Seguridad (Matriz de Permisos)
      if (categoria === 'SEGURIDAD') {
        for (const p of permisosEditados) {
          const original = permisos.find(orig => orig.perfil === p.perfil && orig.modulo === p.modulo);
          if (JSON.stringify(original) !== JSON.stringify(p)) {
            await apiService.updatePermiso(p.perfil, p.modulo, p, currentUser.nombreUsuario);
          }
        }
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
        const primaryRgb = hexToRgb(primaryColor);
        if (primaryRgb) document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
      }
      const secondaryColor = config.find(c => c.clave === 'COLOR_SECUNDARIO')?.valor;
      if (secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        const secondaryRgb = hexToRgb(secondaryColor);
        if (secondaryRgb) document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);
      }
      const accentColor = config.find(c => c.clave === 'COLOR_ACCENT')?.valor;
      if (accentColor) {
        document.documentElement.style.setProperty('--accent-color', accentColor);
        const accentRgb = hexToRgb(accentColor);
        if (accentRgb) document.documentElement.style.setProperty('--accent-rgb', accentRgb);
      }
      
      // Actualizar el tamaño de fuente base global si ha cambiado
      const baseFontSize = config.find(c => c.clave === 'BASE_FONT_SIZE')?.valor;
      if (baseFontSize) {
        document.documentElement.style.setProperty('--clini-font-size-base', baseFontSize);
      }

      setAlertConfig({
        title: 'Configuración Guardada',
        message: 'Todos los cambios (incluyendo permisos y catálogos) se han aplicado correctamente.',
        type: 'success'
      });
      setIsAlertOpen(true);
      window.dispatchEvent(new CustomEvent('configUpdated'));
      loadData();
    } catch (error) {
      console.error('Error saving config:', error);
      setAlertConfig({ 
        title: 'Error al Guardar', 
        message: error instanceof Error ? error.message : 'No se pudo guardar la configuración.', 
        type: 'error' 
      });
      setIsAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDictionaryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    try {
      if (editingDictItem) {
        // Update existing
        await apiService.updateConfig(editingDictItem.clave, data.valor, currentUser.nombreUsuario);
        // We also need to update label which isn't in updateConfig normally, 
        // but since we are in a mock environment we'll update the local state.
        setConfig(prev => prev.map(c => c.id === editingDictItem.id ? { ...c, etiqueta: data.etiqueta, valor: data.valor } : c));
      } else {
        // Create new
        const prefix = selectedDictionaryKey || 'CAT';
        const count = config.filter(c => c.id.startsWith(prefix)).length + 1;
        const newItem: ConfiguracionDinamica = {
          id: `${prefix}-${count.toString().padStart(2, '0')}`,
          clave: `${prefix}_${data.valor.toString().toUpperCase().replace(/\s+/g, '_')}`,
          valor: data.tipoControl === 'CHECKBOX' ? true : data.valor,
          etiqueta: data.etiqueta,
          categoria: 'DICCIONARIOS',
          tipoControl: editingDictItem?.tipoControl || 'CHECKBOX',
          orden: config.length + 1
        };
        await apiService.createConfig(newItem, currentUser.nombreUsuario);
      }
      
      setIsDictModalOpen(false);
      setEditingDictItem(null);
      loadData();
      setAlertConfig({ title: 'Éxito', message: 'Elemento de catálogo guardado.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      console.error('Error saving dictionary item:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDictionaryItem = async (item: ConfiguracionDinamica) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${item.etiqueta}" de este catálogo?`)) return;
    
    setIsProcessing(true);
    try {
      await apiService.deleteConfig(item.clave, currentUser.nombreUsuario);
      loadData();
      setAlertConfig({ title: 'Éxito', message: 'Elemento eliminado correctamente.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      console.error('Error deleting dictionary item:', error);
      setAlertConfig({ title: 'Error', message: 'No se pudo eliminar el elemento.', type: 'error' });
      setIsAlertOpen(true);
    } finally {
      setIsProcessing(false);
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
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSedeDelete = async (sede: Sede) => {
    setIsProcessing(true);
    try {
      await apiService.deleteSede(sede.idSede, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado de la sede ha sido modificado.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado de la sede.', type: 'error' });
      setIsAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ESPECIALIDAD HANDLERS ---
  const handleEspecialidadSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEspecialidadDelete = async (especialidad: Especialidad) => {
    setIsProcessing(true);
    try {
      await apiService.deleteEspecialidad(especialidad.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado de la especialidad ha sido modificado.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado de la especialidad.', type: 'error' });
      setIsAlertOpen(true);
    } finally {
      setIsProcessing(false);
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
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermisoSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const sections = [
    { id: 'BRANDING', label: '🎨 Branding', icon: Palette },
    { id: 'SEDES', label: '🏥 Sedes', icon: Building2 },
    { id: 'ESPECIALIDADES', label: '🩺 Especialidades', icon: Stethoscope },
    { id: 'SEGURIDAD', label: '🔐 Seguridad', icon: Shield },
    { id: 'AGENDA', label: '📅 Agenda', icon: Calendar },
    { id: 'DICCIONARIOS', label: '📑 Diccionarios', icon: LayoutGrid },
  ];

  const renderControl = (item: ConfiguracionDinamica) => {
    switch (item.tipoControl) {
      case 'TEXT':
        return (
          <input 
            type="text" 
            value={item.valor}
            onChange={(e) => handleConfigChange(item.clave, e.target.value)}
            className="clini-input-field-icon-left" // Ahora usa la clase estandarizada
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
          <div className="clini-color-picker-wrapper">
            <input 
              type="color" 
              value={item.valor}
              onChange={(e) => handleConfigChange(item.clave, e.target.value)}
              className="clini-color-input-swatch"
            />
            <input 
              type="text" 
              value={item.valor}
              onChange={(e) => handleConfigChange(item.clave, e.target.value)}
              className="clini-color-input-text"
            />
          </div>
        );
      case 'CHECKBOX':
        return (
          <button 
            onClick={() => handleConfigChange(item.clave, !item.valor)} // Toggle logic
            className={cn("clini-switch-track", item.valor ? "clini-switch-track-active" : "clini-switch-track-inactive")}
          >
            <span className={cn("clini-switch-thumb", item.valor ? "clini-switch-thumb-active" : "clini-switch-thumb-inactive")} />
          </button>
        );
      case 'LIST':
        return (
          <div className="clini-list-editor-container">
            <div className="clini-tag-list">
              {(item.valor || []).map((val: string, i: number) => (
                <span key={i} className="clini-tag-item group">
                  {val}
                  <button type="button" onClick={() => handleConfigChange(item.clave, item.valor.filter((_: any, idx: number) => idx !== i))} className="hover:text-rose-500 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input type="text" className="input-field-xs" placeholder="Presiona Enter para añadir..." onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.currentTarget.value.trim().toUpperCase();
                if (val) {
                  handleConfigChange(item.clave, [...(item.valor || []), val]);
                  e.currentTarget.value = '';
                }
              }
            }} />
          </div>
        );
      case 'IMAGE':
        return (
          <div className="clini-image-upload-group">
            <div className="clini-image-preview-container">
              {item.valor ? (
                <img src={item.valor} alt="Preview" className="clini-image-fit" />
              ) : (
                <ImageIcon className="clini-image-placeholder-icon" size={32} />
              )}
            </div>
            <label className="clini-image-upload-label">
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

  return (
    <div className="clini-config-container">
      <div className="clini-config-header-group">
        <h2 className="clini-title-main">Configuración del Sistema</h2>
        <p className="clini-subtitle">Administra los parámetros globales de forma dinámica.</p>
      </div>

      <div className="clini-config-grid">
        <div className="clini-config-sidebar">
          <div className="clini-config-nav-container">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id as any)}
                  className={cn("clini-config-nav-item", activeSection === section.id ? "clini-config-nav-item-active" : "clini-config-nav-item-inactive")}
                >
                  <Icon size={18} />
                  {section.label.split(' ').slice(1).join(' ')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="clini-config-card-content">
          {isLoading ? (
            <div className="clini-loading-overlay">
              <div className="clini-spinner-lg" />
            </div>
          ) : (
            <div className="clini-animate-fade">
              <div className={cn("clini-config-section-header", !['SEDES', 'ESPECIALIDADES', 'DICCIONARIOS'].includes(activeSection) ? "block" : "hidden")}>
                {permissions.puedeEditar && currentUser.perfil !== 'ADMINISTRADOR_SEDE' && !['SEDES', 'ESPECIALIDADES', 'DICCIONARIOS'].includes(activeSection) && (
                  <button onClick={() => handleSaveConfig(activeSection)} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                )}
              </div>

              <div className="clini-config-content-body">
                {/* 1. CAMPOS DINÁMICOS (Solo si no es Diccionarios y hay items) */}
                {activeSection !== 'DICCIONARIOS' && activeSection !== 'ESPECIALIDADES' && activeSection !== 'SEGURIDAD' && config.some(c => c.categoria === activeSection) && (
                  <div className="clini-config-field-group">
                    {config.filter(c => c.categoria === activeSection).map((item, index) => (
                      <div key={item.id} className="clini-config-field-item">
                        <label className="clini-label">{item.etiqueta}</label>
                        {currentUser.perfil === 'ADMINISTRADOR_SEDE' && item.tipoControl !== 'CHECKBOX' ? (
                          <div className="clini-read-only-field">
                            {item.tipoControl === 'COLOR' ? (
                              <div className="clini-flex-center-gap-2">
                                <div className="clini-read-only-color-swatch" style={{ backgroundColor: item.valor }} />
                                <span>{item.valor}</span>
                              </div>
                            ) : item.valor}
                          </div>
                        ) : (
                          renderControl(item)
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. SECCIONES DE ENTIDAD (Sedes / Especialidades) */}
                {activeSection === 'SEDES' && (
                  <div className="clini-config-section-wrapper">
                    <div>
                      <h4 className="clini-title-section">Sedes Físicas</h4>
                      <p className="clini-form-input-info-large">Administra las ubicaciones y horarios de atención de tus centros.</p>
                    </div>
                  <DataTable 
                    title=""
                    data={permissions.verTodo ? sedes : sedes.filter(s => s.idSede === currentUser.sede)}
                    columns={[ 
                      { header: 'Nombre', accessor: 'nombreSede', sortable: true, sortKey: 'nombreSede' },
                      { header: 'Dirección', accessor: 'direccion' },
                      { header: 'Estado', accessor: (s: Sede) => <span className={cn("clini-badge clini-badge-status-small", s.estado ? "clini-badge-status-success" : "clini-badge-status-neutral")}>{s.estado ? 'Activo' : 'Inactivo'}</span> }
                    ]}
                    onAdd={() => { setSelectedSede(null); setIsSedeModalOpen(true); }}
                    onEdit={(s) => { setSelectedSede(s); setIsSedeModalOpen(true); }}
                    onDelete={handleSedeDelete}
                  />
                  </div>
                )}

                {activeSection === 'ESPECIALIDADES' && (
                  <div className="clini-config-section-wrapper">
                    <div>
                      <h4 className="clini-title-section">Servicios Médicos</h4>
                      <p className="clini-form-input-info-large">Configura las especialidades y la duración estimada de las sesiones.</p>
                    </div>
                  <DataTable 
                    title=""
                    data={especialidades}
                    columns={[ 
                      { header: 'Especialidad', accessor: 'nombre', sortable: true, sortKey: 'nombre' },
                      { header: 'Duración', accessor: (e: Especialidad) => <span className="font-bold text-primary">{e.duracionSesion} min</span> },
                      { header: 'Estado', accessor: (e: Especialidad) => <span className={cn("clini-badge clini-badge-status-small", e.estado ? "clini-badge-status-success" : "clini-badge-status-neutral")}>{e.estado ? 'Activo' : 'Inactivo'}</span> }
                    ]}
                    onAdd={() => { setSelectedEspecialidad(null); setIsEspecialidadModalOpen(true); }}
                    onEdit={(e) => { setSelectedEspecialidad(e); setIsEspecialidadModalOpen(true); }}
                    onDelete={handleEspecialidadDelete}
                  />
                  </div>
                )}

                {/* 3. SEGURIDAD (Matriz + Auditoría) */}
                {activeSection === 'SEGURIDAD' && (
                  <div className="clini-security-matrix-wrapper">
                    <div className="clini-matrix-header">
                      <div className="clini-security-toolbar">
                        <div>
                          <h4 className="clini-title-section">Matriz de Roles y Accesos</h4>
                          <p className="text-xs text-slate-500">Define los permisos granulares por perfil y módulo.</p>
                        </div>
                        <div className="clini-security-search-group clini-flex-center-gap-3">
                          <div className="clini-input-group">
                            <Search className="clini-input-icon" size={14} />
                            <input
                              type="text" 
                              placeholder="Buscar perfil o módulo..." 
                              className="clini-security-search-input"
                              value={searchMatriz}
                              onChange={(e) => setSearchMatriz(e.target.value)}
                            />
                          </div>
                          <button 
                          onClick={() => setIsPermisoModalOpen(true)} 
                          className="btn-primary-sm"
                        >
                          <Plus size={14} /> Nuevo Permiso
                        </button>
                        </div>
                      </div>
                      <div className="clini-table-dense-wrapper">
                        <table className="clini-table-dense">
                          <thead className="clini-table-dense-thead">
                            <tr>
                              <th className="clini-table-dense-th">Módulo</th><th className="clini-table-dense-th">Perfil</th>
                              {['acceso', 'verTodo', 'puedeCrear', 'puedeEditar', 'puedeEliminar', 'filtrarPersonas'].map(f => (
                                <th key={f} className="clini-table-dense-th-center">{f.replace(/([A-Z])/g, ' $1')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="clini-table-body-divide">
                            {permisosEditados
                              .filter(p => p.perfil !== 'SUPER_ADMIN')
                              .filter(p => 
                                p.perfil.toLowerCase().includes(searchMatriz.toLowerCase()) || 
                                p.modulo.toLowerCase().includes(searchMatriz.toLowerCase())
                              ).map((p, i) => (
                              <tr key={i} className="clini-table-row-hover">
                                <td className="clini-table-dense-td-bold">{p.modulo}</td>
                                <td className="clini-table-dense-td">{p.perfil}</td>
                                {['acceso', 'verTodo', 'puedeCrear', 'puedeEditar', 'puedeEliminar', 'filtrarPersonas'].map(f => (
                                  <td key={f} className="clini-table-dense-td-center">
                                    <button 
                                      onClick={() => handleTogglePermiso(p.perfil, p.modulo, f as any)} 
                                      className={cn("clini-toggle-btn", p[f as keyof Permiso] ? "clini-toggle-btn-active" : "clini-toggle-btn-inactive")} 
                                      disabled={currentUser.perfil === 'ADMINISTRADOR_SEDE'}
                                    >{p[f as keyof Permiso] ? <Check size={14} /> : <X size={14} />}</button>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="clini-footer-divider">
                      <DataTable title="Registro de Auditoría" data={auditoria} columns={[{ header: 'Fecha', accessor: (a: Auditoria) => <span className="text-[10px]">{new Date(a.fecha).toLocaleString()}</span> }, { header: 'Usuario', accessor: 'nombreUsuario' }, { header: 'Acción', accessor: (a: Auditoria) => <span className={cn("clini-badge clini-badge-audit", a.accion === 'INSERT' ? "clini-badge-audit-insert" : "clini-badge-audit-update")}>{a.accion}</span> }, { header: 'Tabla', accessor: 'tabla' }]} searchPlaceholder="Buscar logs..." searchFields={['nombreUsuario', 'tabla', 'accion']} />
                    </div>
                  </div>
                )}

                {/* 4. DICCIONARIOS (Submenú Dinámico) */}
                {activeSection === 'DICCIONARIOS' && (
                  <div className="clini-dict-wrapper">
                    {/* Sidebar de Grupos de Diccionarios */}
                    <div className="clini-dict-sidebar-container">
                      <p className="clini-dict-sidebar-title">Maestros del Sistema</p>
                      {Array.from(new Set(config.filter(c => c.categoria === 'DICCIONARIOS').map(c => c.id.split('-')[0]))).sort().map(prefix => {
                        const groupTitle = {
                          'DOC': 'Tipos de Documento',
                          'PAY': 'Medios de Pago',
                          'MON': 'Monedas del Sistema',
                          'MOD': 'Modalidades de Atención'
                        }[prefix as string] || `Grupo ${prefix}`;

                        return ( // Added 'group' class to clini-dict-nav-item
                          <button 
                            key={prefix} 
                            onClick={() => setSelectedDictionaryKey(prefix)} 
                            className={cn("clini-dict-nav-item group", selectedDictionaryKey === prefix ? "clini-config-nav-item-active" : "text-slate-500 hover:bg-slate-50")}
                          >
                            {groupTitle} 
                            <ChevronRight size={14} className={cn("transition-transform", selectedDictionaryKey === prefix ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Contenido del Grupo Seleccionado */}
                    <div className="clini-dict-content-area">
                      {selectedDictionaryKey ? (
                        <div className="space-y-4 clini-animate-slide">
                          <div className="clini-dict-header-row">
                            <div>
                              <h4 className="clini-title-section uppercase tracking-tight">
                                {{
                                  'DOC': 'Tipos de Documento',
                                  'PAY': 'Medios de Pago',
                                  'MON': 'Monedas del Sistema',
                                  'MOD': 'Modalidades de Atención'
                                }[selectedDictionaryKey as string] || 'Gestión de Diccionario'}
                              </h4>
                              <p className="text-xs text-slate-500">Administra los valores de los catálogos maestros.</p>
                            </div> 
                            <button 
                              onClick={() => { setEditingDictItem(null); setIsDictModalOpen(true); }} 
                              className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                            >
                              <Plus size={14} />
                              Nuevo Registro
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {config
                              .filter(c => c.categoria === 'DICCIONARIOS' && c.id.startsWith(selectedDictionaryKey))
                              .map(dicItem => (
                                <div key={dicItem.id} className="clini-dict-item-card group">
                                  <div className="flex items-center gap-4">
                                    <div className="clini-dict-icon-box group-hover:text-primary">
                                      <LayoutGrid size={20} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-700">{dicItem.etiqueta}</p>
                                      <p className="text-[10px] text-slate-400 font-mono uppercase">{dicItem.clave}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => handleDeleteDictionaryItem(dicItem)} // Added 'clini-action-btn-icon' and 'clini-action-btn-icon-rose'
                                      className={cn("clini-action-btn-icon", "clini-action-btn-icon-rose")}
                                      title="Eliminar registro"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => { setEditingDictItem(dicItem); setIsDictModalOpen(true); }} // Added 'clini-action-btn-icon' and 'clini-action-btn-icon-slate'
                                      className={cn("clini-action-btn-icon", "clini-action-btn-icon-slate")}
                                      title="Editar registro"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                              </div>
                              ))
                            }
                          </div>

                        </div>
                      ) : (
                        <div className="clini-dict-empty-state">
                          <div className="clini-dict-empty-icon-box">
                            <LayoutGrid size={40} />
                          </div>
                          <p className="text-sm font-bold text-slate-600">Gestión de Catálogos</p>
                          <p className="text-xs text-slate-400 max-w-[200px] mt-1">Seleccione una categoría de la izquierda para administrar sus elementos.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
        <form onSubmit={handleSedeSave} className="space-y-6">
          <div className="clini-form-grid">
            <div className="clini-form-group">
              <label className="clini-label">Nombre de Sede</label>
              <input name="nombreSede" type="text" className="input-field" defaultValue={selectedSede?.nombreSede} required />
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Dirección</label>
              <input name="direccion" type="text" className="input-field" defaultValue={selectedSede?.direccion} required />
            </div>
          </div>
          <div className="space-y-4">
            <label className="clini-label-with-icon">
              <Clock size={16} />
              Horario de Atención por Día
            </label>
            <div className="clini-table-dense-wrapper">
              <table className="clini-table-dense">
                <thead className="clini-table-dense-thead">
                  <tr>
                    <th className="clini-table-dense-th-left">Día</th>
                    <th className="clini-table-dense-th-uppercase">Activo</th>
                    <th className="clini-table-dense-th-uppercase">Inicio</th>
                    <th className="clini-table-th-uppercase">Fin</th>
                  </tr>
                </thead>
                <tbody className="clini-table-body-divide">
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
                      <td className="clini-table-dense-td-medium">{h.dia}</td>
                      <td className="clini-table-dense-td-center-checkbox">
                        <input 
                          type="checkbox" 
                          defaultChecked={h.activo} 
                          className="clini-checkbox-base-focus"
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
                          className="clini-time-input-inline"
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
                          className="clini-time-input-inline"
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

          <div className="clini-form-actions">
            <button type="button" onClick={() => setIsSedeModalOpen(false)} className="clini-btn-secondary-xs">Cancelar</button>
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
          <div className="clini-form-group">
            <label className="clini-label">Nombre de Especialidad</label>
            <input name="nombre" type="text" className="input-field" defaultValue={selectedEspecialidad?.nombre} required />
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Duración de Sesión (minutos)</label>
            <input 
              name="duracionSesion" 
              type="number" 
              className="input-field disabled:bg-slate-100 disabled:text-slate-400" 
              defaultValue={selectedEspecialidad?.duracionSesion || config.find(c => c.clave === 'DURACION_SESION_GLOBAL')?.valor || 45} 
              required 
              disabled={config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor === 'GLOBAL'}
            />
            {config.find(c => c.clave === 'TIPO_DURACION_SESION')?.valor === 'GLOBAL' && (
              <p className="clini-form-input-disabled-info">La duración se gestiona desde la configuración global de Agenda.</p>
            )}
          </div>
          <div className="clini-form-actions">
            <button type="button" onClick={() => setIsEspecialidadModalOpen(false)} className="clini-btn-secondary-xs">Cancelar</button>
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
          <div className="clini-form-group">
            <label className="clini-label">Perfil / Rol</label>
            <select name="perfil" className="input-field" required>
              {config
                .filter(c => c.categoria === 'SEGURIDAD' && c.clave.startsWith('PERFIL_'))
                .map(perf => (
                  <option key={perf.id} value={perf.valor}>{perf.etiqueta.replace('Perfil: ', '')}</option>
                ))
              }
            </select>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Módulo del Sistema</label>
            <select name="modulo" className="input-field" required>
              {config
                .filter(c => c.categoria === 'SEGURIDAD' && c.clave.startsWith('MOD_'))
                .map(mod => (
                  <option key={mod.id} value={mod.valor}>{mod.etiqueta.replace('Módulo: ', '')}</option>
                ))
              }
            </select>
          </div>
          <div className="clini-permiso-grid">
            {[
              { id: 'acceso', label: 'Acceso' },
              { id: 'verTodo', label: 'Ver Todo' },
              { id: 'puedeCrear', label: 'Crear' },
              { id: 'puedeEditar', label: 'Editar' },
              { id: 'puedeEliminar', label: 'Eliminar' },
              { id: 'filtrarPersonas', label: 'Filtrar' }
            ].map(f => (
              <label key={f.id} className="clini-permiso-label">
                <input type="checkbox" name={f.id} className="clini-checkbox-base-focus" /> {f.label}
              </label>
            ))}
          </div>
          <div className="clini-form-actions">
            <button type="button" onClick={() => setIsPermisoModalOpen(false)} className="clini-btn-secondary-xs">Cancelar</button>
            <button type="submit" className="btn-primary">Crear</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDictModalOpen}
        onClose={() => setIsDictModalOpen(false)}
        title={editingDictItem ? "Editar Elemento" : "Nuevo Elemento de Catálogo"}
      >
        <form onSubmit={handleSaveDictionaryItem} className="space-y-4">
          <div className="clini-form-group">
            <label className="clini-label">Etiqueta Visible</label>
            <input name="etiqueta" type="text" className="input-field" defaultValue={editingDictItem?.etiqueta} placeholder="Ej: Pago con Cripto" required />
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Valor Interno / Código</label>
            <input 
              name="valor" 
              type="text" 
              className="clini-input-field-mono" 
              defaultValue={editingDictItem?.valor} 
              placeholder="Ej: CRIPTO" 
              required 
            />
          </div>
          <div className="clini-form-actions">
            <button type="button" onClick={() => setIsDictModalOpen(false)} className="clini-btn-secondary-xs">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Registro</button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Navegación (Dirty Check) */}
      <Modal
        isOpen={isNavigationModalOpen}
        onClose={() => setIsNavigationModalOpen(false)}
        title="Cambios sin guardar"
      >
        <div className="clini-navigation-modal-content">
          <div className="clini-navigation-modal-icon">
            <History size={20} /> {/* Icono de historial para indicar cambios */}
          </div>
          <div className="clini-form-group">
            <p className="clini-navigation-modal-title">¿Deseas salir de la sección?</p>
            <p className="clini-navigation-modal-text">
              Tienes modificaciones pendientes. Si sales ahora, los cambios se perderán definitivamente.
            </p>
          </div>
          <div className="clini-navigation-modal-buttons">
            <button onClick={() => setIsNavigationModalOpen(false)} className="clini-navigation-modal-btn-primary">
              Seguir Editando
            </button>
            <button onClick={handleDiscardChanges} className="clini-navigation-modal-btn-secondary">
              Descartar y Salir
            </button>
          </div>
        </div>
      </Modal>

      {/* Overlay de Procesamiento (Transition Popup) */}
      {isProcessing && (
        <div className="clini-processing-overlay clini-animate-fade">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clini-processing-card"
          >
            <Loader2 className="clini-processing-spinner" />
            <p className="clini-processing-text">Procesando</p>
          </motion.div>
        </div>
      )}

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