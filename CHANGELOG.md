# Registro de Versiones - CliniGest Pro

## [2.0.0] - 2026-04-06 (Motor de Configuración Dinámica)

### Añadido
- **Motor de Configuración Dinámica:** Refactorización completa del módulo de configuración para ser impulsado por datos.
- **Nuevos Tipos de Control:** Soporte para campos de texto, números, selectores de color, checkboxes, selectores y enlaces a módulos complejos.
- **Categorización Dinámica:** Las secciones de configuración se generan automáticamente según las categorías definidas en la base de datos.
- **Persistencia V2:** Nueva clave de almacenamiento local (`clini_config_v2`) para asegurar la integridad de los datos dinámicos.

### Cambiado
- **Branding Dinámico:** El logo y nombre de la clínica en el Login ahora se cargan desde la configuración dinámica.
- **Especialidades en Terapeutas:** El campo de especialidad ahora es un selector dinámico que consume el catálogo maestro.
- **Arquitectura de Datos:** Migración de `ConfiguracionGlobal` a `ConfiguracionDinamica` para mayor flexibilidad.

## [1.0.0] - 2026-04-06 (Versión Base Estable)

### Funcionalidades Core
- **Autenticación y Sesión:**
  - Sistema de login con persistencia en `localStorage`.
  - Carga dinámica de permisos al iniciar sesión.
- **Seguridad y Roles (RBAC):**
  - Matriz de permisos configurable por módulo (Acceso, Ver Todo, Crear, Editar, Eliminar).
  - Soporte para perfiles: `SUPER_ADMIN`, `ADMINISTRADOR`, `ADMINISTRADOR_SEDE`, `RECEPCIONISTA`, `TERAPEUTA`.
  - Restricciones visuales automáticas (botones ocultos según permisos).
- **Módulo de Pacientes:**
  - CRUD completo con validaciones de DNI, Email y campos obligatorios.
  - Filtrado automático por sede (según perfil del usuario).
- **Módulo de Terapeutas:**
  - CRUD completo con integración de catálogo de especialidades.
  - Selector dinámico de especialidades desde configuración.
- **Módulo de Configuración (V1.0):**
  - **Branding:** Personalización de nombre de clínica, color primario y logo (Base64).
  - **Sedes:** Gestión de sedes físicas de la clínica.
  - **Especialidades:** Catálogo maestro para el personal médico.
  - **Matriz de Permisos:** Control total sobre qué puede hacer cada rol.
  - **Auditoría:** Registro detallado de logs (INSERT, UPDATE, DELETE, LOGIN).
- **Interfaz de Usuario (UI/UX):**
  - Dashboard con estadísticas dinámicas.
  - Tablas inteligentes con búsqueda, ordenamiento y paginación.
  - Modales personalizados para formularios y alertas.
  - Animaciones fluidas con `motion`.

### Aspectos Técnicos
- **Frontend:** React 18 + Vite.
- **Estilos:** Tailwind CSS con variables de color dinámicas.
- **Persistencia:** `localStorage` con simulador de API (`apiService`).
- **Iconografía:** Lucide React.
