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

## 🗺️ 2. Roadmap Estratégico (Alcance vs. Implementación)

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

## 🗄️ 3. Arquitectura de Datos (Diccionario de Tablas)

Estructura requerida para garantizar la trazabilidad e inmutabilidad del sistema.

### ⚙️ Sección: Configuración y Maestros
| Tabla | Datos a Mostrar | Filtros | Validaciones |
| :--- | :--- | :--- | :--- |
| **sys_config** | Clave, Valor, Etiqueta, Categoría | Categoría | Tipo de control (RGB, Base64, Check) |
| **sys_dict** | Prefijo, Valor, Etiqueta | Prefijo | Valor único por prefijo |
| **sys_sedes** | Nombre, Dirección, Horarios L-D | Estado | Horas fin > inicio |
| **sys_permisos**| Módulo, Perfil, Capacidades | Perfil | Matriz única Perfil/Módulo |

### 👥 Sección: Personas y Operaciones
| Tabla | Datos a Mostrar | Filtros | Validaciones |
| :--- | :--- | :--- | :--- |
| **users** | Username, Perfil, Sede, Contacto | Sede, Perfil | Username único, Password hash |
| **patients** | Nombres, DNI, Sede, Responsable | Sede, Nombre | DNI 8 dígitos, Correo format |
| **therapists** | Nombres, Especialidades, Colegiatura | Especialidad | Mínimo 1 especialidad vinculada |
| **especialid** | Nombre, Duración (min), Costo | Estado | Duración > 0, Nombre único |

### 📅 Sección: Operatividad y Finanzas (Fase Actual)
| Tabla | Propósito | Reglas Críticas |
| :--- | :--- | :--- |
| **appointments**| Agenda diaria de atención | No solapamientos, Vincular a disponibilidad |
| **packages** | Control de sesiones prepagadas | Cantidad fija, Frecuencia obligatoria, Consumo progresivo |
| **payments** | Cabecera financiera | Sumatoria transacciones <= Total del paquete |
| **transactions**| Registro granular de dinero | Medio de pago obligatorio (Yape, Tarjeta, etc) |
| **repro_logs** | Historial de excepciones | Motivo obligatorio, Adjunto de evidencia |

### 📝 Sección: Auditoría
| Tabla | Campos Principales | Regla |
| :--- | :--- | :--- |
| **audit_logs** | Tabla, Acción, Data_Anterior, Data_Nueva, Usuario | **Inmutable:** No permite edición ni borrado manual |

---

## 🛠️ 4. Stack Tecnológico
* **Frontend:** React 18 + Vite (SPA)
* **Estilos:** Tailwind CSS v4.0 (Arquitectura SST - Single Source of Truth)
* **Iconografía:** Lucide React
* **Persistencia:** LocalStorage (Capa de servicio lista para integración REST API)

---

## 🛡️ 5. Seguridad y RBAC
El sistema implementa un modelo de acceso granular:
* **Aislamiento de Sede:** Los usuarios solo ven datos de su sede asignada.
* **verTodo:** Capacidad especial para administradores globales.
* **Protección de UI:** Botones de acción (Crear/Editar/Borrar) se renderizan condicionalmente según los permisos del usuario.

---

## 📬 6. Soporte y Contacto
* **Lead Developer:** Juan Castillo
* **Email:** [juancrcastillo20@gmail.com](mailto:juancrcastillo20@gmail.com)
* **Mantenimiento:** CliniGest Pro Core Team.

---
*© 2026 CliniGest Pro — Transformando la gestión clínica con tecnología inteligente.*