import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Building2, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  LayoutGrid,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';
import { exportService } from '../services/exportService';
import { ExportButton } from '../components/common/ExportButton';
import { getExportContext } from '../utils/exportUtils';
import { Cita, Paciente, Terapeuta, Sede, Especialidad } from '../types';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { usePermissions } from '../hooks/usePermissions';

interface AgendaProps {
  currentUser: any;
}

export default function Agenda({ currentUser }: AgendaProps) {
  const permissions = usePermissions(currentUser, 'agenda');
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendario' | 'listado'>('calendario');
  
  // Calendar State
  const [calendarView, setCalendarView] = useState<'day' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    sede: 'ALL',
    terapeuta: 'ALL',
    estado: 'ALL'
  });

  // Modal State
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<any | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sedeContext = permissions.verTodo ? undefined : currentUser?.sede;
      const [c, p, t, s, e] = await Promise.all([
        apiService.getCitas(sedeContext),
        apiService.getPacientes(sedeContext),
        apiService.getTerapeutas(sedeContext),
        apiService.getSedes(),
        apiService.getEspecialidades()
      ]);
      setCitas(c);
      setPacientes(p);
      setTerapeutas(t);
      setSedes(s);
      setEspecialidades(e);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async (filteredData?: any[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredCitas;
    const dataToExport = sourceData.map(c => {
      const row: any = {
        'Fecha': c.fecha,
        'Horario': `${c.horaInicio} - ${c.horaFin}`,
        'Paciente': c.nombrePaciente,
        'Terapeuta': c.nombreTerapeuta,
        'Estado': c.estadoCita
      };
      if (permissions.verTodo) row['Sede'] = c.sede;
      return row;
    });

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Agenda de Consultas',
      fileName: 'Listado_Agenda',
      branding: branding as any,
      context
    });
  };

  const handleExportPDF = async (filteredData?: any[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredCitas;
    const dataToExport = sourceData.map(c => {
      const row: any = {
        'Fecha': c.fecha,
        'Horario': `${c.horaInicio} - ${c.horaFin}`,
        'Paciente': c.nombrePaciente,
        'Estado': c.estadoCita
      };
      if (permissions.verTodo) row['Sede'] = c.sede;
      return row;
    });

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Agenda de Consultas',
      fileName: 'Listado_Agenda',
      branding: branding as any,
      context
    });
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const filteredCitas = useMemo(() => {
    return citas.filter(c => {
      const matchSearch = filters.search === '' || 
        (c.nombrePaciente || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.nombreTerapeuta || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchSede = filters.sede === 'ALL' || c.sede === filters.sede;
      const matchTerapeuta = filters.terapeuta === 'ALL' || c.idTerapeuta === filters.terapeuta;
      const matchEstado = filters.estado === 'ALL' || c.estadoCita === filters.estado;
      return matchSearch && matchSede && matchTerapeuta && matchEstado;
    });
  }, [citas, filters]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    // From 8 AM to 9 PM, every 15 minutes to support 45m or other durations better
    for (let h = 8; h <= 21; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 21 && m > 0) break;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-amber-500';
      case 'CONFIRMADA': return 'bg-blue-500';
      case 'COMPLETADA': return 'bg-emerald-500';
      case 'CANCELADA': return 'bg-rose-500';
      case 'REPROGRAMADA': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  const renderCalendar = () => {
    const days = calendarView === 'week' ? weekDates : [currentDate];
    const gridCols = calendarView === 'week' ? 'grid-cols-[80px_repeat(7,1fr)]' : 'grid-cols-[80px_1fr]';

    return (
      <div className="clini-card overflow-hidden flex flex-col h-[700px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className={cn("grid border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10", gridCols)}>
          <div className="p-4 bg-white border-r border-slate-100"></div>
          {days.map((date, i) => (
            <div key={i} className="p-4 text-center border-r border-slate-100 last:border-r-0 bg-white">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">
                {date.toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className={cn(
                "w-10 h-10 inline-flex items-center justify-center rounded-2xl font-black text-lg transition-all",
                date.toDateString() === new Date().toDateString() 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                  : "text-slate-700"
              )}>
                {date.getDate()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          <div className="absolute inset-0">
            {timeSlots.map((time, idx) => (
              <div key={time} className={cn("grid border-b border-slate-50 min-h-[40px]", gridCols)}>
                <div className="p-2 text-right bg-slate-50/20 border-r border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 tracking-tighter">
                      {time.endsWith(':00') || time.endsWith(':30') ? time : ''}
                   </span>
                </div>
                {days.map((date, dIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const slotCitas = filteredCitas.filter(c => c.fecha === dateStr && c.horaInicio === time);
                  
                  return (
                    <div key={dIdx} className="relative border-r border-slate-50 last:border-r-0 group hover:bg-slate-50/10 transition-colors">
                       {slotCitas.map(cita => {
                         const start = new Date(`2000-01-01T${cita.horaInicio}`);
                         const end = new Date(`2000-01-01T${cita.horaFin}`);
                         const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
                         const slotsCount = Math.ceil(durationMin / 15);
                         
                         return (
                           <div 
                             key={cita.id}
                             onClick={() => {
                               setSelectedCita(cita);
                               setIsCitaModalOpen(true);
                             }}
                             className={cn(
                               "absolute inset-x-0.5 rounded-xl px-2 py-1 cursor-pointer transition-all hover:scale-[1.01] hover:z-20 shadow-sm border border-white/20 active:scale-95",
                               getStatusColor(cita.estadoCita)
                             )}
                             style={{ 
                               top: '2px', 
                               height: `calc(${slotsCount * 100}% - 4px)`,
                               opacity: 0.95,
                               zIndex: 10
                             }}
                           >
                              <div className="flex flex-col h-full text-white overflow-hidden">
                                <span className="text-[7px] font-black uppercase tracking-tighter opacity-80 truncate leading-none mb-0.5">
                                  {cita.horaInicio} - {cita.horaFin}
                                </span>
                                <span className="text-[10px] font-bold leading-none line-clamp-2 mt-0.5">
                                  {cita.nombrePaciente}
                                </span>
                                <span className="text-[7px] font-black uppercase opacity-60 truncate mt-auto">
                                  {cita.nombreTerapeuta?.split(' ')[0]}
                                </span>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clini-animate-fade space-y-8 pb-20">
      {/* Header Section */}
      <div className="clini-page-header clini-flex-between-center">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <CalendarIcon size={18} />
             </div>
             <h2 className="clini-title-main">Agenda Clínica</h2>
           </div>
           <p className="clini-subtitle">Gestión inteligente de citas y disponibilidad por terapeuta.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-[var(--sys-radius-2xl)] shadow-sm border border-slate-100 flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('calendario')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'calendario' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary"
              )}
            >
              Calendario
            </button>
            <button 
              onClick={() => setActiveTab('listado')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'listado' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary"
              )}
            >
              Listado
            </button>
          </div>
        </div>
      </div>

      {/* Control Area: Navigation, Filters & Actions */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0 h-[44px]">
           <button onClick={() => handleNavigate('prev')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-primary cursor-pointer active:scale-90">
              <ChevronLeft size={18} />
           </button>
           <div className="px-2 text-center min-w-[130px]">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight whitespace-nowrap">
                {getWeekRange(currentDate)}
              </span>
           </div>
           <button onClick={() => handleNavigate('next')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-primary cursor-pointer active:scale-90">
              <ChevronRight size={18} />
           </button>
        </div>

        <div className="flex-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md flex flex-wrap md:flex-nowrap items-center gap-2 h-[44px]">
           <div className="relative flex-1 min-w-[120px] group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-primary transition-colors" size={13} />
              <input 
                type="text" 
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border-none rounded-[var(--sys-radius-3xl)] text-[10px] font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Paciente o Terapeuta..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
           </div>
           <div className="flex items-center gap-1">
             <select 
               className="px-2 py-2 bg-slate-50 border-none rounded-xl text-[9px] font-black uppercase text-slate-600 outline-none cursor-pointer min-w-[80px]"
               value={filters.sede}
               onChange={e => setFilters({...filters, sede: e.target.value})}
               disabled={!permissions.verTodo}
             >
               <option value="ALL">Sedes</option>
               {sedes.map(s => <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>)}
             </select>
             <select 
               className="px-2 py-2 bg-slate-50 border-none rounded-xl text-[9px] font-black uppercase text-slate-600 outline-none cursor-pointer min-w-[90px]"
               value={filters.terapeuta}
               onChange={e => setFilters({...filters, terapeuta: e.target.value})}
             >
               <option value="ALL">Personal</option>
               {terapeutas.map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno.split(' ')[0]}</option>)}
             </select>
          </div>
          {(filters.search !== '' || filters.sede !== 'ALL' || filters.terapeuta !== 'ALL' || filters.estado !== 'ALL') && (
            <button 
              onClick={() => setFilters({search: '', sede: 'ALL', terapeuta: 'ALL', estado: 'ALL'})}
              className="p-2.5 rounded-full border border-slate-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center h-[44px] w-[44px] shrink-0 active:scale-95 shadow-sm hover:shadow-md" 
              title="Limpiar filtros"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}

          <div className="h-8 w-px bg-slate-100 mx-1" />

          <ExportButton 
            onExcel={() => handleExportExcel(filteredCitas)}
            onPdf={() => handleExportPDF(filteredCitas)}
            showLabel={false}
            className="rounded-full h-[40px] w-[40px] shadow-sm hover:shadow-md"
          />
        </div>

        <div className="flex items-center gap-2">
           {permissions.puedeCrear && (
              <button 
                onClick={() => { setSelectedCita(null); setIsCitaModalOpen(true); }}
                className="btn-primary flex items-center gap-2 py-2 px-4 whitespace-nowrap text-[11px] font-black uppercase h-[44px] rounded-xl shadow-lg shadow-primary/20"
              >
                <Plus size={16} />
                Agendar
              </button>
           )}
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === 'calendario' ? (
        renderCalendar()
      ) : (
        <DataTable 
          title="Listado Maestro de Citas"
          data={filteredCitas}
          isLoading={isLoading}
          showSearch={false}
          showFilters={false}
          columns={[
            { 
              header: 'Paciente', 
              accessor: (c: any) => (
                <div className="pg-cell-person py-1">
                  <div className="pg-avatar bg-primary/10 text-primary uppercase text-[10px] font-black">
                    {c.nombrePaciente.substring(0, 2)}
                  </div>
                  <div className="pg-cell-person-info">
                    <span className="pg-cell-name font-bold text-slate-800">{c.nombrePaciente}</span>
                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">ID: {c.idPaciente}</span>
                  </div>
                </div>
              )
            },
            { 
              header: 'Terapeuta', 
              accessor: (c: any) => (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{c.nombreTerapeuta}</span>
                </div>
              )
            },
            { 
              header: 'Fecha / Hora', 
              accessor: (c: any) => (
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900">{new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.horaInicio} - {c.horaFin}</span>
                </div>
              )
            },
            {
              header: 'Estado',
              accessor: (c: any) => (
                <span className={cn(
                  "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest",
                  c.estadoCita === 'COMPLETADA' ? "bg-emerald-100 text-emerald-700" :
                  c.estadoCita === 'PENDIENTE' ? "bg-amber-100 text-amber-700" :
                  c.estadoCita === 'CANCELADA' ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                )}>
                  {c.estadoCita}
                </span>
              )
            },
            {
              header: 'Sede',
              accessor: (c: any) => <span className="pg-chip pg-chip--slate text-[9px]">{c.sede}</span>
            }
          ]}
          onEdit={(c) => {
            setSelectedCita(c);
            setIsCitaModalOpen(true);
          }}
        />
      )}

      {/* Appointment Information Modal */}
      <Modal
        isOpen={isCitaModalOpen}
        onClose={() => setIsCitaModalOpen(false)}
        title="Detalles de la Cita"
        size="md"
      >
        {selectedCita && (
          <div className="space-y-6 py-4">
             <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-[var(--sys-radius-3xl)] border border-primary/10">
               <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-primary/5">
                 <User size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Paciente</p>
                 <h4 className="font-black text-xl text-slate-900 tracking-tight leading-none">{selectedCita.nombrePaciente}</h4>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="clini-card p-4 border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <CalendarIcon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Fecha</span>
                  </div>
                  <p className="font-bold text-slate-800">{new Date(selectedCita.fecha + 'T12:00:00').toLocaleDateString('es-ES', { dateStyle: 'full' })}</p>
                </div>
                <div className="clini-card p-4 border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Horario</span>
                  </div>
                  <p className="font-bold text-slate-800">{selectedCita.horaInicio} - {selectedCita.horaFin}</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded inline-block mb-0.5">Terapeuta Responsable</p>
                      <p className="font-bold text-slate-800 text-sm">{selectedCita.nombreTerapeuta}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded inline-block mb-0.5">Sede</p>
                       <p className="font-bold text-slate-800 text-sm">{selectedCita.sede}</p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-4 pt-6">
                <button 
                  onClick={() => setIsCitaModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Regresar
                </button>
                <div className="flex-1 flex gap-2">
                   <button className="flex-1 p-4 rounded-[var(--sys-radius-3xl)] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center">
                      <Trash2 size={20} />
                   </button>
                   <button className="flex-2 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                      <Edit2 size={16} />
                      Reprogramar
                   </button>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
