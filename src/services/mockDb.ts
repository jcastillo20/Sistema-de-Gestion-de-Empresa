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
  // CATEGORIA: BRANDING
  { id: '1', clave: 'CLINICA_NOMBRE', valor: 'CLINIGEST PRO', etiqueta: 'Nombre de la Clínica', categoria: 'BRANDING', tipoControl: 'TEXT', orden: 1 },
  { id: '2', clave: 'COLOR_PRIMARIO', valor: '#4f46e5', etiqueta: 'Color Primario', categoria: 'BRANDING', tipoControl: 'COLOR', orden: 2 },
  { id: '3', clave: 'CLINICA_LOGO', valor: '', etiqueta: 'Logo de la Clínica', categoria: 'BRANDING', tipoControl: 'IMAGE', orden: 3 },
  
  // CATEGORIA: MODULOS (Enlaces a componentes complejos)
  { id: '4', clave: 'MODULO_SEDES', valor: 'SEDES', etiqueta: 'Gestión de Sedes', categoria: 'SEDES', tipoControl: 'MODULE_LINK', orden: 1 },
  { id: '5', clave: 'MODULO_ESPECIALIDADES', valor: 'ESPECIALIDADES', etiqueta: 'Catálogo de Especialidades', categoria: 'ESPECIALIDADES', tipoControl: 'MODULE_LINK', orden: 1 },
  { id: '6', clave: 'MODULO_PERMISOS', valor: 'PERMISOS', etiqueta: 'Matriz de Permisos y Roles', categoria: 'SEGURIDAD', tipoControl: 'MODULE_LINK', orden: 1 },
  { id: '7', clave: 'MODULO_AUDITORIA', valor: 'AUDITORIA', etiqueta: 'Registro de Auditoría', categoria: 'SEGURIDAD', tipoControl: 'MODULE_LINK', orden: 2 },
  
  // CATEGORIA: NOTIFICACIONES
  { id: '8', clave: 'NOTIF_EMAIL', valor: true, etiqueta: 'Notificaciones por Email', categoria: 'NOTIFICACIONES', tipoControl: 'CHECKBOX', orden: 1 },
  { id: '9', clave: 'NOTIF_WHATSAPP', valor: false, etiqueta: 'Notificaciones por WhatsApp', categoria: 'NOTIFICACIONES', tipoControl: 'CHECKBOX', orden: 2 },
  
  // CATEGORIA: AGENDA
  { id: '10', clave: 'TIPO_DURACION_SESION', valor: 'POR_ESPECIALIDAD', etiqueta: 'Tipo de Duración de Sesión', categoria: 'AGENDA', tipoControl: 'SELECT', opciones: ['GLOBAL', 'POR_ESPECIALIDAD'], orden: 1 },
  { id: '11', clave: 'DURACION_SESION_GLOBAL', valor: 45, etiqueta: 'Duración Global (min)', categoria: 'AGENDA', tipoControl: 'NUMBER', orden: 2, descripcion: 'Solo aplica si el tipo es GLOBAL' },
  { id: '12', clave: 'COLOR_DISPONIBLE', valor: '#10b981', etiqueta: 'Color Disponible', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 3 },
  { id: '13', clave: 'COLOR_OCUPADO', valor: '#ef4444', etiqueta: 'Color Ocupado', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 4 },
  { id: '14', clave: 'COLOR_REFRIGERIO', valor: '#f59e0b', etiqueta: 'Color Refrigerio', categoria: 'AGENDA', tipoControl: 'COLOR', orden: 5 },
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
