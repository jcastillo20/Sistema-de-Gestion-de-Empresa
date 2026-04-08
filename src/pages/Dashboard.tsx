import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  CreditCard,
  CheckCircle2,
  PieChart,
  UserRound,
  Building2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Sede } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { apiService } from '../services/apiService';

const ICON_MAP: Record<string, any> = {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CreditCard,
  CheckCircle2,
  PieChart,
  UserRound,
  Building2,
  AlertCircle
};

export default function Dashboard({ currentUser }: { currentUser: any }) {
  const permissions = usePermissions(currentUser, 'dashboard');
  const isAdmin = permissions.verTodo; // Determines if the user has global access

  const [stats, setStats] = useState<any[]>([]);
  const [secondaryStats, setSecondaryStats] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeFilter, setSelectedSedeFilter] = useState(isAdmin ? 'ALL' : currentUser.sede);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const sedeFilter = selectedSedeFilter === 'ALL' ? undefined : selectedSedeFilter;
        
        const [
          statsData, 
          secondaryStatsData, 
          appointmentsData, 
          sedesData
        ] = await Promise.all([
          apiService.getDashboardStats(sedeFilter),
          apiService.getDashboardSecondaryStats(sedeFilter),
          apiService.getRecentAppointments(sedeFilter),
          apiService.getSedes()
        ]);

        setStats(statsData);
        setSecondaryStats(secondaryStatsData);
        setRecentAppointments(appointmentsData);
        setSedes(sedesData);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser.sede, isAdmin, selectedSedeFilter]);

  // Default stats structure for loading or if API fails
  const defaultStats = [
    { label: 'Pacientes Totales', value: '...', icon: Users, color: 'bg-primary', trend: '...', trendUp: true },
    { label: 'Citas Hoy', value: '...', icon: Calendar, color: 'bg-primary/80', trend: '...', trendUp: true },
    { label: 'Ingresos Mensuales', value: '...', icon: TrendingUp, color: 'bg-success', trend: '...', trendUp: true },
    { label: 'Terapeutas Activos', value: '...', icon: UserRound, color: 'bg-warning', trend: '...', trendUp: true },
  ];

  const defaultSecondaryStats = [
    { label: 'Pendientes de Pago', value: '...', icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Paquetes Activos', value: '...', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Nuevos Pacientes', value: '...', icon: Users, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Tasa de Asistencia', value: '...', icon: PieChart, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Sedes Operativas', value: '...', icon: Building2, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Horas Terapia', value: '...', icon: Clock, color: 'text-purple', bg: 'bg-purple/10' },
  ];

  const defaultRecentAppointments = [
    { id: 1, patient: 'Cargando...', therapist: '...', time: '...', status: 'PENDIENTE' },
    { id: 2, patient: 'Cargando...', therapist: '...', time: '...', status: 'PENDIENTE' },
    { id: 3, patient: 'Cargando...', therapist: '...', time: '...', status: 'PENDIENTE' },
    { id: 4, patient: 'Cargando...', therapist: '...', time: '...', status: 'PENDIENTE' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="clini-title-main">Bienvenido al Panel de Control</h2>
          <p className="text-slate-500">Resumen de actividad clínica para <span className="font-bold text-primary">{selectedSedeFilter === 'ALL' ? 'Todas las Sedes' : selectedSedeFilter}</span></p>
        </div>
        {isAdmin && (
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="input-field input-with-icon py-2 text-xs"
              value={selectedSedeFilter}
              onChange={(e) => setSelectedSedeFilter(e.target.value)}
            >
              <option value="ALL">Todas las Sedes</option>
              {sedes.map(s => (
                <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isLoading ? defaultStats : stats).map((stat, index) => {
          const Icon = typeof stat.icon === 'string' ? ICON_MAP[stat.icon] : stat.icon;
          return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="clini-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color, stat.color === 'bg-primary' && 'shadow-primary/20', stat.color === 'bg-success' && 'shadow-success/20', stat.color === 'bg-warning' && 'shadow-warning/20')}>
                {Icon && <Icon size={24} />}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-success' : 'text-danger'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <div className="text-2xl font-bold text-slate-900 mt-1">{isLoading ? <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div> : stat.value}</div>
          </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {(isLoading ? defaultSecondaryStats : secondaryStats).map((stat, index) => {
          const Icon = typeof stat.icon === 'string' ? ICON_MAP[stat.icon] : stat.icon;
          return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
            className={cn("p-4 rounded-2xl flex items-center gap-4 border border-transparent", stat.bg, isLoading && 'animate-pulse')}
          >
            <div className={cn("p-2 rounded-xl bg-white shadow-sm", stat.color)}>
              {Icon && <Icon size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <div className={cn("text-lg font-bold", stat.color)}>{isLoading ? <div className="h-6 w-16 bg-slate-200 rounded"></div> : stat.value}</div>
            </div>
          </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 clini-card overflow-hidden p-0">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="clini-title-section">Citas Recientes</h3>
            <button className="text-primary text-sm font-semibold hover:opacity-80">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Terapeuta</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(isLoading ? defaultRecentAppointments : recentAppointments).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{isLoading ? <div className="h-4 w-24 bg-slate-200 rounded"></div> : apt.patient}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{isLoading ? <div className="h-4 w-20 bg-slate-200 rounded"></div> : apt.therapist}</td>
                    <td className="px-6 py-4 text-slate-600">{isLoading ? <div className="h-4 w-12 bg-slate-200 rounded"></div> : apt.time}</td>
                    <td className="px-6 py-4">
                      {isLoading ? (
                        <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                      ) : (
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          apt.status === 'COMPLETADA' ? 'bg-success/10 text-success' : 
                          apt.status === 'CONFIRMADA' ? 'bg-info/10 text-info' : 
                          'bg-warning/10 text-warning'
                        )}>
                          {apt.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="clini-card p-6">
          <h3 className="clini-title-section mb-6">Acciones Rápidas</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 transition-all group">
              <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="font-semibold">Nueva Cita</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-success/10 text-success hover:bg-success/20 transition-all group">
              <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-semibold">Registrar Paciente</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all group">
              <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
              <span className="font-semibold">Nuevo Pago</span>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h4 className="clini-title-section text-sm mb-4">
              Ocupación de Sedes
            </h4>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                ))
              ) : (
                sedes
                  .filter(s => selectedSedeFilter === 'ALL' || s.nombreSede === selectedSedeFilter)
                  .map(sede => (
                    <div key={sede.idSede}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{sede.nombreSede}</span>
                        <span className="font-bold text-slate-900">
                          {sede.nombreSede === 'LIMA_SUR' ? '85%' : '42%'} {/* Mocked values */}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", sede.nombreSede === 'LIMA_SUR' ? 'bg-primary' : 'bg-accent')} 
                          style={{ width: sede.nombreSede === 'LIMA_SUR' ? '85%' : '42%' }}
                        ></div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
