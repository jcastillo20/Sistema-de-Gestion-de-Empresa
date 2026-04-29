import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Package, Plus, Info, Check, X, Clock, Stethoscope, AlertTriangle, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { Paciente, PaqueteMaestro, Terapeuta, Especialidad } from '../../types';
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
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search States
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [showPatientList, setShowPatientList] = useState(false);

  const [selectedMaestro, setSelectedMaestro] = useState<PaqueteMaestro | null>(null);
  
  // Paso 3: Terapeuta y Horario
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [idTerapeuta, setIdTerapeuta] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [fechaBase, setFechaBase] = useState(new Date().toISOString().split('T')[0]);

  // Proyecciones
  const [proyecciones, setProyecciones] = useState<any[]>([]);
  const [isCheckingCollisions, setIsCheckingCollisions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [p, m, t, e] = await Promise.all([
          apiService.getPacientes(),
          apiService.getPaquetesMaestros(),
          apiService.getTerapeutas(),
          apiService.getEspecialidades()
        ]);
        setPacientes(p);
        setMaestros(m);
        setTerapeutas(t);
        setEspecialidades(e);
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
      setIdTerapeuta('');
      setIdEspecialidad('');
      setHoraInicio('09:00');
      setFechaBase(new Date().toISOString().split('T')[0]);
      setProyecciones([]);
    }
  }, [isOpen]);

  const filteredPacientes = pacientes.filter(p => 
    `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.documentoIdentidad.includes(patientSearch)
  );

  const filteredTerapeutas = terapeutas.filter(t => 
    idEspecialidad === '' || t.especialidades?.includes(idEspecialidad)
  );

  useEffect(() => {
    const check = async () => {
      if (idTerapeuta && selectedMaestro && fechaBase && horaInicio) {
        setIsCheckingCollisions(true);
        try {
          const res = await apiService.checkPackageCollisions(idTerapeuta, selectedMaestro.id, fechaBase, horaInicio);
          setProyecciones(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsCheckingCollisions(false);
        }
      } else {
        setProyecciones([]);
      }
    };
    check();
  }, [idTerapeuta, selectedMaestro, fechaBase, horaInicio]);

  const hasCollisions = proyecciones.some(p => !p.disponible);

  const handleExecuteAssign = async () => {
    if (!selectedPatient || !selectedMaestro) return;
    if (hasCollisions) return;
    
    setIsProcessing(true);
    try {
      await apiService.asignarPaqueteAPaciente(
        selectedPatient.id,
        selectedMaestro.id,
        selectedPatient.sede || currentUser.sede,
        currentUser.nombreUsuario,
        idTerapeuta,
        horaInicio,
        proyecciones
      );
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || "Error al asignar paquete");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateSession = async (index: number, newFecha: string, newHora: string) => {
    if (!idTerapeuta) return;
    const validation = await apiService.validarDisponibilidad(idTerapeuta, newFecha, newHora);
    const newProy = [...proyecciones];
    newProy[index] = {
      ...newProy[index],
      fecha: newFecha,
      hora: newHora,
      disponible: validation.libre,
      motivo: validation.motivo
    };
    setProyecciones(newProy);
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

        {/* Paso 3: Asignación de Terapeuta y Horario */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">3</div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight">Programación Base</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Especialidad</label>
              <div className="relative">
                <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                  value={idEspecialidad}
                  onChange={e => {
                    setIdEspecialidad(e.target.value);
                    setIdTerapeuta('');
                  }}
                >
                  <option value="">Todas...</option>
                  {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Terapeuta</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                value={idTerapeuta}
                onChange={e => setIdTerapeuta(e.target.value)}
              >
                <option value="">Seleccionar Especialista...</option>
                {filteredTerapeutas.map(t => (
                  <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha de Inicio</label>
              <div className="relative">
                <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  value={fechaBase}
                  onChange={e => setFechaBase(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hora Base</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="time" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Projection Area */}
          {proyecciones.length > 0 && (
            <div className="mt-6 border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Previsualización de Citas</h5>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">Valide la disponibilidad antes de confirmar</p>
                </div>
                {isCheckingCollisions && (
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[8px] font-black uppercase">Validando Slots...</span>
                  </div>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 divide-y divide-slate-50">
                  {proyecciones.map((p, idx) => (
                    <div key={idx} className={cn("p-4 flex items-center justify-between transition-colors", !p.disponible ? "bg-rose-50/50" : "hover:bg-slate-50")}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm",
                          p.disponible ? "bg-white text-slate-400 border border-slate-100" : "bg-rose-500 text-white"
                        )}>
                          {p.indice}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="date"
                              className="bg-transparent border-none p-0 text-xs font-black text-slate-800 outline-none focus:text-primary transition-colors cursor-pointer"
                              value={p.fecha}
                              onChange={(e) => updateSession(idx, e.target.value, p.hora)}
                            />
                            <input 
                              type="time"
                              className="bg-transparent border-none p-0 text-xs font-black text-slate-800 outline-none focus:text-primary transition-colors cursor-pointer"
                              value={p.hora}
                              onChange={(e) => updateSession(idx, p.fecha, e.target.value)}
                            />
                          </div>
                          {!p.disponible && (
                            <p className="text-[9px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              {p.motivo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.disponible ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                            <Check size={12} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Disponible</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg">
                            <X size={12} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Colisión</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {hasCollisions && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 animate-pulse">
               <AlertTriangle className="text-rose-500 shrink-0" size={18} />
               <p className="text-[10px] text-rose-600 font-bold leading-relaxed">
                 Existen conflictos de horario (marcados en rojo). El sistema <span className="font-black underline italic">no permite</span> generar el paquete hasta que todas las sesiones estén disponibles. Ajuste las fechas o cambie el terapeuta.
               </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50 rounded-[var(--sys-radius-3xl)] flex items-start gap-4 border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/5">
            <ShoppingCart size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Automatización de Venta y Citas</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
              Al confirmar, se creará el contrato y se agendarán <span className="font-bold text-primary">{selectedMaestro?.cantCitas || 0} sesiones</span> verificadas. Se generará un <span className="font-bold text-primary">Cobro Pendiente</span> por el monto total.
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
            disabled={!selectedPatient || !selectedMaestro || isProcessing || hasCollisions || !idTerapeuta}
            onClick={handleExecuteAssign}
            className="flex-2 py-4 px-6 rounded-[var(--sys-radius-3xl)] bg-primary text-white font-black uppercase text-xs tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>Procesando Venta...</>
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                Confirmar y Agendar
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
