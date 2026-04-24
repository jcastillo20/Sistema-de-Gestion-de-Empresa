# CliniGest Pro - Sistema de Gestión Clínica Integral

## 📖 Introducción
**CliniGest Pro** es una plataforma Enterprise-Grade diseñada para la gestión operativa y administrativa de clínicas médicas y centros de terapia. El sistema destaca por su flexibilidad, permitiendo una personalización profunda de la identidad visual y las reglas de negocio sin necesidad de cambios en el código.

---

## 🚀 Alcance Funcional Detallado

### 1. Dashboard de Inteligencia
*   **KPIs en Tiempo Real**: Visualización de Pacientes Totales, Citas Hoy, Ingresos Mensuales y Tasa de Asistencia.
*   **Sedes y Operatividad**: Estado de sedes operativas y horas de terapia acumuladas.
*   **Gestión de Citas Recientes**: Listado con estados dinámicos (Pendiente, Confirmada, Completada).

### 2. Módulo de Pacientes
*   **Registro Maestro**: Gestión de datos demográficos y de contacto.
*   **Identidad Visual**: Sistema de avatares con iniciales dinámicas y bordes de color primario para una rápida identificación.
*   **Seguimiento por Sede**: Asignación y filtrado de pacientes según su ubicación preferente.

### 3. Gestión de Terapeutas y Especialidades
*   **Perfiles Profesionales**: Administración de colegiaturas y estados operativos.
*   **Catálogo de Especialidades**: Definición de servicios médicos con duraciones personalizables.
*   **Configuración de Duración Flexible**: 
    *   **Global**: Todas las sesiones duran un tiempo estándar (definido en Agenda).
    *   **Por Especialidad**: Cada tipo de servicio tiene su propio tiempo de atención.

### 4. Sistema de Horarios y Planificación (Core)
*   **Planificador Mensual**: Motor para definir turnos rotativos y bloques de atención.
*   **Filtros Unificados**: Búsqueda global por Terapeuta, Especialidad, Mes, Año y término de búsqueda (Sede/Nombre).
*   **Calendario Visual Interactivo**:
    *   **Vista Semanal**: Indicador de rango de fechas (ej: "20 de Abril al 26 de Abril") incluyendo el número de semana.
    *   **Cabeceras Dinámicas**: Los días de la semana (Lunes, Martes, etc.) muestran explícitamente el número de día del mes.
    *   **Bloques de Tiempo**: Visualización de horarios ocupados y disponibles con códigos de color configurables.

### 5. Control de Usuarios y Seguridad (RBAC)
*   **Roles Jerárquicos**: Super Admin, Administrador de Sede, Recepcionista y Terapeuta.
*   **Matriz de Permisos**: Control granular sobre qué módulos puede ver, crear, editar o eliminar cada perfil.
*   **Auditoría Total**: Registro de quién hizo qué, cuándo y en qué registro (incluye comparación de datos anteriores y nuevos).

---

## ⚙️ Configuraciones y Personalización

El sistema es altamente configurable a través del módulo de **Configuración**:

### Identidad Visual (Branding)
*   **Nombre de la Clínica**: Personalizable para el header y títulos.
*   **Logotipo**: Carga dinámica mediante formato Base64.
*   **Colores de Sistema**: Configuración de colores Primario, Secundario, Acento, Éxito, Info y Advertencia en formato RGB/HEX.

### Reglas de Agenda
*   **Método de Duración**: Selección entre duración 'GLOBAL' o 'POR_ESPECIALIDAD'.
*   **Intervalo Visual**: Capacidad de ver la agenda en bloques de 15, 30 o 60 minutos.
*   **Colores de Ocupación**: Personalización de los colores para bloques ocupados y de refrigerio.

### Parámetros de Sistema
*   **Moneda**: Configuración del símbolo monetario local.
*   **Zonas Horarias**: Ajuste según la ubicación geográfica de la clínica.

---

## 📊 Especificaciones Técnicas de UI

*   **Paginación**: El sistema utiliza un componente de tabla reutilizable que muestra la cantidad de registros filtrados vs totales.
*   **Validaciones**:
    *   **Formularios**: Validación de campos obligatorios y tipos de datos (Email, Teléfono, Documentos).
    *   **Duplicidad**: Control de ID de documentos y nombres de usuario únicos.
    *   **Constraint de Horarios**: Validación para evitar el solape de bloques de tiempo en un mismo terapeuta.
*   **Visualización**:
    *   **Avatares**: Círculos de 32px con fondo traslúcido y borde del color primario.
    *   **Badges/Pills**: Uso de indicadores visuales (Dots) para estados Activo/Inactivo.

---

## 🛠️ Cómo Funciona (Arquitectura Flujo)

1.  **Arranque**: El sistema carga la configuración dinámica desde el `ApiService` (preferente `localStorage` -> `mockDb`).
2.  **Autenticación**: El usuario ingresa y recibe un token de sesión con su perfil (RBAC).
3.  **Filtrado de Sede**: Dependiendo del rol, el usuario ve datos globales o solo los pertenecientes a su sede asignada.
4.  **Operatividad**: Al crear un horario, el sistema valida la disponibilidad. Al cambiar una configuración, el `index.css` regenera las variables del sistema (`--sys-color-primary`, etc.) logrando el cambio de marca instantáneo.
5.  **Persistencia**: Cada acción genera un log de auditoría automático antes de salvar en el almacenamiento del navegador.

---
*Desarrollado para CliniGest Pro - Gestión Clínica de Próxima Generación.*
