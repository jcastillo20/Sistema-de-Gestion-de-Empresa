import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  X,
  Smartphone,
  Wallet,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { Pago, Transaccion } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ModalAbonoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pago: Pago;
  pacienteName: string;
  currentUser: any;
  saldoPendiente: number;
}

export default function ModalAbono({ 
  isOpen, 
  onClose, 
  onSuccess, 
  pago, 
  pacienteName,
  currentUser,
  saldoPendiente
}: ModalAbonoProps) {
  const [monto, setMonto] = useState<string>(saldoPendiente.toString());
  const [medio, setMedio] = useState<Transaccion['medio']>('EFECTIVO');
  const [comprobante, setComprobante] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Monto inválido");
      setIsLoading(false);
      return;
    }

    if (montoNum > saldoPendiente) {
      setError(`El monto no puede exceder el saldo pendiente (S/ ${saldoPendiente})`);
      setIsLoading(false);
      return;
    }

    try {
      await apiService.registrarAbono(
        pago.idPago,
        montoNum,
        medio,
        comprobante,
        currentUser.id || currentUser.nombreUsuario
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar el abono");
    } finally {
      setIsLoading(false);
    }
  };

  const mediosPago = [
    { id: 'EFECTIVO', label: 'Efectivo', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'YAPE', label: 'Yape / Plin', icon: Smartphone, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'TRANSFERENCIA', label: 'Transferencia', icon: Building2, color: 'bg-amber-50 text-amber-600' },
    { id: 'TARJETA', label: 'Tarjeta', icon: CreditCard, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Abono"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resumen del Pago */}
        <div className="bg-slate-50 p-6 rounded-[var(--sys-radius-2xl)] space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paciente</p>
              <h4 className="font-black text-slate-800 tracking-tight leading-tight">{pacienteName}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID Pago</p>
              <span className="text-xs font-bold text-slate-500">{pago.idPago}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Paquete</p>
              <span className="text-sm font-bold text-slate-700">S/ {pago.monto.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Saldo Pendiente</p>
              <span className="text-lg font-black text-rose-500 tracking-tighter leading-none">S/ {saldoPendiente.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Selección de Medio */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medio de Pago</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mediosPago.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMedio(m.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                    medio === m.id 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", m.color)}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs de Dinero */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto a Cobrar (S/)</label>
            <div className="relative mt-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <DollarSign size={18} strokeWidth={3} />
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nº Operación / Referencia</label>
            <div className="relative mt-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Receipt size={18} strokeWidth={3} />
              </div>
              <input
                type="text"
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                placeholder="Ej: TRX-123456"
              />
            </div>
          </div>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl border border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[1.5] flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={18} strokeWidth={3} />
            )}
            Confirmar Cobro
          </button>
        </div>
      </form>
    </Modal>
  );
}
