import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Coffee,
  Briefcase,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { Horario, BloqueHorario, Terapeuta, Sede, Especialidad } from '../../types';
import { cn } from '../../lib/utils';
import { AlertModal } from '../../components/common/AlertModal';
import { Modal } from '../../components/common/Modal';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function GestionHorarios() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [terapeuta, setTerapeuta] = useState<Terapeuta | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [configAgenda, setConfigAgenda] = useState<any>({});
  
  const [allTerapeutaHorarios, setAllTerapeutaHorarios] = useState<Horario[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [horarioFormData, setHorarioFormData] = useState<Partial<Horario>>({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    bloques: [],
    estado: true
  });

  const [activeTab, setActiveTab] = useState<'listado' | 'calendario'>('listado');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBloque, setEditingBloque] = useState<Partial<BloqueHorario> | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [terapeutaData, sedesData, especData, configData] = await Promise.all([
        apiService.getTerapeutas().then(ts => ts.find(t => t.id === id) || null),
        apiService.getSedes(),
        apiService.getEspecialidades(),
        apiService.getConfiguracion()
      ]);

      if (!terapeutaData) {
        navigate('/terapeutas');
        return;
      }

      setTerapeuta(terapeutaData);
      setSedes(sedesData);
      setEspecialidades(especData.filter(e => e.estado));
      
      const agendaConfig = configData.filter(c => c.categoria === 'AGENDA').reduce((acc, curr) => {
        acc[curr.clave] = curr.valor;
        return acc;
      }, {} as any);
      setConfigAgenda(agendaConfig);

      const allHorarios = await apiService.getHorarios(undefined, id);
      setAllTerapeutaHorarios(allHorarios);
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const existing = allHorarios.find(h => h.mes === currentMonth && h.año === currentYear && h.estado);

      if (existing) {
        setSelectedHorario(existing);
        setHorarioFormData(JSON.parse(JSON.stringify(existing)));
      } else {
        setHorarioFormData({
          idTerapeuta: id,
          nombreTerapeuta: `${terapeutaData.nombres} ${terapeutaData.apellidoPaterno}`,
          mes: currentMonth,
          año: currentYear,
          sede: terapeutaData.sede,
          bloques: [],
          estado: true
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (month: number, year: number, skipCalendarSync = false) => {
    setFilterMonth(month);
    setFilterYear(year);
    
    // Sincronizar tmbn la fecha del calendario a ese mes/año solo si no viene de una navegación directa del calendario
    if (!skipCalendarSync) {
      const newDate = new Date(year, month - 1, 1);
      setCalendarDate(newDate);
    }

    if (!id) return;

    const existing = allTerapeutaHorarios.find(h => h.mes === month && h.año === year && h.estado);
    if (existing) {
      setSelectedHorario(existing);
      setHorarioFormData(JSON.parse(JSON.stringify(existing)));
    } else {
      setSelectedHorario(null);
      setHorarioFormData({
        idTerapeuta: id,
        nombreTerapeuta: `${terapeuta?.nombres} ${terapeuta?.apellidoPaterno}`,
        mes: month,
        año: year,
        sede: terapeuta?.sede,
        bloques: [],
        estado: true
      });
    }
  };

  const handleAddBloque = () => {
    setEditingBloque({
      id: Math.random().toString(36).substr(2, 9),
      diasSemana: ['Lunes'],
      horaInicio: '08:00',
      horaFin: '12:00',
      tipo: 'TRABAJO',
      estado: 'DISPONIBLE'
    });
    setIsBlockModalOpen(true);
  };

  const handleEditBloque = (bloque: BloqueHorario) => {
    setEditingBloque({...bloque});
    setIsBlockModalOpen(true);
  };

  const handleSaveBloque = () => {
    if (!editingBloque) return;
    setHorarioFormData(prev => {
      const exists = prev.bloques?.find(b => b.id === editingBloque.id);
      let newBloques;
      if (exists) {
        newBloques = prev.bloques?.map(b => b.id === editingBloque.id ? (editingBloque as BloqueHorario) : b);
      } else {
        newBloques = [...(prev.bloques || []), editingBloque as BloqueHorario];
      }
      return { ...prev, bloques: newBloques };
    });
    setIsBlockModalOpen(false);
    setEditingBloque(null);
  };

  const handleRemoveBloque = (bid: string) => {
    setHorarioFormData(prev => ({
      ...prev,
      bloques: prev.bloques?.filter(b => b.id !== bid)
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      if (selectedHorario) {
        await apiService.updateHorario(selectedHorario.id, horarioFormData as Horario, user.nombreUsuario);
      } else {
        await apiService.createHorario(horarioFormData as Horario, user.nombreUsuario);
      }
      setAlertConfig({ title: 'Éxito', message: 'Horario guardado correctamente.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo guardar el horario.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const getTherapistSessionMinutes = () => {
    // 1. Verificar si la configuración es Global
    if (configAgenda?.TIPO_DURACION_SESION === 'GLOBAL') {
      return Number(configAgenda.DURACION_SESION_GLOBAL) || 30;
    }

    // 2. Si es por sesión/especialidad, buscar todas las especialidades del terapeuta
    if (!terapeuta || !terapeuta.especialidades || terapeuta.especialidades.length === 0) {
      return Number(configAgenda?.DURACION_SESION_GLOBAL) || 30;
    }
    
    const therapistSpecs = especialidades.filter(e => terapeuta.especialidades.includes(e.nombre));
    
    if (therapistSpecs.length === 0) {
      return Number(configAgenda?.DURACION_SESION_GLOBAL) || 30;
    }
    
    // Tomar la duración más alta entre sus especialidades (Requerimiento UX Premium)
    const maxDuration = Math.max(...therapistSpecs.map(e => e.duracionSesion || 0));
    
    return maxDuration > 0 ? maxDuration : 30;
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

  if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold tracking-widest uppercase text-xs">Cargando configuración de horarios...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/terapeutas')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Agenda de Trabajo</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-black uppercase tracking-widest">{terapeuta?.nombres} {terapeuta?.apellidoPaterno}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{terapeuta?.sede}</span>
              {terapeuta?.especialidades && terapeuta.especialidades.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">{terapeuta.especialidades.join(' / ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <select 
             value={filterMonth}
             onChange={(e) => handleFilterChange(Number(e.target.value), filterYear)}
             className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 px-3 cursor-pointer"
           >
             {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
             ))}
           </select>
           <select 
             value={filterYear}
             onChange={(e) => handleFilterChange(filterMonth, Number(e.target.value))}
             className="bg-transparent border-none text-[10px] font-black uppercase text-slate-600 focus:ring-0 px-3 cursor-pointer"
           >
             {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(y => (
               <option key={y} value={y}>{y}</option>
             ))}
           </select>
           <button 
             onClick={handleSave}
             className="ml-2 px-6 py-2 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all"
           >
             <Save size={14} />
             Guardar Planes
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
                 <button 
                   onClick={() => setActiveTab('listado')}
                   className={cn(
                     "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                     activeTab === 'listado' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   Listado de Bloques
                 </button>
                 <button 
                   onClick={() => setActiveTab('calendario')}
                   className={cn(
                     "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                     activeTab === 'calendario' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   Vista Semanal
                 </button>
               </div>
               
               {activeTab === 'listado' && (
                 <button 
                   onClick={handleAddBloque}
                   className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary hover:text-white"
                 >
                   <Plus size={14} />
                   Nuevo Bloque de Horario
                 </button>
               )}
            </div>

            {activeTab === 'listado' ? (
              <div className="space-y-6">
                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Días</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horario</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo / Estado</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {horarioFormData.bloques?.length ? (
                        horarioFormData.bloques.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)).map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex flex-wrap gap-1">
                                  {b.diasSemana.map(d => (
                                    <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">{d.substring(0, 3)}</span>
                                  ))}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-slate-400" />
                                  <span className="text-xs font-black text-slate-700">{b.horaInicio} - {b.horaFin}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: configAgenda[`COLOR_${b.estado}`] }}></div>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.estado}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-1">
                                 <button 
                                   onClick={() => handleEditBloque(b)}
                                   className="p-2 text-slate-300 hover:text-primary transition-colors"
                                   title="Editar"
                                 >
                                   <Edit size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleRemoveBloque(b.id)}
                                   className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                                   title="Eliminar"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-300 text-xs italic font-medium">
                            No hay bloques configurados para este mes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => {
                              const newDate = new Date(calendarDate);
                              newDate.setDate(newDate.getDate() - 7);
                              setCalendarDate(newDate);
                              // Sincronizar mes/año del plan si cambió (skip sync para evitar saltos al día 1)
                              if (newDate.getMonth() + 1 !== filterMonth || newDate.getFullYear() !== filterYear) {
                                handleFilterChange(newDate.getMonth() + 1, newDate.getFullYear(), true);
                              }
                            }} 
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <span className="px-6 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center min-w-[250px]">
                            {getWeekRange(calendarDate)}
                          </span>
                          <button 
                            onClick={() => {
                              const newDate = new Date(calendarDate);
                              newDate.setDate(newDate.getDate() + 7);
                              setCalendarDate(newDate);
                              // Sincronizar mes/año del plan si cambió (skip sync para evitar saltos al día 1)
                              if (newDate.getMonth() + 1 !== filterMonth || newDate.getFullYear() !== filterYear) {
                                handleFilterChange(newDate.getMonth() + 1, newDate.getFullYear(), true);
                              }
                            }} 
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all"
                          >
                            <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="border border-slate-100 rounded-[var(--sys-radius-3xl)] overflow-hidden bg-white shadow-inner">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                           <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                              <div className="p-4 border-r border-slate-100"></div>
                              {getWeekDates(calendarDate).map(d => (
                                <div key={d.toISOString()} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                   <span className="text-sm font-black text-primary mt-1 block">{d.getDate()}</span>
                                </div>
                              ))}
                           </div>
                           <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                              {generateTimeSlots(getTherapistSessionMinutes()).map(timeStr => (
                                <div key={timeStr} className="grid grid-cols-8 border-b border-slate-50 last:border-b-0">
                                   <div className="p-2 text-right pr-4 border-r border-slate-100 bg-slate-50/50">
                                      <span className="text-[9px] font-black text-slate-400">
                                         {timeStr}
                                      </span>
                                   </div>
                                   {getWeekDates(calendarDate).map(d => {
                                      const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
                                      const dayNameCap = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                                      const month = d.getMonth() + 1;
                                      const year = d.getFullYear();

                                      // Buscar el plan que corresponde a este día específico (mes/año)
                                      const dayPlan = allTerapeutaHorarios.find(h => h.mes === month && h.año === year && h.estado) || (month === filterMonth && year === filterYear ? horarioFormData : null);

                                      const slotMins = getTherapistSessionMinutes();
                                      const [slotH, slotM] = timeStr.split(':').map(Number);
                                      const slotTotal = slotH * 60 + slotM;
                                      
                                      const match = dayPlan?.bloques?.find(b => {
                                        if (!b.diasSemana.includes(dayNameCap)) return false;
                                        const [sH, sM] = b.horaInicio.split(':').map(Number);
                                        const [eH, eM] = b.horaFin.split(':').map(Number);
                                        const start = sH * 60 + sM;
                                        const end = eH * 60 + eM;
                                        return slotTotal >= start && slotTotal < end;
                                      });

                                      return (
                                        <div key={d.toISOString()} className={cn(
                                          "p-1 border-r border-slate-50 relative min-h-[35px] transition-colors",
                                          match ? "z-10" : "bg-slate-50/10 hover:bg-slate-50/40"
                                        )}>
                                          {match && (
                                            <div 
                                              onClick={() => handleEditBloque(match)}
                                              className="absolute inset-[2px] rounded-[var(--sys-radius-3xl)] border border-white/20 shadow-sm flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:z-20"
                                              style={{ backgroundColor: configAgenda[`COLOR_${match.estado}`] }}
                                            >
                                              <span className="text-[7px] font-black text-white uppercase leading-none">{match.tipo === 'PAUSA' ? <Coffee size={8} /> : <Briefcase size={8} />}</span>
                                              <span className="text-[6px] font-black text-white uppercase mt-0.5">{match.estado.substring(0, 4)}</span>
                                            </div>
                                          )}
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
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-primary" />
                Resumen de Carga
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carga Horaria Estimada</p>
                    <p className="text-xl font-black text-slate-800">
                      {horarioFormData.bloques?.filter(b => b.tipo === 'TRABAJO').reduce((acc, b) => {
                        const [sH, sM] = b.horaInicio.split(':').map(Number);
                        const [eH, eM] = b.horaFin.split(':').map(Number);
                        const mins = (eH * 60 + eM) - (sH * 60 + sM);
                        return acc + (mins * b.diasSemana.length * 4);
                      }, 0) / 60} <span className="text-xs text-slate-400">Hrs/Mes</span>
                    </p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Especialidad Principal</p>
                    <p className="text-sm font-black text-slate-700 uppercase">{terapeuta?.especialidades?.[0] || 'No definida'}</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Leyenda</h3>
              <div className="space-y-4">
                {[
                  { label: 'Disponible', color: configAgenda.COLOR_DISPONIBLE },
                  { label: 'Ocupado', color: configAgenda.COLOR_OCUPADO },
                  { label: 'Refrigerio', color: configAgenda.COLOR_REFRIGERIO },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full ring-4 ring-white/5" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <AlertModal 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Configurar Bloque de Horario"
        size="md"
      >
        {editingBloque && (
          <div className="space-y-6 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mes de Aplicación</label>
                  <select 
                    value={horarioFormData.mes}
                    onChange={(e) => handleFilterChange(Number(e.target.value), horarioFormData.año || filterYear)}
                    className="clini-input rounded-[var(--sys-radius-3xl)] border-slate-200 text-xs font-black"
                  >
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                       <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Año</label>
                  <select 
                    value={horarioFormData.año}
                    onChange={(e) => handleFilterChange(horarioFormData.mes || filterMonth, Number(e.target.value))}
                    className="clini-input rounded-[var(--sys-radius-3xl)] border-slate-200 text-xs font-black"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Días de la Semana (Multi-selección)</label>
                <div className="flex flex-wrap gap-2">
                   {DIAS.map(d => (
                     <button
                       key={d}
                       onClick={() => {
                         const current = editingBloque.diasSemana || [];
                         const next = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
                         setEditingBloque({...editingBloque, diasSemana: next});
                       }}
                       className={cn(
                         "px-4 py-2 rounded-[var(--sys-radius-3xl)] text-[10px] font-black uppercase transition-all border-2",
                         editingBloque.diasSemana?.includes(d) 
                           ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                           : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                       )}
                     >
                       {d.substring(0, 3)}
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-500">Hora Inicio</label>
                  <input 
                    type="time" 
                    className="clini-input bg-emerald-50/30 font-black border-2 border-emerald-100 focus:border-emerald-500 rounded-[var(--sys-radius-3xl)]"
                    value={editingBloque.horaInicio}
                    onChange={(e) => setEditingBloque({...editingBloque, horaInicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-500">Hora Fin</label>
                  <input 
                    type="time" 
                    className="clini-input bg-rose-50/30 font-black border-2 border-rose-100 focus:border-rose-500 rounded-[var(--sys-radius-3xl)]"
                    value={editingBloque.horaFin}
                    onChange={(e) => setEditingBloque({...editingBloque, horaFin: e.target.value})}
                  />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Actividad</label>
                  <select 
                    className="clini-input rounded-[var(--sys-radius-3xl)] border-slate-200"
                    value={editingBloque.tipo}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setEditingBloque({
                        ...editingBloque, 
                        tipo: type,
                        estado: type === 'PAUSA' ? 'REFRIGERIO' : 'DISPONIBLE'
                      });
                    }}
                  >
                    <option value="TRABAJO">💼 Horario Trabajo</option>
                    <option value="PAUSA">☕ Pausa / Refrigerio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disponibilidad</label>
                  <select 
                    className="clini-input rounded-[var(--sys-radius-3xl)] border-slate-200"
                    value={editingBloque.estado}
                    onChange={(e) => setEditingBloque({...editingBloque, estado: e.target.value as any})}
                  >
                    {editingBloque.tipo === 'PAUSA' ? (
                       <option value="REFRIGERIO">☕ Refrigerio</option>
                    ) : (
                      <>
                        <option value="DISPONIBLE">🟢 Disponible</option>
                        <option value="OCUPADO">🔴 Ocupado</option>
                        <option value="BLOQUEADO">🔒 Bloqueado</option>
                      </>
                    )}
                  </select>
                </div>
             </div>

             <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[var(--sys-radius-3xl)] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveBloque}
                  className="flex-1 py-4 bg-primary text-white rounded-[var(--sys-radius-3xl)] font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Confirmar Bloque
                </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
