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

## 🗺️ 3. Roadmap Estratégico (Alcance vs. Implementación)

Este roadmap detalla el cumplimiento de los requerimientos técnicos y funcionales solicitados.

### 🟢 1. Gestión de Personas y Perfiles
* **Estado:** Completado (95%)
* **Tiene:** CRUD Terapeutas, Pacientes y Usuarios. Asociación de roles (RBAC) y estados. Relación múltiple Terapeuta ↔ Especialidad.
* **Validaciones:** DNI (8 dígitos), Email formato, Nombres (solo texto), Teléfono.
* **Filtros:** Por Sede, Perfil y Estado.
* **Pendiente:** Implementar lógica para que terapeutas solo vean pacientes asignados si no tienen permiso `verTodo`.

### 🟡 2. Especialidades & Paquetes Terapéuticos
* **Estado:** En Desarrollo (40%)
* **Tiene:** Catálogo maestro de especialidades con duraciones dinámicas.
* **Pendiente:** Restricción por paquete: Validar que la cantidad de especialidades a elegir no supere el límite del tamaño del paquete.
* **Pendiente:** Motor de generación automática de citas según frecuencia (Semanal/Quincenal/Mensual).

### 🟢 3. Gestión Avanzada de Horarios (Agenda)
* **Estado:** Completado (100%)
* **Tiene:** Horarios por terapeuta, bloques múltiples por día, disponibilidad real.
* **Validaciones:** No solapamientos de bloques, respeto estricto de horario de apertura de sede.
* **Regla Especial:** Restricción automática de media jornada para sábados.

### 🟡 4. Gestión de Citas & Reprogramaciones
* **Estado:** En Desarrollo (60%)
* **Tiene:** Creación manual, estados con colores configurables, duración variable.
* **Validaciones:** No solapamientos de citas, integración con pagos previos.
* **Pendiente:** Flujo de 1 reprogramación estándar vs. excepcional con carga obligatoria de evidencia (Archivo/Motivo).

### 🔴 5. Gestión Financiera: Pagos y Transacciones
* **Estado:** Pendiente (10%)
* **Tiene:** Diccionarios de medios de pago.
* **Pendiente:** Registro de pagos parciales y múltiples transacciones para una sola deuda.
* **Validación:** Sumatoria de transacciones <= Monto total. Cambio automático de estado a "Pagado" al completar saldo.

### 🔴 6. Atención Automatizada (WhatsApp)
* **Estado:** Roadmap Estratégico
* **Pendiente:** Bot para consulta de citas y compra de paquetes. Registro de conversaciones en los logs de auditoría del paciente.

---

##  4. Estructura del Proyecto

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


*© 2026 CliniGest Pro — Transformando la gestión clínica con tecnología inteligente.*