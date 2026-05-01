import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { Paciente, Sede } from '../types';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  ShieldCheck, 
  Package, 
  ShoppingCart, 
  Plus, 
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { getExportContext } from '../utils/exportUtils';
import { ExportButton } from '../components/common/ExportButton';

interface PacientesProps {
  currentUser: any;
}

export default function Pacientes({ currentUser }: PacientesProps) {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sede: 'ALL'
  });

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

  const handleExportExcel = async (filteredData?: Paciente[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || pacientes;
    const dataToExport = sourceData.map(p => {
      const row: any = {
        'Paciente': `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        'Documento': `${p.tipoDocumento} ${p.documentoIdentidad}`,
        'Correo': p.correo || 'N/A',
        'Teléfono': p.telefono || 'N/A',
        'Estado': p.estado ? 'Activo' : 'Inactivo'
      };
      if (permissions.verTodo) row['Sede'] = p.sede;
      return row;
    });

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Maestro de Pacientes',
      fileName: 'Listado_Pacientes',
      branding: branding as any,
      context,
      showSummary: true
    });
  };

  const handleExportPDF = async (filteredData?: Paciente[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || pacientes;
    const dataToExport = sourceData.map(p => {
      const row: any = {
        'Paciente': `${p.nombres} ${p.apellidoPaterno}`,
        'Documento': `${p.documentoIdentidad}`,
        'Correo': p.correo || '-',
        'Estado': p.estado ? 'Activo' : 'Inactivo'
      };
      if (permissions.verTodo) row['Sede'] = p.sede;
      return row;
    });

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Maestro de Pacientes',
      fileName: 'Listado_Pacientes',
      branding: branding as any,
      context
    });
  };

  const handleOpenPackages = (p: Paciente) => {
    navigate(`/pacientes/${p.id}/paquetes`);
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

  const filteredPacientes = useMemo(() => {
    return pacientes.filter(p => {
      const matchSearch = filters.search === '' || 
        (p.nombres || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.apellidoPaterno || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.documentoIdentidad || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchSede = filters.sede === 'ALL' || p.sede === filters.sede;
      return matchSearch && matchSede;
    });
  }, [pacientes, filters]);

  const columns: any[] = [
    { 
      header: 'Paciente', 
      accessor: (p: Paciente) => (
        <div className="pg-cell-person">
          <div className="pg-avatar flex items-center justify-center bg-primary/10 border border-primary shadow-sm hover:shadow-md transition-all">
            <span className="text-primary font-black text-[10px] tracking-tighter">
              {p.nombres.charAt(0).toUpperCase()}{p.apellidoPaterno.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="pg-cell-person-info">
            <div className="flex items-center gap-2">
              <p className="pg-cell-name font-black text-slate-900 leading-tight">
                {p.nombres} {p.apellidoPaterno}
              </p>
            </div>
            <p className="pg-cell-doc text-[11px] font-medium text-slate-400">
              {p.tipoDocumento}: {p.documentoIdentidad}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'apellidoPaterno'
    },
    { 
      header: 'Contacto', 
      accessor: (p: Paciente) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail size={14} className="text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{p.correo || 'Sin correo'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone size={14} className="text-slate-400 shrink-0" />
            <span>{p.telefono || 'Sin teléfono'}</span>
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
        <span className={cn(
          "pg-chip", 
          p.sede === 'ALL' ? "pg-chip--primary" : "pg-chip--info"
        )}>
          <Building2 size={12} className="shrink-0" />
          {p.sede}
        </span>
      ), 
      sortable: true, 
      sortKey: 'sede' 
    });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (p: Paciente) => (
      <div className={cn("pg-status-pill", p.estado ? "pg-status--active" : "pg-status--inactive")}>
        <span className={cn("pg-status-dot", p.estado ? "pg-dot--active" : "pg-dot--inactive")} />
        {p.estado ? 'Activo' : 'Inactivo'}
      </div>
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

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido o DNI..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="pl-12 pr-10 py-2.5 bg-slate-50/50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 w-full transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 pr-2">
          {permissions.verTodo && (
            <select 
              className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase text-slate-600 outline-none cursor-pointer min-w-[150px] focus:ring-4 focus:ring-primary/5 transition-all"
              value={filters.sede}
              onChange={e => setFilters({...filters, sede: e.target.value})}
            >
              <option value="ALL">Todas las sedes</option>
              {sedes.map(s => <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>)}
            </select>
          )}

          {(filters.search !== '' || (permissions.verTodo && filters.sede !== 'ALL')) && (
            <button 
              onClick={() => setFilters({search: '', sede: 'ALL'})}
              className="p-2.5 rounded-full border border-slate-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center h-[44px] w-[44px] shrink-0 active:scale-95 shadow-sm hover:shadow-md" 
              title="Limpiar Filtros"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}

          <div className="h-8 w-px bg-slate-100 mx-1" />

          <ExportButton 
            onExcel={() => handleExportExcel(filteredPacientes)}
            onPdf={() => handleExportPDF(filteredPacientes)}
            showLabel={false}
            className="rounded-full h-[44px] w-[44px] shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <DataTable 
        title="Listado de Pacientes"
        data={filteredPacientes}
        columns={columns}
        showSearch={false}
        showFilters={false}
        onAdd={permissions.puedeCrear ? () => {
          setSelectedPaciente(null);
          setIsModalOpen(true);
        } : undefined}
        onEdit={permissions.puedeEditar ? (p) => {
          setSelectedPaciente(p);
          setIsModalOpen(true);
        } : undefined}
        onDelete={permissions.puedeEliminar ? handleDelete : undefined}
        customActions={(p) => (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleOpenPackages(p)}
              className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors active:scale-95"
              title="Ver Expediente"
            >
              <Package size={16} />
            </button>
            <button 
              onClick={() => navigate('/ventas/nueva')}
              className="p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors active:scale-95"
              title="Nueva Venta"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        )}
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
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="nombres" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.nombres} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Paterno *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoPaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.apellidoPaterno} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Materno</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoMaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.apellidoMaterno} />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Tipo de Documento *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <select name="tipoDocumento" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.tipoDocumento || 'DNI'}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Nro. Documento *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="documentoIdentidad" type="text" className="clini-input-field-icon-left" placeholder="12345678" defaultValue={selectedPaciente?.documentoIdentidad} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Sede *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Building2 size={18} />
                </div>
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
                <div className="clini-input-icon">
                  <Phone size={18} />
                </div>
                <input name="telefono" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.telefono} />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Correo Electrónico</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Mail size={18} />
                </div>
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
