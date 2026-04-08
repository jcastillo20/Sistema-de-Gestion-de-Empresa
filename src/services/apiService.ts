import { 
  Usuario, 
  Terapeuta, 
  Paciente, 
  ConfiguracionDinamica, 
  Permiso, 
  Sede,
  Auditoria,
  Especialidad,
  Horario
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
  MOCK_ESPECIALIDADES_DICT
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
    await this.delay();
    const index = this.horarios.findIndex(h => h.id === id);
    if (index !== -1) {
      const oldData = { ...this.horarios[index] };
      // Soft delete: set state to false
      this.horarios[index].estado = false;
      this.addAudit('HORARIOS', id, 'UPDATE_STATUS', currentUser, oldData, this.horarios[index]);
      this.saveToStorage();
    }
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
