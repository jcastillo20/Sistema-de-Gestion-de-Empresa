import { 
  Usuario, 
  Terapeuta, 
  Paciente, 
  ConfiguracionDinamica, 
  Permiso, 
  Sede,
  Auditoria,
  Especialidad,
  Horario,
  PaqueteMaestro,
  PaquetePaciente,
  Pago,
  Transaccion
} from '../types';
import { 
  MOCK_CONFIG_DINAMICA, 
  MOCK_SEDES, 
  MOCK_PERMISOS, 
  MOCK_USUARIOS, 
  MOCK_TERAPEUTAS, 
  MOCK_PACIENTES, 
  MOCK_AUDITORIA,
  MOCK_HORARIOS,
  MOCK_ESPECIALIDADES_DICT,
  MOCK_PAQUETES_MAESTROS,
  MOCK_CITAS
} from './mockDb';

// Simulated delay to mimic API calls
const DELAY = 500;

const MOCK_ESPECIALIDADES: Especialidad[] = MOCK_ESPECIALIDADES_DICT.map(item => ({
  id: item.id,
  nombre: item.etiqueta,
  duracionSesion: Number(item.valor) || 45,
  estado: true
}));

class ApiService {
  private config: ConfiguracionDinamica[] = [];
  private sedes: Sede[] = [];
  private permisos: Permiso[] = [];
  private usuarios: Usuario[] = [];
  private terapeutas: Terapeuta[] = [];
  private pacientes: Paciente[] = [];
  private auditoria: Auditoria[] = [];
  private especialidades: Especialidad[] = [];
  private horarios: Horario[] = [];
  private paquetesMaestros: PaqueteMaestro[] = [];
  private paquetesPacientes: PaquetePaciente[] = [];
  private pagos: Pago[] = [];
  private transacciones: Transaccion[] = [];
  private citas: any[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedConfig = localStorage.getItem('clini_config_v2');
      const savedSedes = localStorage.getItem('clini_sedes');
      const savedPermisos = localStorage.getItem('clini_permisos');
      const savedUsuarios = localStorage.getItem('clini_usuarios');
      const savedTerapeutas = localStorage.getItem('clini_terapeutas');
      const savedPacientes = localStorage.getItem('clini_pacientes');
      const savedAuditoria = localStorage.getItem('clini_auditoria');
      const savedEspecialidades = localStorage.getItem('clini_especialidades');
      const savedHorarios = localStorage.getItem('clini_horarios');
      const savedPaquetesMaestros = localStorage.getItem('clini_paquetes_maestros');
      const savedPaquetesPacientes = localStorage.getItem('clini_paquetes_pacientes');
      const savedPagos = localStorage.getItem('clini_pagos');

      // Fusionar configuración: Mantener estructura de MOCK pero usar valores de LocalStorage si existen
      const savedConfigArr = savedConfig ? JSON.parse(savedConfig) : [];
      this.config = MOCK_CONFIG_DINAMICA.map(mockItem => {
        const savedItem = Array.isArray(savedConfigArr) 
          ? savedConfigArr.find((s: any) => s.clave === mockItem.clave) 
          : null;
        return savedItem ? { ...mockItem, valor: savedItem.valor } : mockItem;
      });

      this.sedes = savedSedes ? JSON.parse(savedSedes) : [...MOCK_SEDES];
      this.permisos = savedPermisos ? JSON.parse(savedPermisos) : [...MOCK_PERMISOS];
      this.usuarios = savedUsuarios ? JSON.parse(savedUsuarios) : [...MOCK_USUARIOS];
      this.terapeutas = savedTerapeutas ? JSON.parse(savedTerapeutas) : [...MOCK_TERAPEUTAS];
      this.pacientes = savedPacientes ? JSON.parse(savedPacientes) : [...MOCK_PACIENTES];
      this.auditoria = savedAuditoria ? JSON.parse(savedAuditoria) : [...MOCK_AUDITORIA];
      this.especialidades = savedEspecialidades ? JSON.parse(savedEspecialidades) : [...MOCK_ESPECIALIDADES];
      this.horarios = savedHorarios ? JSON.parse(savedHorarios) : [...MOCK_HORARIOS];
      this.paquetesMaestros = savedPaquetesMaestros ? JSON.parse(savedPaquetesMaestros) : [...MOCK_PAQUETES_MAESTROS];
      this.paquetesPacientes = savedPaquetesPacientes ? JSON.parse(savedPaquetesPacientes) : [];
      this.pagos = savedPagos ? JSON.parse(savedPagos) : [];
      const savedTransacciones = localStorage.getItem('clini_transacciones');
      this.transacciones = savedTransacciones ? JSON.parse(savedTransacciones) : [];
      const savedCitas = localStorage.getItem('clini_citas');
      this.citas = savedCitas ? JSON.parse(savedCitas) : [...MOCK_CITAS];
    } catch (e) {
      console.error("Error al cargar localStorage, usando datos mock:", e);
      this.config = [...MOCK_CONFIG_DINAMICA];
      this.sedes = [...MOCK_SEDES];
      this.permisos = [...MOCK_PERMISOS];
      this.usuarios = [...MOCK_USUARIOS];
      this.terapeutas = [...MOCK_TERAPEUTAS];
      this.pacientes = [...MOCK_PACIENTES];
      this.auditoria = [...MOCK_AUDITORIA];
      this.especialidades = [...MOCK_ESPECIALIDADES];
      this.horarios = [...MOCK_HORARIOS];
      this.paquetesMaestros = [...MOCK_PAQUETES_MAESTROS];
      this.paquetesPacientes = [];
      this.pagos = [];
      this.transacciones = [];
      this.citas = [...MOCK_CITAS];
    }

    // Migration: Ensure terapeutas have especialidades array
    this.terapeutas = (this.terapeutas || []).map(t => {
      const anyT = t as any;
      if (anyT.especialidad && !t.especialidades) {
        return {
          ...t,
          especialidades: [anyT.especialidad],
          especialidad: undefined
        };
      }
      if (!t.especialidades) {
        return { ...t, especialidades: [] };
      }
      return t;
    });
  }

  private saveToStorage() {
    try {
      localStorage.setItem('clini_config_v2', JSON.stringify(this.config));
      localStorage.setItem('clini_sedes', JSON.stringify(this.sedes));
      localStorage.setItem('clini_permisos', JSON.stringify(this.permisos));
      localStorage.setItem('clini_usuarios', JSON.stringify(this.usuarios));
      localStorage.setItem('clini_terapeutas', JSON.stringify(this.terapeutas));
      localStorage.setItem('clini_pacientes', JSON.stringify(this.pacientes));
      localStorage.setItem('clini_auditoria', JSON.stringify(this.auditoria));
      localStorage.setItem('clini_especialidades', JSON.stringify(this.especialidades));
      localStorage.setItem('clini_horarios', JSON.stringify(this.horarios));
      localStorage.setItem('clini_paquetes_maestros', JSON.stringify(this.paquetesMaestros));
      localStorage.setItem('clini_paquetes_pacientes', JSON.stringify(this.paquetesPacientes));
      localStorage.setItem('clini_pagos', JSON.stringify(this.pagos));
      localStorage.setItem('clini_transacciones', JSON.stringify(this.transacciones));
      localStorage.setItem('clini_citas', JSON.stringify(this.citas));
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        console.warn("LocalStorage lleno. Pruning logs de auditoría para liberar espacio...");
        // Estrategia de emergencia: quedarnos solo con los últimos 5 logs y reintentar
        this.auditoria = this.auditoria.slice(0, 5);
        try {
          localStorage.setItem('clini_auditoria', JSON.stringify(this.auditoria));
          return; // Si logramos salvar tras el recorte, evitamos lanzar el error al UI
        } catch (retryError) {
          console.error("No se pudo liberar suficiente espacio incluso borrando auditoría.");
        }
      }
      console.error("Error crítico al guardar en localStorage:", error);
      throw new Error("No se pudo persistir la información. El almacenamiento del navegador está lleno.");
    }
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, DELAY));
  }

  // --- CONFIGURACION ---
  async getConfiguracion() {
    await this.delay();
    return this.config;
  }

  async updateConfig(clave: string, valor: any, currentUser: string) {
    await this.delay();
    const index = this.config.findIndex(c => c.clave === clave);
    if (index !== -1) {
      const oldVal = this.config[index].valor;
      this.config[index] = { ...this.config[index], valor };
      
      // Log audit
      this.addAudit('CONFIGURACION', clave, 'UPDATE', currentUser, { valor: oldVal }, { valor });
      this.saveToStorage();
    }
    return this.config[index];
  }

  async createConfig(item: ConfiguracionDinamica, currentUser: string) {
    await this.delay();
    this.config.push(item);
    this.addAudit('CONFIGURACION', item.clave, 'INSERT', currentUser, null, item);
    this.saveToStorage();
    return item;
  }

  async deleteConfig(clave: string, currentUser: string) {
    await this.delay();
    const index = this.config.findIndex(c => c.clave === clave);
    if (index !== -1) {
      const oldData = { ...this.config[index] };
      this.config.splice(index, 1);
      this.addAudit('CONFIGURACION', clave, 'DELETE', currentUser, oldData, null);
      this.saveToStorage();
    }
  }

  // --- DASHBOARD ---
  async getDashboardStats(sede?: string) {
    await this.delay();
    const isGlobal = !sede || sede.toLowerCase() === 'all';
    const activeSedesCount = this.sedes.filter(s => s.estado).length;

    return [
      { label: 'Pacientes Totales', value: isGlobal ? '1,284' : '412', icon: 'Users', color: 'bg-primary', trend: '+12%', trendUp: true },
      { label: 'Citas Hoy', value: isGlobal ? '42' : '15', icon: 'Calendar', color: 'bg-primary', trend: '+5%', trendUp: true },
      { label: 'Ingresos Mensuales', value: isGlobal ? 'S/ 12,450' : 'S/ 4,120', icon: 'TrendingUp', color: 'bg-success', trend: '+18%', trendUp: true },
      { label: 'Terapeutas Activos', value: isGlobal ? '18' : '6', icon: 'UserRound', color: 'bg-warning', trend: '0%', trendUp: true },
    ];
  }

  async getDashboardSecondaryStats(sede?: string) {
    await this.delay();
    const isGlobal = !sede || sede.toLowerCase() === 'all';
    const activeSedesCount = this.sedes.filter(s => s.estado).length;

    return [
      { label: 'Pendientes de Pago', value: isGlobal ? '15' : '4', icon: 'AlertCircle', color: 'text-danger', bg: 'bg-danger/10' },
      { label: 'Paquetes Activos', value: isGlobal ? '84' : '22', icon: 'CheckCircle2', color: 'text-success', bg: 'bg-success/10' },
      { label: 'Nuevos Pacientes', value: isGlobal ? '28' : '9', icon: 'Users', color: 'text-info', bg: 'bg-info/10' },
      { label: 'Tasa de Asistencia', value: '94%', icon: 'PieChart', color: 'text-primary', bg: 'bg-primary/5' },
      { label: 'Sedes Operativas', value: isGlobal ? activeSedesCount.toString() : '1', icon: 'Building2', color: 'text-warning', bg: 'bg-warning/10' },
      { label: 'Horas Terapia', value: isGlobal ? '1,420' : '380', icon: 'Clock', color: 'text-purple', bg: 'bg-purple/10' },
    ];
  }

  async getRecentAppointments(sede?: string) {
    await this.delay();
    const isGlobal = !sede || sede.toLowerCase() === 'all';

    const mockAppointments = [
      { id: 1, patient: 'Juan Pérez', therapist: 'Dra. Ana García', time: '09:00 AM', status: 'COMPLETADA', sede: 'LIMA_SUR' },
      { id: 2, patient: 'María Rodríguez', therapist: 'Dr. Carlos Ruiz', time: '10:30 AM', status: 'CONFIRMADA', sede: 'LIMA_NORTE' },
      { id: 3, patient: 'Roberto Gómez', therapist: 'Dra. Ana García', time: '11:45 AM', status: 'PENDIENTE', sede: 'LIMA_SUR' },
      { id: 4, patient: 'Elena Martínez', therapist: 'Lic. Sofía López', time: '02:15 PM', status: 'CONFIRMADA', sede: 'LIMA_NORTE' },
      { id: 5, patient: 'Pedro Sánchez', therapist: 'Dra. Ana García', time: '03:00 PM', status: 'PENDIENTE', sede: 'LIMA_SUR' },
      { id: 6, patient: 'Laura Torres', therapist: 'Dr. Carlos Ruiz', time: '04:30 PM', status: 'COMPLETADA', sede: 'LIMA_NORTE' },
    ];

    if (isGlobal) {
      return mockAppointments;
    } else {
      return mockAppointments.filter(apt => apt.sede === sede);
    }
  }

  // --- SEDES ---
  async getSedes() {
    await this.delay();
    return this.sedes.filter(s => s.estado !== false);
  }

  async createSede(sede: Omit<Sede, 'idSede'>, currentUser: string) {
    await this.delay();
    const newSede = { ...sede, idSede: Math.random().toString(36).substr(2, 9), estado: true };
    this.sedes.push(newSede as Sede);
    this.addAudit('SEDES', newSede.idSede, 'INSERT', currentUser, null, newSede);
    this.saveToStorage();
    return newSede;
  }

  async updateSede(id: string, data: Partial<Sede>, currentUser: string) {
    await this.delay();
    const index = this.sedes.findIndex(s => s.idSede === id);
    if (index !== -1) {
      const oldData = { ...this.sedes[index] };
      this.sedes[index] = { ...this.sedes[index], ...data };
      this.addAudit('SEDES', id, 'UPDATE', currentUser, oldData, this.sedes[index]);
      this.saveToStorage();
    }
    return this.sedes[index];
  }

  async deleteSede(id: string, currentUser: string) {
    await this.delay();
    const index = this.sedes.findIndex(s => s.idSede === id);
    if (index !== -1) {
      const oldData = { ...this.sedes[index] };
      // Soft delete: set state to false
      this.sedes[index].estado = false;
      this.addAudit('SEDES', id, 'UPDATE_STATUS', currentUser, oldData, this.sedes[index]);
      this.saveToStorage();
    }
  }

  // --- PERMISOS ---
  async getPermisos() {
    await this.delay();
    return this.permisos;
  }

  async createPermiso(permiso: Permiso, currentUser: string) {
    await this.delay();
    this.permisos.push(permiso);
    this.addAudit('PERMISOS', `${permiso.perfil}-${permiso.modulo}`, 'INSERT', currentUser, null, permiso);
    this.saveToStorage();
    return permiso;
  }

  async updatePermiso(perfil: string, modulo: string, data: Partial<Permiso>, currentUser: string) {
    await this.delay();
    const index = this.permisos.findIndex(p => p.perfil === perfil && p.modulo === modulo);
    if (index !== -1) {
      const oldData = { ...this.permisos[index] };
      this.permisos[index] = { ...this.permisos[index], ...data };
      this.addAudit('PERMISOS', `${perfil}-${modulo}`, 'UPDATE', currentUser, oldData, this.permisos[index]);
      this.saveToStorage();
    }
    return this.permisos[index];
  }

  // --- USUARIOS ---
  async getUsuarios(sede?: string) {
    await this.delay();
    let filtered = this.usuarios.filter(u => u.estado !== false);
    if (sede && sede.toLowerCase() !== 'all') {
      return filtered.filter(u => u.sede === sede);
    }
    return filtered;
  }

  async createUsuario(usuario: Omit<Usuario, 'id'>, currentUser: string) {
    await this.delay();
    const newUser = { ...usuario, id: Math.random().toString(36).substr(2, 9), estado: true };
    this.usuarios.push(newUser as Usuario);
    this.addAudit('USUARIOS', newUser.id, 'INSERT', currentUser, null, newUser);
    this.saveToStorage();
    return newUser;
  }

  async updateUsuario(id: string, data: Partial<Usuario>, currentUser: string) {
    await this.delay();
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      const oldData = { ...this.usuarios[index] };
      this.usuarios[index] = { ...this.usuarios[index], ...data };
      this.addAudit('USUARIOS', id, 'UPDATE', currentUser, oldData, this.usuarios[index]);
      this.saveToStorage();
    }
    return this.usuarios[index];
  }

  async deleteUsuario(id: string, currentUser: string) {
    await this.delay();
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      const oldData = { ...this.usuarios[index] };
      // Soft delete: set state to false
      this.usuarios[index].estado = false;
      this.addAudit('USUARIOS', id, 'UPDATE_STATUS', currentUser, oldData, this.usuarios[index]);
      this.saveToStorage();
    }
  }

  // --- TERAPEUTAS ---
  async getTerapeutas(sede?: string) {
    await this.delay();
    let filtered = this.terapeutas.filter(t => t.estado !== false);
    if (sede && sede.toLowerCase() !== 'all') {
      return filtered.filter(t => t.sede === sede);
    }
    return filtered;
  }

  async createTerapeuta(terapeuta: Omit<Terapeuta, 'id'>, currentUser: string) {
    await this.delay();
    const newTerapeuta = { ...terapeuta, id: Math.random().toString(36).substr(2, 9), estado: true };
    this.terapeutas.push(newTerapeuta as Terapeuta);
    this.addAudit('TERAPEUTAS', newTerapeuta.id, 'INSERT', currentUser, null, newTerapeuta);
    this.saveToStorage();
    return newTerapeuta;
  }

  async updateTerapeuta(id: string, data: Partial<Terapeuta>, currentUser: string) {
    await this.delay();
    const index = this.terapeutas.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldData = { ...this.terapeutas[index] };
      this.terapeutas[index] = { ...this.terapeutas[index], ...data };
      this.addAudit('TERAPEUTAS', id, 'UPDATE', currentUser, oldData, this.terapeutas[index]);
      this.saveToStorage();
    }
    return this.terapeutas[index];
  }

  async deleteTerapeuta(id: string, currentUser: string) {
    await this.delay();
    const index = this.terapeutas.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldData = { ...this.terapeutas[index] };
      // Soft delete: set state to false
      this.terapeutas[index].estado = false;
      this.addAudit('TERAPEUTAS', id, 'UPDATE_STATUS', currentUser, oldData, this.terapeutas[index]);
      this.saveToStorage();
    }
  }

  // --- PACIENTES ---
  async getPacientes(sede?: string) {
    await this.delay();
    let filtered = this.pacientes.filter(p => p.estado !== false);
    if (sede && sede.toLowerCase() !== 'all') {
      return filtered.filter(p => p.sede === sede);
    }
    return filtered;
  }

  async createPaciente(paciente: Omit<Paciente, 'id'>, currentUser: string) {
    await this.delay();
    const newPaciente = { ...paciente, id: Math.random().toString(36).substr(2, 9), estado: true };
    this.pacientes.push(newPaciente as Paciente);
    this.addAudit('PACIENTES', newPaciente.id, 'INSERT', currentUser, null, newPaciente);
    this.saveToStorage();
    return newPaciente;
  }

  async updatePaciente(id: string, data: Partial<Paciente>, currentUser: string) {
    await this.delay();
    const index = this.pacientes.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.pacientes[index] };
      this.pacientes[index] = { ...this.pacientes[index], ...data };
      this.addAudit('PACIENTES', id, 'UPDATE', currentUser, oldData, this.pacientes[index]);
      this.saveToStorage();
    }
    return this.pacientes[index];
  }

  async deletePaciente(id: string, currentUser: string) {
    await this.delay();
    const index = this.pacientes.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.pacientes[index] };
      // Soft delete: set state to false
      this.pacientes[index].estado = false;
      this.addAudit('PACIENTES', id, 'UPDATE_STATUS', currentUser, oldData, this.pacientes[index]);
      this.saveToStorage();
    }
  }

  // --- ESPECIALIDADES ---
  async getEspecialidades() {
    await this.delay();
    return this.especialidades.filter(e => e.estado !== false);
  }

  async createEspecialidad(especialidad: Omit<Especialidad, 'id'>, currentUser: string) {
    await this.delay();
    const newEspecialidad = { ...especialidad, id: Math.random().toString(36).substr(2, 9), estado: true };
    this.especialidades.push(newEspecialidad as Especialidad);
    this.addAudit('ESPECIALIDADES', newEspecialidad.id, 'INSERT', currentUser, null, newEspecialidad);
    this.saveToStorage();
    return newEspecialidad;
  }

  async updateEspecialidad(id: string, data: Partial<Especialidad>, currentUser: string) {
    await this.delay();
    const index = this.especialidades.findIndex(e => e.id === id);
    if (index !== -1) {
      const oldData = { ...this.especialidades[index] };
      this.especialidades[index] = { ...this.especialidades[index], ...data };
      this.addAudit('ESPECIALIDADES', id, 'UPDATE', currentUser, oldData, this.especialidades[index]);
      this.saveToStorage();
    }
    return this.especialidades[index];
  }

  async bulkUpdateEspecialidades(data: Partial<Especialidad>, currentUser: string) {
    await this.delay();
    this.especialidades = this.especialidades.map(e => {
      if (e.estado !== false) {
        const oldData = { ...e };
        const newData = { ...e, ...data };
        this.addAudit('ESPECIALIDADES', e.id, 'UPDATE', currentUser, oldData, newData);
        return newData;
      }
      return e;
    });
    this.saveToStorage();
    return this.especialidades;
  }

  async deleteEspecialidad(id: string, currentUser: string) {
    await this.delay();
    const index = this.especialidades.findIndex(e => e.id === id);
    if (index !== -1) {
      const oldData = { ...this.especialidades[index] };
      // Soft delete: set state to false
      this.especialidades[index].estado = false;
      this.addAudit('ESPECIALIDADES', id, 'UPDATE_STATUS', currentUser, oldData, this.especialidades[index]);
      this.saveToStorage();
    }
  }

  // --- HORARIOS TERAPEUTAS ---
  async getHorarios(sede?: string, idTerapeuta?: string) {
    await this.delay();
    let filtered = this.horarios.filter(h => h.estado !== false);
    if (sede && sede.toLowerCase() !== 'all') {
      filtered = filtered.filter(h => h.sede === sede);
    }
    if (idTerapeuta) {
      filtered = filtered.filter(h => h.idTerapeuta === idTerapeuta);
    }
    return filtered;
  }

  async createHorario(horario: Omit<Horario, 'id'>, currentUser: string) {
    await this.delay();
    const newHorario = { ...horario, id: Math.random().toString(36).substr(2, 9), estado: true };
    this.horarios.push(newHorario as Horario);
    this.addAudit('HORARIOS', newHorario.id, 'INSERT', currentUser, null, newHorario);
    this.saveToStorage();
    return newHorario;
  }

  async updateHorario(id: string, data: Partial<Horario>, currentUser: string) {
    await this.delay();
    const index = this.horarios.findIndex(h => h.id === id);
    if (index !== -1) {
      const oldData = { ...this.horarios[index] };
      this.horarios[index] = { ...this.horarios[index], ...data };
      this.addAudit('HORARIOS', id, 'UPDATE', currentUser, oldData, this.horarios[index]);
      this.saveToStorage();
    }
    return this.horarios[index];
  }

  async deleteHorario(id: string, currentUser: string) {
    const index = this.horarios.findIndex(h => h.id === id);
    if (index !== -1) {
      const oldData = { ...this.horarios[index] };
      // Soft delete: set state to false
      this.horarios[index].estado = false;
      this.addAudit('HORARIOS', id, 'UPDATE_STATUS', currentUser, oldData, this.horarios[index]);
      this.saveToStorage();
    }
  }

  // --- PAQUETES MAESTROS ---
  async getPaquetesMaestros() {
    await this.delay();
    return this.paquetesMaestros.filter(p => p.estado !== false);
  }

  async createPaqueteMaestro(paquete: Omit<PaqueteMaestro, 'id'>, currentUser: string) {
    await this.delay();
    const newPaquete = { 
      ...paquete, 
      id: `PM-${Math.random().toString(36).substr(2, 9)}`, 
      estado: true,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion: currentUser
    };
    this.paquetesMaestros.push(newPaquete as PaqueteMaestro);
    this.addAudit('PAQUETES_MAESTROS', newPaquete.id, 'INSERT', currentUser, null, newPaquete);
    this.saveToStorage();
    return newPaquete;
  }

  async updatePaqueteMaestro(id: string, data: Partial<PaqueteMaestro>, currentUser: string) {
    await this.delay();
    const index = this.paquetesMaestros.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.paquetesMaestros[index] };
      this.paquetesMaestros[index] = { ...this.paquetesMaestros[index], ...data };
      this.addAudit('PAQUETES_MAESTROS', id, 'UPDATE', currentUser, oldData, this.paquetesMaestros[index]);
      this.saveToStorage();
    }
    return this.paquetesMaestros[index];
  }

  async deletePaqueteMaestro(id: string, currentUser: string) {
    await this.delay();
    const index = this.paquetesMaestros.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.paquetesMaestros[index] };
      this.paquetesMaestros[index].estado = false;
      this.addAudit('PAQUETES_MAESTROS', id, 'UPDATE_STATUS', currentUser, oldData, this.paquetesMaestros[index]);
      this.saveToStorage();
    }
  }

  // --- PAQUETES PACIENTES (VENTAS) ---
  async getPaquetesPacientes(idPaciente?: string) {
    await this.delay();
    let filtered = this.paquetesPacientes;
    if (idPaciente) {
      filtered = filtered.filter(p => p.idPaciente === idPaciente);
    }
    return filtered;
  }

  async getPaquetePaciente(id: string) {
    await this.delay();
    return this.paquetesPacientes.find(p => p.id === id) || null;
  }

  async updatePaquetePaciente(id: string, data: Partial<PaquetePaciente>, currentUser: string) {
    await this.delay();
    const index = this.paquetesPacientes.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.paquetesPacientes[index] };
      const updated = { ...this.paquetesPacientes[index], ...data };
      this.paquetesPacientes[index] = updated;
      this.addAudit('PAQUETES_PACIENTES', id, 'UPDATE', currentUser, oldData, updated);
      this.saveToStorage();
    }
    return this.paquetesPacientes[index];
  }

  /**
   * CORE FLOW: ASIGNACIÓN DE PAQUETE A PACIENTE
   * 
   * Este es el disparador central del negocio. Ejecuta las siguientes acciones en cadena:
   * 1. Vincula un paciente con un paquete maestro específico.
   * 2. Calcula proyecciones de citas basadas en la frecuencia (Semanal, Quincenal, Mensual).
   * 3. Registra una cuenta por cobrar (Pago) en el módulo financiero.
   * 4. Registra auditoría detallada de cada inserción masiva.
   * 
   * @throws Error si el paquete o el paciente no existen.
   */
  /**
   * Valida si un terapeuta tiene disponibilidad en una fecha y hora específica.
   * Ahora incluye validación de horario laboral del terapeuta.
   */
  async validarDisponibilidad(idTerapeuta: string, fecha: string, horaInicio: string, horaFin?: string) {
    if (!idTerapeuta) return { libre: true };

    const terapeuta = this.terapeutas.find(t => t.id === idTerapeuta);
    if (!terapeuta) return { libre: false, motivo: 'Terapeuta no encontrado' };

    // 1. Verificar Horario Laboral en this.horarios
    const fechaObj = new Date(fecha + 'T12:00:00');
    const diaNombre = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaCapitalizado = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);

    // Buscar horario del terapeuta para este mes/año (o cualquier horario activo)
    const horario = this.horarios.find(h => h.idTerapeuta === idTerapeuta && h.estado);
    
    if (horario) {
      const bloque = horario.bloques.find(b => 
        b.diasSemana.includes(diaCapitalizado) && b.tipo === 'TRABAJO'
      );

      if (!bloque) {
        return { libre: false, motivo: `El terapeuta no labora los días ${diaCapitalizado}` };
      }

      const [hReq, mReq] = horaInicio.split(':').map(Number);
      const [hIni, mIni] = bloque.horaInicio.split(':').map(Number);
      const [hFin, mFin] = bloque.horaFin.split(':').map(Number);

      const minReq = hReq * 60 + mReq;
      const minIni = hIni * 60 + mIni;
      const minFin = hFin * 60 + mFin;

      if (minReq < minIni || minReq >= minFin) {
        return { libre: false, motivo: `Fuera de horario laboral (${bloque.horaInicio} - ${bloque.horaFin})` };
      }
    }

    // 2. Verificar Colisión con otras citas
    const citaExistente = this.citas.find(c => 
      c.idTerapeuta === idTerapeuta && 
      c.fecha === fecha && 
      c.horaInicio === horaInicio && 
      c.estadoCita !== 'CANCELADA'
    );

    if (citaExistente) {
      return { libre: false, motivo: `Cita ya programada con ${citaExistente.nombrePaciente}` };
    }

    return { libre: true };
  }

  /**
   * Realiza un pre-chequeo de todas las citas que se generarían con un paquete.
   */
  async checkPackageCollisions(idTerapeuta: string, idMaestro: string, fechaBase: string, horaInicio: string) {
    const maestro = this.paquetesMaestros.find(m => m.id === idMaestro);
    if (!maestro) throw new Error("Paquete no encontrado");

    const proyecciones = [];
    const baseDate = new Date(fechaBase + 'T00:00:00');

    for (let i = 0; i < maestro.cantCitas; i++) {
        const fechaCita = new Date(baseDate);
        if (maestro.frecuencia === 'SEMANAL') {
            fechaCita.setDate(baseDate.getDate() + (i * 7));
        } else if (maestro.frecuencia === 'QUINCENAL') {
            fechaCita.setDate(baseDate.getDate() + (i * 14));
        } else if (maestro.frecuencia === 'MENSUAL') {
            fechaCita.setMonth(baseDate.getMonth() + i);
        }

        const dateStr = fechaCita.toISOString().split('T')[0];
        const validation = await this.validarDisponibilidad(idTerapeuta, dateStr, horaInicio);
        
        proyecciones.push({
            indice: i + 1,
            fecha: dateStr,
            hora: horaInicio,
            disponible: validation.libre,
            motivo: validation.motivo
        });
    }

    return proyecciones;
  }

  /**
   * CORE FLOW: ASIGNACIÓN DE PAQUETE A PACIENTE
   * 
   * @throws Error si hay colisiones críticas o falta de datos.
   */
  async asignarPaqueteAPaciente(idPaciente: string, idMaestro: string, sede: string, currentUser: string, idTerapeuta?: string, horaInicio?: string, customProyecciones?: any[]) {
    await this.delay();
    const maestro = this.paquetesMaestros.find(m => m.id === idMaestro);
    if (!maestro) throw new Error("Paquete maestro no encontrado");

    const paciente = this.pacientes.find(p => p.id === idPaciente);
    if (!paciente) throw new Error("Paciente no encontrado");

    const terapeuta = idTerapeuta ? this.terapeutas.find(t => t.id === idTerapeuta) : null;

    // Verificar colisión inicial si se provee terapeuta y hora
    if (idTerapeuta && horaInicio) {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const isLibre = await this.validarDisponibilidad(idTerapeuta, fechaHoy, horaInicio);
        // Nota: Solo validamos la primera, pero el motor debería ser proactivo.
    }

    // BLOQUEO: No permitir asignación si hay colisiones en los datos finales
    const finalProyecciones = customProyecciones || [];
    if (finalProyecciones.length > 0 && finalProyecciones.some(p => !p.disponible)) {
        throw new Error("No se puede asignar el paquete: Existen colisiones de horario que deben resolverse.");
    }

    const newPaquetePaciente: PaquetePaciente = {
      id: `PP-${Math.random().toString(36).substr(2, 9)}`,
      idPaciente,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidoPaterno}`,
      idMaestro,
      nombre: maestro.nombre,
      cantCitas: maestro.cantCitas,
      citasConsumidas: 0,
      precioVenta: maestro.precioSugerido,
      frecuencia: maestro.frecuencia,
      limiteEspecialidades: maestro.limiteEspecialidades,
      fechaContrato: new Date().toISOString(),
      estado: 'ACTIVO',
      sede,
      usuarioCreacion: currentUser
    };

    this.paquetesPacientes.push(newPaquetePaciente);
    this.addAudit('PAQUETES_PACIENTES', newPaquetePaciente.id, 'INSERT', currentUser, null, newPaquetePaciente);

    // --- MOTOR DE GENERACIÓN DE CITAS ---
    const citasGeneradas: any[] = [];
    
    if (finalProyecciones.length > 0) {
        // Usar proyecciones validadas
        finalProyecciones.forEach((p, i) => {
            const newCita = {
                id: `CT-${Math.random().toString(36).substr(2, 9)}`,
                idPaciente,
                nombrePaciente: `${paciente.nombres} ${paciente.apellidoPaterno}`,
                idTerapeuta: idTerapeuta || '',
                nombreTerapeuta: terapeuta ? `${terapeuta.nombres} ${terapeuta.apellidoPaterno}` : 'Sin Asignar',
                idPaquete: newPaquetePaciente.id,
                fecha: p.fecha,
                horaInicio: p.hora,
                horaFin: '09:45',
                sede,
                estadoCita: 'PENDIENTE',
                estadoPago: 'PENDIENTE',
                montoPagado: 0,
                notas: '',
                usuarioCreacion: currentUser,
                fechaCreacion: new Date().toISOString()
            };
            citasGeneradas.push(newCita);
            this.citas.push(newCita);
        });
    } else {
        // Fallback lógica antigua pero con chequeo estricto
        const fechaBase = new Date();
        for(let i = 0; i < maestro.cantCitas; i++) {
            const fechaCita = new Date(fechaBase);
            if (maestro.frecuencia === 'SEMANAL') {
                fechaCita.setDate(fechaBase.getDate() + (i * 7) + 1);
            } else if (maestro.frecuencia === 'QUINCENAL') {
                fechaCita.setDate(fechaBase.getDate() + (i * 14) + 1);
            } else if (maestro.frecuencia === 'MENSUAL') {
                fechaCita.setMonth(fechaBase.getMonth() + i + 1);
            }

            const dateStr = fechaCita.toISOString().split('T')[0];
            const hora = horaInicio || '09:00';

            const validation = idTerapeuta ? await this.validarDisponibilidad(idTerapeuta, dateStr, hora) : { libre: true };
            if (!validation.libre) {
                throw new Error(`Colisión en sesión ${i+1} (${dateStr}): ${validation.motivo}`);
            }

            const newCita = {
                id: `CT-${Math.random().toString(36).substr(2, 9)}`,
                idPaciente,
                nombrePaciente: `${paciente.nombres} ${paciente.apellidoPaterno}`,
                idTerapeuta: idTerapeuta || '',
                nombreTerapeuta: terapeuta ? `${terapeuta.nombres} ${terapeuta.apellidoPaterno}` : 'Sin Asignar',
                idPaquete: newPaquetePaciente.id,
                fecha: dateStr,
                horaInicio: hora,
                horaFin: '09:45',
                sede,
                estadoCita: 'PENDIENTE',
                estadoPago: 'PENDIENTE',
                montoPagado: 0,
                notas: '',
                usuarioCreacion: currentUser,
                fechaCreacion: new Date().toISOString()
            };
            citasGeneradas.push(newCita);
            this.citas.push(newCita);
        }
    }
    
    this.addAudit('CITAS', newPaquetePaciente.id, 'BULK_INSERT', currentUser, null, { 
      count: citasGeneradas.length
    });

    // TRIGGER FINANCIERO: Crear pago automático
    const newPago: Pago = {
      idPago: `PAG-${Math.random().toString(36).substr(2, 9)}`,
      idPaciente,
      idPaquete: newPaquetePaciente.id,
      concepto: `Pago por Paquete: ${maestro.nombre}`,
      monto: maestro.precioSugerido,
      estado: 'PENDIENTE',
      fechaReferencial: new Date().toISOString(),
      moneda: 'PEN',
      idSede: sede,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion: currentUser
    };
    this.pagos.push(newPago);
    this.addAudit('PAGOS', newPago.idPago, 'INSERT', currentUser, null, newPago);

    this.saveToStorage();
    return newPaquetePaciente;
  }

  async registrarGasto(monto: number, concepto: string, idSede: string, medio: Transaccion['medio'], currentUser: string, comprobante?: string) {
    await this.delay();
    
    const newTransaccion: Transaccion = {
      idTransaccion: `EXP-${Math.random().toString(36).substr(2, 9)}`,
      idPago: '', 
      monto: monto,
      fecha: new Date().toISOString(),
      medio,
      comprobante: comprobante || 'S/N',
      tipoTransaccion: 'EGRESO',
      estado: 'COMPLETADO',
      idSede,
      concepto,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion: currentUser
    };

    this.transacciones.push(newTransaccion);
    this.addAudit('TRANSACCIONES', newTransaccion.idTransaccion, 'INSERT', currentUser, null, newTransaccion);
    this.saveToStorage();
    return newTransaccion;
  }

  // --- PAGOS ---
  async getPagos(idPaciente?: string, sede?: string) {
    await this.delay();
    let filtered = this.pagos;
    if (idPaciente) {
      filtered = filtered.filter(p => p.idPaciente === idPaciente);
    }
    if (sede && sede.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.idSede === sede);
    }
    return filtered;
  }

  async getTransacciones(idPago?: string) {
    await this.delay();
    if (idPago) {
      return this.transacciones.filter(t => t.idPago === idPago);
    }
    return this.transacciones;
  }

  // --- CITAS ---
  async getCitas(sede?: string, idPaciente?: string, idTerapeuta?: string) {
    await this.delay();
    let filtered = this.citas;
    if (sede && sede.toLowerCase() !== 'all') {
      filtered = filtered.filter(c => c.sede === sede);
    }
    if (idPaciente) {
      filtered = filtered.filter(c => c.idPaciente === idPaciente);
    }
    if (idTerapeuta) {
      filtered = filtered.filter(c => c.idTerapeuta === idTerapeuta);
    }
    return filtered;
  }

  async updateCita(id: string, data: any, currentUser: string) {
    await this.delay();
    const index = this.citas.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldData = { ...this.citas[index] };
      this.citas[index] = { ...this.citas[index], ...data };
      this.addAudit('CITAS', id, 'UPDATE', currentUser, oldData, this.citas[index]);
      this.saveToStorage();
    }
    return this.citas[index];
  }

  async cancelarPaquetePaciente(id: string, currentUser: string) {
    await this.delay();
    const index = this.paquetesPacientes.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldData = { ...this.paquetesPacientes[index] };
      this.paquetesPacientes[index].estado = 'CANCELADO';
      this.addAudit('PAQUETES_PACIENTES', id, 'UPDATE_STATUS', currentUser, oldData, this.paquetesPacientes[index]);
      
      // Cancelar también el pago si sigue pendiente
      const pago = this.pagos.find(p => p.idPaquete === id && p.estado === 'PENDIENTE');
      if (pago) {
        const oldPago = { ...pago };
        pago.estado = 'ANULADO';
        this.addAudit('PAGOS', pago.idPago, 'UPDATE_STATUS', currentUser, oldPago, pago);
      }

      // Cancelar citas pendientes vinculadas a este paquete
      this.citas = this.citas.filter(c => !(c.idPaquete === id && c.estadoCita === 'PENDIENTE'));

      this.saveToStorage();
    }
    return this.paquetesPacientes[index];
  }

  async registrarAbono(idPago: string, monto: number, medio: Transaccion['medio'], comprobante: string, currentUser: string) {
    await this.delay();
    const pagoIndex = this.pagos.findIndex(p => p.idPago === idPago);
    if (pagoIndex === -1) throw new Error("Registro de pago no encontrado");

    const pago = this.pagos[pagoIndex];
    const transaccionesDelPago = this.transacciones.filter(t => t.idPago === idPago);
    const totalAbonadoPrevio = transaccionesDelPago.reduce((sum, t) => sum + t.monto, 0);
    
    if (totalAbonadoPrevio + monto > pago.monto) {
      throw new Error(`El abono excede el saldo pendiente (Saldo: S/ ${pago.monto - totalAbonadoPrevio})`);
    }

    const newTransaccion: Transaccion = {
      idTransaccion: `TRX-${Math.random().toString(36).substr(2, 9)}`,
      idPago,
      monto,
      fecha: new Date().toISOString(),
      medio,
      comprobante,
      tipoTransaccion: 'INGRESO',
      estado: 'COMPLETADO',
      idSede: pago.idSede,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion: currentUser
    };

    this.transacciones.push(newTransaccion);
    
    // Actualizar estado del pago
    const nuevoTotal = totalAbonadoPrevio + monto;
    if (nuevoTotal >= pago.monto) {
      this.pagos[pagoIndex].estado = 'PAGADO';
    } else {
      this.pagos[pagoIndex].estado = 'PARCIAL';
    }

    this.addAudit('TRANSACCIONES', newTransaccion.idTransaccion, 'INSERT', currentUser, null, newTransaccion);
    this.addAudit('PAGOS', idPago, 'UPDATE', currentUser, { estado: pago.estado }, { estado: this.pagos[pagoIndex].estado });
    
    this.saveToStorage();
    return newTransaccion;
  }

  // --- AUDITORIA ---
  async getAuditoria() {
    await this.delay();
    return this.auditoria;
  }

  private addAudit(tabla: string, idRegistro: string, accion: string, usuario: string, datosAnteriores?: any, datosNuevos?: any) {
    // Función para omitir valores gigantes (como Base64 de imágenes) en los logs de auditoría
    const sanitize = (data: any) => {
      if (!data || typeof data !== 'object') return data;
      const clean = { ...data };
      Object.keys(clean).forEach(key => {
        if (typeof clean[key] === 'string' && clean[key].length > 1000) {
          clean[key] = `[Omitido: Dato demasiado grande (${clean[key].length} chars)]`;
        }
      });
      return clean;
    };

    const audit: Auditoria = {
      id: Math.random().toString(36).substr(2, 9),
      tabla,
      idRegistro,
      accion: accion as 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'UPDATE_STATUS',
      datosAnteriores: sanitize(datosAnteriores),
      datosNuevos: sanitize(datosNuevos),
      fecha: new Date().toISOString(),
      idUsuario: usuario,
      nombreUsuario: usuario
    };
    this.auditoria.unshift(audit);

    // Limitar el tamaño del log de auditoría para prevenir problemas de cuota de localStorage
    const MAX_AUDIT_LOGS = 50; // Reducido para evitar QuotaExceededError
    if (this.auditoria.length > MAX_AUDIT_LOGS) {
      this.auditoria = this.auditoria.slice(0, MAX_AUDIT_LOGS);
    }
    this.saveToStorage();
  }
}

export const apiService = new ApiService();
