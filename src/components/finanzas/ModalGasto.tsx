import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { Sede } from '../../types';
import { ArrowDownLeft, Calendar, DollarSign, Tag, Building2, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalGastoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

export default function ModalGasto({ isOpen, onClose, onSuccess, currentUser }: ModalGastoProps) {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [formData, setFormData] = useState({
    monto: 0,
    concepto: '',
    idSede: currentUser.sede === 'ALL' ? '' : currentUser.sede,
    medio: 'EFECTIVO'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadSedes = async () => {
      const s = await apiService.getSedes();
      setSedes(s);
    };
    if (isOpen) {
      loadSedes();
      setFormData({
        monto: 0,
        concepto: '',
        idSede: currentUser.sede === 'ALL' ? '' : currentUser.sede,
        medio: 'EFECTIVO'
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (formData.monto <= 0 || !formData.concepto || !formData.idSede) return;
    setIsProcessing(true);
    try {
      await apiService.registrarGasto(
        formData.monto,
        formData.concepto,
        formData.idSede,
        formData.medio,
        currentUser.nombreUsuario
      );
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Gasto / Egreso"
      size="md"
    >
      <div className="space-y-6 pt-4">
        {/* Banner Section */}
        <div className="p-4 bg-rose-50 rounded-[var(--sys-radius-3xl)] flex items-center gap-4 border border-rose-100">
           <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
             <ArrowDownLeft size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Nuevo Egreso</p>
             <p className="text-sm font-bold text-rose-900">Registra una salida de caja de la clínica.</p>
           </div>
        </div>

        <div className="space-y-4">
           {/* Monto */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Importe del Gasto</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</div>
                <input 
                  type="number" 
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-2xl)] text-lg font-black focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                  placeholder="0.00"
                  value={formData.monto || ''}
                  onChange={e => setFormData({...formData, monto: parseFloat(e.target.value) || 0})}
                />
              </div>
           </div>

           {/* Concepto */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Concepto / Descripción</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-[var(--sys-radius-2xl)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  placeholder="Ej: Pago de luz, Mantenimiento..."
                  value={formData.concepto}
                  onChange={e => setFormData({...formData, concepto: e.target.value})}
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Sede */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sede de Ejecución</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <select 
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all outline-none appearance-none"
                    value={formData.idSede}
                    onChange={e => setFormData({...formData, idSede: e.target.value})}
                  >
                    <option value="">Seleccionar Sede</option>
                    {sedes.map(s => <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>)}
                  </select>
                </div>
              </div>

              {/* Medio de Pago */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Medio de Pago</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <select 
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all outline-none appearance-none"
                    value={formData.medio}
                    onChange={e => setFormData({...formData, medio: e.target.value})}
                  >
                    <option value="EFECTIVO">Efectivo (Caja)</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="YAPE/PLIN">Yape / Plin</option>
                  </select>
                </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={formData.monto <= 0 || !formData.concepto || !formData.idSede || isProcessing}
            onClick={handleSave}
            className="flex-2 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Registrando...' : 'Confirmar Gasto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
