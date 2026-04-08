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
      id: 'USR001',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: 'Global',
      nombres: 'Super Admin',
      nombreUsuario: 'super',
      contrasena: 'super123',
      correo: 'super@clinigest.com',
      telefono: '999999999',
      tipoDocumento: 'DNI', // En BD: DOC001
      documentoIdentidad: '00000000',
      perfil: 'SUPERADMIN', // En BD: PRF001
      sede: 'ALL',          // Acceso Global a todas las sedes
      estado: true,
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'SYSTEM'
    },
    {
      id: 'USR002',
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
      sede: 'ALL', 
      estado: true,
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'SYSTEM'
    }
  ];

  for (let i = 3; i <= 15; i++) {
    users.push({
      id: `USR00${i}`,
      apellidoPaterno: `ApellidoP${i}`,
      apellidoMaterno: `ApellidoM${i}`,
      nombres: `Usuario ${i}`,
      nombreUsuario: `user${i}`,
      contrasena: `pass${i}`,
      correo: `user${i}@clinica.com`,
      telefono: `9000000${i}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `100000${i}`,perfil: i % 2 === 0 ? 'ADMINISTRADOR' : 'RECEPCIONISTA',
      sede: i % 2 === 0 ? 'LIMA_SUR' : 'LIMA_NORTE',
      estado: true,
      fechaCreacion: '2024-03-01',
      usuarioCreacion: 'USR001'
    });
  }
  return users;
};

const generateMockTerapeutas = (): Terapeuta[] => {
  const terapeutas: Terapeuta[] = [
    {
     id: 'TER001',
      apellidoPaterno: 'Castillo',
      apellidoMaterno: 'Jimenez',
      nombres: 'Juan Aurelio',
      tipoDocumento: 'DNI',
      documentoIdentidad: '45871293',
      correo: 'zwells@example.com',
      telefono: '947123846',
      especialidades: ['PAREJA', 'CONDUCTUAL'], // Mapeado de string a Array
      colegiatura: 'CTO 1234',
      sede: 'LIMA_SUR',
      estado: true,
      fechaCreacion: '2025-05-02',
      usuarioCreacion: 'admin'
    }
  ];

  for (let i = 2; i <= 25; i++) {
    terapeutas.push({
      id: `TER00${i.toString().padStart(2, '0')}`,
      apellidoPaterno: `TerapeutaP${i}`,
      apellidoMaterno: `TerapeutaM${i}`,
      nombres: `Terapeuta ${i}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `200000${i.toString().padStart(2, '0')}`,
      correo: `terapeuta${i}@clinica.com`,
      telefono: `9100000${i.toString().padStart(2, '0')}`,
      // Asignación dinámica de IDs de especialidad
      especialidades: i % 2 === 0 ? ['PAREJA'] : ['CONDUCTUAL'],
      colegiatura: `COL ${1000 + i}`,
      sede: i % 2 === 0 ? 'LIMA_SUR' : 'LIMA_NORTE', // Alterna entre ID Sede 1 y 2
      estado: true,
      fechaCreacion: '2023-12-01',
      usuarioCreacion: 'U001'
    });
  }
  return terapeutas;
};

const generateMockPacientes = (): Paciente[] => {
  const pacientes: Paciente[] = [
    {
      id: 'PAC001',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Sánchez',
      nombres: 'María',
      tipoDocumento: 'DNI', // En BD: DOC001
      documentoIdentidad: '11223344',
      correo: 'maria.lopez@gmail.com',
      telefono: '998877665',
      responsable: 'Pedro López',
      motivo: 'Terapia de lenguaje',
      sede: 'LIMA_SUR', // En BD: SED001
      estado: true,
      fechaCreacion: '2024-02-01',
      usuarioCreacion: 'USR001'
    }
  ];

  for (let i = 2; i <= 25; i++) {
    pacientes.push({
      id: `PAC${i.toString().padStart(3, '0')}`,
      apellidoPaterno: `PacienteP${i}`,
      apellidoMaterno: `PacienteM${i}`,
      nombres: `Paciente ${i}`,
      tipoDocumento: 'DNI',
      documentoIdentidad: `3000000${i}`,
      correo: `paciente${i}@email.com`,
      telefono: `92000000${i}`,
      sede: i % 2 === 0 ? 'LIMA_SUR' : 'LIMA_NORTE',
      estado: true,
      fechaCreacion: '2024-02-01',
      usuarioCreacion: 'USR001',
      responsable: `Responsable ${i}`,
      motivo: i % 3 === 0 ? 'Control mensual' : 'Tratamiento continuo'
    });
  }
  return pacientes;
};
export const MOCK_CONFIG_DINAMICA: ConfiguracionDinamica[] = [
  { id: 'CONF-01', clave: 'CLINICA_NOMBRE', valor: 'CLINIGEST PRO', etiqueta: 'Nombre Comercial de Empresa', categoria: 'BRANDING', tipoControl: 'TEXT', orden: 1 },
  { id: 'CONF-02', clave: 'COLOR_PRIMARIO', valor: '#4f46e5', etiqueta: 'Color Primario', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 2 },
  { id: 'CONF-03', clave: 'COLOR_SECUNDARIO', valor: '#10b981', etiqueta: 'Color Secundario', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 3 },
  { id: 'CONF-04', clave: 'COLOR_ACCENT', valor: '#f59e0b', etiqueta: 'Color Accent (Destacados)', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 4 },
  { id: 'CONF-05', clave: 'CLINICA_LOGO', valor: '', etiqueta: 'Logo Corporativo', categoria: 'BRANDING', tipoControl: 'IMAGE', orden: 5 },

  // --- CATEGORIA: SEGURIDAD (PWD + PERFILES + MODULOS) ---
  { id: 'CONF-06', clave: 'PWD_MIN_LENGTH', valor: 8, etiqueta: 'Longitud Mínima de Contraseña', categoria: 'SEGURIDAD', tipoControl: 'NUMBER', orden: 1 },
  { id: 'CONF-07', clave: 'PWD_EXPIRATION_DAYS', valor: 90, etiqueta: 'Expiración de Clave (Días)', categoria: 'SEGURIDAD', tipoControl: 'NUMBER', orden: 2 },
  
  // Perfiles desacoplados
  { id: 'PRF-01', clave: 'PERFIL_ADMIN', valor: 'ADMINISTRADOR', etiqueta: 'Perfil: Administrador', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 3 },
  { id: 'PRF-02', clave: 'PERFIL_ADMIN_SEDE', valor: 'ADMINISTRADOR_SEDE', etiqueta: 'Perfil: Administrador de Sede', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 4 },
  { id: 'PRF-03', clave: 'PERFIL_RECEP', valor: 'RECEPCIONISTA', etiqueta: 'Perfil: Recepcionista', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 5 },
  { id: 'PRF-04', clave: 'PERFIL_TERAP', valor: 'TERAPEUTA', etiqueta: 'Perfil: Terapeuta', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 6 },
  { id: 'PRF-05', clave: 'PERFIL_GEREN', valor: 'GERENTE', etiqueta: 'Perfil: Gerente', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 7 },
  { id: 'PRF-06', clave: 'PERFIL_SUPER', valor: 'SUPERADMIN', etiqueta: 'Perfil: Super Administrador', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 8 },

  // Módulos desacoplados
  { id: 'MOD-01', clave: 'MOD_PACIENTES', valor: 'PACIENTES', etiqueta: 'Módulo: Pacientes', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 8 },
  { id: 'MOD-02', clave: 'MOD_TERAPEUTAS', valor: 'TERAPEUTAS', etiqueta: 'Módulo: Terapeutas', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 9 },
  { id: 'MOD-03', clave: 'MOD_HORARIOS', valor: 'HORARIOS', etiqueta: 'Módulo: Horarios', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 10 },
  { id: 'MOD-04', clave: 'MOD_USUARIOS', valor: 'USUARIOS', etiqueta: 'Módulo: Usuarios', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 11 },
  { id: 'MOD-05', clave: 'MOD_CONFIG', valor: 'CONFIGURACION', etiqueta: 'Módulo: Configuración', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 12 },
  { id: 'MOD-06', clave: 'MOD_AGENDA', valor: 'AGENDA', etiqueta: 'Módulo: Agenda', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 13 },
  { id: 'MOD-07', clave: 'MOD_FINANZAS', valor: 'FINANZAS', etiqueta: 'Módulo: Finanzas', categoria: 'SEGURIDAD', tipoControl: 'CHECKBOX', orden: 14 },

  // --- CATEGORIA: AGENDA (ESTADOS + TIEMPOS) ---
  { id: 'CONF-08', clave: 'COLOR_DISPONIBLE', valor: '#f59e0b', etiqueta: 'Color: Horario Disponible', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 1 },
  { id: 'CONF-09', clave: 'COLOR_OCUPADO', valor: '#10b981', etiqueta: 'Color: Horario Ocupado', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 2 },
  { id: 'CONF-10', clave: 'COLOR_REFRIGERIO', valor: '#ef4444', etiqueta: 'Color: Horario Refrigerio', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 3 },
  { id: 'CONF-11', clave: 'DURACION_SESION_GLOBAL', valor: 45, etiqueta: 'Duración Global Defecto (min)', categoria: 'AGENDA', tipoControl: 'NUMBER', orden: 4 },
  { id: 'CONF-12', clave: 'INTERVALO_CALENDARIO', valor: '30', etiqueta: 'Intervalo Visual de Agenda', categoria: 'AGENDA', tipoControl: 'SELECT', opciones: ['15', '30', '60'], orden: 5 },

  // --- CATEGORIA: DICCIONARIOS (DOCS + PAGOS + MONEDAS + MODALIDADES) ---
  // Tipos de Documento desacoplados
  { id: 'DOC-01', clave: 'DOC_DNI', valor: 'DNI', etiqueta: 'Tipo Doc: DNI', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 1 },
  { id: 'DOC-02', clave: 'DOC_CE', valor: 'CE', etiqueta: 'Tipo Doc: Carnet Extranjería', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 2 },
  { id: 'DOC-03', clave: 'DOC_PAS', valor: 'PASAPORTE', etiqueta: 'Tipo Doc: Pasaporte', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 3 },

  // Medios de Pago desacoplados
  { id: 'PAY-01', clave: 'PAGO_EFECTIVO', valor: 'EFECTIVO', etiqueta: 'Medio Pago: Efectivo', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 4 },
  { id: 'PAY-02', clave: 'PAGO_TARJETA', valor: 'TARJETA', etiqueta: 'Medio Pago: Tarjeta', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 5 },
  { id: 'PAY-03', clave: 'PAGO_TRANSF', valor: 'TRANSFERENCIA', etiqueta: 'Medio Pago: Transferencia', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 6 },
  { id: 'PAY-04', clave: 'PAGO_YAPE', valor: 'YAPE', etiqueta: 'Medio Pago: Yape / Plin', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 7 },

  // Monedas y Modalidades
  { id: 'MON-13', clave: 'MONEDAS_SISTEMA', valor: 'PEN', etiqueta: 'Soles (S/.)', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 8 },
  { id: 'MON-16', clave: 'MONEDAS_SISTEMA', valor: 'USD', etiqueta: 'Dolares ($.)', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 11 },
  { id: 'MOD-14', clave: 'MODALIDAD_PRESENCIAL', valor: true, etiqueta: 'Atención Presencial Habilitada', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 9 },
  { id: 'MOD-15', clave: 'MODALIDAD_VIRTUAL', valor: true, etiqueta: 'Atención Virtual Habilitada', categoria: 'DICCIONARIOS', tipoControl: 'CHECKBOX', orden: 10 },

  // --- CATEGORIA: ESPECIALIDADES (DESACOPLADAS) ---
  { id: 'ESP-01', clave: 'ESP_TERAPIA_OCUP', valor: '45', etiqueta: 'Terapia Ocupacional', categoria: 'ESPECIALIDADES', tipoControl: 'NUMBER', orden: 1 },
  { id: 'ESP-02', clave: 'ESP_FISIOTERAPIA', valor: '60', etiqueta: 'Fisioterapia', categoria: 'ESPECIALIDADES', tipoControl: 'NUMBER', orden: 2 },
  { id: 'ESP-03', clave: 'ESP_PSICO_INFANTIL', valor: '50', etiqueta: 'Psicología Infantil', categoria: 'ESPECIALIDADES', tipoControl: 'NUMBER', orden: 3 },
  { id: 'ESP-04', clave: 'ESP_LENGUAJE', valor: '30', etiqueta: 'Terapia de Lenguaje', categoria: 'ESPECIALIDADES', tipoControl: 'NUMBER', orden: 4 },
  { id: 'ESP-05', clave: 'ESP_PSICOMOTRICIDAD', valor: '45', etiqueta: 'Psicomotricidad', categoria: 'ESPECIALIDADES', tipoControl: 'NUMBER', orden: 5 },
];

export const MOCK_PERFILES = MOCK_CONFIG_DINAMICA
  .filter(c => c.categoria === 'SEGURIDAD' && c.clave.startsWith('PERFIL_'));

// Extraer Módulos
export const MOCK_MODULOS = MOCK_CONFIG_DINAMICA
  .filter(c => c.categoria === 'SEGURIDAD' && c.clave.startsWith('MOD_'));

// Extraer Tipos de Documento
export const MOCK_TIPOS_DOCUMENTO = MOCK_CONFIG_DINAMICA
  .filter(c => c.categoria === 'DICCIONARIOS' && c.clave.startsWith('DOC_'));

// Extraer Medios de Pago
export const MOCK_MEDIOS_PAGO = MOCK_CONFIG_DINAMICA
  .filter(c => c.categoria === 'DICCIONARIOS' && c.clave.startsWith('PAGO_'));

// Extraer Especialidades (como diccionario de IDs y nombres)
export const MOCK_ESPECIALIDADES_DICT = MOCK_CONFIG_DINAMICA
  .filter(c => c.categoria === 'ESPECIALIDADES');

export const MOCK_SEDES: Sede[] = [
  { 
    idSede: '1', 
    nombreSede: 'LIMA_SUR', 
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
    nombreSede: 'LIMA_NORTE', 
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
    idTerapeuta: 'TER001',
    nombreTerapeuta: 'Carlos García',
    mes: 4,
    año: 2026,
    bloques: [
      { id: 'b1', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '08:00', horaFin: '13:00', tipo: 'TRABAJO', estado: 'DISPONIBLE' },
      { id: 'b2', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '13:00', horaFin: '14:00', tipo: 'PAUSA', estado: 'REFRIGERIO', descripcion: 'Almuerzo' },
      { id: 'b3', diasSemana: ['Lunes', 'Miércoles', 'Viernes'], horaInicio: '14:00', horaFin: '18:00', tipo: 'TRABAJO', estado: 'DISPONIBLE' }
    ],
    sede: 'LIMA_NORTE',
    estado: true,
    fechaCreacion: '2026-03-20',
    usuarioCreacion: 'admin'
  }
];

export const MOCK_AUDITORIA: Auditoria[] = [
  {
    id: 'AUD001',
    tabla: 'USUARIOS',
    idRegistro: '1',
    accion: 'LOGIN',
    fecha: new Date().toISOString(),
    idUsuario: '1',
    nombreUsuario: 'admin'
  }
];

export const MOCK_CITAS: any[] = [
  {
    id: '1',
    idPaciente: '1',
    nombrePaciente: 'María López',
    idTerapeuta: '1',
    nombreTerapeuta: 'Carlos García',
    especialidad: 'TERAPIA OCUPACIONAL',
    fecha: '2026-04-10',
    horaInicio: '09:00',
    horaFin: '09:45',
    sede: 'SEDE CENTRAL',
    estadoCita: 'PENDIENTE',
    montoPagado: 0,
    estadoPago: 'PENDIENTE'
  }
];
