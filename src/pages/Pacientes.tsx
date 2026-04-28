import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { AlertModal } from '../components/common/AlertModal';
import { Paciente, Sede, PaqueteMaestro, PaquetePaciente } from '../types';
import { UserPlus, Mail, Phone, User, Building2, ShieldCheck, UserCheck, Package, ShoppingCart, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VALIDATION_RULES, PROFILES_WITH_SEDE_ACCESS } from '../constants';
import { usePermissions } from '../hooks/usePermissions';
import { cn } from '@/src/lib/utils';
import { apiService } from '../services/apiService';
import PackageCard from '../components/paquetes/PackageCard';

interface PacientesProps {
  currentUser: any;
}

export default function Pacientes({ currentUser }: PacientesProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [patientPackages, setPatientPackages] = useState<PaquetePaciente[]>([]);
  const [masterPackages, setMasterPackages] = useState<PaqueteMaestro[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [isConfirmAssignOpen, setIsConfirmAssignOpen] = useState(false);
  const [packageToAssign, setPackageToAssign] = useState<string | null>(null);
  const [packageNameToAssign, setPackageNameToAssign] = useState<string>('');

  const permissions = usePermissions(currentUser, 'pacientes');

  if (!permissions.acceso) {
    return (
      <div className="clini-denied-container">
        <div className="clini-denied-icon">
          <ShieldCheck size={32} />
        </div>
        <h3 className="clini-denied-title">Acceso Denegado</h3>
        <p className="clini-denied-text">
          No tienes los permisos necesarios para acceder al módulo de pacientes. 
          Por favor, contacta con el administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, [currentUser.sede]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Use permission verTodo to decide if we filter by sede
      const sedeFilter = permissions.verTodo ? undefined : currentUser.sede;
      const [pacientesData, sedesData, masters] = await Promise.all([
        apiService.getPacientes(sedeFilter),
        apiService.getSedes(),
        apiService.getPaquetesMaestros()
      ]);
      setPacientes(pacientesData);
      setSedes(sedesData);
      setMasterPackages(masters);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [patientStats, setPatientStats] = useState({
    totalCitas: 0,
    asistencias: 0,
    deuda: 0,
    paquetesActivos: 0
  });

  const [patientCitas, setPatientCitas] = useState<any[]>([]);

  const loadPatientStats = async (pacienteId: string) => {
    const [packs, pagos, citas, transacciones] = await Promise.all([
      apiService.getPaquetesPacientes(pacienteId),
      apiService.getPagos(pacienteId), // Note: apiService.getPagos arg order is idPaciente, sede? 
      apiService.getCitas(undefined, pacienteId),
      apiService.getTransacciones()
    ]);
    
    setPatientPackages(packs);
    setPatientCitas(citas);
    
    // Calcular deuda: Suma de montos de pagos menos suma de transacciones vinculadas
    const stats = {
      totalCitas: citas.length,
      asistencias: citas.filter(c => c.estadoCita === 'ASISTIÓ' || c.estadoCita === 'FINALIZADO').length,
      deuda: pagos.reduce((acc, p) => {
        const pagado = transacciones
          .filter(t => t.idPago === p.idPago)
          .reduce((sum, t) => sum + t.monto, 0);
        return acc + (p.monto - pagado);
      }, 0),
      paquetesActivos: packs.filter(p => p.estado === 'ACTIVO').length
    };
    setPatientStats(stats);
  };

  const handleOpenPackages = async (p: Paciente) => {
    setSelectedPaciente(p);
    setShowAllPackages(false);
    loadPatientStats(p.id);
    setIsPackModalOpen(true);
  };

  const handleAssignPackageClick = (idMaestro: string, nombreMaestro: string) => {
    setPackageToAssign(idMaestro);
    setPackageNameToAssign(nombreMaestro);
    setIsConfirmAssignOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedPaciente || !packageToAssign) return;
    setIsConfirmAssignOpen(false);
    setIsAssigning(true);
    try {
      await apiService.asignarPaqueteAPaciente(
        selectedPaciente.id,
        packageToAssign,
        selectedPaciente.sede || currentUser.sede,
        currentUser.nombreUsuario
      );
      await loadPatientStats(selectedPaciente.id);
      setAlertConfig({ title: 'Paquete Asignado', message: `El paquete "${packageNameToAssign}" se ha vinculado al paciente y se ha generado el cargo financiero.`, type: 'success' });
      setIsAlertOpen(true);
    } catch (error: any) {
      setAlertConfig({ title: 'Error', message: error.message || 'No se pudo asignar el paquete.', type: 'error' });
      setIsAlertOpen(true);
    } finally {
      setIsAssigning(false);
      setPackageToAssign(null);
    }
  };

  const validateForm = (formData: any) => {
    if (!formData.nombres || !formData.apellidoPaterno || !formData.documentoIdentidad) {
      return 'Por favor complete los campos obligatorios.';
    }
    if (!VALIDATION_RULES.TEXT_ONLY.test(formData.nombres) || !VALIDATION_RULES.TEXT_ONLY.test(formData.apellidoPaterno)) {
      return 'Los nombres y apellidos solo deben contener letras.';
    }
    if (formData.correo && !VALIDATION_RULES.EMAIL.test(formData.correo)) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (formData.documentoIdentidad && !VALIDATION_RULES.DNI.test(formData.documentoIdentidad)) {
      return 'El DNI debe tener 8 dígitos.';
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Permission check
    if (selectedPaciente && !permissions.puedeEditar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para editar pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }
    if (!selectedPaciente && !permissions.puedeCrear) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para crear pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;
    
    const error = validateForm(data);
    if (error) {
      setAlertConfig({ title: 'Error de Validación', message: error, type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      if (selectedPaciente) {
        await apiService.updatePaciente(selectedPaciente.id, data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Paciente Actualizado', message: 'Los datos se han guardado correctamente.', type: 'success' });
      } else {
        await apiService.createPaciente(data, currentUser.nombreUsuario);
        setAlertConfig({ title: 'Paciente Registrado', message: 'El nuevo paciente ha sido creado con éxito.', type: 'success' });
      }
      
      setIsModalOpen(false);
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo completar la operación.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const handleDelete = async (p: Paciente) => {
    if (!permissions.puedeEliminar) {
      setAlertConfig({ title: 'Acceso Denegado', message: 'No tienes permisos para eliminar pacientes.', type: 'error' });
      setIsAlertOpen(true);
      return;
    }

    try {
      await apiService.deletePaciente(p.id, currentUser.nombreUsuario);
      setAlertConfig({ title: 'Estado Actualizado', message: 'El estado del paciente ha sido modificado correctamente.', type: 'success' });
      setIsAlertOpen(true);
      loadData();
    } catch (error) {
      setAlertConfig({ title: 'Error', message: 'No se pudo cambiar el estado del paciente.', type: 'error' });
      setIsAlertOpen(true);
    }
  };

  const columns: any[] = [
    { 
      header: 'Paciente', 
      accessor: (p: Paciente) => (
        <div className="pg-cell-person">
          <div className="pg-avatar flex items-center justify-center bg-primary/10 border border-primary shadow-sm hover:shadow-md transition-all">
            <span className="text-primary font-black text-[10px] tracking-tighter">
              {p.nombres.charAt(0).toUpperCase()}{p.apellidoPaterno.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="pg-cell-person-info">
            <div className="flex items-center gap-2">
              <p className="pg-cell-name font-black text-slate-900 leading-tight">
                {p.nombres} {p.apellidoPaterno}
              </p>
            </div>
            <p className="pg-cell-doc text-[11px] font-medium text-slate-400">
              {p.tipoDocumento}: {p.documentoIdentidad}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'apellidoPaterno'
    },
    { 
      header: 'Contacto', 
      accessor: (p: Paciente) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail size={14} className="text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{p.correo || 'Sin correo'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone size={14} className="text-slate-400 shrink-0" />
            <span>{p.telefono || 'Sin teléfono'}</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'correo'
    }
  ];

  if (permissions.verTodo) {
    columns.push({ 
      header: 'Sede', 
      accessor: (p: Paciente) => (
        <span className={cn(
          "pg-chip", 
          p.sede === 'ALL' ? "pg-chip--primary" : "pg-chip--info"
        )}>
          <Building2 size={12} className="shrink-0" />
          {p.sede}
        </span>
      ), 
      sortable: true, 
      sortKey: 'sede' 
    });
  }

  columns.push({ 
    header: 'Estado', 
    accessor: (p: Paciente) => (
      <div className={cn("pg-status-pill", p.estado ? "pg-status--active" : "pg-status--inactive")}>
        <span className={cn("pg-status-dot", p.estado ? "pg-dot--active" : "pg-dot--inactive")} />
        {p.estado ? 'Activo' : 'Inactivo'}
      </div>
    ),
    sortable: true,
    sortKey: 'estado'
  });

  return (
    <div className="clini-page-container clini-space-y-ui-g">
      <div className="clini-page-header clini-flex-between-center">
        <div>
          <h2 className="clini-title-main">Gestión de Pacientes</h2>
          <p className="clini-subtitle">Administra la información y expedientes de tus pacientes.</p>
        </div>
      </div>

      <DataTable 
        title="Listado de Pacientes"
        data={pacientes}
        columns={columns}
        searchPlaceholder="Buscar por nombre, apellido o DNI..."
        searchFields={['nombres', 'apellidoPaterno', 'apellidoMaterno', 'documentoIdentidad']}
        onAdd={permissions.puedeCrear ? () => {
          setSelectedPaciente(null);
          setIsModalOpen(true);
        } : undefined}
        onEdit={permissions.puedeEditar ? (p) => {
          setSelectedPaciente(p);
          setIsModalOpen(true);
        } : undefined}
        onDelete={permissions.puedeEliminar ? handleDelete : undefined}
        customActions={(p) => (
          <button 
            onClick={() => handleOpenPackages(p)}
            className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors active:scale-95"
            title="Paquetes del Paciente"
          >
            <Package size={16} />
          </button>
        )}
      />

      <Modal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        title={`Expediente: ${selectedPaciente?.nombres} ${selectedPaciente?.apellidoPaterno}`}
        size="lg"
      >
        <div className="space-y-8 py-4">
          {/* Top 4 Cards - Expediente Híbrido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Citas Totales</p>
              <p className="text-2xl font-black text-slate-900">{patientStats.totalCitas}</p>
            </div>
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Asistencias</p>
              <p className="text-2xl font-black text-emerald-700">{patientStats.asistencias}</p>
            </div>
            <div className="p-4 rounded-3xl bg-rose-50 border border-rose-100">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Deuda Pendiente</p>
              <p className="text-2xl font-black text-rose-700">S/ {patientStats.deuda}</p>
            </div>
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Paquetes Activos</p>
              <p className="text-2xl font-black text-amber-700">{patientStats.paquetesActivos}</p>
            </div>
          </div>

          {/* Listado de Citas Recientes/Próximas */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tight">
              <ShieldCheck size={18} className="text-primary" />
              Agenda y Seguimiento
            </h4>
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
               {patientCitas.length > 0 ? (
                 <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                   {patientCitas.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(cita => (
                     <div key={cita.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-primary leading-none">{new Date(cita.fecha).getDate()}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">{new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}</span>
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-700">{cita.horaInicio} - {cita.horaFin}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{cita.sede}</p>
                           </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                          cita.estadoCita === 'PENDIENTE' ? "bg-amber-100 text-amber-600" :
                          cita.estadoCita === 'ASISTIÓ' ? "bg-emerald-100 text-emerald-600" :
                          "bg-slate-100 text-slate-400"
                        )}>
                          {cita.estadoCita}
                        </span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 text-center text-slate-400 italic text-xs">
                    No se registran citas para este paciente.
                 </div>
               )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tight">
                <ShoppingCart size={18} className="text-primary" />
                Suscripciones y Contratos
              </h4>
              {patientPackages.length > 0 && (
                <button
                  onClick={() => setShowAllPackages(!showAllPackages)}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all"
                >
                  {showAllPackages ? 'Ver Cards Recientes' : 'Ver Historial Completo'}
                </button>
              )}
            </div>

            {patientPackages.length > 0 ? (
              showAllPackages ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <DataTable 
                    title="Historial Completo"
                    data={patientPackages}
                    showSearch={false}
                    showFilters={false}
                    columns={[
                      { 
                        header: 'Fecha', 
                        accessor: (p: PaquetePaciente) => <span className="font-medium text-slate-500">{new Date(p.fechaContrato).toLocaleDateString()}</span>,
                        sortable: true,
                        sortKey: 'fechaContrato'
                      },
                      { 
                        header: 'Paquete', 
                        accessor: 'nombre' as any,
                        className: 'font-bold text-slate-700',
                        sortable: true
                      },
                      { 
                        header: 'Estado', 
                        accessor: (p: PaquetePaciente) => (
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter",
                              p.estado === 'ACTIVO' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                              {p.estado}
                            </span>
                          </div>
                        ),
                        sortable: true,
                        sortKey: 'estado'
                      },
                      { 
                        header: 'Progreso', 
                        accessor: (p: PaquetePaciente) => (
                          <div className="flex items-center gap-3">
                            <span className="font-black text-primary min-w-[35px] text-right">{Math.round((p.citasConsumidas / p.cantCitas) * 100)}%</span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.citasConsumidas / p.cantCitas) * 100}%` }}
                                className="h-full bg-primary" 
                              />
                            </div>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {patientPackages.slice(0, 4).map((pack: PaquetePaciente) => (
                    <PackageCard key={pack.id} pack={pack} />
                  ))}
                </div>
              )
            ) : (
              <div className="p-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Package size={32} />
                </div>
                <p className="text-slate-500 font-bold">Sin paquetes activos</p>
                <p className="text-xs text-slate-400">El paciente aún no ha contratado ningún plan terapéutico.</p>
              </div>
            )}
          </section>

          {/* Buscador/Asignador de Paquetes Maestros */}
          <section className="space-y-4 pt-6 border-t font-sans">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              <h4 className="font-black text-slate-800 uppercase tracking-tight">Vincular Nuevo Paquete</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {masterPackages.map(master => (
                <button
                  key={master.id}
                  disabled={isAssigning}
                  onClick={() => handleAssignPackageClick(master.id, master.nombre)}
                  className="p-4 rounded-3xl border border-slate-200 text-left hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{master.nombre}</p>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{master.cantCitas} Citas</span>
                       <span className="text-primary font-black">S/ {master.precioSugerido}</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} className="text-primary" />
                  </div>
                </button>
              ))}
            </div>
            {masterPackages.length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-sm">
                <Info size={20} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  No hay "Paquetes Maestros" definidos. Debe crearlos primero en el módulo de Paquetes para poder venderlos.
                </p>
              </div>
            )}
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
      >
        <form onSubmit={handleSave} className="clini-form-stack clini-space-y-ui-g">
          <div className="clini-form-grid">
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Nombres *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="nombres" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.nombres} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Paterno *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoPaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.apellidoPaterno} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Apellido Materno</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="apellidoMaterno" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.apellidoMaterno} />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Tipo de Documento *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <UserCheck size={18} />
                </div>
                <select name="tipoDocumento" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.tipoDocumento || 'DNI'}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Nro. Documento *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <User size={18} />
                </div>
                <input name="documentoIdentidad" type="text" className="clini-input-field-icon-left" placeholder="12345678" defaultValue={selectedPaciente?.documentoIdentidad} required />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Sede *</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Building2 size={18} />
                </div>
                {permissions.verTodo ? (
                  <select name="sede" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.sede || currentUser.sede}>
                    {sedes.map(s => ( 
                      <option key={s.idSede} value={s.nombreSede}>{s.nombreSede}</option>
                    ))}
                  </select>
                ) : (
                  <div className="clini-field-disabled-display">
                    {selectedPaciente?.sede || currentUser.sede}
                    <input type="hidden" name="sede" value={selectedPaciente?.sede || currentUser.sede} />
                  </div>
                )}
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Teléfono</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Phone size={18} />
                </div>
                <input name="telefono" type="text" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.telefono} />
              </div>
            </div>
            <div className="clini-form-field clini-space-y-ui-c">
              <label className="clini-label">Correo Electrónico</label>
              <div className="clini-input-group clini-relative">
                <div className="clini-input-icon">
                  <Mail size={18} />
                </div>
                <input name="correo" type="email" className="clini-input-field-icon-left" defaultValue={selectedPaciente?.correo} />
              </div>
            </div>
            <div className="clini-form-field clini-field-full clini-space-y-ui-c">
              <label className="clini-label">Responsable / Familiar</label>
              <input name="responsable" type="text" className="input-field" placeholder="Nombre del responsable" defaultValue={selectedPaciente?.responsable} />
            </div>
            <div className="clini-form-field clini-field-full clini-space-y-ui-c">
              <label className="clini-label">Motivo de Consulta</label>
              <textarea name="motivo" className="clini-textarea" placeholder="Breve descripción..." defaultValue={selectedPaciente?.motivo} />
            </div>
          </div>
          <div className="clini-form-footer clini-flex-end-gap-3 clini-pt-ui-g clini-border-t-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {selectedPaciente ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </Modal>

      <AlertModal 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type as any}
      />

      <AlertModal
        isOpen={isConfirmAssignOpen}
        onClose={() => setIsConfirmAssignOpen(false)}
        title="Confirmación de Asignación"
        message={`¿Deseas asignar el paquete "${packageNameToAssign}" al paciente "${selectedPaciente?.nombres}"? Esta acción generará un cobro pendiente automáticamente.`}
        type="warning"
        onConfirm={handleConfirmAssign}
      />
    </div>
  );
}
