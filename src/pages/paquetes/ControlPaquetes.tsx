import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Plus, Search, Filter, Building2 as SedeIcon, Info, Package, User, Building2, ChevronDown, Trash2, Edit, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { AlertModal } from '../../components/common/AlertModal';
import { apiService } from '../../services/apiService';
import { exportService } from '../../services/exportService';
import { getExportContext } from '../../utils/exportUtils';
import { ExportButton } from '../../components/common/ExportButton';
import { PaquetePaciente, Sede, PaqueteMaestro } from '../../types';
import ModalVentaPaquete from '../../components/paquetes/ModalVentaPaquete';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';

interface ControlPaquetesProps {
  currentUser: any;
}

export default function ControlPaquetes({ currentUser }: ControlPaquetesProps) {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<PaquetePaciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [maestros, setMaestros] = useState<PaqueteMaestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [ventaToCancel, setVentaToCancel] = useState<PaquetePaciente | null>(null);

  const permissions = usePermissions(currentUser, 'paquetes_control');

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
      const [v, s, m, p] = await Promise.all([
        apiService.getPaquetesPacientes(),
        apiService.getSedes(),
        apiService.getPaquetesMaestros(),
        apiService.getPacientes()
      ]);

      // Data Enrichment: Ensure pacienteNombre is present and accurate
      const enrichedVentas = v.map(venta => {
        // Try to find patient by exact ID or by numeric part if needed
        let patient = p.find(pac => pac.id === venta.idPaciente);
        
        // Fallback for numeric IDs (e.g. "1" matching "PAC001")
        if (!patient && /^\d+$/.test(venta.idPaciente)) {
          const paddedId = `PAC${venta.idPaciente.padStart(3, '0')}`;
          patient = p.find(pac => pac.id === paddedId);
        }

        return {
          ...venta,
          pacienteNombre: patient 
            ? `${patient.nombres} ${patient.apellidoPaterno}` 
            : (venta.pacienteNombre && venta.pacienteNombre !== "1" ? venta.pacienteNombre : `ID: ${venta.idPaciente}`)
        };
      });

      setVentas(enrichedVentas);
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

  const handleCancelClick = (venta: PaquetePaciente) => {
    setVentaToCancel(venta);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!ventaToCancel) return;
    try {
      await apiService.cancelarPaquetePaciente(ventaToCancel.id, currentUser.nombreUsuario);
      setIsCancelModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportExcel = async (filteredData?: PaquetePaciente[]) => {
    const { branding, context } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredVentas;
    const dataToExport = sourceData.map(v => {
      const row: any = {
        'ID Venta': v.id,
        'Paciente': v.pacienteNombre,
        'Paquete': v.nombre,
        'Sesiones Totales': v.cantCitas,
        'Sesiones Consumidas': v.citasConsumidas,
        'Precio Venta': v.precioVenta,
        'Estado': v.estado
      };
      if (permissions.verTodo) row['Sede'] = v.sede;
      return row;
    });

    exportService.exportToExcel(dataToExport, {
      moduleName: 'Control de Paquetes y Ventas',
      fileName: 'Control_Ventas',
      branding: branding as any,
      context
    });
  };

  const handleExportPDF = async (filteredData?: PaquetePaciente[]) => {
    const { branding, context = null } = await getExportContext(currentUser);
    const sourceData = filteredData || filteredVentas;
    const dataToExport = sourceData.map(v => {
      const row: any = {
        'Paciente': v.pacienteNombre,
        'Paquete': v.nombre,
        'Progreso': `${v.citasConsumidas}/${v.cantCitas}`,
        'Precio': `S/ ${v.precioVenta}`,
        'Estado': v.estado
      };
      if (permissions.verTodo) row['Sede'] = v.sede;
      return row;
    });

    exportService.exportToPDF(dataToExport, {
      moduleName: 'Control de Paquetes y Ventas',
      fileName: 'Control_Ventas',
      branding: branding as any,
      context
    });
  };

  const handleGlobalReset = () => {
    setFilters({
      search: '',
      sede: 'ALL',
      maestro: 'ALL',
      estado: 'ALL'
    });
  };

  const filteredVentas = useMemo(() => {
    let result = ventas;

    // Aislamiento de sede por permisos (RBAC Strict)
    if (!permissions.verTodo && currentUser?.sede) {
      result = result.filter(v => v.sede === currentUser.sede);
    }

    return result.filter(v => {
      const patientName = v.pacienteNombre?.toLowerCase() || "";
      const matchesSearch = (v.nombre || '').toLowerCase().includes(filters.search.toLowerCase()) || 
                           (v.idPaciente || '').toLowerCase().includes(filters.search.toLowerCase()) ||
                           patientName.includes(filters.search.toLowerCase()) ||
                           (v.id || '').toLowerCase().includes(filters.search.toLowerCase());
      
      // Match using nombreSede (string) or idSede
      const matchesSede = filters.sede === 'ALL' || 
                         v.sede === filters.sede || 
                         (sedes.find(s => s.idSede === filters.sede)?.nombreSede === v.sede);
      const matchesMaestro = filters.maestro === 'ALL' || v.idMaestro === filters.maestro;
      
      let matchesEstado = filters.estado === 'ALL';
      if (!matchesEstado) {
        if (filters.estado === 'ACTIVO') matchesEstado = v.estado === 'ACTIVO' && v.citasConsumidas < v.cantCitas;
        if (filters.estado === 'AGOTADO') matchesEstado = v.citasConsumidas >= v.cantCitas;
        if (filters.estado === 'CANCELADO') matchesEstado = v.estado === 'CANCELADO';
      }

      return matchesSearch && matchesSede && matchesMaestro && matchesEstado;
    });
  }, [ventas, filters, permissions.verTodo, currentUser?.sede]);

  const columns = useMemo(() => {
    const cols = [
      { 
        header: 'Paciente / Contrato', 
        accessor: (v: PaquetePaciente) => {
          const initials = v.pacienteNombre 
            ? (v.pacienteNombre || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/ventas/nueva')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Área de Filtros pg-card */}
      <div className="clini-card p-6 border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            <span className="text-sm font-black uppercase tracking-tight text-slate-700">Filtros de Control</span>
          </div>
          {(filters.search !== '' || filters.sede !== 'ALL' || filters.maestro !== 'ALL' || filters.estado !== 'ALL') && (
            <button 
              onClick={handleGlobalReset}
              className="p-2.5 rounded-full border border-slate-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center h-[44px] w-[44px] shrink-0 active:scale-95 shadow-sm hover:shadow-md" 
              title="Limpiar Filtros"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}

          <div className="h-8 w-px bg-slate-100 mx-1" />

          <ExportButton 
            onExcel={() => handleExportExcel(filteredVentas)}
            onPdf={() => handleExportPDF(filteredVentas)}
            showLabel={false}
            className="rounded-full h-[44px] w-[44px] shadow-sm hover:shadow-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <label className="clini-label px-1">Buscar Venta</label>
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Paciente o Contrato..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-3xl)] text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all"
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
                {sedes.map(s => <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>)}
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
        onEdit={(v) => navigate(`/ventas/editar/${v.id}`)}
        onDelete={permissions.puedeEliminar ? handleCancelClick : undefined}
        showSearch={false}
        showFilters={false}
      />

      <AlertModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Anular Paquete"
        message={`¿Estás seguro que deseas anular el paquete "${ventaToCancel?.nombre}" para el paciente "${ventaToCancel?.pacienteNombre}"? Se anularán los cobros pendientes y citas no realizadas.`}
        type="error"
        onConfirm={handleConfirmCancel}
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
    </div>
  );
}
