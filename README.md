# 🏥 CliniGest Pro — Enterprise Clinical Management System (SaaS Ready)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

## 1. Información General
**CliniGest Pro** es una plataforma integral de grado empresarial diseñada específicamente para centros psicológicos y clínicas especializadas. Su arquitectura se basa en un **Motor de Configuración Dinámica**, lo que permite una flexibilidad total: el 90% de las reglas de negocio, la identidad visual y los niveles de acceso se definen mediante datos, no mediante código.

### El Problema que Resuelve
La mayoría de los sistemas de salud son rígidos. CliniGest Pro resuelve la desconexión entre el software y la marca corporativa, permitiendo que administradores sin conocimientos técnicos ajusten colores, logos, duraciones de sesión y permisos de seguridad en tiempo real.

### Público Objetivo
*   Centros de salud multisede.
*   Administradores que requieren **Auditoría de Datos** (Logs de trazabilidad).
*   Clínicas con flujos de trabajo dinámicos (duración de sesión por especialidad).

## 👁️ Interface & User Experience

| Dashboard Overview | Dynamic Branding | Smart Scheduling |
| :---: | :---: | :---: |
| ![Dashboard](https://raw.githubusercontent.com/juancastillo/clinigest-pro/main/docs/screenshots/dashboard.png) | ![Branding](https://raw.githubusercontent.com/juancastillo/clinigest-pro/main/docs/screenshots/branding.png) | ![Calendar](https://raw.githubusercontent.com/juancastillo/clinigest-pro/main/docs/screenshots/calendar.png) |
| *Métricas en tiempo real.* | *Customización instantánea.* | *Control de bloques y turnos.* |

### ⚡ Demo: Cambio de Identidad en Caliente
> El sistema utiliza variables CSS `:root` inyectadas dinámicamente para actualizar la marca en milisegundos.

!Dynamic Theming GIF

---

## 2. Tabla de Contenido
1. Características Principales
2. Arquitectura & Stack
3. Instalación y Configuración
4. Seguridad y RBAC
5. Motor de Configuración
6. Diseño e Identidad
7. Roadmap & Futuro

---

## 3. Características Principales

### 👥 Gestión Maestras de Personas
*   **Terapeutas & Pacientes:** Módulos CRUD con validación de identidad (DNI/CE).
*   **Relación Terapéutica:** Asociación dinámica de terapeutas con múltiples especialidades y sedes.
*   **Rich Cells:** Celdas con avatares dinámicos, contrastados según el color primario del sistema.

### 🩺 Gestión de Especialidades
*   **Catálogo Maestro:** Definición de servicios médicos con duraciones personalizadas.
*   **Lógica de Paquetes:** (In Development) Restricciones de especialidad según el tamaño del paquete contratado.

### 📅 Gestión Avanzada de Horarios (Scheduling Core)
*   **Validación de Solapamiento:** Algoritmo que impide el registro de bloques cruzados para el mismo profesional.
*   **Restricciones de Sede:** Los horarios de los terapeutas respetan los días laborables y horas de apertura de la sede física.
*   **Sábados Media Jornada:** Soporte para restricciones horarias diferenciadas por fin de semana.

### 📊 Inteligencia de Negocio
*   **KPIs con Tendencias:** Visualización de métricas clave (Pacientes, Citas, Ingresos) con indicadores de crecimiento porcentual.
*   **Ocupación de Sedes:** Barras de progreso dinámicas que muestran la carga operativa actual por ubicación.

---

## 4. Arquitectura del Sistema

### Stack Tecnológico
*   **Frontend:** React 18 + Vite (HMR Ultra-fast).
*   **Styles:** Tailwind CSS v4.0 (Native CSS Variables API).
*   **Motion:** Framer Motion (Micro-interactions & Page transitions).
*   **Persistence:** Abstraction Layer `apiService` (Adapter Pattern ready for Axios/Fetch).

### Estructura de Directorios
```bash
src/
 ├── components/common # DataTable, Modal, Alert (Atomic Design)
 ├── hooks/           # usePermissions (RBAC logic)
 ├── services/        # apiService (Logic Core & Persistence)
 └── index.css        # Design System SST (Single Source of Truth)
```

---

## 5. Instalación y Configuración

### Requisitos Previos
*   **Node.js:** v18.17.0 o superior (recomendado v20+).
*   **Administrador de paquetes:** `npm` o `pnpm`.

### Pasos Detallados
1.  **Clonar:**
    ```bash
    git clone https://github.com/juancastillo/clinigest-pro.git
    cd clinigest-pro
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```
4.  **Construir para producción:**
    ```bash
    npm run build
    ```

---

## 6. Seguridad y RBAC

El sistema implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** extremadamente granular:

```typescript
// Ejemplo de estructura de Permisos (src/types/index.ts)
{
  perfil: "RECEPCIONISTA",
  modulo: "PACIENTES",
  acceso: true,
  puedeCrear: true,
  puedeEditar: true,
  puedeEliminar: false,
  verTodo: false // Solo ve pacientes de su sede
}
```

*   **Matriz de Permisos:** Se define por la combinación `Perfil + Módulo`.
*   **Capacidades:** `acceso`, `verTodo` (Global vs Sede), `puedeCrear`, `puedeEditar`, `puedeEliminar`, `filtrarPersonas`.
*   **Protección de UI:** El sistema oculta automáticamente botones de acción (Editar/Eliminar) si el usuario no tiene la capacidad otorgada en la matriz.
*   **Dirty Checking:** El módulo de configuración incluye una validación de "Cambios sin guardar" que previene la pérdida de datos al navegar accidentalmente fuera de una sección editada.

---

## 7. Motor de Configuración (v2.0)

Es el corazón del sistema. Permite la edición dinámica de:

*   **Branding:** Logo (Base64), Colores Institucionales (Primario/Secundario/Acento), Nombre de Empresa.
*   **Reglas de Agenda:** Duración de sesión (Global vs Por Especialidad), Colores de estados (Disponible/Ocupado/Refrigerio).
*   **Diccionarios Maestros:** Gestión de catálogos de Tipos de Documento, Medios de Pago, Monedas y Modalidades de atención.
*   **Configuración de Sede:** Cada sede tiene su propio horario de atención activo/inactivo por día de la semana.

---

## 8. API y Endpoints

La capa `apiService.ts` actúa como un orquestador que simula un Backend real:

| Método | Descripción | Regla de Negocio | Estado |
| :--- | :--- | :--- | :--- |
| `getPacientes(sede?)` | Obtiene listado | Aplica filtro de seguridad si no es SuperAdmin. | **Mock Persistence** |
| `updateConfig(clave, valor)`| Persiste ajustes | Regenera dinámicamente el CSS `:root` y loguea auditoría. | **Ready for API** |
| `createHorario(data)` | Registra planificación | Valida solapamientos antes de persistir. | **Logic Validated** |
| `deleteUsuario(id)` | Desactivación | Realiza un **Soft Delete** (cambio de estado). | **Mock Persistence** |

> **Nota:** La capa de servicios está diseñada bajo el patrón *Repository*, permitiendo el cambio a una API real (Axios/Fetch) simplemente modificando la implementación del `apiService` sin tocar los componentes.

---

## 9. Diseño e Identidad Visual

### Single Source of Truth (SST)
Todo el diseño reside en `index.css`. El sistema aprovecha las capacidades de **Tailwind CSS v4.0**, eliminando la necesidad de archivos de configuración pesados y utilizando la nueva API de inyección de variables nativas.

*   **Formatos RAW:** Los colores se guardan en formato RGB plano (`79, 70, 229`). Esto permite que el sistema aplique opacidades variables sobre el color de marca (ej: `bg-primary/10`) manteniendo la legibilidad.
*   **Escala Semántica:**
    *   `xxs` (10px): Micro etiquetas.
    *   `ui` (15px): Navegación.
    *   `heading` (24px): Títulos principales.
*   **Elevación:** 6 niveles de sombras jerárquicas (`shadow-sys-xs` a `shadow-sys-2xl`).

---

## 10. Mantenimiento y Auditoría

### Sistema de Auditoría (Logs)
Cada acción de escritura en el sistema (`INSERT`, `UPDATE`, `DELETE`, `LOGIN`) genera un registro en la tabla de Auditoría que captura:
1.  **Usuario:** Quién realizó la acción.
2.  **Trazabilidad:** Datos anteriores vs Datos nuevos (JSON Diff).
3.  **Sanitización:** El sistema omite automáticamente campos grandes (como imágenes Base64) en los logs para optimizar el almacenamiento.

### Estrategia de Resiliencia
El `apiService` incluye una lógica de **Auto-Pruning**. Si el `localStorage` del navegador se llena (`QuotaExceededError`), el sistema elimina automáticamente los logs más antiguos para asegurar que las operaciones críticas (como guardar una cita) nunca fallen.

---

## 11. Despliegue

El proyecto es un SPA (Single Page Application) estático:
1.  Generar build: `npm run build`.
2.  El resultado en la carpeta `dist/` puede ser desplegado en:
    *   Vercel / Netlify.
    *   GitHub Pages.
    *   Firebase Hosting.
    *   S3 + CloudFront.

---

## 12. Contribución

Para mantener la integridad del sistema:
1.  **Atomic Design:** Si creas un nuevo componente de UI, debe ir en `components/common` y usar variables `:root`.
2.  **Tipado:** Todo nuevo modelo debe ser definido en `src/types/index.ts`.
3.  **Logs:** Asegúrate de llamar a `addAudit` en el `apiService` para cualquier nueva operación de persistencia.

---

## 13. Soporte y Contacto

*   **Lead Developer:** Juan Castillo
*   **Email:** juancrcastillo20@gmail.com
*   **Mantenimiento:** CliniGest Pro Core Team.

---
*© 2024 CliniGest Pro — Transformando la gestión clínica con tecnología inteligente.*
