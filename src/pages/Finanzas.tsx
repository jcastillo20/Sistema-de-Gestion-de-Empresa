import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  History, 
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { apiService } from '../services/apiService';
import { Pago, Transaccion, Paciente } from '../types';
import { cn } from '../lib/utils';
import ModalAbono from '../components/finanzas/ModalAbono';
import ModalGasto from '../components/finanzas/ModalGasto';

interface FinanzasProps {
  currentUser: any;
}

export default function Finanzas({ currentUser }: FinanzasProps) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sede = currentUser.sede === 'ALL' ? undefined : currentUser.sede;
      const [pagosData, todasTransacciones, pacientesData] = await Promise.all([
        apiService.getPagos(undefined, sede),
        apiService.getTransacciones(),
        apiService.getPacientes(sede)
      ]);
      setPagos(pagosData);
      setTransacciones(todasTransacciones);
      setPacientes(pacientesData);
    } catch (error) {
      console.error("Error al cargar datos financieros", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.sede]);

  const getPacienteName = (id: string) => {
    const p = pacientes.find(pac => pac.id === id);
    return p ? `${p.nombres} ${p.apellidoPaterno}` : 'N/A';
  };

  const getSedeName = (id: string) => {
    return id || 'N/A';
  };

  const handleAbonoClick = (pago: Pago) => {
    setSelectedPago(pago);
    setIsAbonoModalOpen(true);
  };

  const columns = [
    {
      header: 'Paciente',
      accessor: (p: Pago) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{getPacienteName(p.idPaciente)}</span>
          <span className="text-[10px] text-slate-400 font-medium">Ref: {p.idPago}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Concepto',
      accessor: (p: Pago) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-50 text-slate-400 shrink-0">
            <Receipt size={14} />
          </div>
          <span className="truncate max-w-[200px]">{p.concepto}</span>
        </div>
      )
    },
    {
      header: 'Monto Total',
      accessor: (p: Pago) => (
        <span className="font-black text-slate-900">S/ {p.monto.toFixed(2)}</span>
      ),
      sortable: true,
      className: 'text-right'
    },
    {
      header: 'Saldo',
      accessor: (p: Pago) => {
        const abonos = transacciones.filter(t => t.idPago === p.idPago).reduce((s, t) => s + t.monto, 0);
        const saldo = p.monto - abonos;
        return (
          <div className="flex flex-col items-end">
            <span className={cn("font-black", saldo === 0 ? "text-emerald-500" : "text-rose-500")}>
              S/ {saldo.toFixed(2)}
            </span>
            <div className="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", saldo === 0 ? "bg-emerald-400" : "bg-rose-400")} 
                style={{ width: `${(abonos / p.monto) * 100}%` }}
              />
            </div>
          </div>
        );
      },
      className: 'text-right'
    },
    {
      header: 'Estado',
      accessor: (p: Pago) => (
        <div className="flex justify-center">
          <span className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
            p.estado === 'PAGADO' ? "bg-emerald-50 text-emerald-600" : 
            p.estado === 'PARCIAL' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
          )}>
            {p.estado}
          </span>
        </div>
      ),
      className: 'text-center'
    },
    {
      header: 'Sede',
      accessor: (p: Pago) => (
        <span className="text-[10px] font-black text-slate-400 uppercase">{getSedeName(p.idSede)}</span>
      )
    }
  ];

  const totalPorCobrar = pagos
    .filter(p => p.estado !== 'PAGADO')
    .reduce((sum, p) => {
      const abonos = transacciones.filter(t => t.idPago === p.idPago).reduce((s, t) => s + t.monto, 0);
      return sum + (p.monto - abonos);
    }, 0);

  const recaudacionMes = transacciones
    .filter(t => {
      const date = new Date(t.fecha);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.monto, 0);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="z-10">
          <h2 className="clini-title-main text-3xl">Tesorería y Caja</h2>
          <p className="clini-subtitle-main mt-2">Gestión de ingresos, deudas y abonos de pacientes.</p>
        </div>
        <div className="flex items-center gap-4 z-10">
          <button 
            onClick={() => setIsGastoModalOpen(true)}
            className="btn-primary bg-rose-500 hover:bg-rose-600 shadow-rose-200 flex items-center gap-2"
          >
            <ArrowDownLeft size={20} />
            Registrar Egreso
          </button>
          <button 
            onClick={loadData}
            className="p-3 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all hover:rotate-180 duration-500"
            title="Sincronizar Datos"
          >
            <History size={20} />
          </button>
        </div>
      </div>

      {/* Stats Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Por Cobrar</p>
            <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">S/ {totalPorCobrar.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Cobrado (Mes)</p>
            <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">S/ {recaudacionMes.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Pagos Pendientes</p>
            <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">
              {pagos.filter(p => p.estado !== 'PAGADO').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[var(--sys-radius-2xl)] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Transacciones</p>
            <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{transacciones.length}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <DataTable
        title="Control de Cuentas por Cobrar"
        data={pagos}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar por paciente o concepto..."
        searchFields={['idPago', 'idPaciente', 'concepto']}
        customActions={(p: Pago) => (
          <div className="flex items-center gap-2">
            {p.estado !== 'PAGADO' && (
              <button 
                onClick={() => handleAbonoClick(p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                <CreditCard size={14} />
                Cobrar
              </button>
            )}
            <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
              <History size={16} />
            </button>
          </div>
        )}
      />

      {/* Modal de Registro de Abono */}
      {selectedPago && (
        <ModalAbono
          isOpen={isAbonoModalOpen}
          onClose={() => setIsAbonoModalOpen(false)}
          onSuccess={loadData}
          pago={selectedPago}
          pacienteName={getPacienteName(selectedPago.idPaciente)}
          currentUser={currentUser}
          saldoPendiente={selectedPago.monto - transacciones.filter(t => t.idPago === selectedPago.idPago).reduce((s, t) => s + t.monto, 0)}
        />
      )}

      <ModalGasto 
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        onSuccess={loadData}
        currentUser={currentUser}
      />
    </div>
  );
}
