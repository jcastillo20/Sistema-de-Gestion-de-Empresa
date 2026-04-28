import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clipboard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  History,
  Activity,
  ArrowRight,
  Search,
  ChevronDown
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Paciente, Cita, Terapeuta } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function TherapistDashboard({ currentUser }: { currentUser: any }) {
  const { user: realUser } = useAuth();
  const [pacientesCount, setPacientesCount] = useState(0);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [selectedTerapeutaId, setSelectedTerapeutaId] = useState<string>(currentUser.perfil === 'TERAPEUTA' ? currentUser.id : 'ALL');
  
  const [indicadores, setIndicadores] = useState({
    asistenciaMes: '94%',
    horasSemanales: 32,
    efectividad: '88%'
  });

  const isAdmin = realUser?.perfil === 'SUPERADMIN' || realUser?.perfil === 'ADMINISTRADOR';

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAdmin) {
        const allTerapeutas = await apiService.getTerapeutas();
        setTerapeutas(allTerapeutas);
      }
    };
    loadInitialData();
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      const terapeutaId = selectedTerapeutaId === 'ALL' ? undefined : selectedTerapeutaId;
      const sede = currentUser.sede === 'ALL' ? undefined : currentUser.sede;

      const [allCitas, pacientes] = await Promise.all([
        apiService.getCitas(sede, undefined, terapeutaId),
        apiService.getPacientes(sede)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayCitas = allCitas.filter(c => c.fecha === today);
      
      setCitasHoy(todayCitas);
      
      // If filtering all, we could show counts for all therapists
      if (selectedTerapeutaId === 'ALL') {
        setPacientesCount(pacientes.length);
        setIndicadores({
            asistenciaMes: '89%',
            horasSemanales: 140, // Suma de todos
            efectividad: '85%'
        });
      } else {
        // Mock data for specific therapist
        setPacientesCount(18);
        setIndicadores({
            asistenciaMes: '94%',
            horasSemanales: 32,
            efectividad: '88%'
        });
      }
    };
    loadData();
  }, [currentUser, selectedTerapeutaId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Filter for Admin */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Search size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visibilidad Global</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Filtrar por Terapeuta</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={selectedTerapeutaId}
              onChange={(e) => setSelectedTerapeutaId(e.target.value)}
              className="flex-1 sm:w-64 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option key="all" value="ALL">Todos los Terapeutas</option>
              {terapeutas.map(t => (
                <option key={t.idTerapeuta} value={t.idTerapeuta}>
                  {t.nombres} {t.apellidoPaterno}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mis Pacientes</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{pacientesCount}</h3>
            <span className="text-xs font-bold text-emerald-500">+3 esta semana</span>
          </div>
          <div className="mt-6">
             <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all">Ver todos <ArrowRight size={14} /></button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-500">
            <Activity size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asistencia (Mes)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{indicadores.asistenciaMes}</h3>
            <span className="text-xs font-bold text-emerald-500">Excl. feriados</span>
          </div>
           <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-emerald-500" />
           </div>
        </div>

        <div className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-primary">
            <Clock size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horas Agendadas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{indicadores.horasSemanales}</h3>
            <span className="text-xs font-bold text-slate-400">/ 40h semanales</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
            <Clock size={14} /> 8h disponibles
          </div>
        </div>
      </div>

      {/* Agenda & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Citas para Hoy</h3>
             <span className="px-4 py-2 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest">
               {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
             </span>
          </div>

          <div className="space-y-6">
            {citasHoy.map((cita) => (
              <div key={cita.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/20 before:rounded-full group">
                <div className="absolute left-[-4px] top-0 w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 tracking-tight leading-none">{cita.hora}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {cita.paciente}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{cita.notas}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">Iniciar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Acciones Pendientes</h3>
          <div className="space-y-4">
            <DashboardTask icon={Clipboard} title="Completar notas clínicas" patient="Sofia Martinez" time="Hace 2h" color="rose" />
            <DashboardTask icon={Calendar} title="Confirmar reprogramación" patient="Andrés García" time="Mañana 09:00" color="amber" />
            <DashboardTask icon={CheckCircle2} title="Validar sesiones extra" patient="Lucía Lopez" time="Hoy 18:00" color="emerald" />
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardTask({ icon: Icon, title, patient, time, color }: any) {
  const colors: any = {
    rose: "bg-rose-50 text-rose-500 border-rose-100",
    amber: "bg-amber-50 text-amber-500 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-500 border-emerald-100",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/30 transition-all cursor-pointer group">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", colors[color])}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient}</p>
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{time}</span>
    </div>
  );
}
