import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { Paciente, Sede } from '../types';
import { UserPlus, Mail, Phone, CreditCard, User, Building2, ShieldCheck } from 'lucide-react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '@/src/lib/utils';
import { apiService } from '../services/apiService';

interface PacientesProps {
  currentUser: any;
}

export default function Pacientes({ currentUser }: PacientesProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const permissions = usePermissions(currentUser, 'pacientes');

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <ShieldCheck size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
          No tienes los permisos necesarios para acceder al módulo de pacientes. 
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
      // Use permission verTodo to decide if we filter by sede
      const sedeFilter = permissions.verTodo ? undefined : currentUser.sede;
      const [pacientesData, sedesData] = await Promise.all([
        apiService.getPacientes(sedeFilter),
        apiService.getSedes()
      ]);
      setPacientes(pacientesData);
      setSedes(sedesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (formData: any) => {
    if (!formData.nombres || !formData.apellidoPaterno || !formData.documentoIdentidad) {
      return 'Por favor complete los campos obligatorios.';
    }
    if (!VALIDATION_RULES.TEXT_ONLY.test(formData.nombres) || !VALIDATION_RULES.TEXT_ONLY.test(formData.apellidoPaterno)) {
      return 'Los nombres y apellidos solo deben contener letras.';
    }
    if (formData.correo && !VALIDATION_RULES.EMAIL.test(formData.correo)) {
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
    if (selectedPaciente && !permissions.puedeEditar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para editar pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }
    if (!selectedPaciente && !permissions.puedeCrear) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para crear pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    const error = validateForm(data);
    if (error) {
      setAlertConfig({ title: 'Error de Validación', message: error, type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      if (selectedPaciente) {
        await apiService.updatePaciente(selectedPaciente.id, data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Paciente Actualizado', message: 'Los datos se han guardado correctamente.', type: 'success' });
      } else {
        await apiService.createPaciente(data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Paciente Registrado', message: 'El nuevo paciente ha sido creado con éxito.', type: 'success' });
      }
      
      setIsModalOpen(false);
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo completar la operación.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleDelete = async (p: Paciente) => {
    if (!permissions.puedeEliminar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para eliminar pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      await apiService.deletePaciente(p.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado del paciente ha sido modificado correctamente.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado del paciente.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const columns: any[] = [
    { 
      header: 'Paciente', 
      accessor: (p: Paciente) => (
        <div className="clini-table-entity-cell clini-flex-center-gap-3">
          <div className="clini-avatar-patient">
            {p.nombres.charAt(0).toUpperCase()}{p.apellidoPaterno.charAt(0).toUpperCase()}
          </div>
          <div className="clini-table-entity-info">
            <p className="clini-table-entity-name">{p.nombres} {p.apellidoPaterno}</p>
            <p className="clini-table-entity-detail">{p.tipoDocumento}: {p.documentoIdentidad}</p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'apellidoPaterno'
    },
    { 
      header: 'Contacto', 
      accessor: (p: Paciente) => (
        <div className="clini-table-contact-stack clini-space-y-ui-c">
          <div className="clini-table-contact-item clini-flex-center-gap-2">
            <Mail size={14} className="clini-table-contact-icon" />
            <span className="truncate max-w-[180px]">{p.correo}</span>
          </div>
          <div className="clini-table-contact-item clini-flex-center-gap-2">
            <Phone size={14} className="clini-table-contact-icon" />
            <span>{p.telefono}</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'correo'
    }
  ];

  if (permissions.verTodo) {
    columns.push({ 
      header: 'Sede', 
      accessor: (p: Paciente) => (
        <div className="clini-table-sede-badge clini-flex-center-gap-2">
          <Building2 size={12} className="shrink-0" />
          <span>{p.sede}</span>
        </div>
      ), 
      sortable: true, 
      sortKey: 'sede' 
    });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (p: Paciente) => (
      <span className={cn("clini-badge", p.estado ? "clini-badge-status-success" : "clini-badge-status-neutral")}>
        {p.estado ? 'Activo' : 'Inactivo'}
      </span>
    ),
    sortable: true,
    sortKey: 'estado'
  });

  return (
    <div className="clini-page-container clini-space-y-ui-g">
      <div className="clini-page-header clini-flex-between-center">
        <div>
          <h2 className="clini-title-main">Gestión de Pacientes</h2>
          <p className="clini-subtitle">Administra la información y expedientes de tus pacientes.</p>
        </div>
      </div>

      <DataTable 
        title="Listado de Pacientes"
        data={pacientes}
        columns={columns}
        searchPlaceholder="Buscar por nombre, apellido o DNI..."
        searchFields={['nombres', 'apellidoPaterno', 'apellidoMaterno', 'documentoIdentidad']}
        onAdd={permissions.puedeCrear ? () => {
          setSelectedPaciente(null);
          setIsModalOpen(true);
        } : undefined}
        onEdit={permissions.puedeEditar ? (p) => {
          setSelectedPaciente(p);
          setIsModalOpen(true);
        } : undefined}
        onDelete={permissions.puedeEliminar ? handleDelete : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
      >
        <form onSubmit={handleSave} className="clini-form-stack clini-space-y-ui-g">
          <div className="clini-form-grid">
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Nombres *</label>
              <div className="clini-input-group clini-relative">
                <User className="clini-input-icon" size={18} />
                <input name="nombres" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.nombres} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Paterno *</label>
              <input name="apellidoPaterno" type="text" className="input-field" defaultValue={selectedPaciente?.apellidoPaterno} required />
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Materno</label>
              <input name="apellidoMaterno" type="text" className="input-field" defaultValue={selectedPaciente?.apellidoMaterno} />
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Tipo de Documento *</label>
              <select name="tipoDocumento" className="input-field" defaultValue={selectedPaciente?.tipoDocumento || 'DNI'}>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Nro. Documento *</label>
              <input name="documentoIdentidad" type="text" className="input-field" placeholder="12345678" defaultValue={selectedPaciente?.documentoIdentidad} required />
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Sede *</label>
              <div className="clini-input-group clini-relative">
                <Building2 className="clini-input-icon" size={18} />
                {permissions.verTodo ? (
                  <select name="sede" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.sede || currentUser.sede}>
                    {sedes.map(s => ( 
                      <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                    ))}
                  </select>
                ) : (
                  <div className="clini-field-disabled-display">
                    {selectedPaciente?.sede || currentUser.sede}
                    <input type="hidden" name="sede" value={selectedPaciente?.sede || currentUser.sede} />
                  </div>
                )}
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Teléfono</label>
              <div className="clini-input-group clini-relative">
                <Phone className="clini-input-icon" size={18} />
                <input name="telefono" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.telefono} />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Correo Electrónico</label>
              <div className="clini-input-group clini-relative">
                <Mail className="clini-input-icon" size={18} />
                <input name="correo" type="email" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.correo} />
              </div>
            </div>
            <div className="clini-form-field clini-field-full clini-space-y-ui-c">
              <label className="clini-label">Responsable / Familiar</label>
              <input name="responsable" type="text" className="input-field" placeholder="Nombre del responsable" defaultValue={selectedPaciente?.responsable} />
            </div>
            <div className="clini-form-field clini-field-full clini-space-y-ui-c">
              <label className="clini-label">Motivo de Consulta</label>
              <textarea name="motivo" className="clini-textarea" placeholder="Breve descripción..." defaultValue={selectedPaciente?.motivo} />
            </div>
          </div>
          <div className="clini-form-footer clini-flex-end-gap-3 clini-pt-ui-g clini-border-t-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {selectedPaciente ? 'Guardar Cambios' : 'Registrar Paciente'}
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
