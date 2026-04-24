import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { Usuario, Sede, ConfiguracionDinamica } from '../types';
import { User, Mail, Phone, Shield, Eye, EyeOff, Building2, Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '@/src/lib/utils';
import { apiService } from '../services/apiService';

interface UsuariosProps {
  currentUser: any;
}

export default function Usuarios({ currentUser }: UsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allProfilesConfig, setAllProfilesConfig] = useState<ConfiguracionDinamica[]>([]);

  const permissions = usePermissions(currentUser, 'usuarios');

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <ShieldCheck size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
          No tienes los permisos necesarios para acceder al módulo de usuarios. 
          Por favor, contacta con el administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, [currentUser.sede]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sedeFilter = permissions.verTodo ? undefined : currentUser.sede;
      const [usuariosData, sedesData, configData] = await Promise.all([
        apiService.getUsuarios(sedeFilter),
        apiService.getSedes(),
        apiService.getConfiguracion()
      ]);
      setUsuarios(usuariosData);
      setSedes(sedesData);
      setAllProfilesConfig(configData.filter(c => c.categoria === 'SEGURIDAD' && c.clave.startsWith('PERFIL_')));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (formData: any) => {
    if (!formData.nombres || !formData.apellidoPaterno || !formData.nombreUsuario) {
      return 'Por favor complete los campos obligatorios.';
    }
    if (!VALIDATION_RULES.TEXT_ONLY.test(formData.nombres) || !VALIDATION_RULES.TEXT_ONLY.test(formData.apellidoPaterno)) {
      return 'Los nombres y apellidos solo deben contener letras.';
    }
    if (!VALIDATION_RULES.EMAIL.test(formData.correo)) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (formData.documentoIdentidad && !VALIDATION_RULES.DNI.test(formData.documentoIdentidad)) {
      return 'El DNI debe tener 8 dígitos.';
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Permission check
    if (selectedUsuario && !permissions.puedeEditar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para editar usuarios.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }
    if (!selectedUsuario && !permissions.puedeCrear) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para crear usuarios.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    // Si el perfil seleccionado es global y la sede es 'ALL', no la hacemos requerida
    const selectedProfileValue = data.perfil;
    const isSelectedProfileGlobal = PROFILES_WITH_SEDE_ACCESS.includes(selectedProfileValue);
    if (isSelectedProfileGlobal && data.sede === 'ALL') {
      // No es necesario validar la sede si es un perfil global y se seleccionó 'ALL'
    } else if (!data.sede) { // Si no es global y la sede está vacía
      setAlertConfig({ title: 'Error de Validación', message: 'La sede es obligatoria para este perfil.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const error = validateForm(data);
    if (error) {
      setAlertConfig({ title: 'Error de Validación', message: error, type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      if (selectedUsuario) {
        await apiService.updateUsuario(selectedUsuario.id, data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Usuario Actualizado', message: 'Los datos se han guardado correctamente.', type: 'success' });
      } else {
        await apiService.createUsuario(data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Usuario Registrado', message: 'El nuevo usuario ha sido creado con éxito.', type: 'success' });
      }
      
      setIsModalOpen(false);
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo completar la operación.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleDelete = async (u: Usuario) => {
    if (!permissions.puedeEliminar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para eliminar usuarios.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      await apiService.deleteUsuario(u.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado del usuario ha sido modificado correctamente.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado del usuario.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const columns: any[] = [
    { 
      header: 'Usuario', 
      accessor: (u: Usuario) => {
        return (
          <div className="pg-cell-person">
            <div className="pg-avatar flex items-center justify-center bg-primary/10 border border-primary shadow-sm">
              <span className="text-primary font-black text-[10px] tracking-tighter">
                {u.nombres.charAt(0).toUpperCase()}{u.apellidoPaterno.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="pg-cell-person-info">
              <div className="flex items-center gap-2">
                <span className="pg-cell-name font-black text-slate-900 leading-tight">{u.nombreUsuario}</span>
              </div>
              <span className="pg-cell-doc text-[11px] font-medium text-slate-400">
                {u.nombres} {u.apellidoPaterno}
              </span>
            </div>
          </div>
        );
      },
      sortable: true,
      sortKey: 'nombreUsuario'
    },
    { 
      header: 'Perfil', 
      accessor: (u: Usuario) => (
        <span className="pg-chip pg-chip--slate">
          <Shield size={12} className="shrink-0" />
          {u.perfil}
        </span>
      ),
      sortable: true,
      sortKey: 'perfil'
    },
    { 
      header: 'Contacto', 
      accessor: (u: Usuario) => (
        <div className="pg-cell-contact">
          <div className="pg-contact-row">
            <Mail size={14} className="pg-contact-icon" />
            <span className="truncate max-w-[150px]">{u.correo}</span>
          </div>
          <div className="pg-contact-row">
            <Phone size={14} className="pg-contact-icon" />
            <span>{u.telefono}</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'correo'
    }
  ];

  // Solo mostrar columna SEDE si el perfil tiene acceso
  if (permissions.verTodo) {
    columns.push({ 
      header: 'Sede', 
      accessor: (u: Usuario) => (
        <span className={cn(
          "pg-chip", 
          u.sede === 'ALL' ? "pg-chip--primary" : "pg-chip--info"
        )}>
          <Building2 size={12} className="shrink-0" />
          {u.sede}
        </span>
      ), 
      sortable: true, 
      sortKey: 'sede' 
    });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (u: Usuario) => (
      <div className={cn(
        "pg-status-pill", 
        u.estado ? "pg-status--active" : "pg-status--inactive"
      )}>
        <span className={cn("pg-status-dot", u.estado ? "pg-dot--active" : "pg-dot--inactive")} />
        {u.estado ? 'Activo' : 'Inactivo'}
      </div>
    ),
    sortable: true,
    sortKey: 'estado'
  });

  return (
    <div className="clini-page-container">
      <div className="clini-page-header">
        <div>
          <h2 className="clini-title-main">Gestión de Usuarios</h2>
          <p className="clini-subtitle">Administra los accesos y perfiles del personal del sistema.</p>
        </div>
      </div>

      <DataTable 
        title="Listado de Usuarios"
        data={usuarios}
        columns={columns}
        searchPlaceholder="Buscar por nombre de usuario, nombre real o perfil..."
        searchFields={['nombreUsuario', 'nombres', 'apellidoPaterno', 'perfil']}
        onAdd={permissions.puedeCrear ? () => {
          setSelectedUsuario(null);
          setIsModalOpen(true);
        } : undefined}
        onEdit={permissions.puedeEditar ? (u: Usuario) => {
          if (u.perfil === 'SUPER_ADMIN' && currentUser.perfil !== 'SUPER_ADMIN') {
            setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para editar al Super Administrador.', type: 'error' });
            setIsAlertOpen(true);
            return;
          }
          setSelectedUsuario(u);
          setIsModalOpen(true);
        } : undefined}
        onDelete={permissions.puedeEliminar ? (u: Usuario) => {
          if (u.perfil === 'SUPER_ADMIN') {
            setAlertConfig({ title: 'Acceso Denegado', message: 'El Super Administrador no puede ser eliminado.', type: 'error' });
            setIsAlertOpen(true);
            return;
          }
          handleDelete(u);
        } : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSave} className="clini-form-stack">
          <div className="clini-form-grid">
            <div className="clini-form-group">
              <label className="clini-label">Nombres *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><User size={18} /></div>
                <input name="nombres" type="text" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.nombres} required />
              </div>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Apellido Paterno *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><User size={18} /></div>
                <input name="apellidoPaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.apellidoPaterno} required />
              </div>
            </div>
            <div className="clini-form-group"> 
              <label className="clini-label">Apellido Materno</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><User size={18} /></div>
                <input name="apellidoMaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.apellidoMaterno} />
              </div>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Nombre de Usuario *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><UserCheck size={18} /></div>
                <input name="nombreUsuario" type="text" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.nombreUsuario} required />
              </div>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Contraseña *</label>
              <div className="clini-input-group clini-relative">
                <input name="contrasena" type={showPassword ? "text" : "password"} className="clini-input-field-right-action" defaultValue={selectedUsuario?.contrasena} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="clini-input-action">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="clini-form-group"> 
              <label className="clini-label">Perfil *</label>
              <select 
                name="perfil" 
                className="input-field"
                defaultValue={selectedUsuario?.perfil || 'RECEPCIONISTA'}
              >
                {allProfilesConfig.map(p => (
                  <option key={p.id} value={p.valor}>{p.etiqueta.replace('Perfil: ', '')}</option>
                ))}
              </select>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Sede *</label>
              <div className="clini-input-group">
                <div className="clini-input-icon"><Building2 size={18} /></div>
                {permissions.verTodo ? (
                  <select 
                    name="sede" 
                    className="clini-input-field-icon-left"
                    defaultValue={selectedUsuario?.sede || (PROFILES_WITH_SEDE_ACCESS.includes(selectedUsuario?.perfil || 'RECEPCIONISTA') ? 'ALL' : currentUser.sede)}
                    required={!PROFILES_WITH_SEDE_ACCESS.includes(selectedUsuario?.perfil || 'RECEPCIONISTA')}
                  >
                    {PROFILES_WITH_SEDE_ACCESS.includes(selectedUsuario?.perfil || 'RECEPCIONISTA') && (
                      <option value="ALL">Todas las Sedes</option>
                    )}
                    {sedes.map(s => (
                      <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                    ))}
                  </select> 
                ) : (
                  <div className="clini-read-only-field">
                    {selectedUsuario?.sede || currentUser.sede}
                    <input type="hidden" name="sede" value={selectedUsuario?.sede || currentUser.sede} />
                  </div>
                )}
              </div>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Correo Electrónico *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><Mail size={18} /></div>
                <input name="correo" type="email" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.correo} required />
              </div>
            </div>
            <div className="clini-form-group"> 
              <label className="clini-label">Teléfono</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon"><Phone size={18} /></div>
                <input name="telefono" type="text" className="clini-input-field-icon-left" defaultValue={selectedUsuario?.telefono} />
              </div>
            </div>
            <div className="clini-form-group">
              <label className="clini-label">Documento de Identidad</label>
              <div className="flex gap-2">
                <select name="tipoDocumento" className="input-field-xs w-1/3" defaultValue={selectedUsuario?.tipoDocumento || 'DNI'}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
                <input name="documentoIdentidad" type="text" className="input-field flex-1" defaultValue={selectedUsuario?.documentoIdentidad} />
              </div>
            </div>
          </div>
          <div className="clini-form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {selectedUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      <AlertModal 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type as any}
      />
    </div>
  );
}
