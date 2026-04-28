import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Package, Plus, Info, Check, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { AlertModal } from '../common/AlertModal';
import { apiService } from '../../services/apiService';
import { Paciente, PaqueteMaestro } from '../../types';
import { cn } from '../../lib/utils';

interface ModalVentaPaqueteProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess: () => void;
}

export default function ModalVentaPaquete({ isOpen, onClose, currentUser, onSuccess }: ModalVentaPaqueteProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [maestros, setMaestros] = useState<PaqueteMaestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search States
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [showPatientList, setShowPatientList] = useState(false);

  const [selectedMaestro, setSelectedMaestro] = useState<PaqueteMaestro | null>(null);
  const [packageNameToAssign, setPackageNameToAssign] = useState<string>('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [p, m] = await Promise.all([
          apiService.getPacientes(),
          apiService.getPaquetesMaestros()
        ]);
        setPacientes(p);
        setMaestros(m);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      loadData();
      // Reset
      setSelectedPatient(null);
      setSelectedMaestro(null);
      setPatientSearch('');
    }
  }, [isOpen]);

  const filteredPacientes = pacientes.filter(p => 
    `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.documentoIdentidad.includes(patientSearch)
  );

  const handleConfirmClick = () => {
    if (!selectedPatient || !selectedMaestro) return;
    setIsConfirmOpen(true);
  };

  const handleExecuteAssign = async () => {
    if (!selectedPatient || !selectedMaestro) return;
    setIsConfirmOpen(false);
    setIsProcessing(true);
    try {
      await apiService.asignarPaqueteAPaciente(
        selectedPatient.id,
        selectedMaestro.id,
        selectedPatient.sede || currentUser.sede,
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
      title="Nueva Venta de Paquete"
      size="lg"
    >
      <div className="space-y-8 py-6">
        {/* Paso 1: Selección de Paciente (Predictive) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">1</div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight">Seleccionar Paciente</h4>
          </div>

          <div className="relative">
            {selectedPatient ? (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-[var(--sys-radius-3xl)] animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-primary/10">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{selectedPatient.nombres} {selectedPatient.apellidoPaterno}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedPatient.tipoDocumento}: {selectedPatient.documentoIdentidad}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch('');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[var(--sys-radius-3xl)] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                    placeholder="Buscar por Nombre, Apellido o DNI..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientList(true);
                    }}
                    onFocus={() => setShowPatientList(true)}
                  />
                </div>
                
                {showPatientList && patientSearch.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[var(--sys-radius-3xl)] border border-slate-100 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    {filteredPacientes.length > 0 ? (
                      <div className="p-2">
                        {filteredPacientes.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setShowPatientList(false);
                            }}
                            className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{p.nombres} {p.apellidoPaterno} {p.apellidoMaterno}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.documentoIdentidad}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm font-bold text-slate-400">No se encontraron pacientes</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Paso 2: Selección de Paquete (Catálogo) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">2</div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight">Vincular Plantilla de Catálogo</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maestros.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMaestro(m)}
                className={cn(
                  "p-5 rounded-[var(--sys-radius-3xl)] border-2 transition-all text-left relative overflow-hidden group h-full",
                  selectedMaestro?.id === m.id 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex flex-col h-full gap-3">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      selectedMaestro?.id === m.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                    )}>
                      <Package size={20} />
                    </div>
                    {selectedMaestro?.id === m.id && (
                      <div className="bg-primary text-white p-1 rounded-full animate-in zoom-in duration-300">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{m.nombre}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.cantCitas} SESIONES</span>
                       <span className="text-sm font-black text-primary ml-auto">S/ {m.precioSugerido}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {maestros.length === 0 && (
            <div className="p-8 text-center bg-amber-50 rounded-[var(--sys-radius-3xl)] border border-amber-100">
              <Info className="mx-auto text-amber-500 mb-2" size={32} />
              <p className="text-sm font-bold text-amber-700">No hay paquetes en el catálogo</p>
              <p className="text-xs text-amber-600">Debe crear plantillas en el Catálogo antes de vender.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50 rounded-[var(--sys-radius-3xl)] flex items-start gap-4 border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/5">
            <ShoppingCart size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Automatización de Venta</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
              Al confirmar, se creará el contrato inmutable del paciente y se generará un registro de <span className="font-bold text-primary">Cobro Pendiente</span> en el módulo de finanzas por el monto total.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            disabled={!selectedPatient || !selectedMaestro || isProcessing}
            onClick={handleConfirmClick}
            className="flex-2 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-primary text-white font-black uppercase text-xs tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>Procesando Venta...</>
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                Confirmar y Generar Pago
              </>
            )}
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmación de Venta"
        message={`¿Deseas asignar el paquete "${selectedMaestro?.nombre}" al paciente "${selectedPatient?.nombres}"? Esta acción generará un cobro pendiente automáticamente.`}
        type="warning"
        onConfirm={handleExecuteAssign}
      />
    </Modal>
  );
}
