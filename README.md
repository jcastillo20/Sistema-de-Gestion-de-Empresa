# CliniGest Pro - Sistema de Gestión Clínica Integral

##  Descripción
CliniGest Pro es una solución integral de software diseñada para optimizar la gestión operativa de centros médicos y psicológicos. La plataforma centraliza la administración de pacientes, la planificación de recursos humanos (terapeutas), el control de agendas multi-sede y el seguimiento administrativo, garantizando la seguridad de la información mediante un sistema avanzado de control de acceso basado en roles (RBAC).

## 🎯 Alcance del Proyecto
El sistema ha sido desarrollado para cubrir las necesidades críticas de una clínica moderna:
- **Gestión de Identidad**: Autenticación segura y perfiles de usuario personalizados.
- **Control Operativo**: Administración de sedes físicas, especialidades médicas y catálogos de servicios.
- **Módulo de Planificación**: Motor de horarios dinámicos con soporte para turnos rotativos, pausas y visualización en tiempo real.
- **Inteligencia de Datos**: Dashboard administrativo con indicadores clave de rendimiento (KPIs).
- **Seguridad y Auditoría**: Registro exhaustivo de todas las operaciones realizadas en el sistema para trazabilidad total.

## 🛠️ Stack Tecnológico

### Core Frontend
- **React 18**: Framework principal para una interfaz reactiva.
- **Vite**: Herramienta de construcción y desarrollo de alto rendimiento.
- **TypeScript**: Tipado estático para asegurar un código robusto y escalable.

### Diseño y UX
- **Tailwind CSS**: Estilizado moderno basado en utilidades.
- **Framer Motion**: Animaciones fluidas y transiciones de alto impacto visual.
- **Lucide React**: Paquete de iconografía vectorial coherente.

### Arquitectura de Datos
- **Simulador de API Robusto**: Implementación de lógica de persistencia asíncrona mediante `localStorage` y `apiService`, permitiendo una transición sencilla a un backend real (SQL/NoSQL).
- **Configuración Dinámica**: Motor que permite el cambio de identidad visual y parámetros de negocio sin intervención técnica.

## 🚀 Funcionalidades Destacadas

### 1. Sistema de Horarios Avanzado
- **Filtros Multi-Criterio**: Búsqueda por terapeuta, mes, año y especialidad clínica.
- **Vista Dual**: Listado administrativo para gestión masiva y Calendario visual para supervisión rápida.
- **Validación de Conflictos**: Algoritmo que previene el solapamiento de horarios y asegura el cumplimiento de las jornadas laborales.

### 2. Seguridad RBAC (Role-Based Access Control)
- Matriz de permisos granular: Acceso, Ver Todo, Crear, Editar y Eliminar.
- Perfiles predefinidos: Super Admin, Administrador de Sede, Recepcionista y Terapeuta.

### 3. Branding Personalizable
- Capacidad de modificar el logotipo (Base64), nombre de la clínica y colores corporativos de forma dinámica a través del panel de configuración.

## 📂 Estructura de Directorios

```text
src/
├── components/     # Componentes reutilizables (Tablas, Modales, Alertas)
├── hooks/          # Hooks personalizados (Gestión de permisos y estado)
├── lib/            # Utilidades y configuración de estilos
├── pages/          # Módulos de negocio (Horarios, Pacientes, Terapeutas)
├── services/       # Capa de datos y comunicación con API
├── types/          # Definiciones globales de TypeScript
└── constants.ts    # Configuración de navegación y reglas de validación
```

## 📦 Instalación

1. Clonar el repositorio.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Generar el build de producción:
   ```bash
   npm run build
   ```

## 🛡️ Estándares de Calidad
- **Clean Code**: Código organizado siguiendo principios de responsabilidad única.
- **Responsividad**: Interfaz optimizada para dispositivos móviles y escritorio.
- **Auditoría**: Registro de actividad integrado para cumplimiento normativo.

---
*Propiedad de CliniGest Pro - Sistema de Gestión Profesional.*