// Los Enums de estado se mantienen porque son LÓGICA DE NEGOCIO (Hardcoded en el flujo)
export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'REPROGRAMADA';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ANULADO';

export interface Usuario {
  id: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  nombreUsuario: string;
  contrasena: string;
  correo: string;
  telefono: string;
  tipoDocumento: string;
  documentoIdentidad: string;
  perfil: string;
  sede: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Terapeuta {
  id: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  tipoDocumento: string;
  documentoIdentidad: string;
  correo: string;
  telefono: string;
  especialidades: string[];
  colegiatura: string;
  sede: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Paciente {
  id: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  tipoDocumento: string;
  documentoIdentidad: string;
  correo: string;
  telefono: string;
  responsable: string;
  motivo: string;
  sede: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Cita {
  idCita: string;
  idDoctor: string;
  idPaciente: string;
  idPaquete?: string;
  idPago?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estadoCita: AppointmentStatus;
  sede: string;
  estado: boolean;
  modalidad: 'PRESENCIAL' | 'VIRTUAL';
  ubicacion?: string;
  idCitaOriginal?: string;
  notas?: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Paquete {
  idPaquete: string;
  idPaciente: string;
  idDoctor: string;
  descripcion: string;
  categoria: string;
  frecuencia: string;
  totalCitas: number;
  monto: number;
  fechaInicio: string;
  fechaFin: string;
  reprogramacion: boolean;
  sede: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Pago {
  idPago: string;
  idPaciente: string;
  idPaquete?: string;
  concepto: string;
  monto: number;
  estado: PaymentStatus;
  fechaReferencial: string;
  moneda: 'PEN' | 'USD';
  observaciones?: string;
  idSede: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface Transaccion {
  idTransaccion: string;
  idPago: string;
  monto: number;
  fecha: string;
  medio: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'YAPE' | 'PLIN';
  estado: string;
  comprobante?: string;
  tipoTransaccion: 'INGRESO' | 'EGRESO';
  observaciones?: string;
  idSede: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface BloqueHorario {
  id: string;
  diasSemana: string[]; // e.g., ['Lunes', 'Martes']
  horaInicio: string;
  horaFin: string;
  tipo: 'TRABAJO' | 'PAUSA';
  estado: 'DISPONIBLE' | 'OCUPADO' | 'REFRIGERIO';
  descripcion?: string;
}

export interface Horario {
  id: string;
  idTerapeuta: string;
  nombreTerapeuta: string;
  mes: number;
  año: number;
  bloques: BloqueHorario[];
  sede: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface HorarioAtencionDia {
  dia: string; // 'Lunes', 'Martes', etc.
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}

export interface Sede {
  idSede: string;
  nombreSede: string;
  direccion: string;
  horarioAtencion?: HorarioAtencionDia[];
  estado: boolean;
}

export type ControlType = 'TEXT' | 'NUMBER' | 'COLOR' | 'CHECKBOX' | 'SELECT' | 'IMAGE' | 'MODULE_LINK' | 'LIST';

export interface ConfiguracionDinamica {
  id: string;
  clave: string;
  valor: any;
  etiqueta: string;
  categoria: string;
  tipoControl: ControlType;
  opciones?: string[]; // Para SELECT
  orden: number;
  descripcion?: string;
}

export interface Sede {
  idSede: string;
  nombreSede: string;
  direccion: string;
  horarioAtencion?: HorarioAtencionDia[];
  estado: boolean;
}

export interface Permiso {
  perfil: string;
  modulo: string;
  acceso: boolean;
  verTodo: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  filtrarPersonas: boolean;
}

export interface ConfiguracionGlobal {
  id: string;
  clave: string;
  valor: string;
  tipoControl: 'TEXT' | 'COLOR_PICKER' | 'TIME_RANGE' | 'CHECKLIST_DAYS' | 'IMAGE_BASE64';
  categoria: 'BRANDING' | 'CLINICA' | 'AGENDA';
  descripcion: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion?: string;
  duracionSesion: number; // en minutos
  estado: boolean;
}

export interface Auditoria {
  id: string;
  tabla: string;
  idRegistro: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'UPDATE_STATUS';
  datosAnteriores?: any;
  datosNuevos?: any;
  fecha: string;
  idUsuario: string;
  nombreUsuario: string;
}
