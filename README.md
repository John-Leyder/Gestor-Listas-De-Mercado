# Gestor de Lista de Mercado

Una aplicación web moderna para gestionar listas de compras y productos por tienda, desarrollada con React y Firebase.

## 🚀 Características

### Sprint 1: Funcionalidades Base ✅
- **Gestión de Tiendas**
  - Crear, editar y eliminar tiendas
  - Asignar nombre y dirección a cada tienda
  - Seleccionar tienda activa para gestionar sus productos

- **Gestión de Categorías**
  - Organizar productos por categorías
  - Crear, editar y eliminar categorías por tienda
  - Facilitar la organización de productos

- **Gestión de Productos**
  - Agregar productos con nombre, marca, precio y unidad de medida
  - Editar información de productos existentes
  - Eliminar productos no necesarios
  - Visualizar productos en una interfaz intuitiva

- **Autenticación de Usuarios**
  - Registro de nuevos usuarios
  - Inicio de sesión seguro
  - Cierre de sesión
  - Protección de rutas privadas

### Sprint 2: Características Avanzadas ✅
- **Sistema de Filtrado Avanzado**
  - Búsqueda por nombre de producto
  - Filtrado por marca
  - Filtrado por categoría
  - Rango de precios (mínimo y máximo)
  - Filtros en tiempo real
  - Botón de limpieza de filtros
  - Validación de campos numéricos

- **Historial de Precios**
  - Registro automático de cambios de precio
  - Visualización de historial por producto
  - Timestamps para cada modificación
  - Modal para visualización detallada

- **Resumen de Gastos**
  - Cálculo de gastos mensuales
  - Visualización de tendencias
  - Integración con historial de precios
  - Toggle para mostrar/ocultar resumen

- **Gestión de Estado de Productos**
  - Sistema de activación/desactivación
  - Indicadores visuales de estado
  - Diálogo de confirmación para cambios
  - Contadores de productos activos/inactivos
  - Migración automática de productos existentes

- **Mejoras en la Interfaz**
  - Diseño responsive optimizado
  - Grid layout para filtros
  - Feedback visual mejorado
  - Validaciones en tiempo real
  - Mensajes de error descriptivos
  - Botones de reintento en caso de fallos
  - Animaciones y transiciones

- **Optimizaciones Técnicas**
  - Implementación de useMemo para rendimiento
  - Gestión eficiente de estados
  - Índices optimizados en Firestore
  - Manejo mejorado de timestamps
  - Operaciones batch para actualizaciones masivas
  - Validación robusta de datos
  - Manejo de errores mejorado

### Sprint 3: Experiencia de Usuario y Seguridad ✅
- **Diseño Responsivo**
  - Adaptación a diferentes dispositivos
  - Interfaz fluida y adaptable
  - Optimización de componentes móviles
  - Mejoras en la usabilidad

- **Sistema de Asistencia al Usuario**
  - Centro de ayuda integrado
  - Documentación contextual
  - Guías paso a paso
  - Soporte por correo electrónico

- **Pruebas de Seguridad y Rendimiento**
  - Validación de autenticación
  - Pruebas de reglas de Firestore
  - Protección contra XSS
  - Validación de entrada de datos
  - Monitoreo de rendimiento
  - Optimización de carga
  - Gestión de memoria

- **Manejo de Errores Mejorado**
  - Mensajes de error descriptivos
  - Sistema de reintentos
  - Recuperación de fallos
  - Logging de errores

- **Mejoras de Interfaz**
  - Animaciones y transiciones
  - Feedback visual
  - Indicadores de estado
  - Accesibilidad mejorada

## 🛠️ Tecnologías Utilizadas

- **Frontend**
  - React.js
  - React Router para navegación
  - Context API para gestión de estado
  - CSS Modules para estilos

- **Backend y Servicios**
  - Firebase Authentication para autenticación
  - Cloud Firestore para base de datos
  - Reglas de seguridad personalizadas

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de Firebase
- Git

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd gestor-lista-mercado
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crear un proyecto en Firebase Console
   - Habilitar Authentication y Firestore
   - Copiar las credenciales de configuración
   - Crear un archivo `.env` en la raíz del proyecto:
     ```
     REACT_APP_FIREBASE_API_KEY=tu_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=tu_app_id
     ```
   - Para configurar la autenticación social (Google, GitHub, Facebook), sigue las instrucciones en [docs/SOCIAL_AUTH_SETUP.md](docs/SOCIAL_AUTH_SETUP.md)

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Auth/          # Componentes de autenticación
│   ├── Stores/        # Componentes relacionados con tiendas
│   ├── Categories/    # Componentes de categorías
│   └── Products/      # Componentes de productos
├── contexts/          # Contextos de React
├── pages/            # Páginas/rutas principales
├── services/         # Servicios de Firebase
├── config/           # Configuraciones
└── styles/           # Estilos globales
```

## 🔒 Seguridad

- Autenticación de usuarios implementada (email/password y proveedores sociales)
- Reglas de Firestore para proteger datos
- Validación de datos en el cliente y servidor
- Manejo seguro de sesiones

## 🌟 Características Futuras (Sprint 4)

- [ ] Sistema de notificaciones push
- [ ] Modo offline completo
- [ ] Sincronización en tiempo real
- [ ] Análisis avanzado de datos
- [ ] Integración con APIs externas
- [ ] Reportes personalizados
- [ ] Sistema de backup automático

## 👥 Contribuir

1. Fork el proyecto
2. Crear una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles

## 📞 Soporte

Si tienes alguna pregunta o sugerencia, por favor abre un issue en el repositorio.

## Solución a los problemas actuales

Actualmente hay dos problemas principales:

1. **Error de permisos de Firestore**: `Missing or insufficient permissions`
2. **Error al seleccionar tiendas**: `selectStore is not a function`

### 1. Solución al error de permisos

Se han creado reglas de Firestore para desarrollo que permiten el acceso sin restricciones. Para aplicarlas:

1. Abre la [consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Firestore Database" en el menú lateral
4. Haz clic en la pestaña "Reglas"
5. Reemplaza las reglas existentes con:
   ```
   rules_version = '2';
   
   service cloud.firestore {
     match /databases/{database}/documents {
       // Permitir acceso a todos los documentos para desarrollo
       // NOTA: Estas reglas son solo para desarrollo, NO usar en producción
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
6. Haz clic en "Publicar"

Estas reglas se encuentran en la carpeta `firebase-setup/firestore.rules`.

### 2. Solución al error de selección de tiendas

Se ha corregido el componente `StoreList.jsx` para usar `setSelectedStore` en lugar de `selectStore`. Este cambio ya está aplicado en el código.

Si aún experimentas problemas, revisa:
- Que tienes una sesión iniciada correctamente
- Que has aplicado las reglas de Firestore como se indica arriba
- Que has recargado la página después de aplicar los cambios

## Uso del depurador de Firebase

En la página principal, encontrarás un depurador de Firebase que te ayudará a:

1. Ver el estado actual de tu autenticación y selección de tienda
2. Crear datos de prueba (tienda, categoría y producto) para verificar que todo funciona
3. Obtener instrucciones para resolver problemas de permisos

## Pasos para iniciar la aplicación correctamente

1. Inicia la aplicación con `npm run dev`
2. Inicia sesión con tu cuenta
3. Aplica las reglas de Firestore como se indica arriba
4. Recarga la página
5. Si no ves tiendas, usa el botón "Crear datos de prueba" en el depurador
6. Recarga la página nuevamente para ver los datos creados

Si sigues experimentando problemas, no dudes en preguntar.

