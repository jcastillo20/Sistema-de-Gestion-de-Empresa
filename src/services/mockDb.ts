import { 
  Usuario, 
  Terapeuta, 
  Paciente, 
  ConfiguracionGlobal, 
  Permiso, 
  Sede,
  Auditoria,
  Especialidad,
  ConfiguracionDinamica
} from '../types';

// Mock Data based on user specifications
const generateMockUsuarios = (): Usuario[] => {
  const users: Usuario[] = [
    {
      id: '0',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: 'Global',
      nombres: 'Super Admin',
      nombreUsuario: 'super',
      contrasena: 'super123',
      correo: 'super@clinigest.com',
      telefono: '999999999',
      tipoDocumento: 'DNI',
      documentoIdentidad: '00000000',
      perfil: 'SUPER_ADMIN',
      sede: 'SEDE CENTRAL',
      estado: true,
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'SYSTEM'
    },
    {
      id: '1',
      apellidoPaterno: 'Castillo',
      apellidoMaterno: 'Ramos',
      nombres: 'Juan',
      nombreUsuario: 'admin',
      contrasena: 'admin123',
      correo: 'juancrcastillo20@gmail.com',
      telefono: '987654321',
      tipoDocumento: 'DNI',
      documentoIdentidad: '12345678',
      perfil: 'ADMINISTRADOR',
      sede: 'SEDE CENTRAL',
      estado: true,
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'SYSTEM'
    },
    {
      id: '2',
      apellidoPaterno: 'Sánchez',
      apellidoMaterno: 'Díaz',
      nombres: 'Ana María',
      nombreUsuario: 'recepcion',
      contrasena: 'recep123',
      correo: 'ana.sanchez@clinigest.com',
      telefono: '912345678',
      tipoDocumento: 'DNI',
      documentoIdentidad: '87654321',
      perfil: 'RECEPCIONISTA',
      sede: 'SEDE NORTE',
      estado: true,
      fechaCreacion: '2024-02-15',
      usuarioCreacion: 'admin'
    }
  ];

  for (let i = 3; i <= 25; i++) {
    users.push({
      id: i.toString(),
      apellidoPaterno: `ApellidoP${i}`,
      apellidoMaterno: `ApellidoM${i}`,
      nombres: `Usuario ${i}`,
      nombreUsuario: `user${i}`,
      contrasena: `pass${i}`,
      correo: `user${i}@clinica.com`,
      telefono: `9000000${i.toString().padStart(2, '0')}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `100000${i.toString().padStart(2, '0')}`,
      perfil: i % 3 === 0 ? 'TERAPEUTA' : i % 4 === 0 ? 'GERENTE' : 'RECEPCIONISTA',
      sede: i % 2 === 0 ? 'SEDE CENTRAL' : 'SEDE NORTE',
      estado: true,
      fechaCreacion: '2024-03-01',
      usuarioCreacion: 'admin'
    });
  }
  return users;
};

const generateMockTerapeutas = (): Terapeuta[] => {
  const terapeutas: Terapeuta[] = [
    {
      id: '1',
      apellidoPaterno: 'García',
      apellidoMaterno: 'Pérez',
      nombres: 'Carlos',
      tipoDocumento: 'DNI',
      documentoIdentidad: '87654321',
      correo: 'carlos.garcia@clinica.com',
      telefono: '912345678',
      especialidades: ['TERAPIA OCUPACIONAL', 'PSICOMOTRICIDAD'],
      colegiatura: 'CTO 1234',
      sede: 'SEDE CENTRAL',
      estado: true,
      fechaCreacion: '2024-01-05',
      usuarioCreacion: 'admin'
    }
  ];

  for (let i = 2; i <= 25; i++) {
    terapeutas.push({
      id: i.toString(),
      apellidoPaterno: `TerapeutaP${i}`,
      apellidoMaterno: `TerapeutaM${i}`,
      nombres: `Terapeuta ${i}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `200000${i.toString().padStart(2, '0')}`,
      correo: `terapeuta${i}@clinica.com`,
      telefono: `9100000${i.toString().padStart(2, '0')}`,
      especialidades: i % 2 === 0 ? ['FISIOTERAPIA'] : ['PSICOLOGÍA INFANTIL', 'TERAPIA DE LENGUAJE'],
      colegiatura: `COL ${1000 + i}`,
      sede: i % 2 === 0 ? 'SEDE CENTRAL' : 'SEDE NORTE',
      estado: true,
      fechaCreacion: '2023-12-01',
      usuarioCreacion: 'admin'
    });
  }
  return terapeutas;
};

const generateMockPacientes = (): Paciente[] => {
  const pacientes: Paciente[] = [
    {
      id: '1',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Sánchez',
      nombres: 'María',
      tipoDocumento: 'DNI',
      documentoIdentidad: '11223344',
      correo: 'maria.lopez@gmail.com',
      telefono: '998877665',
      responsable: 'Pedro López',
      motivo: 'Terapia de lenguaje',
      sede: 'SEDE CENTRAL',
      estado: true,
      fechaCreacion: '2024-02-01',
      usuarioCreacion: 'admin'
    }
  ];

  for (let i = 2; i <= 25; i++) {
    pacientes.push({
      id: i.toString(),
      apellidoPaterno: `PacienteP${i}`,
      apellidoMaterno: `PacienteM${i}`,
      nombres: `Paciente ${i}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `300000${i.toString().padStart(2, '0')}`,
      correo: `paciente${i}@email.com`,
      telefono: `9200000${i.toString().padStart(2, '0')}`,
      sede: i % 2 === 0 ? 'SEDE CENTRAL' : 'SEDE NORTE',
      estado: true,
      fechaCreacion: '2024-02-01',
      usuarioCreacion: 'admin',
      responsable: `Responsable ${i}`,
      motivo: 'Tratamiento continuo'
    });
  }
  return pacientes;
};

export const MOCK_CONFIG_DINAMICA: ConfiguracionDinamica[] = [
  // TAB 1: BRANDING
  { id: '1', clave: 'CLINICA_NOMBRE', valor: 'CLINIGEST PRO', etiqueta: 'Nombre Comercial de Empresa', categoria: 'BRANDING', tipoControl: 'TEXT', orden: 1 },
  { id: '2', clave: 'COLOR_PRIMARIO', valor: '#4f46e5', etiqueta: 'Color Primario', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 2 },
  { id: '2b', clave: 'COLOR_SECUNDARIO', valor: '#10b981', etiqueta: 'Color Secundario', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 3 },
  { id: '2c', clave: 'COLOR_ACCENT', valor: '#f59e0b', etiqueta: 'Color de Accent (Destacados)', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 4 },
  { id: '3', clave: 'CLINICA_LOGO', valor: '', etiqueta: 'Logo de la Clínica (Base64)', categoria: 'BRANDING', tipoControl: 'IMAGE', orden: 5 },

  // TAB 3: SEGURIDAD
  { id: 's1', clave: 'PWD_MIN_LENGTH', valor: 8, etiqueta: 'Longitud Mínima de Password', categoria: 'SEGURIDAD', tipoControl: 'NUMBER', orden: 1 },
  { id: 's2', clave: 'PWD_EXPIRATION_DAYS', valor: 90, etiqueta: 'Días para Expiración de Clave', categoria: 'SEGURIDAD', tipoControl: 'NUMBER', orden: 2 },

  // TAB 4: AGENDA
  { id: 'a1', clave: 'ESTADO_PENDIENTE_COLOR', valor: '#f59e0b', etiqueta: 'Color: Cita Pendiente', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 1 },
  { id: 'a2', clave: 'ESTADO_CONFIRMADA_COLOR', valor: '#10b981', etiqueta: 'Color: Cita Confirmada', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 2 },
  { id: 'a3', clave: 'ESTADO_CANCELADA_COLOR', valor: '#ef4444', etiqueta: 'Color: Cita Cancelada', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 3 },
  { id: 'a4', clave: 'DURACION_SESION_GLOBAL', valor: 45, etiqueta: 'Duración Global Defecto (min)', categoria: 'AGENDA', tipoControl: 'NUMBER', orden: 4 },
  { id: 'a5', clave: 'INTERVALO_CALENDARIO', valor: '30', etiqueta: 'Intervalo Visual de Agenda', categoria: 'AGENDA', tipoControl: 'SELECT', opciones: ['15', '30', '60'], orden: 5 },

  // TAB 5: DICCIONARIOS
  { id: 'd1', clave: 'LISTA_TIPO_DOCUMENTO', valor: ['DNI', 'CE', 'PASAPORTE'], etiqueta: 'Tipos de Documento', categoria: 'DICCIONARIOS', tipoControl: 'LIST', orden: 1 },
  { id: 'd2', clave: 'LISTA_MEDIO_PAGO', valor: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE/PLIN'], etiqueta: 'Medios de Pago', categoria: 'DICCIONARIOS', tipoControl: 'LIST', orden: 2 },
  { id: 'd3', clave: 'MONEDAS_OPERATIVAS', valor: 'PEN', etiqueta: 'Moneda Principal', categoria: 'DICCIONARIOS', tipoControl: 'SELECT', opciones: ['PEN', 'USD', 'AMBAS'], orden: 3 },
  { id: 'd4', clave: 'LISTA_CATEGORIA_PAQUETE', valor: ['ESTANDAR', 'PREMIUM', 'PROMOCIONAL'], etiqueta: 'Categorías de Paquete', categoria: 'DICCIONARIOS', tipoControl: 'LIST', orden: 4 },
  { id: 'd5', clave: 'MODALIDAD_PRESENCIAL', valor: true, etiqueta: 'Modalidad Presencial', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 5 },
  { id: 'd6', clave: 'MODALIDAD_VIRTUAL', valor: true, etiqueta: 'Modalidad Virtual', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 6 },

  // LISTAS TÉCNICAS (Necesarias para el sistema)
  { id: '15', clave: 'LISTA_PERFILES', valor: ['ADMINISTRADOR', 'ADMINISTRADOR_SEDE', 'RECEPCIONISTA', 'TERAPEUTA', 'GERENTE'], etiqueta: 'Perfiles de Usuario', categoria: 'SEGURIDAD', tipoControl: 'LIST', orden: 10 },
  { id: '16', clave: 'LISTA_MODULOS', valor: ['PACIENTES', 'TERAPEUTAS', 'HORARIOS', 'USUARIOS', 'CONFIGURACION', 'AGENDA', 'FINANZAS'], etiqueta: 'Módulos del Sistema', categoria: 'SEGURIDAD', tipoControl: 'LIST', orden: 11 },
];

export const MOCK_ESPECIALIDADES: Especialidad[] = [
  { id: '1', nombre: 'TERAPIA OCUPACIONAL', duracionSesion: 45, estado: true },
  { id: '2', nombre: 'FISIOTERAPIA', duracionSesion: 60, estado: true },
  { id: '3', nombre: 'PSICOLOGÍA INFANTIL', duracionSesion: 50, estado: true },
  { id: '4', nombre: 'TERAPIA DE LENGUAJE', duracionSesion: 30, estado: true },
  { id: '5', nombre: 'PSICOMOTRICIDAD', duracionSesion: 45, estado: true }
];

export const MOCK_SEDES: Sede[] = [
  { 
    idSede: '1', 
    nombreSede: 'SEDE CENTRAL', 
    direccion: 'Av. Principal 123', 
    horarioAtencion: [
      { dia: 'Lunes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Martes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Miércoles', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Jueves', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Viernes', activo: true, horaInicio: '08:00', horaFin: '20:00' },
      { dia: 'Sábado', activo: true, horaInicio: '08:00', horaFin: '14:00' },
      { dia: 'Domingo', activo: false, horaInicio: '00:00', horaFin: '00:00' },
    ],
    estado: true 
  },
  { 
    idSede: '2', 
    nombreSede: 'SEDE NORTE', 
    direccion: 'Calle Norte 456', 
    horarioAtencion: [
      { dia: 'Lunes', activo: true, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 'Martes', activo: true, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 'Miércoles', activo: true, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 'Jueves', activo: true, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 'Viernes', activo: true, horaInicio: '09:00', horaFin: '18:00' },
      { dia: 'Sábado', activo: false, horaInicio: '00:00', horaFin: '00:00' },
      { dia: 'Domingo', activo: false, horaInicio: '00:00', horaFin: '00:00' },
    ],
    estado: true 
  }
];

export const MOCK_PERMISOS: Permiso[] = [
  {
    perfil: 'ADMINISTRADOR',
    modulo: 'PACIENTES',
    acceso: true,
    verTodo: true,
    puedeCrear: true,
    puedeEditar: false,
    puedeEliminar: false,
    filtrarPersonas: false
  },
  {
    perfil: 'ADMINISTRADOR',
    modulo: 'TERAPEUTAS',
    acceso: true,
    verTodo: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    filtrarPersonas: false
  },
  {
    perfil: 'ADMINISTRADOR',
    modulo: 'HORARIOS',
    acceso: true,
    verTodo: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    filtrarPersonas: false
  },
  {
    perfil: 'ADMINISTRADOR',
    modulo: 'USUARIOS',
    acceso: true,
    verTodo: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    filtrarPersonas: false
  },
  {
    perfil: 'ADMINISTRADOR',
    modulo: 'CONFIGURACION',
    acceso: true,
    verTodo: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    filtrarPersonas: false
  },
  {
    perfil: 'RECEPCIONISTA',
    modulo: 'PACIENTES',
    acceso: true,
    verTodo: false,
    puedeCrear: true,
    puedeEditar: false,
    puedeEliminar: false,
    filtrarPersonas: true
  }
];

export const MOCK_USUARIOS: Usuario[] = generateMockUsuarios();
export const MOCK_TERAPEUTAS: Terapeuta[] = generateMockTerapeutas();
export const MOCK_PACIENTES: Paciente[] = generateMockPacientes();

export const MOCK_HORARIOS: any[] = [
  {
    id: '1',
    idTerapeuta: '1',
    nombreTerapeuta: 'Carlos García',
    mes: 4,
    año: 2026,
    bloques: [
      { id: 'b1', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '08:00', horaFin: '13:00', tipo: 'TRABAJO', estado: 'DISPONIBLE' },
      { id: 'b2', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '13:00', horaFin: '14:00', tipo: 'PAUSA', estado: 'REFRIGERIO', descripcion: 'Almuerzo' },
      { id: 'b3', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '14:00', horaFin: '18:00', tipo: 'TRABAJO', estado: 'DISPONIBLE' }
    ],
    sede: 'SEDE CENTRAL',
    estado: true,
    fechaCreacion: '2026-03-20',
    usuarioCreacion: 'admin'
  }
];

export const MOCK_AUDITORIA: Auditoria[] = [
  {
    id: '1',
    tabla: 'USUARIOS',
    idRegistro: '1',
    accion: 'LOGIN',
    fecha: new Date().toISOString(),
    idUsuario: '1',
    nombreUsuario: 'admin'
  }
];
