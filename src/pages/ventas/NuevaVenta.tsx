import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Package, 
  Check, 
  X, 
  Clock, 
  Stethoscope, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  ArrowLeft 
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Paciente, PaqueteMaestro, Terapeuta, Especialidad, PaquetePaciente } from '../../types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function NuevaVenta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [maestros, setMaestros] = useState<PaqueteMaestro[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Mode state
  const [editingVenta, setEditingVenta] = useState<PaquetePaciente | null>(null);

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

        if (id) {
          const ventaData = await apiService.getPaquetePaciente(id);
          if (ventaData) {
            setEditingVenta(ventaData);
            const pFound = p.find(pac => pac.id === ventaData.idPaciente);
            if (pFound) setSelectedPatient(pFound);
            
            const mFound = m.find(ma => ma.id === ventaData.idMaestro);
            if (mFound) setSelectedMaestro(mFound);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

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
    if (!selectedPatient || !selectedMaestro || !currentUser) return;
    
    setIsProcessing(true);
    try {
      if (id && editingVenta) {
        // En modo edición solo actualizamos datos básicos por ahora para proteger proyecciones ya agendadas
        await apiService.updatePaquetePaciente(id, {
          precioVenta: selectedMaestro.precioSugerido // o un campo de precio manual si existiera
        }, currentUser.nombreUsuario);
        navigate('/ventas');
      } else {
        if (hasCollisions) return;
        await apiService.asignarPaqueteAPaciente(
          selectedPatient.id,
          selectedMaestro.id,
          selectedPatient.sede || currentUser.sede,
          currentUser.nombreUsuario,
          idTerapeuta,
          horaInicio,
          proyecciones
        );
        navigate('/finanzas');
      }
    } catch (e: any) {
      alert(e.message || "Error al procesar venta");
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

  if (isLoading) return <div className="p-12 text-center font-black text-slate-400 animate-pulse">CARGANDO MOTOR DE VENTAS...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {id ? 'Editar Venta de Paquete' : 'Nueva Venta de Paquete'}
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            {id ? 'Actualización de contrato y condiciones' : 'Flujo integrado automatizado de venta y cobranza'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Paso 1: Paciente */}
            <div className="clini-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">1</div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Seleccionar Paciente</h3>
                </div>

                <div className="relative">
                    {selectedPatient ? (
                    <div className="flex items-center justify-between p-5 bg-primary/5 border border-primary/20 rounded-3xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-primary/10">
                            <User size={28} />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-lg">{selectedPatient.nombres} {selectedPatient.apellidoPaterno}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedPatient.tipoDocumento}: {selectedPatient.documentoIdentidad}</p>
                        </div>
                        </div>
                        <button 
                        onClick={() => {
                            setSelectedPatient(null);
                            setPatientSearch('');
                        }}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                        <X size={24} />
                        </button>
                    </div>
                    ) : (
                    <>
                        <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input
                            type="text"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                            placeholder="Buscar por Nombre o DNI..."
                            value={patientSearch}
                            onChange={(e) => {
                            setPatientSearch(e.target.value);
                            setShowPatientList(true);
                            }}
                            onFocus={() => setShowPatientList(true)}
                        />
                        </div>
                        
                        {showPatientList && patientSearch.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
                            {filteredPacientes.length > 0 ? (
                            <div className="p-3">
                                {filteredPacientes.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                    setSelectedPatient(p);
                                    setShowPatientList(false);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <User size={24} />
                                    </div>
                                    <div>
                                    <p className="font-black text-slate-800">{p.nombres} {p.apellidoPaterno}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{p.documentoIdentidad}</p>
                                    </div>
                                </button>
                                ))}
                            </div>
                            ) : (
                            <div className="p-12 text-center">
                                <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No se encontraron pacientes</p>
                                <p className="text-xs text-slate-500 font-bold mt-2">Verifique los datos o registre uno nuevo.</p>
                            </div>
                            )}
                        </div>
                        )}
                    </>
                    )}
                </div>
            </div>

            {/* Paso 2: Paquete */}
            <div className="clini-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">2</div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Vincular Plan de Tratamiento</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {maestros.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedMaestro(m)}
                        className={cn(
                        "p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group h-full",
                        selectedMaestro?.id === m.id 
                            ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                            : "border-slate-100 hover:border-primary/20 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex flex-col h-full gap-4">
                        <div className="flex items-center justify-between">
                            <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            selectedMaestro?.id === m.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                            <Package size={24} />
                            </div>
                            {selectedMaestro?.id === m.id && (
                            <div className="bg-primary text-white p-2 rounded-full animate-in zoom-in duration-500">
                                <Check size={16} strokeWidth={4} />
                            </div>
                            )}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg leading-tight uppercase tracking-tight">{m.nombre}</p>
                            <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.cantCitas} SESIONES</span>
                            <span className="text-lg font-black text-primary ml-auto">S/ {m.precioSugerido}</span>
                            </div>
                        </div>
                        </div>
                    </button>
                    ))}
                </div>
            </div>

            {/* Paso 3: Programación */}
            <div className="clini-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">3</div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Programación Estratégica</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Especialidad</label>
                        <div className="relative">
                            <Stethoscope size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none appearance-none"
                                value={idEspecialidad}
                                onChange={e => {
                                    setIdEspecialidad(e.target.value);
                                    setIdTerapeuta('');
                                }}
                            >
                                <option value="">Todas las Especialidades...</option>
                                {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Terapeuta</label>
                        <select 
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none"
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
                            <CalendarIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                            type="date" 
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                            value={fechaBase}
                            onChange={e => setFechaBase(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hora Base</label>
                        <div className="relative">
                            <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                            type="time" 
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                            value={horaInicio}
                            onChange={e => setHoraInicio(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            {/* Sidebar Projection / Confirmation */}
            <div className="clini-card p-8 sticky top-8 space-y-8">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resumen del Paquete</h4>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-black text-slate-800 uppercase leading-relaxed">
                            {selectedMaestro?.nombre || 'Seleccione un paquete...'}
                        </p>
                        {selectedMaestro && (
                            <div className="mt-2 flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedMaestro.cantCitas} Sesiones</span>
                                <span className="text-xl font-black text-primary">S/ {selectedMaestro.precioSugerido}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Previsualización Citas</h4>
                        {isCheckingCollisions && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    </div>

                    <div className={cn(
                        "space-y-2 max-h-[400px] overflow-y-auto no-scrollbar",
                        proyecciones.length === 0 && "py-12 text-center opacity-30 grayscale"
                    )}>
                        {proyecciones.length > 0 ? (
                            proyecciones.map((p, idx) => (
                                <div key={idx} className={cn(
                                    "p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all",
                                    p.disponible ? "bg-white border-slate-100" : "bg-rose-50 border-rose-100"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]",
                                            p.disponible ? "bg-slate-100 text-slate-400" : "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                        )}>
                                            {p.indice}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-800">{p.fecha}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.hora}</p>
                                        </div>
                                    </div>
                                    {p.disponible ? (
                                        <Check size={14} className="text-emerald-500" strokeWidth={4} />
                                    ) : (
                                        <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center">
                                <CalendarIcon size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingrese Terapeuta y Horario</p>
                            </div>
                        )}
                    </div>
                </div>

                {hasCollisions && (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                        <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-[9px] text-rose-600 font-bold leading-tight uppercase tracking-tight">
                            Existen colisiones. Debe ajustar las fechas manualmente antes de proceder.
                        </p>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <ShoppingCart size={16} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                            Al confirmar se agendarán <span className="text-slate-800 font-black">{selectedMaestro?.cantCitas || 0}</span> sesiones y se enviará al módulo de <span className="text-slate-800 font-black">Finanzas</span> para cobro.
                        </p>
                    </div>

                    <button
                        disabled={!selectedPatient || !selectedMaestro || isProcessing || (!id && (hasCollisions || !idTerapeuta))}
                        onClick={handleExecuteAssign}
                        className="w-full py-5 rounded-3xl bg-primary text-white font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                        <>
                            <Check size={20} strokeWidth={3} />
                            {id ? 'Guardar Cambios' : 'Generar Venta'}
                        </>
                        )}
                    </button>
                    <button 
                         onClick={() => navigate(-1)}
                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                    >
                        Cancelar Todo
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
