import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Building2,
  Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Paciente, Pago, Sede } from '../../types';
import { cn } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';

export default function AdminDashboard({ currentUser }: { currentUser: any }) {
  const { user: realUser } = useAuth();
  const [stats, setStats] = useState({
    pacientesNuevos: 0,
    recaudacionMes: 0,
    ocupacionPorcentaje: 0,
    citasHoy: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<string>(currentUser.sede || 'ALL');

  const isAdmin = realUser?.perfil === 'SUPERADMIN' || realUser?.perfil === 'ADMINISTRADOR';

  useEffect(() => {
    const loadSedes = async () => {
      const allSedes = await apiService.getSedes();
      setSedes(allSedes);
    };
    loadSedes();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const sede = selectedSedeId === 'ALL' ? undefined : selectedSedeId;
      const [pacientes, pagos, transacciones] = await Promise.all([
        apiService.getPacientes(sede),
        apiService.getPagos(undefined, sede),
        apiService.getTransacciones()
      ]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      // Pacientes nuevos este mes
      const nuevos = pacientes.filter(p => {
        const d = new Date(p.fechaCreacion);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;

      // Recaudación este mes (filtrada por sede si es necesario)
      let filteredTransacciones = transacciones;
      if (sede) {
          const allPagos = await apiService.getPagos(undefined, sede);
          const validPagoIds = new Set(allPagos.map(p => p.idPago));
          filteredTransacciones = transacciones.filter(t => validPagoIds.has(t.idPago));
      }

      const recaudado = filteredTransacciones.filter(t => {
        const d = new Date(t.fecha);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).reduce((sum, t) => sum + t.monto, 0);

      setStats({
        pacientesNuevos: nuevos,
        recaudacionMes: recaudado,
        ocupacionPorcentaje: 78, 
        citasHoy: 24 
      });

      // Data para el gráfico (últimos 6 meses)
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        
        const mName = months[m];
        const mRev = filteredTransacciones.filter(t => {
          const td = new Date(t.fecha);
          return td.getMonth() === m && td.getFullYear() === y;
        }).reduce((sum, t) => sum + t.monto, 0);

        last6Months.push({ name: mName, total: mRev });
      }
      setRevenueData(last6Months);
    };

    loadStats();
  }, [currentUser, selectedSedeId]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Branch Filter for Admin */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Análisis Operativo</p>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Filtro de Sede / Global</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={selectedSedeId}
            onChange={(e) => setSelectedSedeId(e.target.value)}
            className="flex-1 sm:w-64 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option key="all" value="ALL">Consolidado (Todas las Sedes)</option>
            {sedes.map(s => (
              <option key={s.idSede} value={s.idSede}>{s.nombreSede}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Welcome & Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Recaudación (Mes)" 
          value={`S/ ${stats.recaudacionMes.toLocaleString()}`} 
          trend="+12.5%" 
          trendType="up"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard 
          title="Pacientes Nuevos" 
          value={stats.pacientesNuevos} 
          trend="+4" 
          trendType="up"
          icon={Users}
          color="primary"
        />
        <StatCard 
          title="Ocupación" 
          value={`${stats.ocupacionPorcentaje}%`} 
          trend="-2.1%" 
          trendType="down"
          icon={Calendar}
          color="amber"
        />
        <StatCard 
          title="Citas para Hoy" 
          value={stats.citasHoy} 
          trend="8 críticas" 
          trendType="neutral"
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Flujo de Ingresos</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Consolidado Mensual de Transacciones</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                <TrendingUp size={12} />
                +18.4%
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => `S/${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--primary-color)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase mb-2">Desempeño Sedes</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Ocupación Actual por Locación</p>
          
          <div className="space-y-6 flex-1">
            <SedeRank name="San Borja" value={85} color="bg-primary" />
            <SedeRank name="Miraflores" value={62} color="bg-emerald-500" />
            <SedeRank name="La Molina" value={45} color="bg-amber-500" />
            <SedeRank name="Surco" value={92} color="bg-rose-500" />
          </div>

          <button className="mt-8 w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">
            Ver Reporte Detallado
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendType, icon: Icon, color }: any) {
  const colors: any = {
    primary: "bg-primary/10 text-primary shadow-primary/20",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-500/10",
    amber: "bg-amber-50 text-amber-600 shadow-amber-500/10",
    rose: "bg-rose-50 text-rose-600 shadow-rose-500/10",
  };

  return (
    <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg", colors[color])}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1",
          trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
          trendType === 'down' ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
        )}>
          {trendType === 'up' ? <ArrowUpRight size={12} /> : trendType === 'down' ? <ArrowDownRight size={12} /> : null}
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-800 tracking-tight tabular-nums">{value}</h4>
    </div>
  );
}

function SedeRank({ name, value, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{name}</span>
        <span className="text-xs font-black text-slate-400">{value}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
