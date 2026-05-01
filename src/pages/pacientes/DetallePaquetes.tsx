import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  AlertCircle, 
  CreditCard, 
  Wallet, 
  Heart,
  ChevronRight,
  Stethoscope,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Paciente, PaquetePaciente, Cita, Pago } from '../../types';
import { cn } from '../../lib/utils';

export default function DetallePaquetes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [paquetes, setPaquetes] = useState<PaquetePaciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [p, pp, c, allPagos] = await Promise.all([
          apiService.getPacientes().then(list => list.find(x => x.id === id) || null),
          apiService.getPaquetesPacientes().then(list => list.filter(x => x.idPaciente === id)),
          apiService.getCitas(undefined, id),
          apiService.getPagos(id)
        ]);
        setPaciente(p);
        setPaquetes(pp);
        setCitas(c);
        setPagos(allPagos);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const stats = useMemo(() => {
    const totalPagado = pagos.filter(p => p.estado === 'PAGADO').reduce((acc, p) => acc + p.monto, 0);
    const totalPendiente = pagos.filter(p => p.estado === 'PENDIENTE').reduce((acc, p) => acc + p.monto, 0);
    const paquetesActivos = paquetes.filter(p => p.estado === 'ACTIVO').length;
    const sesionesConsumidas = citas.filter(c => c.estadoCita === 'COMPLETADA').length;
    
    return { totalPagado, totalPendiente, paquetesActivos, sesionesConsumidas };
  }, [pagos, paquetes, citas]);

  if (isLoading) return <div className="p-12 text-center animate-pulse font-black text-slate-400 tracking-widest uppercase text-xs">Cargando Historia Clínica...</div>;
  if (!paciente) return <div className="p-12 text-center text-rose-500 font-bold uppercase tracking-widest text-xs">Paciente no encontrado</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/pacientes')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center gap-2 mb-0.5">
               <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Expediente Médico</span>
               <span className="text-[10px] text-slate-300 font-bold"># {paciente.id.substring(0, 8)}</span>
             </div>
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
               {paciente.nombres} {paciente.apellidoPaterno}
             </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/ventas/nueva')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Paquete
          </button>
          <button 
            onClick={() => navigate('/agenda')}
            className="btn-secondary flex items-center gap-2 border-slate-200"
          >
            <Calendar size={18} />
            Agendar Sesión
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
               <CreditCard size={64} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda Pendiente</p>
            <p className={cn("text-2xl font-black", stats.totalPendiente > 0 ? "text-rose-500" : "text-emerald-500")}>
              S/ {stats.totalPendiente.toFixed(2)}
            </p>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
               <Package size={64} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paquetes Activos</p>
            <p className="text-2xl font-black text-slate-800">{stats.paquetesActivos}</p>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
               <Clock size={64} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sesiones Consumidas</p>
            <p className="text-2xl font-black text-slate-800">{stats.sesionesConsumidas}</p>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
               <Wallet size={64} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Inversión</p>
            <p className="text-2xl font-black text-slate-800">S/ {stats.totalPagado.toFixed(2)}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-24 h-24 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-amber-100/50 shadow-xl border-4 border-white">
                <User size={48} />
              </div>
              
              <div className="text-center space-y-1 mb-8">
                 <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">{paciente.nombres}</h4>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DNI: {paciente.documentoIdentidad}</p>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <MapPin size={12} className="text-slate-300" /> Sede Principal
                    </p>
                    <p className="text-xs font-bold text-slate-600">{paciente.sede || 'No especificada'}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Phone size={12} className="text-slate-300" /> Contacto Directo
                    </p>
                    <p className="text-xs font-bold text-slate-600">{paciente.telefono || 'N/A'}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Mail size={12} className="text-slate-300" /> Comunicación
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 truncate">{paciente.correo || 'N/A'}</p>
                 </div>
              </div>
           </div>

           {/* Outstanding Balances if any */}
           {stats.totalPendiente > 0 && (
             <div className="bg-rose-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-rose-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <AlertCircle size={20} />
                   </div>
                   <h5 className="font-black text-[10px] uppercase tracking-widest">Cargos Pendientes</h5>
                </div>
                <p className="text-xs font-medium text-rose-100 leading-tight mb-6">El paciente tiene una deuda acumulada que requiere regularización inmediata.</p>
                <button 
                  onClick={() => navigate('/finanzas')}
                  className="w-full py-3 bg-white text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                   Gestión de Cobro
                   <ChevronRight size={14} />
                </button>
             </div>
           )}
        </div>

        {/* Main Timeline of Packages & Appointments */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                 <Package size={16} className="text-primary" />
                 Línea de Tiempo de Paquetes
              </h4>
           </div>

           <div className="space-y-8">
              {paquetes.length === 0 ? (
                <div className="py-20 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={24} className="text-slate-200" />
                   </div>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin Historial de Paquetes</p>
                </div>
              ) : (
                paquetes.sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)).map(paq => {
                   const citasPaq = citas.filter(c => c.idPaquete === paq.id);
                   const completadas = citasPaq.filter(c => c.estadoCita === 'COMPLETADA').length;
                   const porcentaje = (completadas / paq.cantCitas) * 100;

                   return (
                     <div key={paq.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm relative group hover:border-primary/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 mb-2">
                                 <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight">{paq.nombre}</h5>
                                 <span className={cn(
                                   "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                   paq.estado === 'ACTIVO' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                 )}>
                                   {paq.estado}
                                 </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Contratado el {paq.fechaContrato}</span>
                                 <span className="flex items-center gap-1.5 text-primary"><CreditCard size={14} /> S/ {paq.precioVenta.toFixed(2)}</span>
                              </div>
                           </div>

                           <div className="w-full md:w-56 space-y-2">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo de Sesiones</span>
                                 <span className="text-[11px] font-black text-slate-800">{completadas} / {paq.cantCitas}</span>
                              </div>
                              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                 <div 
                                   className={cn(
                                     "h-full transition-all duration-1000",
                                     porcentaje === 100 ? "bg-emerald-500" : "bg-primary"
                                   )} 
                                   style={{ width: `${porcentaje}%` }} 
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Session Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                           {citasPaq.sort((a,b) => a.fecha.localeCompare(b.fecha)).map((cita, idx) => (
                             <div 
                               key={cita.id} 
                               className={cn(
                                 "p-3 rounded-2xl border text-center relative",
                                 cita.estadoCita === 'COMPLETADA' ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
                               )}
                             >
                               <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1 select-none">Terapia {idx + 1}</span>
                               <p className="text-[9px] font-black text-slate-800">{new Date(cita.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                               <div className="mt-2 flex justify-center">
                                  {cita.estadoCita === 'COMPLETADA' ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                  ) : (
                                    <Clock size={16} className="text-primary/20" />
                                  )}
                               </div>
                               {/* Hover details */}
                               <div className="absolute inset-0 bg-slate-800/95 opacity-0 hover:opacity-100 rounded-2xl transition-opacity flex flex-col items-center justify-center p-2 z-20">
                                  <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1">Terapeuta</p>
                                  <p className="text-[9px] font-bold text-white leading-tight uppercase text-center line-clamp-1">{cita.nombreTerapeuta?.split(' ')[0]}</p>
                               </div>
                             </div>
                           ))}
                           {/* Add Session Placeholder */}
                           {completadas < paq.cantCitas && (
                             <button 
                               onClick={() => navigate('/agenda')}
                               className="p-3 rounded-2xl border-2 border-dashed border-slate-100 text-slate-300 hover:border-primary/30 hover:text-primary transition-all flex flex-col items-center justify-center gap-1"
                             >
                               <Plus size={16} />
                               <span className="text-[8px] font-black uppercase tracking-tight">Agendar</span>
                             </button>
                           )}
                        </div>
                     </div>
                   );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
