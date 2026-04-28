# 🏥 CliniGest Pro — Enterprise Clinical Management System

<div align="center">

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg?style=for-the-badge)](CHANGELOG.md)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg?style=for-the-badge)](LICENSE)

**Plataforma integral de grado empresarial para la gestión clínica multisede con motor dinámico.**

</div>

---

## 1. Información General
**CliniGest Pro** es una solución diseñada para centros de salud que requieren flexibilidad total. Su arquitectura permite que el 90% de las reglas de negocio e identidad visual se definan mediante datos, permitiendo ajustes de marca, duraciones de sesión y permisos en tiempo real sin tocar el código fuente.

### El Problema que Resuelve
La rigidez de los sistemas tradicionales. CliniGest Pro permite una personalización profunda (Branding dinámico) y una gestión operativa basada en el consumo inteligente de paquetes terapéuticos.

---

## 🚀 2. Instalación y Uso

### Requisitos Previos
*   **Node.js** (v18.0 o superior recomendado)
*   **npm** o **pnpm** como gestor de paquetes.

### Pasos de Instalación
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/juancastillo/clinigest-pro.git
    cd clinigest-pro
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Iniciar entorno de desarrollo:**
    ```bash
    npm run dev
    ```

### Credenciales de Acceso (Entorno Mock)
El sistema utiliza una capa de persistencia simulada. Puedes ingresar con:
*   **Administrador:** `admin` / `admin123`
*   **Super Usuario:** `super` / `super123`

---

## 📘 Manual de Usuario e Informe Técnico: CliniGest Pro

**Destino:** Auditoría de Implementación y Manual de Cierre de Gaps.

### 0. Arquitectura Transversal (El Corazón del Sistema)
El sistema opera bajo una arquitectura **Metadata-Driven** donde el diseño visual y la seguridad están centralizados en una "Única Fuente de Verdad" (SST).

*   **Branding Dinámico:** Los colores `primary`, `secondary` y `accent` se inyectan desde `apiService` a variables CSS (`--primary-rgb`, etc.), permitiendo cambios de marca sin recompilar.
*   **Aislamiento de Sedes:** Implementado a nivel de servicio. Los usuarios sin el permiso `verTodo` solo reciben y visualizan datos filtrados por su propiedad `sede`.
*   **RBAC Estricto:** Matriz de 5 perfiles controlada por el hook `usePermissions` que desaparece botones de acción del DOM si el usuario no tiene los bits `puedeCrear`, `puedeEditar` o `puedeEliminar`.

---

### 1. Módulo: PACIENTES
**👶 ¿Qué es y para qué sirve?**
Es el archivo clínico central. Aquí se registra a toda persona que recibirá terapia, gestionando su identidad y vinculación con la clínica.

**🖼️ ¿Qué veo en pantalla?**
*   **DataTable:** Lista con avatares (iniciales), nombres completos, documentos y sede.
*   **Chips de Estado:** Indicadores visuales de estado Activo/Inactivo.
*   **Acciones:** Botón flotante "Nuevo Paciente", filtros rápidos y buscador predictivo.

**📝 Formulario de Registro**
*   **Identidad:** Nombres, Apellidos (Paterno/Materno).
*   **Documentación:** Tipo (DNI/CE/PAS) y número de documento.
*   **Contacto:** Teléfono, Email y Dirección.
*   **Clínico:** Fecha de Nacimiento (calcula edad) y Género.
*   **Control:** Sede de origen (asignada por defecto al Admin de Sede).

**⚡ Acciones y Filtros**
*   **Botón Editar:** Permite modificar todos los campos excepto la fecha de creación.
*   **Botón Eliminar:** Cambio de estado (Soft Delete) para preservar integridad histórica.
*   **Filtros:** Por Sede (si tiene `verTodo`) y Estado.

**🔒 Permisos y Gaps**
*   **Accesos:** SuperAdmin (Total), Admin (Sede), Recepción (Registro/Lectura).
*   **Gap Identificado:** Falta historial de parentesco/apoderado (esencial para pediatría).

---

### 2. Módulo: TERAPEUTAS
**👶 ¿Qué es y para qué sirve?**
Es el directorio de especialistas. Define quiénes pueden atender, en qué especialidades y en qué sede laboran.

**🖼️ ¿Qué veo en pantalla?**
*   **Tarjetas/Tabla:** Muestra especialidad principal, sede y cantidad de especialidades vinculadas.
*   **Badge de Sede:** Identificador visual de la base de operaciones del profesional.

**📝 Formulario de Registro**
*   **Datos Personales:** Nombre completo y DNI.
*   **Especialidades:** Selección múltiple de especialidades (Maestras definidas en Configuración).
*   **Asignación:** Sede fija de trabajo.

**🔒 Permisos y Gaps**
*   **Accesos:** Solo Administradores pueden gestionar el staff.
*   **Gap Identificado:** No existe "Cargo" o "Role Interno" dentro del staff (ej: Coordinador).

---

### 3. Módulo: USUARIOS (Acceso al Sistema)
**👶 ¿Qué es y para qué sirve?**
Controla quién entra al software. No son pacientes ni terapeutas, son los operadores del sistema.

**🖼️ ¿Qué veo en pantalla?**
*   **Lista de Seguridad:** Muestra nombre de usuario, perfil (RBAC) y última conexión (auditoría).

**📝 Formulario de Registro**
*   **Credenciales:** Username y Password inicial.
*   **Perfil:** Selección de uno de los 5 roles predefinidos.
*   **Aislamiento:** Sede a la que pertenece (limita su visión).

---

### 4. Módulo: CONFIGURACIÓN (7 Sub-Menús)
Este es el "Cerebro" del sistema, estructurado en pestañas independientes:

1.  **BRANDING:** Carga de Logo y colores Hexadecimales. Actualiza el SST en tiempo real.
2.  **SEDES:** CRUD de locales físicos. Define direcciones y horarios maestros del local.
3.  **ESPECIALIDADES:** Definición de servicios clínicos (ej: Terapia Física). Aquí se gestiona el catálogo, no en Terapeutas.
4.  **SEGURIDAD:** Matriz de permisos. Define qué módulos ve cada perfil y qué acciones (CRUD) puede ejecutar.
5.  **AGENDA:** Ajustes globales de tiempos. Define colores por estado de cita y duraciones por defecto.
6.  **DICCIONARIOS:** Listas desplegables (Tipos de documento, Géneros, etc.).
7.  **AUDITORÍA:** Log inmutable de quién hizo qué, cuándo y qué datos cambió.

---

### 5. Módulo: CATÁLOGO DE PAQUETES
**👶 ¿Qué es y para qué sirve?**
Define las "ofertas" o moldes. Son plantillas para vender bloques de citas (ej: "Paquete 12 Sesiones").

**🖼️ ¿Qué veo en pantalla?**
*   **Tabla de Plantillas:** Muestra cantidad de citas, precio sugerido y frecuencia (Semanal/Quincenal).

---

### 6. Módulo: CONTROL DE PAQUETES (Ventas y Proyección)
**👶 ¿Qué es y para qué sirve?**
Es el motor comercial. Aquí se "vende" un paquete a un paciente real.

**⚙️ Lógica de Negocio (Package Engine)**
Al asignar un paquete:
1.  **Venta:** Se crea un contrato inmutable con el precio de ese momento.
2.  **Proyección de Citas:** El sistema genera automáticamente `N` citas (ej: 12) basadas en la frecuencia.
3.  **Trigger Financiero:** Se genera una cuenta por cobrar (Debt) en el módulo de Tesorería por el total.

---

### 7. Módulo: TESORERÍA / CAJA
**👶 ¿Qué es y para qué sirve?**
Controla el flujo de dinero. Gestiona lo que los pacientes deben y lo que han pagado.

**📝 Funcionamiento de Abonos**
*   **Saldo Pendiente:** Calcula `Total Ventas - Total Pagado`.
*   **Registro de Pago:** Botón "Cobrar" permite abonos parciales o totales.
*   **Validación:** El sistema bloquea citas si el estado de pago es "Pendiente" (Configurable).

---

### 8. Módulo: HORARIOS Y AGENDA
**👶 ¿Qué es y para qué sirve?**
Gestión de tiempos. Los terapeutas definen su disponibilidad mensual para que la agenda pueda recibir citas.

**🖼️ Vista Calendario (Agenda)**
*   **Grid de Tiempos:** Visualización por Día/Semana/Mes.
*   **Colores dinámicos:** Los bloques cambian de color según su estado (Mañana, Tarde, Pausa, Trabajo) configurado en el SST.

---

## 🏗️ II. TABLA DE CUMPLIMIENTO Y GAP ANALYSIS (ROADMAP)

# 🏥 CliniGest Pro — Matriz de Cumplimiento v2.1

| Módulo | Alcance / Funcionalidad | % Avance | Gaps Pendientes |
| :--- | :--- | :--- | :--- |
| **PACIENTES** | CRUD, Filtros sede, Edad auto, DNI único. | 95% | Datos de apoderado. |
| **USUARIOS** | RBAC, Perfiles inmutables, Login. | 100% | - |
| **TERAPEUTAS** | Especialidades múltiples, Sede fija. | 90% | Bio/Foto del especialista. |
| **CONFIGURACIÓN** | Branding, Sedes, Seguridad, Logs. | 98% | Backup manual de base de datos. |
| **CATÁLOGO** | Moldes comerciales, Precios, Frecuencia. | 100% | - |
| **CONTROL PQ** | Venta, Proyección, Contrato inmutable. | 85% | Validación de disponibilidad (Colisiones). |
| **TESORERÍA** | Ingresos, Abonos, Saldos, Deudas. | 70% | Módulo de Egresos (Gastos). |
| **HORARIOS** | Bloques, Meses, Vista Calendario. | 90% | Reprogramación masiva. |
| **AGENDA** | Estados, Colores dinámicos, Timeline. | 80% | Subvención de documentos de evidencia. |

---

### ⚠️ GAPS CRÍTICOS IDENTIFICADOS (Visión 2.1)
1.  **Motor de Colisiones (Agenda):** La generación de citas de paquetes es "ciega"; genera la cita a las 09:00 sin validar si el terapeuta está libre.
2.  **Gestión de Egresos:** El sistema solo registra ingresos (Ventas). Falta el módulo de Gastos para calcular rentabilidad real.
3.  **Evidencia de Reprogramación:** No existe el input para subir archivo/foto al mover una cita.

---

## 🏗️ 5. Arquitectura de Producción Propuesta

El sistema ha sido diseñado como un **Monolito Moderno** preparado para ser desacoplado o desplegado de forma eficiente según costes de nube.

### Opción A: Despliegue en Azure (Costo Optimizado)
*   **Frontend:** Azure Storage Account (Static Website) -> Costo mínimo.
*   **Backend:** Azure Web App (Containerizada con Spring Boot) o App Service.
*   **Base de Datos:** Azure Database for MariaDB/Postgres.
*   **Seguridad:** Azure Key Vault + SSL Gestionado por el dominio.

### Opción B: Despliegue en AWS (Rendimiento)
*   **Cómputo:** AWS EC2 (t3.micro/small) para el motor monolítico.
*   **Almacenamiento:** Amazon S3 para evidencias de reprogramación y logos.
*   **Base de Datos:** Amazon RDS (Postgres).

### Estrategia Tecnológica Sugerida
*   **Backend:** Spring Boot (Java) para robustez en transacciones financieras.
*   **Frontend:** React/Angular (SPA) consumiendo la API.
*   **Automatización:** Agente n8n residente en EC2/Contenedor conectándose directamente a la DB para flujos de WhatsApp.

---

##  6. Estructura del Proyecto

```bash
src/
 ├── assets/          # Recursos estáticos (Imágenes, logos)
 ├── components/      # Componentes React (Atomic Design)
 │    ├── common/     # Componentes reutilizables (DataTable, Modal, AlertModal)
 │    └── layout/     # Sidebar, Header y Wrappers globales
 ├── hooks/           # Custom hooks (RBAC, permisos, lógica compartida)
 ├── lib/             # Utilidades de terceros (Tailwind merge, clsx)
 ├── pages/           # Módulos de negocio (Dashboard, Pacientes, Terapeutas, etc.)
 ├── services/        # Capa de datos (apiService, mockDb para persistencia simulada)
 ├── types/           # Definiciones de TypeScript (Interfaces y Modelos)
 ├── constants.ts     # Reglas de validación y configuraciones globales
 ├── index.css        # Sistema de Diseño SST (Single Source of Truth)
 └── main.tsx         # Punto de entrada de la aplicación
```

---

## 🗄️ 5. Estructura de Datos (Modelos)

A continuación se detallan las entidades principales del sistema. El proyecto utiliza una arquitectura orientada a servicios preparada para una futura migración a una base de datos SQL real.

### 👥 Gestión de Personas y Acceso

#### Usuario (`Usuario`)
Representa a las cuentas que tienen acceso al sistema (Administradores, Recepcionistas, etc.).

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único del usuario. |
| `apellidoPaterno` | `string` | Apellido paterno del usuario. |
| `apellidoMaterno` | `string` | Apellido materno del usuario. |
| `nombres` | `string` | Nombres reales del usuario. |
| `nombreUsuario` | `string` | Nombre de login (username). |
| `contrasena` | `string` | Contraseña de acceso (manejada como hash). |
| `correo` | `string` | Correo electrónico de contacto. |
| `telefono` | `string` | Número telefónico. |
| `tipoDocumento` | `string` | Tipo de identificación (DNI, CE). |
| `documentoIdentidad`| `string` | Número de DNI o Carnet de Extranjería. |
| `perfil` | `string` | Rol asignado (ej: `SUPERADMIN`, `RECEPCIONISTA`). |
| `sede` | `string` | Nombre de la sede asignada o `ALL` para acceso global. |
| `estado` | `boolean` | Indica si el usuario está activo o inhabilitado. |
| `fechaCreacion` | `string` | Fecha y hora de registro inicial. |
| `usuarioCreacion` | `string` | Usuario que realizó el registro. |
| `fechaModificacion` | `string` | Fecha de la última actualización (opcional). |
| `usuarioModificacion`| `string` | Último usuario que modificó el registro (opcional). |

#### Paciente (`Paciente`)
Expediente maestro de los pacientes atendidos en la clínica.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único del paciente. |
| `apellidoPaterno` | `string` | Apellido paterno del paciente. |
| `apellidoMaterno` | `string` | Apellido materno del paciente. |
| `nombres` | `string` | Nombres del paciente. |
| `tipoDocumento` | `string` | Tipo de identificación (DNI, CE, PASAPORTE). |
| `documentoIdentidad`| `string` | Número de documento único. |
| `correo` | `string` | Correo electrónico de contacto. |
| `telefono` | `string` | Número telefónico. |
| `responsable` | `string` | Nombre del tutor o familiar a cargo. |
| `motivo` | `string` | Descripción breve del motivo de consulta inicial. |
| `sede` | `string` | Sede donde se atiende preferentemente. |
| `estado` | `boolean` | Indica si el paciente tiene un expediente activo. |
| `fechaCreacion` | `string` | Fecha de registro en el sistema. |
| `usuarioCreacion` | `string` | Usuario que registró al paciente. |
| `fechaModificacion` | `string` | Fecha de la última actualización. |
| `usuarioModificacion`| `string` | Último usuario que modificó el registro. |

#### Terapeuta (`Terapeuta`)
Personal médico o clínico especializado.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único del terapeuta. |
| `apellidoPaterno` | `string` | Apellido paterno. |
| `apellidoMaterno` | `string` | Apellido materno. |
| `nombres` | `string` | Nombres del profesional. |
| `tipoDocumento` | `string` | Tipo de identificación. |
| `documentoIdentidad`| `string` | Número de documento profesional. |
| `correo` | `string` | Correo institucional. |
| `telefono` | `string` | Teléfono de contacto. |
| `especialidades` | `string[]` | Lista de especialidades que puede atender. |
| `colegiatura` | `string` | Número de registro profesional. |
| `sede` | `string` | Sede base de operaciones. |
| `estado` | `boolean` | Indica si el terapeuta está laborando actualmente. |
| `fechaCreacion` | `string` | Fecha de alta en el sistema. |
| `usuarioCreacion` | `string` | Usuario que creó la ficha del terapeuta. |
| `fechaModificacion` | `string` | Fecha de la última actualización. |
| `usuarioModificacion`| `string` | Último usuario que modificó el registro. |

### 📅 Operaciones y Configuración

#### Permiso (`Permiso`)
Matriz de capacidades granulares por rol y módulo.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `perfil` | `string` | Nombre del perfil al que aplica (ej: `RECEPCIONISTA`). |
| `modulo` | `string` | Nombre del módulo (ej: `PACIENTES`). |
| `acceso` | `boolean` | Si puede entrar al módulo. |
| `verTodo` | `boolean` | Si puede ignorar el filtro de sede (Global). |
| `puedeCrear` | `boolean` | Si tiene permiso para insertar registros. |
| `puedeEditar` | `boolean` | Si tiene permiso para modificar datos. |
| `puedeEliminar` | `boolean` | Si tiene permiso para desactivar registros. |
| `filtrarPersonas` | `boolean` | Si debe ver solo los registros asignados a él. |

### 📅 Operaciones y Horarios

#### Cita (`Cita`)
Registro individual de una sesión de atención clínica.

| Campo | Tipo | Descripción |
| :--- | :--- | : :--- |
| :--- | :--- | :--- |
| `idCita` | `string` | Identificador único de la cita. |
| `idDoctor` | `string` | Referencia al terapeuta asignado. |
| `idPaciente` | `string` | Referencia al paciente atendido. |
| `idPaquete` | `string` | Referencia al paquete vinculado (opcional). |
| `idPago` | `string` | Referencia al registro de pago vinculado (opcional). |
| `fecha` | `string` | Fecha programada de la cita. |
| `horaInicio` | `string` | Hora de inicio de la sesión. |
| `horaFin` | `string` | Hora de finalización prevista. |
| `motivo` | `string` | Descripción del servicio o consulta. |
| `estadoCita` | `enum` | Estado: `PENDIENTE`, `COMPLETADA`, `CANCELADA`, etc. |
| `sede` | `string` | Lugar de atención. |
| `modalidad` | `enum` | Tipo de atención: `PRESENCIAL` o `VIRTUAL`. |
| `ubicacion` | `string` | Consultorio físico o enlace de reunión virtual. |
| `idCitaOriginal` | `string` | ID de la cita origen en caso de reprogramación. |
| `notas` | `string` | Comentarios adicionales del terapeuta. |
| `estado` | `boolean` | Vigencia del registro. |
| `fechaCreacion` | `string` | Registro de creación. |
| `usuarioCreacion` | `string` | Usuario que agendó la cita. |
| `fechaModificacion` | `string` | Fecha de la última actualización. |
| `usuarioModificacion`| `string` | Último usuario que modificó el registro. |

#### Horario (`Horario`)
Planificación mensual de disponibilidad para un terapeuta.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador del registro de horario. |
| `idTerapeuta` | `string` | Referencia al ID del terapeuta. |
| `nombreTerapeuta` | `string` | Nombre completo denormalizado para búsquedas. |
| `mes` | `number` | Mes de la planificación (1-12). |
| `año` | `number` | Año de la planificación. |
| `bloques` | `Bloque[]` | Lista de rangos horarios definidos. |
| `sede` | `string` | Sede donde se aplicará este horario. |
| `estado` | `boolean` | Si el horario está activo o es histórico. |
| `fechaCreacion` | `string` | Fecha de creación del planning. |
| `usuarioCreacion` | `string` | Usuario que realizó el registro. |
| `fechaModificacion` | `string` | Fecha de la última actualización. |
| `usuarioModificacion`| `string` | Último usuario que modificó el registro. |


#### Bloque de Horario (`BloqueHorario`)
Definición específica de tiempo dentro de una planificación.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | ID del bloque. |
| `diasSemana` | `string[]` | Días donde aplica (ej: `['Lunes', 'Martes']`). |
| `horaInicio` | `string` | Hora de entrada (formato `HH:mm`). |
| `horaFin` | `string` | Hora de salida (formato `HH:mm`). |
| `tipo` | `string` | Clasificación: `TRABAJO` o `PAUSA`. |
| `estado` | `string` | Sub-estado: `DISPONIBLE`, `OCUPADO`, `REFRIGERIO`. |
| `descripcion` | `string` | Notas adicionales sobre el bloque (opcional). |

#### Especialidad (`Especialidad`)
Servicios ofrecidos por la clínica.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | ID de la especialidad. |
| `nombre` | `string` | Nombre del servicio (ej: Psicología Infantil). |
| `descripcion` | `string` | Detalle del servicio terapéutico. |
| `duracionSesion` | `number` | Tiempo estándar de atención en minutos. |
| `estado` | `boolean` | Disponibilidad comercial del servicio. |

#### Sede (`Sede`)
Ubicaciones físicas de atención clínica.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `idSede` | `string` | ID único de la sede. |
| `nombreSede` | `string` | Nombre comercial del centro. |
| `direccion` | `string` | Ubicación física. |
| `horarioAtencion`| `array` | Configuración de apertura diaria. |
| `estado` | `boolean` | Vigencia de la sede. |

### 💰 Gestión Financiera

#### Paquete (`Paquete`)
Contrato de múltiples sesiones terapéuticas con precio preferencial.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `idPaquete` | `string` | Identificador único del paquete. |
| `idPaciente` | `string` | Cliente titular del paquete. |
| `idDoctor` | `string` | Terapeuta principal asignado. |
| `descripcion` | `string` | Detalle comercial del servicio. |
| `categoria` | `string` | Clasificación del servicio. |
| `frecuencia` | `string` | Periodicidad sugerida (ej: Semanal). |
| `totalCitas` | `number` | Cantidad total de sesiones contratadas. |
| `monto` | `number` | Precio total pactado. |
| `fechaInicio` | `string` | Fecha de activación. |
| `fechaFin` | `string` | Fecha de vencimiento estimada. |
| `reprogramacion` | `boolean` | Indica si permite cambios de fecha. |
| `sede` | `string` | Sede de contratación. |
| `estado` | `boolean` | Vigencia del paquete. |
| `fechaCreacion` | `string` | Registro de venta. |
| `usuarioCreacion` | `string` | Usuario que realizó la venta. |

#### Pago (`Pago`)
Cabecera de registro de deuda o ingreso por servicios.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `idPago` | `string` | Identificador único de la cuenta. |
| `idPaciente` | `string` | Paciente responsable del pago. |
| `idPaquete` | `string` | Paquete vinculado (si aplica). |
| `concepto` | `string` | Descripción del cobro. |
| `monto` | `number` | Importe total de la obligación financiera. |
| `estado` | `enum` | Estado actual: `PAGADO`, `PENDIENTE`, `PARCIAL`. |
| `fechaReferencial` | `string` | Fecha contable o de emisión. |
| `moneda` | `enum` | Moneda: `PEN` (Soles) o `USD` (Dólares). |
| `idSede` | `string` | Sede donde se genera el flujo. |
| `fechaCreacion` | `string` | Fecha de registro del pago. |
| `usuarioCreacion` | `string` | Usuario que registró la deuda/pago. |

#### Transacción (`Transaccion`)
Movimiento individual de dinero vinculado a un pago.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `idTransaccion` | `string` | Identificador único del movimiento. |
| `idPago` | `string` | Referencia a la cabecera de pago vinculada. |
| `monto` | `number` | Importe de esta transacción específica. |
| `fecha` | `string` | Fecha y hora en que se realizó el movimiento. |
| `medio` | `enum` | Medio: `EFECTIVO`, `TRANSFERENCIA`, `YAPE`, etc. |
| `estado` | `string` | Estado: `COMPLETADO`, `ANULADO`, etc. |
| `comprobante` | `string` | Número de operación o referencia. |
| `tipoTransaccion`| `enum` | Flujo: `INGRESO` o `EGRESO`. |
| `idSede` | `string` | Sede donde ingresó el dinero. |


#### Configuración Dinámica (`ConfiguracionDinamica`)
Motor que impulsa el branding y las reglas de negocio desde la base de datos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único del parámetro. |
| `clave` | `string` | Identificador lógico (ej: `COLOR_PRIMARIO`). |
| `valor` | `any` | El dato configurado (string, number, hex, etc.). |
| `etiqueta` | `string` | Nombre descriptivo que aparece en la interfaz. |
| `categoria` | `string` | Grupo al que pertenece (`BRANDING`, `AGENDA`, etc.). |
| `tipoControl` | `string` | Tipo de input: `COLOR`, `IMAGE`, `CHECKBOX`, `LIST`. |
| `opciones` | `string[]` | Lista de valores si el control es un selector. |
| `orden` | `number` | Prioridad de visualización en el panel. |
| `descripcion` | `string` | Explicación del impacto de esta configuración. |


#### Configuración Global (`ConfiguracionGlobal`)
Parámetros estructurales del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único. |
| `clave` | `string` | Identificador lógico. |
| `valor` | `string` | Valor asignado. |
| `tipoControl` | `string` | Tipo de selector especializado. |
| `categoria` | `string` | Área de impacto. |
| `descripcion` | `string` | Detalle técnico. |


#### Auditoría (`Auditoria`)
Registro inmutable de la actividad del sistema.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único del log. |
| `tabla` | `string` | Entidad o módulo afectado (ej: `USUARIOS`). |
| `idRegistro` | `string` | ID del objeto afectado para trazabilidad directa. |
| `accion` | `enum` | Tipo de operación: `INSERT`, `UPDATE`, `DELETE`, etc. |
| `datosAnteriores` | `any` | Objeto JSON con el estado previo al cambio. |
| `datosNuevos` | `any` | Objeto JSON con el estado posterior al cambio. |
| `fecha` | `string` | Marca de tiempo en formato ISO. |
| `idUsuario` | `string` | ID del usuario que realizó la acción. |
| `nombreUsuario` | `string` | Usuario que ejecutó la acción. |

---

## 🛡️ 6. Seguridad y RBAC

El sistema utiliza una matriz de **Control de Acceso Basado en Roles (RBAC)** que se inyecta dinámicamente:
*   **Aislamiento de Sede:** Los usuarios con perfil restringido solo pueden ver datos de su propia sede.
*   **Validación de Capacidades:** Los botones de "Editar" o "Eliminar" se ocultan automáticamente mediante el hook `usePermissions` si el perfil no tiene la capacidad otorgada en la configuración.
*   **Protección de Rutas:** El acceso a módulos completos (como Configuración) está bloqueado por el mismo motor de seguridad.

---

## 📬 7. Soporte y Contacto
* **Lead Developer:** Juan Castillo
* **Email:** [juancrcastillo20@gmail.com](mailto:juancrcastillo20@gmail.com)
* **Mantenimiento:** CliniGest Pro Core Team.

---

# Reporte de Consolidación de Estilos — CliniGest Pro

## 1. Identificación de Archivos CSS
Se realizó una búsqueda exhaustiva en todo el repositorio para identificar archivos de hojas de estilo (.css, .scss, .less).

| Archivo | Ruta | Líneas (aprox.) | Estado |
| :--- | :--- | :--- | :--- |
| **index.css** | `/src/index.css` | 2123 | **Centralizado (SST)** |

**Resultado:** Se ha confirmado que el proyecto ya opera bajo una arquitectura de **Single Source of Truth (SST)**. No se encontraron archivos CSS adicionales en carpetas de componentes, páginas o activos estáticos.

## 2. Validación de la Estructura Actual
El archivo `index.css` actual es el núcleo del sistema de diseño y cumple con las siguientes características:
- **Variables dinámicas**: Uso extensivo de `:root` para colores (formato RAW RGB para opacidad), tipografía, espaciado y elevación.
- **Tailwind 4 Integration**: Uso de `@theme` para mapear variables de CSS nativo a utilidades de Tailwind.
- **Capas de componentes**: Definición de clases semánticas (ej. `.clini-card`, `.clini-input-field`) que eliminan la necesidad de estilos inline repetitivos.
- **Inyección dinámica**: Preparado para recibir actualizaciones de variables vía JavaScript desde el módulo de configuración.

## 3. Estilos fuera de index.css
No se detectaron archivos `.css` externos. Sin embargo, se identificaron algunos patrones de Tailwind "hardcoded" en componentes que podrían ser abstraídos para cumplir con la visión del arquitecto de centralización total.

## 4. Estado del Objetivo
- [x] Centralización ya cumplida: **SÍ**.
- [x] Única fuente de verdad: **Establecida**.
- [x] Configuración vía `:root`: **Operativo**.