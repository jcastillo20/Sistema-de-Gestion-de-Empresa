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
  Filter
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Horario, Terapeuta, Sede, BloqueHorario, Especialidad } from '@/src/types';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { usePermissions } from '../hooks/usePermissions';
import { apiService } from '../services/apiService';

interface HorariosProps {
  currentUser: any;
}

export default function Horarios({ currentUser }: HorariosProps) {
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
  const [filterTerapeuta, setFilterTerapeuta] = useState('');
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
    const matchMes = !filterMonth || h.mes === filterMonth;
    const matchAño = !filterYear || h.año === filterYear;
    
    let matchEspecialidad = true;
    if (filterEspecialidad) {
      const terapeuta = terapeutas.find(t => t.id === h.idTerapeuta);
      matchEspecialidad = terapeuta?.especialidades?.includes(filterEspecialidad) || false;
    }
    
    return matchTerapeuta && matchMes && matchAño && matchEspecialidad;
  });

  const handleNavigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (calendarView === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (calendarView === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCalendarDate(newDate);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
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
        {permissions.puedeCrear && (
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Planificar Horario
          </button>
        )}
      </div>

      {/* Filtros Avanzados */}
      <div className="clini-card clini-form-stack">
        <div className="clini-label-with-icon">
          <Filter size={16} className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider">Filtros de Búsqueda</span>
        </div>
        <div className="clini-form-grid md:grid-cols-4 gap-4">
          <div className="clini-form-group">
            <label className="clini-label">Terapeuta</label>
            <select 
              className="input-field-xs"
              value={filterTerapeuta}
              onChange={(e) => setFilterTerapeuta(e.target.value)}
            >
              <option value="">Todos los Terapeutas</option>
              {terapeutas.map(t => (
                <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
              ))}
            </select>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Especialidad</label>
            <select 
              className="input-field-xs"
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
            >
              <option value="">Todas las Especialidades</option>
              {especialidades.map(e => (
                <option key={e.id} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Mes</label>
            <select 
              className="input-field-xs"
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              {meses.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="clini-form-group">
            <label className="clini-label">Año</label>
            <select 
              className="input-field-xs"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
                <div className="px-4 text-[10px] font-black text-text-secondary uppercase min-w-[150px] text-center tracking-widest">
                  {calendarView === 'month' ? calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 
                   calendarView === 'week' ? `Semana ${Math.ceil(calendarDate.getDate() / 7)} - ${calendarDate.toLocaleDateString('es-ES', { month: 'short' })}` :
                   calendarDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
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
                  {(calendarView === 'week' ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] : [['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][calendarDate.getDay()]]).map(d => ( 
                    <div key={d} className="p-4 text-center font-black text-[10px] text-text-muted uppercase tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {generateTimeSlots().map(time => (
                    <div key={time} className={cn("grid border-b border-slate-50 last:border-b-0", calendarView === 'week' ? "grid-cols-8" : "grid-cols-2")}>
                      <div className="p-3 text-right pr-4 border-r border-border bg-bg/50">
                        <span className="text-[10px] font-bold text-text-muted">{time}</span>
                      </div>
                      {(calendarView === 'week' ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] : [['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][calendarDate.getDay()]]).map(day => {
                        const slotBlocks = filteredHorariosData.flatMap(h => h.bloques.filter(b => {
                          if (!b.diasSemana.includes(day)) return false;
                          return time >= b.horaInicio && time < b.horaFin;
                        }));

                        return (
                          <div key={day} className="p-1 border-r border-slate-50 last:border-r-0 min-h-[45px] relative group">
                            {slotBlocks.map((b, idx) => (
                              <div 
                                key={idx}
                                className="absolute inset-x-1 rounded-lg shadow-sm border border-white/20 p-1 flex flex-col justify-center overflow-hidden"
                                style={{ 
                                  backgroundColor: configAgenda[`COLOR_${b.estado}`],
                                  top: '2px', bottom: '2px', zIndex: 1
                                }}
                              >
                                <span className="text-[7px] font-black text-white uppercase leading-none truncate">
                                  {filteredHorariosData.find(h => h.bloques.includes(b))?.nombreTerapeuta.split(' ')[0]}
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
          columns={[
            { 
              header: 'Terapeuta', 
              accessor: (h: Horario) => (
                <div className="pg-cell-person">
                  <div className="pg-avatar pg-avatar--primary">
                    {h.nombreTerapeuta.charAt(0)}
                  </div>
                  <span className="pg-cell-name">{h.nombreTerapeuta}</span>
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
                Terapeuta
              </label>
              <select 
                className="input-field"
                value={formData.idTerapeuta}
                onChange={(e) => setFormData({ ...formData, idTerapeuta: e.target.value })}
                disabled={!!selectedHorario}
              >
                <option value="">Seleccionar Terapeuta</option>
                {terapeutas
                  .filter(t => !formData.sede || t.sede === formData.sede)
                  .map(t => (
                  <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
                ))}
              </select>
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
              <input 
                type="number" 
                className="input-field"
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
                disabled={!!selectedHorario}
              />
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
                                    "w-6 h-6 rounded-md text-[9px] font-bold transition-all border",
                                    isSelected ? "bg-primary border-primary text-white" : "bg-white border-border text-text-muted hover:border-primary/40"
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
                          <div className="clini-flex-center-gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: configAgenda[`COLOR_${bloque.estado}`] }}></div>
                            <span className="clini-badge-status-small uppercase">{bloque.estado}</span>
                          </div>
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
