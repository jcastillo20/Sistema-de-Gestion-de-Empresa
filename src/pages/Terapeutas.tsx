import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { Terapeuta, Sede, Especialidad, Horario, BloqueHorario } from '../types';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  Award, 
  Building2, 
  User, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit,
  Search,
  Download
} from 'lucide-react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { getExportContext } from '../utils/exportUtils';
import { ExportButton } from '../components/common/ExportButton';

interface TerapeutasProps {
  currentUser: any;
}

export default function Terapeutas({ currentUser }: TerapeutasProps) {
  const navigate = useNavigate();
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedTerapeuta, setSelectedTerapeuta] = useState<Terapeuta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sede: 'ALL'
  });
  
  const permissions = usePermissions(currentUser, 'terapeutas');

  // Protección del componente: Si no hay usuario, no renderiza nada (redirigido por App.tsx o Layout)
  if (!currentUser) {
    return null; 
  }

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <ShieldCheck size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
          No tienes los permisos necesarios para acceder al módulo de terapeutas. 
          Por favor, contacta con el administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  useEffect(() => {
    // Solo carga datos si hay una sesión válida y el usuario tiene acceso al módulo
    if (currentUser && permissions.acceso) {
      loadData();
    }
  }, [currentUser?.sede, permissions.acceso]);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const sedeFilter = permissions.verTodo ? undefined : currentUser.sede;
      const [terapeutasData, sedesData, especialidadesData, configData] = await Promise.all([
        apiService.getTerapeutas(sedeFilter),
        apiService.getSedes(),
        apiService.getEspecialidades(),
        apiService.getConfiguracion()
      ]);
      setTerapeutas(terapeutasData);
      setSedes(sedesData);
      setEspecialidades(especialidadesData.filter(e => e.estado));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async (filteredData?: Terapeuta[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || terapeutas;
    const dataToExport = sourceData.map(t => {
      const row: any = {
        'Terapeuta': `${t.nombres} ${t.apellidoPaterno}`,
        'Colegiatura': t.colegiatura || 'N/A',
        'Especialidades': (t.especialidades || []).join(', '),
        'Correo': t.correo,
        'Teléfono': t.telefono,
        'Estado': t.estado ? 'Activo' : 'Inactivo'
      };
      if (permissions.verTodo) row['Sede'] = t.sede;
      return row;
    });

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Personal Médico',
      fileName: 'Listado_Terapeutas',
      branding: branding as any,
      context,
      showSummary: true
    });
  };

  const handleExportPDF = async (filteredData?: Terapeuta[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || terapeutas;
    const dataToExport = sourceData.map(t => {
      const row: any = {
        'Terapeuta': `${t.nombres} ${t.apellidoPaterno}`,
        'Colegiatura': t.colegiatura || '-',
        'Especialidades': (t.especialidades || []).slice(0, 2).join(', '),
        'Estado': t.estado ? 'Activo' : 'Inactivo'
      };
      if (permissions.verTodo) row['Sede'] = t.sede;
      return row;
    });

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Personal Médico',
      fileName: 'Listado_Personal_Medico',
      branding: branding as any,
      context
    });
  };

  const validateForm = (formData: any) => {
    if (!formData.nombres || !formData.apellidoPaterno || !formData.especialidades || formData.especialidades.length === 0) {
      return 'Por favor complete los campos obligatorios.';
    }
    if (!VALIDATION_RULES.TEXT_ONLY.test(formData.nombres) || !VALIDATION_RULES.TEXT_ONLY.test(formData.apellidoPaterno)) {
      return 'Los nombres y apellidos solo deben contener letras.';
    }
    if (formData.correo && !VALIDATION_RULES.EMAIL.test(formData.correo)) {
      return 'El formato del correo electrónico no es válido.';
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Permission check
    if (selectedTerapeuta && !permissions.puedeEditar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para editar terapeutas.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }
    if (!selectedTerapeuta && !permissions.puedeCrear) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para crear terapeutas.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    // Get multiple specialties from checkboxes
    const selectedSpecs = especialidades
      .filter(e => formData.get(`spec_${e.id}`) === 'on')
      .map(e => e.nombre);
    
    const finalData = { ...data, especialidades: selectedSpecs };
    
    const error = validateForm(finalData);
    if (error) {
      setAlertConfig({ title: 'Error de Validación', message: error, type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      if (selectedTerapeuta) {
        await apiService.updateTerapeuta(selectedTerapeuta.id, { ...finalData, estado: true }, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Terapeuta Actualizado', message: 'Los datos se han guardado correctamente.', type: 'success' });
      } else {
        await apiService.createTerapeuta({ ...finalData, estado: true }, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Terapeuta Registrado', message: 'El nuevo terapeuta ha sido creado con éxito.', type: 'success' });
      }
      
      setIsModalOpen(false);
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo completar la operación.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleDelete = async (t: Terapeuta) => {
    if (!permissions.puedeEliminar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para eliminar terapeutas.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      await apiService.deleteTerapeuta(t.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado del terapeuta ha sido modificado correctamente.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado del terapeuta.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleOpenHorario = (t: Terapeuta) => {
    navigate(`/terapeutas/${t.id}/horarios`);
  };

  const filteredTerapeutas = useMemo(() => {
    return terapeutas.filter(t => {
      const matchSearch = filters.search === '' || 
        (t.nombres || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.apellidoPaterno || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.especialidades || []).some(e => (e || '').toLowerCase().includes(filters.search.toLowerCase())) ||
        (t.colegiatura || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchSede = filters.sede === 'ALL' || t.sede === filters.sede;
      return matchSearch && matchSede;
    });
  }, [terapeutas, filters]);

  const columns: any[] = [
    { 
      header: 'Terapeuta', 
      accessor: (t: Terapeuta) => (
        <div className="pg-cell-person">
          <div className="pg-avatar flex items-center justify-center bg-primary/10 border border-primary shadow-sm">
            <span className="text-primary font-black text-[10px] tracking-tighter">
              {t.nombres.charAt(0).toUpperCase()}{t.apellidoPaterno.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="pg-cell-person-info">
            <div className="flex items-center gap-2">
              <p className="pg-cell-name font-black text-slate-900 leading-tight">{t.nombres} {t.apellidoPaterno}</p>
            </div>
            <p className="pg-cell-doc text-[11px] font-medium text-slate-400">{t.colegiatura || 'Sin Colegiatura'}</p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'apellidoPaterno'
    },
    { 
      header: 'Especialidades', 
      accessor: (t: Terapeuta) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(t.especialidades || []).slice(0, 2).map((esp: string, idx: number) => (
            <span key={idx} className="clini-badge clini-badge-primary whitespace-nowrap">
              {esp}
            </span>
          ))}
          {(t.especialidades || []).length > 2 && (
              <span className="clini-badge clini-badge-neutral">
                +{(t.especialidades || []).length - 2}
              </span>
            )}
        </div>
      ),
    },
    { 
      header: 'Contacto', 
      accessor: (t: Terapeuta) => (
        <div className="pg-cell-contact">
          <div className="pg-contact-row">
            <Mail size={14} className="pg-contact-icon" />
            <span className="truncate max-w-[150px]">{t.correo}</span>
          </div>
          <div className="pg-contact-row">
            <Phone size={14} className="pg-contact-icon" />
            <span>{t.telefono}</span>
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
      accessor: (t: Terapeuta) => (
        <span className={cn(
          "pg-chip", 
          t.sede === 'ALL' ? "pg-chip--primary" : "pg-chip--info"
        )}>
          <Building2 size={12} className="shrink-0" />
          {t.sede}
        </span>
      ), 
      sortable: true, 
      sortKey: 'sede' 
    });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (t: Terapeuta) => (
      <div className={cn("pg-status-pill", t.estado ? "pg-status--active" : "pg-status--inactive")}>
        <span className={cn("pg-status-dot", t.estado ? "pg-dot--active" : "pg-dot--inactive")} />
        {t.estado ? 'Activo' : 'Inactivo'}
      </div>
    ),
    sortable: true,
    sortKey: 'estado'
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="clini-title-main text-3xl font-black text-slate-900 tracking-tight">Gestión de Terapeutas</h2>
          <p className="clini-subtitle text-slate-400 font-medium">Administra el personal médico y sus especialidades.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, especialidad o colegiatura..."
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
            onExcel={() => handleExportExcel(filteredTerapeutas)}
            onPdf={() => handleExportPDF(filteredTerapeutas)}
            showLabel={false}
            className="rounded-full h-[44px] w-[44px] shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <DataTable 
        title="Listado de Terapeutas"
        data={filteredTerapeutas}
        columns={columns}
        showSearch={false}
        showFilters={false}
        onAdd={permissions.puedeCrear ? () => {
          setSelectedTerapeuta(null);
          setIsModalOpen(true);
        } : undefined}
        onEdit={permissions.puedeEditar ? (t) => {
          setSelectedTerapeuta(t);
          setIsModalOpen(true);
        } : undefined}
        onDelete={permissions.puedeEliminar ? handleDelete : undefined}
        customActions={(t) => (
          <button 
            onClick={() => handleOpenHorario(t)}
            className="clini-action-btn-emerald"
            title="Gestionar Horarios"
          >
            <Calendar size={18} />
          </button>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTerapeuta ? 'Editar Terapeuta' : 'Nuevo Terapeuta'}
      >
        <form onSubmit={handleSave} className="clini-form-stack clini-space-y-ui-g">
          <div className="clini-form-grid">
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label">Nombres *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="nombres" type="text" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.nombres} required />
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label">Apellido Paterno *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoPaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.apellidoPaterno} required />
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label">Apellido Materno</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoMaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.apellidoMaterno} />
              </div>
            </div>
            <div className="clini-form-group md:col-span-2">
              <label className="clini-label">Servicios y Especialidades *</label>
              <div className="clini-checkbox-group">
                {especialidades.map(e => (
                  <label key={e.id} className="clini-checkbox-item group">
                    <input 
                      type="checkbox" 
                      name={`spec_${e.id}`}
                      className="clini-checkbox-input"
                      defaultChecked={selectedTerapeuta?.especialidades?.includes(e.nombre) || false}
                    />
                    <span className="clini-checkbox-label">{e.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label">Colegiatura</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Award size={18} />
                </div>
                <input name="colegiatura" type="text" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.colegiatura} />
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label">Sede Principal *</label>
              <div className="clini-input-group clini-relative"> 
                <div className="clini-input-icon">
                  <Building2 size={18} />
                </div>
                {permissions.verTodo ? (
                  <select name="sede" className="clini-input-field-icon-left input-field" defaultValue={selectedTerapeuta?.sede || currentUser.sede}>
                    {sedes.map(s => (
                      <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                    ))}
                  </select> 
                ) : (
                  <div className="clini-field-disabled-display">
                    {selectedTerapeuta?.sede || currentUser.sede}
                    <input type="hidden" name="sede" value={selectedTerapeuta?.sede || currentUser.sede} />
                  </div>
                )}
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c"> 
              <label className="clini-label">Teléfono</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Phone size={18} />
                </div>
                <input name="telefono" type="text" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.telefono} />
              </div>
            </div>
            <div className="clini-form-group clini-space-y-ui-c"> 
              <label className="clini-label">Correo</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Mail size={18} />
                </div>
                <input name="correo" type="email" className="clini-input-field-icon-left" defaultValue={selectedTerapeuta?.correo} />
              </div>
            </div>
          </div>
          <div className="clini-form-footer clini-flex-end-gap-3 clini-pt-ui-g clini-border-t-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {selectedTerapeuta ? 'Guardar Cambios' : 'Crear Terapeuta'}
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
