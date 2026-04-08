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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h3>
        <p className="text-slate-500 max-w-md">
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
      accessor: (u: Usuario) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            {u.nombres.charAt(0)}{u.apellidoPaterno.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{u.nombreUsuario}</p>
            <p className="text-xs text-slate-500">{u.nombres} {u.apellidoPaterno}</p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreUsuario'
    },
    { 
      header: 'Perfil', 
      accessor: (u: Usuario) => (
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{u.perfil}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'perfil'
    },
    { 
      header: 'Contacto', 
      accessor: (u: Usuario) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail size={14} className="text-slate-400" />
            {u.correo}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone size={14} className="text-slate-400" />
            {u.telefono}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'correo'
    }
  ];

  // Solo mostrar columna SEDE si el perfil tiene acceso
  if (permissions.verTodo) {
    columns.push({ header: 'Sede', accessor: 'sede', sortable: true, sortKey: 'sede' });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (u: Usuario) => (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        u.estado ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
      )}>
        {u.estado ? 'Activo' : 'Inactivo'}
      </span>
    ),
    sortable: true,
    sortKey: 'estado'
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h2>
          <p className="text-slate-500">Administra los accesos y perfiles del personal del sistema.</p>
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
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombres *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="nombres" type="text" className="input-field input-with-icon" defaultValue={selectedUsuario?.nombres} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Apellido Paterno *</label>
              <input name="apellidoPaterno" type="text" className="input-field" defaultValue={selectedUsuario?.apellidoPaterno} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Apellido Materno</label>
              <input name="apellidoMaterno" type="text" className="input-field" defaultValue={selectedUsuario?.apellidoMaterno} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre de Usuario *</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="nombreUsuario" type="text" className="input-field input-with-icon" defaultValue={selectedUsuario?.nombreUsuario} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contraseña *</label>
              <div className="relative">
                <input name="contrasena" type={showPassword ? "text" : "password"} className="input-field pr-10" defaultValue={selectedUsuario?.contrasena} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Perfil *</label>
              <select 
                name="perfil" 
                className="input-field" 
                defaultValue={selectedUsuario?.perfil || 'RECEPCIONISTA'}
                onChange={(e) => {
                  // Forcing a re-render or state update might be needed if sede logic depends on this immediately
                  // For now, the handleSave will re-evaluate based on the final form data
                }}
              >
                {allProfilesConfig.map(p => (
                  <option key={p.id} value={p.valor}>{p.etiqueta.replace('Perfil: ', '')}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sede *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {permissions.verTodo ? (
                  <select 
                    name="sede" 
                    className="input-field input-with-icon" 
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
                  <div className="input-field input-with-icon bg-slate-50 flex items-center text-slate-600">
                    {selectedUsuario?.sede || currentUser.sede}
                    <input type="hidden" name="sede" value={selectedUsuario?.sede || currentUser.sede} />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="correo" type="email" className="input-field input-with-icon" defaultValue={selectedUsuario?.correo} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="telefono" type="text" className="input-field input-with-icon" defaultValue={selectedUsuario?.telefono} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Documento de Identidad</label>
              <div className="flex gap-2">
                <select name="tipoDocumento" className="input-field w-1/3" defaultValue={selectedUsuario?.tipoDocumento || 'DNI'}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
                <input name="documentoIdentidad" type="text" className="input-field flex-1" defaultValue={selectedUsuario?.documentoIdentidad} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-all">
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
