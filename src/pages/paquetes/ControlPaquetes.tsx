import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, Search, Filter, Building2 as SedeIcon, Info, Package, User } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { apiService } from '../../services/apiService';
import { PaquetePaciente, Sede, PaqueteMaestro } from '../../types';
import ModalVentaPaquete from '../../components/paquetes/ModalVentaPaquete';
import { cn } from '../../lib/utils';

interface ControlPaquetesProps {
  currentUser: any;
}

export default function ControlPaquetes({ currentUser }: ControlPaquetesProps) {
  const [ventas, setVentas] = useState<PaquetePaciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [maestros, setMaestros] = useState<PaqueteMaestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);

  // Filtros Avanzados
  const [filters, setFilters] = useState({
    search: '',
    sede: 'ALL',
    maestro: 'ALL',
    estado: 'ALL'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [v, s, m] = await Promise.all([
        apiService.getPaquetesPacientes(),
        apiService.getSedes(),
        apiService.getPaquetesMaestros()
      ]);
      setVentas(v);
      setSedes(s);
      setMaestros(m);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredVentas = ventas.filter(v => {
    const matchesSearch = v.nombre.toLowerCase().includes(filters.search.toLowerCase()) || 
                         v.idPaciente.toLowerCase().includes(filters.search.toLowerCase()); // In real app, match by patient name
    const matchesSede = filters.sede === 'ALL' || v.sede === filters.sede;
    const matchesMaestro = filters.maestro === 'ALL' || v.idMaestro === filters.maestro;
    const matchesEstado = filters.estado === 'ALL' || v.estado === filters.estado;
    return matchesSearch && matchesSede && matchesMaestro && matchesEstado;
  });

  const columns = [
    { 
      header: 'Paciente / Contrato', 
      accessor: (v: PaquetePaciente) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
            <User size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">Paciente: {v.idPaciente}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">ID Venta: {v.id}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Paquete Adquirido', 
      accessor: (v: PaquetePaciente) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-700 text-sm">{v.nombre}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.frecuencia}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Progreso', 
      accessor: (v: PaquetePaciente) => (
        <div className="w-32 space-y-1.5">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>{v.citasConsumidas}/{v.cantCitas}</span>
            <span>{Math.round((v.citasConsumidas / v.cantCitas) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(v.citasConsumidas / v.cantCitas) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    { 
      header: 'Estado', 
      accessor: (v: PaquetePaciente) => (
        <span className={cn(
          "pg-status-pill", 
          v.estado === 'ACTIVO' ? "pg-status--active" : "pg-status--inactive"
        )}>
          {v.estado}
        </span>
      )
    },
    { 
      header: 'Precio Venta', 
      accessor: (v: PaquetePaciente) => (
        <span className="font-black text-slate-900">S/ {v.precioVenta}</span>
      )
    }
  ];

  return (
    <div className="clini-animate-fade space-y-8 pb-10">
      <div className="clini-page-header">
        <div>
          <h2 className="clini-title-main font-black">Control de Paquetes</h2>
          <p className="clini-subtitle">Seguimiento de ventas, consumo y estados de contratos.</p>
        </div>
        <button 
          onClick={() => setIsVentaModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {/* Área de Filtros pg-card */}
      <div className="pg-card p-6 border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Buscar Paciente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Nombre o ID..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Filtrar Sede</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none cursor-pointer"
                value={filters.sede}
                onChange={e => setFilters({...filters, sede: e.target.value})}
              >
                <option value="ALL">Todas las Sedes</option>
                {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombreSede}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Paquete Maestro</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none cursor-pointer"
                value={filters.maestro}
                onChange={e => setFilters({...filters, maestro: e.target.value})}
              >
                <option value="ALL">Cualquier Paquete</option>
                {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Estado de Uso</label>
            <div className="relative">
              <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none cursor-pointer"
                value={filters.estado}
                onChange={e => setFilters({...filters, estado: e.target.value})}
              >
                <option value="ALL">Todos los Estados</option>
                <option value="ACTIVO">Activos (Con Citas)</option>
                <option value="AGOTADO">Agotados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title="Ventas Realizadas"
        data={filteredVentas}
        columns={columns as any}
        isLoading={isLoading}
      />

      {ventas.length === 0 && !isLoading && (
        <div className="p-20 text-center bg-white rounded-[var(--sys-radius-3xl)] border border-dashed border-slate-200">
           <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
             <Info size={32} />
           </div>
           <p className="font-black text-slate-800 text-lg uppercase tracking-tight">No se registran ventas</p>
           <p className="text-sm text-slate-400 font-medium">Usa el botón superior para realizar la primera venta de un paquete.</p>
        </div>
      )}

      <ModalVentaPaquete 
        isOpen={isVentaModalOpen}
        onClose={() => setIsVentaModalOpen(false)}
        currentUser={currentUser}
        onSuccess={loadData}
      />
    </div>
  );
}
