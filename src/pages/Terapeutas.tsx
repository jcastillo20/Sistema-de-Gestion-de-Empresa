import React, { useState, useEffect } from 'react';
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
  Edit
} from 'lucide-react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '@/src/lib/utils';
import { apiService } from '../services/apiService';

interface TerapeutasProps {
  currentUser: any;
}

export default function Terapeutas({ currentUser }: TerapeutasProps) {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedTerapeuta, setSelectedTerapeuta] = useState<Terapeuta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Horarios State
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [allTerapeutaHorarios, setAllTerapeutaHorarios] = useState<Horario[]>([]);
  const [horarioFormData, setHorarioFormData] = useState<Partial<Horario>>({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    bloques: [],
    estado: true
  });
  const [activeTab, setActiveTab] = useState<'listado' | 'calendario'>('listado');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [configAgenda, setConfigAgenda] = useState<any>({});
  const [isAddingHorario, setIsAddingHorario] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    diasSemana: [] as string[],
    tipo: 'TRABAJO' as 'TRABAJO' | 'PAUSA',
    horaInicio: '08:00',
    horaFin: '12:00',
    estado: 'DISPONIBLE' as 'DISPONIBLE' | 'REFRIGERIO'
  });
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());

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
      
      const agendaConfig = configData.filter(c => c.categoria === 'AGENDA').reduce((acc, curr) => {
        acc[curr.clave] = curr.valor;
        return acc;
      }, {} as any);
      setConfigAgenda(agendaConfig);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
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

  // --- HORARIOS HANDLERS ---
  const handleOpenHorario = async (t: Terapeuta) => {
    setSelectedTerapeuta(t);
    setIsLoading(true);
    setActiveTab('listado');
    setIsAddingHorario(false);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    setFilterMonth(currentMonth);
    setFilterYear(currentYear);
    
    try {
      const allHorarios = await apiService.getHorarios(undefined, t.id);
      setAllTerapeutaHorarios(allHorarios);
      const existing = allHorarios.find(h => 
        h.mes === currentMonth && 
        h.año === currentYear &&
        h.estado
      );

      if (existing) {
        setSelectedHorario(existing);
        setHorarioFormData(JSON.parse(JSON.stringify(existing)));
      } else {
        setSelectedHorario(null);
        setHorarioFormData({
          idTerapeuta: t.id,
          nombreTerapeuta: `${t.nombres} ${t.apellidoPaterno}`,
          mes: currentMonth,
          año: currentYear,
          sede: t.sede,
          bloques: [],
          estado: true
        });
      }
      setIsHorarioModalOpen(true);
    } catch (error) {
      console.error('Error loading horario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (month: number, year: number) => {
    setFilterMonth(month);
    setFilterYear(year);
    if (!selectedTerapeuta) return;

    try {
      const allHorarios = await apiService.getHorarios(undefined, selectedTerapeuta.id);
      setAllTerapeutaHorarios(allHorarios);
      const existing = allHorarios.find(h => h.mes === month && h.año === year && h.estado);
      
      if (existing) {
        setSelectedHorario(existing);
        setHorarioFormData(JSON.parse(JSON.stringify(existing)));
      } else {
        setSelectedHorario(null);
        setHorarioFormData({
          idTerapeuta: selectedTerapeuta.id,
          nombreTerapeuta: `${selectedTerapeuta.nombres} ${selectedTerapeuta.apellidoPaterno}`,
          mes: month,
          año: year,
          sede: selectedTerapeuta.sede,
          bloques: [],
          estado: true
        });
      }
    } catch (error) {
      console.error('Error filtering horario:', error);
    }
  };

  const handleAddBloque = () => {
    const newBloque: BloqueHorario = {
      id: Math.random().toString(36).substr(2, 9),
      diasSemana: ['Lunes'],
      horaInicio: '08:00',
      horaFin: '12:00',
      tipo: 'TRABAJO',
      estado: 'DISPONIBLE'
    };
    setHorarioFormData(prev => ({
      ...prev,
      bloques: [...(prev.bloques || []), newBloque]
    }));
  };

  const handleRemoveBloque = (id: string) => {
    setHorarioFormData(prev => ({
      ...prev,
      bloques: prev.bloques?.filter(b => b.id !== id)
    }));
  };

  const handleUpdateBloque = (id: string, field: keyof BloqueHorario, value: any) => {
    setHorarioFormData(prev => {
      const updatedBloques = prev.bloques?.map(b => {
        if (b.id === id) {
          const updated = { ...b, [field]: value };
          if (field === 'tipo') {
            updated.estado = value === 'PAUSA' ? 'REFRIGERIO' : 'DISPONIBLE';
          }
          return updated;
        }
        return b;
      });
      return { ...prev, bloques: updatedBloques };
    });
  };

  const handleBulkAdd = () => {
    if (!bulkFormData.diasSemana || bulkFormData.diasSemana.length === 0) {
      setAlertConfig({ title: 'Atención', message: 'Debe seleccionar al menos un día.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const newStart = parseInt(bulkFormData.horaInicio.replace(':', ''));
    const newEnd = parseInt(bulkFormData.horaFin.replace(':', ''));

    if (newStart >= newEnd) {
      setAlertConfig({ title: 'Error de Horario', message: 'La hora de inicio debe ser menor a la hora de fin.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    // Validar solapamiento con bloques ya agregados en la lista local
    const conflicto = horarioFormData.bloques?.find(b => {
      const tieneDiaComun = b.diasSemana.some(d => bulkFormData.diasSemana.includes(d));
      if (!tieneDiaComun) return false;

      const bStart = parseInt(b.horaInicio.replace(':', ''));
      const bEnd = parseInt(b.horaFin.replace(':', ''));
      return newStart < bEnd && bStart < newEnd && b.tipo === bulkFormData.tipo;
    });

    if (conflicto) {
      const diasAfectados = conflicto.diasSemana.filter(d => bulkFormData.diasSemana.includes(d));
      setAlertConfig({
        title: 'Conflicto detectado',
        message: `Los días [${diasAfectados.join(', ')}] ya tienen un registro en el rango ${conflicto.horaInicio} - ${conflicto.horaFin}. Por favor, ajuste el horario o los días.`,
        type: 'error'
      });
      setIsAlertOpen(true);
      return;
    }

    const newBloque: BloqueHorario = {
      id: Math.random().toString(36).substr(2, 9),
      diasSemana: [...bulkFormData.diasSemana],
      horaInicio: bulkFormData.horaInicio,
      horaFin: bulkFormData.horaFin,
      tipo: bulkFormData.tipo,
      estado: bulkFormData.estado
    };

    setHorarioFormData(prev => ({
      ...prev,
      bloques: [...(prev.bloques || []), newBloque]
    }));
    setIsBulkAdding(false);
    setBulkFormData({
      diasSemana: [],
      tipo: 'TRABAJO',
      horaInicio: '08:00',
      horaFin: '12:00',
      estado: 'DISPONIBLE'
    });
  };

  const getDayName = (day: number) => {
    const date = new Date(filterYear, filterMonth - 1, day);
    return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
  };

  const getSessionDuration = () => {
    if (configAgenda.TIPO_DURACION_SESION === 'GLOBAL') {
      return parseInt(configAgenda.DURACION_SESION_GLOBAL) || 45;
    }
    const firstSpecName = selectedTerapeuta?.especialidades?.[0];
    const spec = especialidades.find(e => e.nombre === firstSpecName);
    return spec?.duracionSesion || 45;
  };

  const generateTimeSlots = () => {
    const duration = getSessionDuration();
    const slots = [];
    let currentMinutes = 8 * 60; // Start at 08:00
    const endMinutes = 21 * 60; // End at 21:00

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
      currentMinutes += duration;
    }
    return slots;
  };

  const handleNavigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    const prevMonth = newDate.getMonth();
    const prevYear = newDate.getFullYear();

    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCalendarDate(newDate);

    if (newDate.getMonth() !== prevMonth || newDate.getFullYear() !== prevYear) {
      handleFilterChange(newDate.getMonth() + 1, newDate.getFullYear());
    }
  };

  const handleSaveHorario = async () => {
    const bloques = horarioFormData.bloques || [];
    
    // Normalize day names to handle potential case/whitespace issues
    const normalizeDay = (day: string) => day.trim().toLowerCase();

    for (let i = 0; i < bloques.length; i++) {
      for (let j = i + 1; j < bloques.length; j++) {
        const b1 = bloques[i];
        const b2 = bloques[j];
        
        // Check if they share any days
        const sharedDays = b1.diasSemana.filter(day => 
          b2.diasSemana.some(d2 => normalizeDay(day) === normalizeDay(d2))
        );
        
        if (sharedDays.length > 0) {
          // Check for time overlap
          const start1 = parseInt(b1.horaInicio.replace(':', ''));
          const end1 = parseInt(b1.horaFin.replace(':', ''));
          const start2 = parseInt(b2.horaInicio.replace(':', ''));
          const end2 = parseInt(b2.horaFin.replace(':', ''));
          
          // Solo es error si se solapan bloques del MISMO TIPO
          if (start1 < end2 && start2 < end1 && b1.tipo === b2.tipo) {
            setAlertConfig({ 
              title: 'Error de Validación', 
              message: `El bloque ${b1.horaInicio}-${b1.horaFin} (${b1.diasSemana.join(', ')}) se solapa con ${b2.horaInicio}-${b2.horaFin} (${b2.diasSemana.join(', ')}) en los días: ${sharedDays.join(', ')}`, 
              type: 'error' 
            });
            setIsAlertOpen(true);
            return;
          }
        }
      }
    }

    try {
      const payload = {
        ...horarioFormData,
        usuarioCreacion: currentUser.nombreUsuario,
        fechaCreacion: new Date().toISOString()
      } as Horario;

      if (selectedHorario) {
        await apiService.updateHorario(selectedHorario.id, payload, currentUser.nombreUsuario);
      } else {
        await apiService.createHorario(payload, currentUser.nombreUsuario);
      }

      if (selectedTerapeuta) {
        const allHorarios = await apiService.getHorarios(undefined, selectedTerapeuta.id);
        setAllTerapeutaHorarios(allHorarios);
        const existing = allHorarios.find(h => h.mes === filterMonth && h.año === filterYear && h.estado);
        if (existing) {
          setSelectedHorario(existing);
          setHorarioFormData(JSON.parse(JSON.stringify(existing)));
        }
      }

      setIsHorarioModalOpen(false);
      setAlertConfig({ title: 'Éxito', message: 'Horario actualizado correctamente.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar el horario.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

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
          <h2 className="clini-title-main">Gestión de Terapeutas</h2>
          <p className="clini-subtitle">Administra el personal médico y sus especialidades.</p>
        </div>
      </div>

      <DataTable 
        title="Listado de Terapeutas"
        data={terapeutas}
        columns={columns}
        searchPlaceholder="Buscar por nombre, especialidad o colegiatura..."
        searchFields={['nombres', 'apellidoPaterno', 'especialidades', 'colegiatura']}
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

      {/* Modal de Horarios */}
      <Modal
        isOpen={isHorarioModalOpen}
        onClose={() => setIsHorarioModalOpen(false)}
        title={`Gestión de Horarios: ${selectedTerapeuta?.nombres} ${selectedTerapeuta?.apellidoPaterno}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Header Info & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-5 rounded-card border border-border">
            <div className="flex items-center gap-4">
              <div className="clini-avatar-patient w-14 h-14 rounded-2xl text-xl shadow-inner flex items-center justify-center font-bold">
                {selectedTerapeuta?.nombres.charAt(0)}
              </div>
              <div>
                <p className="clini-title-section">{selectedTerapeuta?.nombres} {selectedTerapeuta?.apellidoPaterno}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTerapeuta?.sede}</span>
                  <span className="w-1 h-1 rounded-full bg-border-medium"></span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    {configAgenda.TIPO_DURACION_SESION === 'GLOBAL' ? `Duración Global: ${configAgenda.DURACION_SESION_GLOBAL}m` : 'Duración por Especialidad'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sys-sm border border-border">
              <select 
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
                value={filterMonth}
                onChange={(e) => handleFilterChange(parseInt(e.target.value), filterYear)}
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
                value={filterYear}
                onChange={(e) => handleFilterChange(filterMonth, parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('listado')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'listado' ? "bg-white text-primary shadow-sys-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Clock size={16} />
              Listado
            </button>
            <button 
              onClick={() => setActiveTab('calendario')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'calendario' ? "bg-white text-primary shadow-sys-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Calendar size={16} />
              Calendario
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'listado' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Planificación Detallada</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Gestiona los bloques de tiempo específicos para el mes.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsBulkAdding(!isBulkAdding)}
                      className={cn(
                        "btn-secondary py-2 px-4 text-xs flex items-center gap-2",
                        isBulkAdding && "bg-indigo-600 text-white border-indigo-600"
                      )}
                    >
                      <Plus size={14} />
                      {isBulkAdding ? 'Cerrar Planificador' : 'Planificar Horario'}
                    </button>
                    {horarioFormData.bloques?.length > 0 && (
                      <button 
                        onClick={handleSaveHorario}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                      >
                        <Save size={14} />
                        Guardar Cambios
                      </button>
                    )}
                  </div>
                </div>

                {isBulkAdding && (
                  <div className="clini-config-section-wrapper bg-indigo-50/50 border-indigo-100 rounded-3xl p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-indigo-900">Configuración de Horario por Días de la Semana</h4>
                      <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">Genera bloques de forma masiva</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="clini-label ml-1">Días de la Semana</label>
                        <div className="flex flex-wrap gap-1">
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => {
                            const hasConflict = horarioFormData.bloques?.some(b => {
                              if (!b.diasSemana.includes(d)) return false;
                              const newStart = parseInt(bulkFormData.horaInicio.replace(':', ''));
                              const newEnd = parseInt(bulkFormData.horaFin.replace(':', ''));
                              const bStart = parseInt(b.horaInicio.replace(':', ''));
                              const bEnd = parseInt(b.horaFin.replace(':', ''));
                              return newStart < bEnd && bStart < newEnd;
                            });
                            const isSelected = bulkFormData.diasSemana.includes(d);

                            return (
                              <button
                                key={d}
                                onClick={() => {
                                  setBulkFormData(prev => ({
                                    ...prev,
                                    diasSemana: isSelected 
                                      ? prev.diasSemana.filter(day => day !== d)
                                      : [...prev.diasSemana, d]
                                  }));
                                }}
                                className={cn(
                                  "px-2 py-1 rounded-xl text-[10px] font-bold transition-all border relative",
                                  isSelected && !hasConflict && "bg-indigo-600 border-indigo-600 text-white shadow-sm",
                                  isSelected && hasConflict && "bg-rose-500 border-rose-500 text-white",
                                  !isSelected && !hasConflict && "bg-white border-indigo-100 text-indigo-400 hover:border-indigo-400",
                                  !isSelected && hasConflict && "bg-amber-50 border-amber-300 text-amber-600"
                                )}
                                title={hasConflict ? "Conflicto de horario detectado" : ""}
                              >
                                {d.substring(0, 3)}
                                {hasConflict && (
                                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {bulkFormData.diasSemana.some(d => horarioFormData.bloques?.some(b => b.diasSemana.includes(d) && parseInt(bulkFormData.horaInicio.replace(':', '')) < parseInt(b.horaFin.replace(':', '')) && parseInt(b.horaInicio.replace(':', '')) < parseInt(bulkFormData.horaFin.replace(':', '')))) && (
                          <p className="text-[9px] font-bold text-rose-500 animate-pulse flex items-center gap-1">
                            <AlertCircle size={10} />
                            Días seleccionados tienen conflictos de horario.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="clini-label ml-1">Tipo de Registro</label>
                        <select 
                          className="input-field py-1.5 text-xs bg-white"
                          value={bulkFormData.tipo}
                          onChange={(e) => setBulkFormData(prev => ({ ...prev, tipo: e.target.value as any, estado: e.target.value === 'PAUSA' ? 'REFRIGERIO' : 'DISPONIBLE' }))}
                        >
                          <option value="TRABAJO">TRABAJO / ATENCIÓN</option>
                          <option value="PAUSA">PAUSA / RECESO</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="clini-label ml-1">Hora Inicio</label>
                          <input 
                            type="time" 
                            className="input-field py-1.5 text-xs bg-white"
                            value={bulkFormData.horaInicio}
                            onChange={(e) => setBulkFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="clini-label ml-1">Hora Fin</label>
                          <input 
                            type="time" 
                            className="input-field py-1.5 text-xs bg-white"
                            value={bulkFormData.horaFin}
                            onChange={(e) => setBulkFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button onClick={handleBulkAdd} className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2">
                          <Plus size={14} />
                          Aplicar a Días Seleccionados
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(isAddingHorario || selectedHorario) ? (
                  <div className="clini-table-dense-wrapper">
                    <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                      <table className="clini-table-dense">
                        <thead className="clini-table-dense-thead sticky top-0 z-10">
                          <tr>
                            <th className="clini-table-dense-th">Día de Semana</th>
                            <th className="clini-table-dense-th">Tipo Registro</th>
                            <th className="clini-table-dense-th">H. Inicio</th>
                            <th className="clini-table-dense-th">H. Fin</th>
                            <th className="clini-table-dense-th">Estado Inicial</th>
                            <th className="clini-table-dense-th-center">Gestión</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {horarioFormData.bloques?.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)).map((bloque) => (
                            <tr key={bloque.id} className="clini-table-row-hover">
                              <td className="clini-table-dense-td">
                                <div className="flex flex-col">
                                  <span className="font-bold text-text-primary">{bloque.diasSemana.join(', ')}</span>
                                </div>
                              </td>
                              <td className="clini-table-dense-td">
                                <select 
                                  className="clini-time-input-inline"
                                  value={bloque.tipo}
                                  onChange={(e) => handleUpdateBloque(bloque.id, 'tipo', e.target.value)}
                                >
                                  <option value="TRABAJO">TRABAJO</option>
                                  <option value="PAUSA">PAUSA</option>
                                </select>
                              </td>
                              <td className="clini-table-dense-td">
                                <input 
                                  type="time" 
                                  className="clini-time-input-inline"
                                  value={bloque.horaInicio}
                                  onChange={(e) => handleUpdateBloque(bloque.id, 'horaInicio', e.target.value)}
                                />
                              </td>
                              <td className="clini-table-dense-td">
                                <input 
                                  type="time" 
                                  className="clini-time-input-inline"
                                  value={bloque.horaFin}
                                  onChange={(e) => handleUpdateBloque(bloque.id, 'horaFin', e.target.value)}
                                />
                              </td>
                              <td className="clini-table-dense-td">
                                <div className="clini-flex-center-gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: configAgenda[`COLOR_${bloque.estado}`] }}></div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{bloque.estado}</span>
                                </div>
                              </td>
                              <td className="clini-table-dense-td-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => {
                                      setBulkFormData({
                                        diasSemana: bloque.diasSemana,
                                        tipo: bloque.tipo,
                                        horaInicio: bloque.horaInicio,
                                        horaFin: bloque.horaFin,
                                        estado: bloque.estado
                                      });
                                      setIsBulkAdding(true);
                                      handleRemoveBloque(bloque.id);
                                    }}
                                    className="clini-action-btn-icon clini-action-btn-icon-slate"
                                    title="Editar registro"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveBloque(bloque.id)}
                                    className="clini-action-btn-icon clini-action-btn-icon-rose"
                                    title="Eliminar registro"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button 
                      onClick={handleAddBloque}
                      className="w-full py-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold text-xs border-t border-slate-100"
                    >
                      <Plus size={14} />
                      Añadir Registro Manual
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-card border border-slate-100 text-center">
                    <div className="clini-dict-empty-icon-box">
                      <Calendar size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No hay planificación registrada para este mes.</p>
                    <button 
                      onClick={() => {
                        setIsAddingHorario(true);
                        handleAddBloque();
                      }}
                      className="mt-4 text-primary font-bold hover:underline"
                    >
                      Comenzar Planificación
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span className="text-sm font-bold text-slate-900">Agenda Semanal</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 p-1">
                      <button 
                        onClick={() => handleNavigateCalendar('prev')}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="px-3 text-[10px] font-bold text-slate-600 uppercase min-w-[120px] text-center">
                        {(() => {
                          if (calendarView === 'day') return calendarDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                          if (calendarView === 'week') {
                            const d = new Date(calendarDate);
                            const day = d.getDay();
                            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                            const start = new Date(d.setDate(diff));
                            const end = new Date(start);
                            end.setDate(start.getDate() + 6);

                            const startMonth = start.toLocaleDateString('es-ES', { month: 'long' });
                            const endMonth = end.toLocaleDateString('es-ES', { month: 'long' });
                            const startYear = start.getFullYear();
                            const endYear = end.getFullYear();

                            if (startYear !== endYear) {
                              return `Del ${start.getDate()} de ${startMonth} ${startYear} al ${end.getDate()} de ${endMonth} ${endYear}`;
                            }
                            if (startMonth !== endMonth) {
                              return `Del ${start.getDate()} de ${startMonth} al ${end.getDate()} de ${endMonth}`;
                            }
                            return `Del ${start.getDate()} al ${end.getDate()} de ${startMonth}`;
                          }
                          return calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                        })()}
                      </div>
                      <button 
                        onClick={() => handleNavigateCalendar('next')}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-100">
                    {(['day', 'week', 'month'] as const).map(view => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                          calendarView === view ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                      </button>
                    ))}
                  </div>
                </div>

                {calendarView === 'month' ? (
                  <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                      <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
                    ))}
                    {Array.from({ length: new Date(filterYear, filterMonth - 1, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({ length: new Date(filterYear, filterMonth, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(filterYear, filterMonth - 1, day);
                      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
                      const sede = sedes.find(s => s.nombreSede === selectedTerapeuta?.sede);
                      const sedeDayConfig = sede?.horarioAtencion?.find(h => h.dia === dayName);
                      const isSedeOpen = sedeDayConfig?.activo;
                      const dayBloques = horarioFormData.bloques?.filter(b => b.diasSemana.includes(dayName)) || [];
                      
                      return (
                        <div key={day} className={cn(
                          "aspect-square p-2 rounded-2xl border transition-all relative group overflow-hidden",
                          isSedeOpen ? "bg-white border-slate-100 hover:shadow-sys-md" : "bg-slate-50 border-transparent opacity-50"
                        )}>
                          <span className={cn("text-xs font-bold", isSedeOpen ? "text-slate-900" : "text-slate-400")}>{day}</span>
                          {!isSedeOpen && (
                            <div className="absolute inset-0 flex items-center justify-center rotate-[-45deg] pointer-events-none">
                              <span className="text-[8px] font-black text-slate-200 uppercase tracking-tighter">Cerrado</span>
                            </div>
                          )}
                          <div className="mt-1 space-y-0.5">
                            {dayBloques.map(b => (
                              <div key={b.id} className="h-1.5 w-full rounded-full shadow-sm" style={{ backgroundColor: configAgenda[`COLOR_${b.estado}`] }}></div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <div className={cn("min-w-[800px]", calendarView === 'day' && "min-w-full")}>
                        {/* Header */}
                        <div className={cn(
                          "grid border-b border-slate-100 bg-slate-50",
                          calendarView === 'week' ? "grid-cols-8" : "grid-cols-2"
                        )}>
                          <div className="p-4 border-r border-slate-100"></div>
                          {calendarView === 'week' ? (
                            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => {
                              const start = new Date(calendarDate);
                              const day = start.getDay();
                              const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                              start.setDate(diff);
                              const date = new Date(start);
                              date.setDate(start.getDate() + i);
                              return (
                                <div key={d} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.substring(0, 3)} {date.getDate()}</span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                                {calendarDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Time Slots */}
                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                          {generateTimeSlots().map((timeStr, idx) => {
                            const [hour, minute] = timeStr.split(':').map(Number);
                            
                            return (
                              <div key={timeStr} className={cn(
                                "grid border-b border-slate-50 last:border-b-0",
                                calendarView === 'week' ? "grid-cols-8" : "grid-cols-2"
                              )}>
                                <div className="p-2 text-right pr-4 border-r border-slate-100 bg-slate-50/50">
                                  <span className="text-[10px] font-bold text-slate-400">{timeStr}</span>
                                </div>
                                {(calendarView === 'week' ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] : [
                                  ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][calendarDate.getDay()]
                                ]).map((dayName, dayIndex) => {
                                  const actualDate = new Date(calendarDate);
                                  if (calendarView === 'week') {
                                    const day = actualDate.getDay();
                                    const diff = actualDate.getDate() - day + (day === 0 ? -6 : 1);
                                    actualDate.setDate(diff + dayIndex);
                                  }
                                  const actualMonth = actualDate.getMonth() + 1;
                                  const actualYear = actualDate.getFullYear();

                                  const blocksToUse = (actualMonth === filterMonth && actualYear === filterYear) 
                                    ? (horarioFormData.bloques || [])
                                    : (allTerapeutaHorarios.find(h => h.mes === actualMonth && h.año === actualYear && h.estado)?.bloques || []);

                                  const dayBloques = blocksToUse.filter(b => {
                                    if (!b.diasSemana.includes(dayName)) return false;
                                    
                                    const [bStartH, bStartM] = b.horaInicio.split(':').map(Number);
                                    const [bEndH, bEndM] = b.horaFin.split(':').map(Number);
                                    const bStartTotal = bStartH * 60 + bStartM;
                                    const bEndTotal = bEndH * 60 + bEndM;
                                    const slotTotal = hour * 60 + minute;
                                    
                                    return slotTotal >= bStartTotal && slotTotal < bEndTotal;
                                  }) || [];

                                  const sede = sedes.find(s => s.nombreSede === selectedTerapeuta?.sede);
                                  const sedeDayConfig = sede?.horarioAtencion?.find(h => h.dia === dayName);
                                  const isSedeOpen = sedeDayConfig?.activo;
                                  
                                  let isWithinCenterHours = false;
                                  if (isSedeOpen && sedeDayConfig) {
                                    const slotTotal = hour * 60 + minute;
                                    const [hStart, mStart] = sedeDayConfig.horaInicio.split(':').map(Number);
                                    const [hEnd, mEnd] = sedeDayConfig.horaFin.split(':').map(Number);
                                    const centerStart = hStart * 60 + mStart;
                                    const centerEnd = hEnd * 60 + mEnd;
                                    isWithinCenterHours = slotTotal >= centerStart && slotTotal < centerEnd;
                                  }

                                  const isNoDisponible = isWithinCenterHours && dayBloques.length === 0;

                                  return (
                                    <div key={dayName} className={cn(
                                      "p-1 border-r border-slate-50 last:border-r-0 min-h-[40px] relative",
                                      !isWithinCenterHours && "bg-slate-50/50",
                                      isNoDisponible && "bg-slate-700/5"
                                    )}>
                                      {isNoDisponible && (
                                        <div className="absolute inset-x-1 inset-y-0.5 rounded-lg bg-slate-200/50 flex items-center justify-center border border-slate-300/30">
                                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">No Disp.</span>
                                        </div>
                                      )}
                                      {dayBloques.map(b => (
                                        <div 
                                          key={b.id} 
                                          className="absolute inset-x-1 rounded-lg shadow-sm border border-white/20 p-1 flex flex-col justify-center overflow-hidden"
                                          style={{ 
                                            backgroundColor: configAgenda[`COLOR_${b.estado}`],
                                            top: '2px',
                                            bottom: '2px',
                                            zIndex: 1
                                          }}
                                        >
                                          <span className="text-[7px] font-black text-white uppercase leading-none truncate">{b.estado}</span>
                                        </div>
                                      ))}
                                      {isWithinCenterHours && dayBloques.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-primary/5 cursor-pointer">
                                          <Plus size={12} className="text-primary/40" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Leyenda de Disponibilidad:</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: configAgenda.COLOR_DISPONIBLE }}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: configAgenda.COLOR_OCUPADO }}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: configAgenda.COLOR_REFRIGERIO }}></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Refrigerio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm border border-slate-300"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">No Disponible</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sede Cerrada</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button onClick={() => setIsHorarioModalOpen(false)} className="btn-secondary">
              Cerrar
            </button>
            {(isAddingHorario || selectedHorario) && activeTab === 'listado' && (
              <button onClick={handleSaveHorario} className="btn-primary py-2 px-8 text-sm flex items-center gap-2">
                <Save size={18} />
                Guardar Planificación
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
