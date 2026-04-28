import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Plus, Search, Filter, Building2 as SedeIcon, Info, Package, User, Building2, ChevronDown } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { apiService } from '../../services/apiService';
import { PaquetePaciente, Sede, PaqueteMaestro } from '../../types';
import ModalVentaPaquete from '../../components/paquetes/ModalVentaPaquete';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';

interface ControlPaquetesProps {
  currentUser: any;
}

export default function ControlPaquetes({ currentUser }: ControlPaquetesProps) {
  const [ventas, setVentas] = useState<PaquetePaciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [maestros, setMaestros] = useState<PaqueteMaestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);

  const permissions = usePermissions(currentUser, 'paquetes_control');

  // Filtros Avanzados
  const [filters, setFilters] = useState({
    search: '',
    sede: 'ALL',
    maestro: 'ALL',
    estado: 'ALL'
  });

  useEffect(() => {
    if (!permissions.verTodo && currentUser?.sede) {
      setFilters(f => ({ ...f, sede: currentUser.sede }));
    }
  }, [permissions.verTodo, currentUser?.sede]);

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

  const filteredVentas = useMemo(() => {
    let result = ventas;

    // Aislamiento de sede por permisos
    if (!permissions.verTodo && currentUser?.sede) {
      result = result.filter(v => v.sede === currentUser.sede);
    }

    return result.filter(v => {
      const patientName = v.pacienteNombre?.toLowerCase() || '';
      const matchesSearch = v.nombre.toLowerCase().includes(filters.search.toLowerCase()) || 
                           v.idPaciente.toLowerCase().includes(filters.search.toLowerCase()) ||
                           patientName.includes(filters.search.toLowerCase());
      
      const matchesSede = filters.sede === 'ALL' || v.sede === filters.sede;
      const matchesMaestro = filters.maestro === 'ALL' || v.idMaestro === filters.maestro;
      const matchesEstado = filters.estado === 'ALL' || v.estado === filters.estado;
      return matchesSearch && matchesSede && matchesMaestro && matchesEstado;
    });
  }, [ventas, filters, permissions.verTodo, currentUser?.sede]);

  const columns = useMemo(() => {
    const cols = [
      { 
        header: 'Paciente / Contrato', 
        accessor: (v: PaquetePaciente) => {
          const initials = v.pacienteNombre 
            ? v.pacienteNombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : v.idPaciente.substring(0, 2).toUpperCase();

          return (
            <div className="pg-cell-person">
              <div className="pg-avatar group-hover:scale-110 transition-transform">
                {initials}
              </div>
              <div className="pg-cell-person-info">
                <p className="pg-cell-name">{v.pacienteNombre || v.idPaciente}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">ID Venta: {v.id}</p>
              </div>
            </div>
          );
        }
      },
      { 
        header: 'Paquete Adquirido', 
        accessor: (v: PaquetePaciente) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-700 text-sm">{v.nombre}</span>
            <div className="flex items-center gap-2">
              <span className="pg-chip pg-chip--slate">{v.frecuencia}</span>
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
            <span className={cn("pg-status-dot", v.estado === 'ACTIVO' ? "pg-dot--active" : "pg-dot--inactive")}></span>
            {v.estado}
          </span>
        )
      }
    ];

    if (permissions.verTodo) {
      cols.push({
        header: 'Sede',
        accessor: (v: PaquetePaciente) => (
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Building2 size={14} className="text-slate-300" />
            <span className="pg-chip pg-chip--primary text-[9px]">{v.sede}</span>
          </div>
        )
      } as any);
    }

    cols.push({ 
      header: 'Precio Venta', 
      accessor: (v: PaquetePaciente) => (
        <span className="font-black text-slate-900">S/ {v.precioVenta}</span>
      )
    } as any);

    return cols;
  }, [permissions.verTodo]);

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
      <div className="clini-card p-6 border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="clini-label px-1">Buscar Paciente</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all placeholder:text-slate-300"
                placeholder="Nombre, Paquete o ID..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className={cn("space-y-2", !permissions.verTodo && "opacity-50 pointer-events-none grayscale")}>
            <label className="clini-label px-1">Filtrar Sede</label>
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <select 
                disabled={!permissions.verTodo}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all"
                value={filters.sede}
                onChange={e => setFilters({...filters, sede: e.target.value})}
              >
                <option value="ALL">Todas las Sedes</option>
                {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombreSede}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="clini-label px-1">Paquete Maestro</label>
            <div className="relative group">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <select 
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all"
                value={filters.maestro}
                onChange={e => setFilters({...filters, maestro: e.target.value})}
              >
                <option value="ALL">Cualquier Paquete</option>
                {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="clini-label px-1">Estado de Uso</label>
            <div className="relative group">
              <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <select 
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all"
                value={filters.estado}
                onChange={e => setFilters({...filters, estado: e.target.value})}
              >
                <option value="ALL">Todos los Estados</option>
                <option value="ACTIVO">Activos (Con Citas)</option>
                <option value="AGOTADO">Agotados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
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
