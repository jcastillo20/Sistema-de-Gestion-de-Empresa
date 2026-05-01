import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Search,
  Building2,
  User,
  Coffee,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Stethoscope,
  LayoutGrid,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { Horario, Terapeuta, Sede, BloqueHorario, Especialidad } from '@/src/types';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { usePermissions } from '../hooks/usePermissions';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { getExportContext } from '../utils/exportUtils';
import { ExportButton } from '../components/common/ExportButton';
import { useAuth } from '../context/AuthContext';

interface HorariosProps {
  currentUser: any;
}

export default function Horarios({ currentUser }: HorariosProps) {
  const { user: authUser } = useAuth();
  const permissions = usePermissions(currentUser, 'horarios');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Tab & View State
  const [activeTab, setActiveTab] = useState<'listado' | 'calendario'>('listado');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerapeuta, setFilterTerapeuta] = useState('');
  const [filterSede, setFilterSede] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterEspecialidad, setFilterEspecialidad] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Horario>>({
    idTerapeuta: '',
    nombreTerapeuta: '',
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    sede: currentUser?.sede || '',
    bloques: [],
    estado: true
  });

  const [configAgenda, setConfigAgenda] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const handleExportExcel = async (filteredData?: Horario[]) => {
    const { branding, context } = await getExportContext(authUser);
    const sourceData = filteredData || filteredHorariosData;
    const dataToExport = sourceData.map(h => ({
      'Terapeuta': h.nombreTerapeuta,
      'Mes': meses[h.mes - 1],
      'Año': h.año,
      'Sede': h.sede,
      'Bloques': h.bloques.map(b => `${b.horaInicio}-${b.horaFin} (${b.estado})`).join(', '),
      'Estado': h.estado ? 'Activo' : 'Inactivo'
    }));

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Planificación de Horarios',
      fileName: 'Horarios_Terapeutas',
      branding: branding as any,
      context,
      showSummary: true
    });
  };

  const handleExportPDF = async (filteredData?: Horario[]) => {
    const { branding, context } = await getExportContext(authUser);
    const sourceData = filteredData || filteredHorariosData;
    const dataToExport = sourceData.map(h => ({
      'Terapeuta': h.nombreTerapeuta,
      'Mes': `${meses[h.mes - 1]} ${h.año}`,
      'Sede': h.sede,
      'Estado': h.estado ? 'Activo' : 'Inactivo'
    }));

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Planificación de Horarios',
      fileName: 'Horarios_Terapeutas',
      branding: branding as any,
      context
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sedeContext = permissions?.verTodo ? undefined : currentUser?.sede;
      const [horariosData, terapeutasData, sedesData, configData, specsData] = await Promise.all([
        apiService.getHorarios(sedeContext),
        apiService.getTerapeutas(sedeContext),
        apiService.getSedes(),
        apiService.getConfiguracion(),
        apiService.getEspecialidades()
      ]);
      setHorarios(horariosData);
      setTerapeutas(terapeutasData);
      setSedes(sedesData);
      setEspecialidades(specsData.filter(e => e.estado));

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

  const handleOpenModal = (horario?: Horario) => {
    if (horario) {
      setSelectedHorario(horario);
      setFormData(JSON.parse(JSON.stringify(horario)));
    } else {
      setSelectedHorario(null);
      setFormData({
        idTerapeuta: '',
        nombreTerapeuta: '',
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
        sede: permissions?.verTodo ? '' : currentUser?.sede,
        bloques: [],
        estado: true
      });
    }
    setIsModalOpen(true);
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
    setFormData(prev => ({
      ...prev,
      bloques: [...(prev.bloques || []), newBloque]
    }));
  };

  const handleRemoveBloque = (id: string) => {
    setFormData(prev => ({
      ...prev,
      bloques: prev.bloques?.filter(b => b.id !== id)
    }));
  };

  const handleUpdateBloque = (id: string, field: keyof BloqueHorario, value: any) => {
    setFormData(prev => {
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

  const validateHorario = () => {
    if (!formData.idTerapeuta) return 'Debe seleccionar un terapeuta';
    if (!formData.sede) return 'Debe seleccionar una sede';
    if (!formData.bloques || formData.bloques.length === 0) return 'Debe agregar al menos un bloque horario';

    const bloques = formData.bloques || [];
    const normalizeDay = (day: string) => day.trim().toLowerCase();

    // Validaciones de solapamiento y lógica de bloques
    for (let i = 0; i < bloques.length; i++) {
      const b1 = bloques[i];
      if (b1.diasSemana.length === 0) return `El bloque ${i + 1} debe tener al menos un día seleccionado.`;
      
      const start1 = parseInt(b1.horaInicio.replace(':', ''));
      const end1 = parseInt(b1.horaFin.replace(':', ''));
      
      if (start1 >= end1) return `Error en bloque ${i + 1}: La hora de inicio (${b1.horaInicio}) debe ser menor a la fin (${b1.horaFin})`;

      for (let j = i + 1; j < bloques.length; j++) {
        const b2 = bloques[j];
        const sharedDays = b1.diasSemana.filter(day => 
          b2.diasSemana.some(d2 => normalizeDay(day) === normalizeDay(d2))
        );
        
        if (sharedDays.length > 0) {
          const start2 = parseInt(b2.horaInicio.replace(':', ''));
          const end2 = parseInt(b2.horaFin.replace(':', ''));
          
          // Permitir solapamiento solo si son de diferente tipo (Trabajo vs Pausa)
          if (start1 < end2 && start2 < end1 && b1.tipo === b2.tipo) {
            return `Solapamiento detectado en ${sharedDays.join(', ')}: Los bloques ${b1.horaInicio}-${b1.horaFin} y ${b2.horaInicio}-${b2.horaFin} se cruzan.`;
          }
        }
      }
    }

    // Validate against Sede hours
    const sedeObj = sedes.find(s => s.nombreSede === formData.sede);
    if (sedeObj && sedeObj.horarioAtencion) {
      for (const bloque of bloques) {
        // Check if any day's center hours are violated
        // For simplicity, we check if it's within the general range of the center's active days
        const activeDays = sedeObj.horarioAtencion.filter(d => d.activo);
        const minStart = activeDays.reduce((min, d) => d.horaInicio < min ? d.horaInicio : min, '23:59');
        const maxEnd = activeDays.reduce((max, d) => d.horaFin > max ? d.horaFin : max, '00:00');

        if (bloque.horaInicio < minStart || bloque.horaFin > maxEnd) {
          return `El bloque ${bloque.horaInicio}-${bloque.horaFin} está fuera del horario general de la sede (${minStart}-${maxEnd})`;
        }
        if (bloque.horaInicio >= bloque.horaFin) {
          return `La hora de inicio debe ser menor a la hora de fin en el bloque ${bloque.horaInicio}-${bloque.horaFin}`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateHorario();
    if (error) {
      setAlertConfig({ title: 'Error de Validación', message: error, type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      const terapeuta = terapeutas.find(t => t.id === formData.idTerapeuta);
      const payload = {
        ...formData,
        nombreTerapeuta: terapeuta ? `${terapeuta.nombres} ${terapeuta.apellidoPaterno}` : '',
        usuarioCreacion: currentUser?.nombreUsuario,
        fechaCreacion: new Date().toISOString()
      } as Horario;

      if (selectedHorario) {
        await apiService.updateHorario(selectedHorario.id, payload, currentUser.nombreUsuario);
      } else {
        await apiService.createHorario(payload, currentUser.nombreUsuario);
      }

      setIsModalOpen(false);
      loadData();
      setAlertConfig({ title: 'Éxito', message: 'Horario guardado correctamente.', type: 'success' });
      setIsAlertOpen(true);
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar el horario.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleDelete = async (horario: Horario) => {
    try {
      await apiService.deleteHorario(horario.id, currentUser?.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado del horario ha sido modificado.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado del horario.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const filteredHorariosData = horarios.filter(h => {
    const matchTerapeuta = !filterTerapeuta || h.idTerapeuta === filterTerapeuta;
    const matchSede = filterSede === 'ALL' || h.sede === filterSede;
    const matchMes = !filterMonth || h.mes === filterMonth;
    const matchAño = !filterYear || h.año === filterYear;
    
    let matchEspecialidad = true;
    if (filterEspecialidad) {
      const terapeuta = terapeutas.find(t => t.id === h.idTerapeuta);
      matchEspecialidad = terapeuta?.especialidades?.includes(filterEspecialidad) || false;
    }

    const matchSearch = !searchTerm || 
      (h.nombreTerapeuta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.sede || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchTerapeuta && matchMes && matchAño && matchEspecialidad && matchSearch;
  });

  const getWeekRange = (date: Date) => {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const first = new Date(curr.setDate(diff));
    const last = new Date(first);
    last.setDate(first.getDate() + 6);

    const formatDayMonth = (d: Date) => {
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    };

    const formatFull = (d: Date) => {
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Calcular número de semana
    const startOfYear = new Date(first.getFullYear(), 0, 1);
    const pastDaysOfYear = (first.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    let rangeText = "";
    if (first.getFullYear() !== last.getFullYear()) {
      rangeText = `${formatFull(first)} al ${formatFull(last)}`;
    } else if (first.getMonth() !== last.getMonth()) {
      rangeText = `${formatDayMonth(first)} al ${formatFull(last)}`;
    } else {
      rangeText = `${first.getDate()} al ${formatFull(last)}`;
    }

    return `${rangeText} (Semana ${weekNum})`;
  };

  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(curr.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const handleNavigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (calendarView === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (calendarView === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCalendarDate(newDate);
  };

  const getTherapistSessionMinutes = (terapeutaId: string) => {
    const tera = terapeutas.find(t => t.id === terapeutaId);
    if (!tera || !tera.especialidades || tera.especialidades.length === 0) return 30; // Default
    
    const spec = especialidades.find(e => e.nombre === tera.especialidades[0]);
    return spec?.minutosSesion || 30;
  };

  const generateTimeSlots = (intervalMinutes: number) => {
    const slots = [];
    const startHour = 8;
    const endHour = 21;
    
    let currentInMinutes = startHour * 60;
    const endInMinutes = endHour * 60;

    while (currentInMinutes < endInMinutes) {
      const h = Math.floor(currentInMinutes / 60);
      const m = currentInMinutes % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentInMinutes += intervalMinutes;
    }
    return slots;
  };

  if (!permissions?.acceso) {
    return <div className="p-8 text-center">No tienes acceso a este módulo.</div>;
  }

  return (
    <div className="clini-page-container">
      <div className="clini-page-header">
        <div>
          <h2 className="clini-title-main">Horarios de Terapeutas</h2>
          <p className="clini-subtitle">Gestiona los turnos rotativos y pausas mensuales.</p>
        </div>
        <div className="flex items-center gap-2">
          {permissions.puedeCrear && (
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Planificar Horario
            </button>
          )}
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="clini-card clini-form-stack mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="clini-label-with-icon">
              <Filter size={18} className="text-primary" />
              <span className="text-base font-bold uppercase tracking-tight text-slate-900">Filtros de Búsqueda</span>
            </div>
            
            {(searchTerm !== '' || filterTerapeuta !== '' || filterSede !== 'ALL' || filterEspecialidad !== '' || filterMonth !== (new Date().getMonth() + 1) || filterYear !== new Date().getFullYear()) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterTerapeuta('');
                  setFilterSede('ALL');
                  setFilterEspecialidad('');
                  setFilterMonth(new Date().getMonth() + 1);
                  setFilterYear(new Date().getFullYear());
                }}
                className="p-2.5 rounded-full border border-slate-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center h-[44px] w-[44px] shrink-0 active:scale-95 shadow-sm hover:shadow-md" 
                title="Limpiar Filtros"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ExportButton 
              onExcel={() => handleExportExcel(filteredHorariosData)}
              onPdf={() => handleExportPDF(filteredHorariosData)}
              showLabel={false}
              className="rounded-full h-[40px] w-[40px] shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        <div className="clini-form-grid md:grid-cols-6 gap-6">
          <div className="clini-form-group">
            <label className="clini-label px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Buscar Terapeuta</label>
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Nombre o Sede..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="clini-form-group">
            <label className="clini-label px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Filtrar Sede</label>
            <div className="clini-input-group clini-relative">
              <div className="clini-input-icon">
                <Building2 size={18} />
              </div>
              <select 
                className="clini-input-field-icon-left"
                value={filterSede}
                onChange={(e) => setFilterSede(e.target.value)}
                disabled={!permissions?.verTodo}
              >
                <option value="ALL">Todas las Sedes</option>
                {sedes.map(s => (
                  <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Especialidad</label>
            <div className="clini-input-group clini-relative">
              <div className="clini-input-icon">
                <ShieldCheck size={18} />
              </div>
              <select 
                className="clini-input-field-icon-left"
                value={filterEspecialidad}
                onChange={(e) => {
                  const newSpec = e.target.value;
                  setFilterEspecialidad(newSpec);
                  // Limpiar el filtro de terapeuta si no pertenece a la nueva especialidad seleccionada
                  if (newSpec && filterTerapeuta) {
                    const tera = terapeutas.find(t => t.id === filterTerapeuta);
                    if (!tera?.especialidades?.includes(newSpec)) {
                      setFilterTerapeuta('');
                    }
                  }
                }}
              >
                <option value="">Todas las Especialidades</option>
                {especialidades.map(e => (
                  <option key={e.id} value={e.nombre}>{e.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Terapeuta</label>
            <SearchableSelect 
              options={[
                { value: '', label: 'Todos los Terapeutas' },
                ...(filterEspecialidad 
                  ? terapeutas.filter(t => t.especialidades?.includes(filterEspecialidad))
                  : terapeutas
                ).map(t => ({ value: t.id, label: `${t.nombres} ${t.apellidoPaterno}` }))
              ]}
              value={filterTerapeuta}
              onChange={(val) => setFilterTerapeuta(val as string)}
              placeholder="Todos los Terapeutas"
              className="w-full"
              icon={<User size={18} />}
            />
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Mes</label>
            <div className="clini-input-group clini-relative">
              <div className="clini-input-icon">
                <Calendar size={18} />
              </div>
              <select 
                className="clini-input-field-icon-left"
                value={filterMonth}
                onChange={(e) => setFilterMonth(Number(e.target.value))}
              >
                {meses.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Año</label>
            <div className="clini-input-group clini-relative">
              <div className="clini-input-icon">
                <Clock size={18} />
              </div>
              <select 
                className="clini-input-field-icon-left"
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="clini-segmented-control">
        <button 
          onClick={() => setActiveTab('listado')}
          className={cn(
            "clini-segmented-item",
            activeTab === 'listado' && "clini-segmented-item--active"
          )} 
        >
          <LayoutGrid size={16} />
          Vista Lista
        </button>
        <button 
          onClick={() => setActiveTab('calendario')}
          className={cn(
            "clini-segmented-item",
            activeTab === 'calendario' && "clini-segmented-item--active"
          )}
        >
          <Calendar size={16} />
          Calendario
        </button>
      </div>

      <>
        {activeTab === 'calendario' ? (
        <div className="clini-page-container">
          <div className="clini-calendar-header">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-border rounded-xl p-1 shadow-inner">
                <button onClick={() => handleNavigateCalendar('prev')} className="p-1.5 text-text-muted hover:text-primary hover:bg-surface rounded-lg transition-all">
                  <ChevronLeft size={18} />
                </button>
                <div className="px-4 text-[10px] font-black text-text-secondary uppercase min-w-[280px] text-center tracking-widest leading-relaxed">
                  {calendarView === 'month' ? calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 
                   calendarView === 'week' ? getWeekRange(calendarDate) :
                   calendarDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => handleNavigateCalendar('next')} className="p-1.5 text-text-muted hover:text-primary hover:bg-surface rounded-lg transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="clini-segmented-control">
              {(['day', 'week', 'month'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={cn(
                    "clini-segmented-item px-3 py-1",
                    calendarView === view && "clini-segmented-item--active"
                  )}
                >
                  <span className="text-[10px] uppercase">{view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dt-root">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className={cn("grid border-b border-border bg-muted-bg", calendarView === 'week' ? "grid-cols-8" : "grid-cols-2")}>
                  <div className="p-4 border-r border-border"></div>
                  {(calendarView === 'week' 
                    ? getWeekDates(calendarDate).map(d => ({ 
                        label: d.toLocaleDateString('es-ES', { weekday: 'short' }), 
                        num: d.getDate() 
                      })) 
                    : [{ 
                        label: calendarDate.toLocaleDateString('es-ES', { weekday: 'short' }), 
                        num: calendarDate.getDate() 
                      }]
                  ).map((d, i) => ( 
                    <div key={i} className="p-4 text-center font-black text-[10px] text-text-muted uppercase tracking-widest">
                      <span className="text-slate-400">{d.label}</span>
                      <span className="block text-primary text-sm mt-1">{d.num}</span>
                    </div>
                  ))}
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {generateTimeSlots(filterTerapeuta ? getTherapistSessionMinutes(filterTerapeuta) : 30).map(time => (
                    <div key={time} className={cn("grid border-b border-slate-50 last:border-b-0", calendarView === 'week' ? "grid-cols-8" : "grid-cols-2")}>
                      <div className="p-3 text-right pr-4 border-r border-border bg-bg/50">
                        <span className="text-[10px] font-bold text-text-muted">{time}</span>
                      </div>
                      {(calendarView === 'week' 
                        ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] 
                        : [calendarDate.toLocaleDateString('es-ES', { weekday: 'long' }).charAt(0).toUpperCase() + calendarDate.toLocaleDateString('es-ES', { weekday: 'long' }).slice(1)]
                      ).map(day => {
                        const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
                        const sessionMinutes = filterTerapeuta ? getTherapistSessionMinutes(filterTerapeuta) : 30;
                        
                        // Parse current slot time
                        const [hours, minutes] = time.split(':').map(Number);
                        const currentSlotStartMinutes = hours * 60 + minutes;
                        const currentSlotEndMinutes = currentSlotStartMinutes + sessionMinutes;

                        const slotBlocks = filteredHorariosData.flatMap(h => h.bloques.filter(b => {
                          if (!b.diasSemana.includes(capitalizedDay)) return false;
                          
                          const [bHours, bMinutes] = b.horaInicio.split(':').map(Number);
                          const [bEHours, bEMinutes] = b.horaFin.split(':').map(Number);
                          const blockStart = bHours * 60 + bMinutes;
                          const blockEnd = bEHours * 60 + bEMinutes;

                          // Check if slot falls within block
                          return currentSlotStartMinutes >= blockStart && currentSlotStartMinutes < blockEnd;
                        }));

                        return (
                          <div key={day} className="p-1 border-r border-slate-50 last:border-r-0 min-h-[45px] relative group">
                            {slotBlocks.map((b, idx) => (
                              <div 
                                key={idx}
                                className="absolute inset-x-1 rounded-[var(--sys-radius-3xl)] shadow-sm border border-white/20 p-1 flex flex-col justify-center overflow-hidden transition-all hover:scale-[1.02] hover:z-10"
                                style={{ 
                                  backgroundColor: configAgenda[`COLOR_${b.estado}`],
                                  top: '2px', bottom: '2px', zIndex: 1
                                }}
                              >
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-[8px] font-black text-white uppercase leading-none truncate">
                                    {(b.tipo === 'PAUSA' ? 'REFRIGERIO' : 'DISPONIBLE')}
                                  </span>
                                  {b.tipo === 'PAUSA' ? <Coffee size={8} className="text-white/80" /> : <Briefcase size={8} className="text-white/80" />}
                                </div>
                                <span className="text-[7px] font-bold text-white/90 leading-tight mt-0.5 truncate px-1">
                                  {filteredHorariosData.find(h => h.bloques.includes(b))?.nombreTerapeuta}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DataTable 
          title="Planificación Mensual"
          data={filteredHorariosData}
          showSearch={false}
          showFilters={false}
          isLoading={isLoading}
          columns={[
            { 
              header: 'Terapeuta', 
              accessor: (h: Horario) => (
                <div className="pg-cell-person">
                  <div className="pg-avatar flex items-center justify-center bg-primary/10 border border-primary shadow-sm">
                    <span className="text-primary font-black text-[10px] tracking-tighter">
                      {h.nombreTerapeuta.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="pg-cell-person-info">
                    <span className="pg-cell-name font-black text-slate-900 leading-tight">{h.nombreTerapeuta}</span>
                  </div>
                </div> 
              )
            },
            { header: 'Mes/Año', accessor: (h: Horario) => `${meses[h.mes - 1]} ${h.año}` },
            { 
              header: 'Sede', 
              accessor: (h: Horario) => (
                <span className={cn(
                  "pg-chip", 
                  h.sede === 'ALL' ? "pg-chip--primary" : "pg-chip--info"
                )}>
                  <Building2 size={12} className="shrink-0" />
                  {h.sede}
                </span>
              ),
              sortable: true,
              sortKey: 'sede'
            },
            { 
              header: 'Bloques', 
              accessor: (h: Horario) => (
                <div className="pg-esp-list">
                  {h.bloques.map((b, i) => (
                    <span key={i} className="pg-block-chip" style={{ 
                      backgroundColor: configAgenda[`COLOR_${b.estado}`] || 'var(--sys-color-border-medium)',
                      boxShadow: 'var(--sys-shadow-xs)'
                    }}>
                      {b.horaInicio} - {b.horaFin}
                    </span>
                  ))}
                </div>
              )
            },
            { 
              header: 'Estado', 
              accessor: (h: Horario) => (
                <div className={cn("pg-status-pill", h.estado ? "pg-status--active" : "pg-status--inactive")}>
                  <span className={cn("pg-status-dot", h.estado ? "pg-dot--active" : "pg-dot--inactive")} />
                  {h.estado ? 'Activo' : 'Inactivo'}
                </div>
              )
            }
          ]}
          onEdit={permissions.puedeEditar ? handleOpenModal : undefined}
          onDelete={permissions.puedeEliminar ? handleDelete : undefined}
         
        />
      )}
      </>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedHorario ? "Editar Planificación" : "Nueva Planificación"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="clini-form-grid">
            <div className="clini-form-group clini-space-y-ui-c">
              <label className="clini-label-form flex items-center gap-2">
                <Building2 size={14} className="text-text-muted" />
                Sede de Atención *
              </label>
              <select 
                className="input-field"
                value={formData.sede}
                onChange={(e) => setFormData({ ...formData, sede: e.target.value, idTerapeuta: '' })}
                disabled={!!selectedHorario || !permissions.verTodo}
              >
                <option value="">Seleccionar Sede</option>
                {sedes.map(s => (
                  <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                ))}
              </select>
            </div>
            <div className="clini-form-group">
              <label className="clini-label-with-icon">
                <User size={16} />
                Terapeuta *
              </label>
              <SearchableSelect
                options={terapeutas
                  .filter(t => !formData.sede || t.sede === formData.sede)
                  .map(t => ({ value: t.id, label: `${t.nombres} ${t.apellidoPaterno}` }))
                }
                value={formData.idTerapeuta || ''}
                onChange={(val) => setFormData({ ...formData, idTerapeuta: val as string })}
                placeholder="Seleccionar Terapeuta"
                disabled={!!selectedHorario}
                icon={<User size={18} />}
              />
            </div>
            <div className="clini-form-group">
              <label className="clini-label-with-icon">
                <Calendar size={16} />
                Mes de Aplicación
              </label>
              <select 
                className="input-field"
                value={formData.mes}
                onChange={(e) => setFormData({ ...formData, mes: Number(e.target.value) })}
                disabled={!!selectedHorario}
              >
                {meses.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="clini-form-group">
              <label className="clini-label-with-icon">
                <Calendar size={16} />
                Año
              </label>
              <select 
                className="input-field"
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
                disabled={!!selectedHorario}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="clini-form-stack">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="clini-label-with-icon text-sm uppercase tracking-tight">
                <Clock size={18} />
                Planificación de Bloques
              </h3>
              <button onClick={handleAddBloque} className="btn-primary-sm">
                <Plus size={14} />
                Agregar Bloque
              </button>
            </div>

            <div className="clini-table-dense-wrapper">
              {formData.bloques?.length === 0 ? (
                <div className="p-12 text-center bg-muted-bg/50">
                  <p className="text-text-muted text-sm italic">No hay bloques definidos para este horario.</p>
                </div>
              ) : (
                <table className="clini-table-dense">
                  <thead className="clini-table-dense-thead">
                    <tr>
                      <th className="clini-table-dense-th">Días</th>
                      <th className="clini-table-dense-th">Tipo</th>
                      <th className="clini-table-dense-th">Inicio</th>
                      <th className="clini-table-dense-th">Fin</th>
                      <th className="clini-table-dense-th">Estado</th>
                      <th className="clini-table-dense-th-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="clini-table-body-divide">
                    {formData.bloques?.map((bloque) => (
                      <tr key={bloque.id} className="clini-table-row-hover">
                        <td className="clini-table-dense-td">
                          <div className="flex flex-wrap gap-1 min-w-[150px]">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => {
                              const isSelected = bloque.diasSemana.includes(d);
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    const newDays = isSelected 
                                      ? bloque.diasSemana.filter(day => day !== d)
                                      : [...bloque.diasSemana, d];
                                    handleUpdateBloque(bloque.id, 'diasSemana', newDays);
                                  }}
                                  className={cn(
                                    "w-7 h-7 rounded-lg text-[10px] font-black transition-all border shadow-sm",
                                    isSelected 
                                      ? "bg-primary border-primary text-white scale-110 z-10" 
                                      : "bg-slate-50 border-slate-100 text-slate-400 hover:border-primary/40 hover:bg-white"
                                  )}
                                >
                                  {d.substring(0, 1)}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="clini-table-dense-td">
                          <select className="clini-time-input-inline font-bold" value={bloque.tipo} onChange={(e) => handleUpdateBloque(bloque.id, 'tipo', e.target.value)}>
                            <option value="TRABAJO">Trabajo</option>
                            <option value="PAUSA">Pausa</option>
                          </select>
                        </td>
                        <td className="clini-table-dense-td">
                          <input type="time" className="clini-time-input-inline" value={bloque.horaInicio} onChange={(e) => handleUpdateBloque(bloque.id, 'horaInicio', e.target.value)} />
                        </td>
                        <td className="clini-table-dense-td">
                          <input type="time" className="clini-time-input-inline" value={bloque.horaFin} onChange={(e) => handleUpdateBloque(bloque.id, 'horaFin', e.target.value)} />
                        </td>
                        <td className="clini-table-dense-td">
                          <select 
                            className="clini-time-input-inline font-bold" 
                            value={bloque.estado} 
                            onChange={(e) => handleUpdateBloque(bloque.id, 'estado', e.target.value)}
                          >
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="OCUPADO">Ocupado</option>
                            <option value="REFRIGERIO">Refrigerio</option>
                            <option value="BLOQUEADO">Bloqueado</option>
                          </select>
                        </td>
                        <td className="clini-table-dense-td-center">
                          <button onClick={() => handleRemoveBloque(bloque.id)} className="clini-action-btn-icon clini-action-btn-icon-rose">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="clini-form-actions">
            <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save size={18} />
              Guardar Planificación
            </button>
          </div>
        </div>
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
