import React from 'react';
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
import { usePermissions } from '../hooks/usePermissions';
import { MOCK_SEDES } from '../services/mockDb';

export default function Dashboard({ currentUser }: { currentUser: any }) {
  const permissions = usePermissions(currentUser, 'dashboard');
  const activeSedesCount = MOCK_SEDES.filter(s => s.estado).length;
  const isAdmin = permissions.verTodo;

  const stats = [
    { label: 'Pacientes Totales', value: isAdmin ? '1,284' : '412', icon: Users, color: 'bg-primary', trend: '+12%', trendUp: true },
    { label: 'Citas Hoy', value: isAdmin ? '42' : '15', icon: Calendar, color: 'bg-primary/80', trend: '+5%', trendUp: true },
    { label: 'Ingresos Mensuales', value: isAdmin ? 'S/ 12,450' : 'S/ 4,120', icon: TrendingUp, color: 'bg-emerald-500', trend: '+18%', trendUp: true },
    { label: 'Terapeutas Activos', value: isAdmin ? '18' : '6', icon: UserRound, color: 'bg-amber-500', trend: '0%', trendUp: true },
  ];

  const secondaryStats = [
    { label: 'Pendientes de Pago', value: isAdmin ? '15' : '4', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Paquetes Activos', value: isAdmin ? '84' : '22', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Nuevos Pacientes', value: isAdmin ? '28' : '9', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasa de Asistencia', value: '94%', icon: PieChart, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Sedes Operativas', value: isAdmin ? activeSedesCount.toString() : '1', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Horas Terapia', value: isAdmin ? '1,420' : '380', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const recentAppointments = [
    { id: 1, patient: 'Juan Pérez', therapist: 'Dra. Ana García', time: '09:00 AM', status: 'COMPLETADA' },
    { id: 2, patient: 'María Rodríguez', therapist: 'Dr. Carlos Ruiz', time: '10:30 AM', status: 'CONFIRMADA' },
    { id: 3, patient: 'Roberto Gómez', therapist: 'Dra. Ana García', time: '11:45 AM', status: 'PENDIENTE' },
    { id: 4, patient: 'Elena Martínez', therapist: 'Lic. Sofía López', time: '02:15 PM', status: 'CONFIRMADA' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bienvenido al Panel de Control</h2>
          <p className="text-slate-500">Resumen de actividad clínica para <span className="font-bold text-primary">{isAdmin ? 'Todas las Sedes' : currentUser.sede}</span></p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <Building2 size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">{currentUser.sede}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {secondaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
            className={cn("p-4 rounded-2xl flex items-center gap-4 border border-transparent", stat.bg)}
          >
            <div className={cn("p-2 rounded-xl bg-white shadow-sm", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Citas Recientes</h3>
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
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{apt.patient}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{apt.therapist}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${apt.status === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' : 
                          apt.status === 'CONFIRMADA' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {apt.status}
                      </span>
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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6">Acciones Rápidas</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 transition-all group">
              <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="font-semibold">Nueva Cita</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all group">
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
            <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              {isAdmin ? 'Ocupación de Sedes' : 'Ocupación de mi Sede'}
            </h4>
            <div className="space-y-4">
              {isAdmin ? (
                MOCK_SEDES.map(sede => (
                  <div key={sede.idSede}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{sede.nombreSede}</span>
                      <span className="font-bold text-slate-900">
                        {sede.nombreSede === 'SEDE CENTRAL' ? '85%' : '42%'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", sede.nombreSede === 'SEDE CENTRAL' ? 'bg-primary' : 'bg-amber-500')} 
                        style={{ width: sede.nombreSede === 'SEDE CENTRAL' ? '85%' : '42%' }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{currentUser.sede}</span>
                    <span className="font-bold text-slate-900">65%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
