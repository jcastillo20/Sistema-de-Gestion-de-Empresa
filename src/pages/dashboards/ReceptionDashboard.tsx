import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CreditCard, 
  Plus, 
  Search,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Paciente, Pago, Cita, Sede } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function ReceptionDashboard({ currentUser }: { currentUser: any }) {
  const { user: realUser } = useAuth();
  const [pacientesCount, setPacientesCount] = useState(0);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [pagosPendientes, setPagosPendientes] = useState<Pago[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<string>(currentUser.sede || 'ALL');

  const isAdmin = realUser?.perfil === 'SUPERADMIN' || realUser?.perfil === 'ADMINISTRADOR';

  useEffect(() => {
    const loadSedes = async () => {
      if (isAdmin) {
        const allSedes = await apiService.getSedes();
        setSedes(allSedes);
      }
    };
    loadSedes();
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      const sede = selectedSedeId === 'ALL' ? undefined : selectedSedeId;
      const [pacientes, pagos, allCitas] = await Promise.all([
        apiService.getPacientes(sede),
        apiService.getPagos(undefined, sede),
        apiService.getCitas(sede)
      ]);
      
      setPacientesCount(pacientes.length);
      setPagosPendientes(pagos.filter(p => p.estado !== 'PAGADO').slice(0, 5));
      
      const today = new Date().toISOString().split('T')[0];
      const todayCitas = allCitas.filter(c => c.fecha === today).map(c => ({
        id: c.id,
        paciente: c.nombrePaciente,
        hora: c.horaInicio,
        servicio: 'Sesión Agendada',
        estado: c.estadoCita
      })).slice(0, 10);

      setCitasHoy(todayCitas);
    };
    loadData();
  }, [currentUser, selectedSedeId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Branch Filter for Admin */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Search size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Control de Recepción</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Filtrar por Sede</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={selectedSedeId}
              onChange={(e) => setSelectedSedeId(e.target.value)}
              className="flex-1 sm:w-64 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option key="all" value="ALL">Todas las Sedes</option>
              {sedes.map(s => (
                <option key={s.idSede} value={s.idSede}>{s.nombreSede}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Quick Action Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary p-6 rounded-[var(--sys-radius-2xl)] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <Users size={40} className="mb-4 opacity-50" />
          <h3 className="text-3xl font-black tracking-tight leading-none">{pacientesCount}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Pacientes en Base</p>
          <div className="mt-6 flex gap-2">
             <button className="flex-1 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Nueva Cita</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">En Horario</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">12</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Citas restantes hoy</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-rose-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-tighter">Acción Requerida</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">S/ {pagosPendientes.length * 150}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Saldos por cobrar hoy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agenda del Día */}
        <section className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Agenda Próxima</h3>
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Bell size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {citasHoy.map((cita) => (
              <div key={cita.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-black shrink-0 border border-slate-100">
                  <span className="text-[10px] leading-none mb-1 opacity-50 uppercase">Hoy</span>
                  <span className="text-sm leading-none">{cita.hora}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 tracking-tight truncate">{cita.paciente}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cita.servicio}</p>
                </div>
                <div className="text-right">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                     cita.estado.includes('Llega') ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-primary/5 text-primary"
                   )}>
                     {cita.estado}
                   </span>
                </div>
                <button className="p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pagos Pendientes Rápidos */}
        <section className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Cobros de Hoy</h3>
          <div className="space-y-3">
            {pagosPendientes.map((pago) => (
              <div key={pago.idPago} className="flex flex-col p-4 rounded-2xl border border-slate-50 hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID {pago.idPago}</span>
                  <span className="text-xs font-black text-rose-500">S/ {pago.monto}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 truncate">{pago.concepto}</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all">
                    Cobrar Ahora
                  </button>
                </div>
              </div>
            ))}
            {pagosPendientes.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-slate-300">
                <Clock size={48} strokeWidth={1} className="mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Sin deudas críticas</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
