# Documentación: Gestor de Listas de Mercado

## Índice
1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Componentes Principales](#componentes-principales)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Autenticación](#autenticación)
7. [Base de Datos](#base-de-datos)
8. [Servicios](#servicios)
9. [Estilos](#estilos)
10. [Despliegue](#despliegue)
11. [Pruebas](#pruebas)

## Descripción General

La aplicación "Gestor de Listas de Mercado" es una herramienta web diseñada para ayudar a los usuarios a organizar y gestionar sus compras de mercado. Permite a los usuarios:

- Crear y gestionar listas de productos
- Organizar productos por categorías
- Registrar tiendas para las compras
- Realizar seguimiento de gastos
- Gestionar su perfil de usuario
- Acceder desde múltiples dispositivos mediante autenticación segura

La aplicación está construida con un enfoque modular, utilizando React para el frontend y Firebase para el backend, brindando una experiencia fluida y responsive en distintos dispositivos.

## Tecnologías Utilizadas

### Frontend
- **React:** Biblioteca de JavaScript para construir interfaces de usuario
- **React Router:** Navegación entre diferentes componentes de la aplicación
- **React Bootstrap:** Framework CSS para diseño responsive
- **React Icons:** Biblioteca de iconos para la interfaz gráfica
- **React Toastify:** Para mostrar notificaciones al usuario
- **Chart.js y React Chart.js 2:** Para visualización de datos y gráficos

### Backend y Servicios
- **Firebase Authentication:** Sistema de autenticación seguro
- **Firebase Firestore:** Base de datos NoSQL en la nube
- **Firebase Analytics:** Análisis de uso de la aplicación

### Herramientas de Desarrollo
- **Vite:** Herramienta de construcción y desarrollo rápido
- **ESLint:** Herramienta de análisis de código estático
- **Vitest:** Framework de pruebas unitarias
- **Testing Library:** Para pruebas de componentes React

### Utilidades
- **EmailJS:** Servicio para envío de emails desde el frontend
- **date-fns:** Biblioteca para manipulación de fechas
- **xlsx:** Para exportación de datos a Excel

## Estructura del Proyecto

```
/
├── src/                  # Código fuente principal
│   ├── assets/           # Recursos estáticos (imágenes, iconos)
│   ├── contexts/         # Contextos de React (AuthContext)
│   ├── features/         # Características organizadas por dominio
│   │   ├── auth/         # Autenticación (login, registro, perfil)
│   │   ├── categories/   # Gestión de categorías
│   │   ├── dashboard/    # Dashboard principal y navegación
│   │   ├── products/     # Gestión de productos
│   │   ├── stores/       # Gestión de tiendas
│   │   └── support/      # Centro de ayuda
│   ├── firebase/         # Configuración de Firebase
│   ├── routes/           # Configuración de rutas
│   └── styles/           # Estilos globales
├── public/               # Archivos estáticos públicos
├── docs/                 # Documentación adicional
└── firebase-setup/       # Configuración adicional de Firebase
```

## Componentes Principales

### Autenticación (`src/features/auth/`)

#### Login.jsx
Componente para inicio de sesión con email/contraseña, Google o GitHub.

```jsx
// Fragmento clave: Manejo de autenticación social
const handleSocialLogin = async (provider, providerFunction) => {
  try {
    setError('');
    setLoading(true);
    await providerFunction();
    navigate('/dashboard');
  } catch (error) {
    console.error(`Error de inicio de sesión con ${provider}:`, error);
    const errorMessage = generateAuthErrorMessage(error, provider);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

#### Signup.jsx
Componente para registro de nuevos usuarios con email/contraseña, Google o GitHub.

```jsx
// Fragmento clave: Validación y registro
async function handleSubmit(e) {
  e.preventDefault();

  if (!validateEmail(email)) {
    return setError('Por favor ingresa un email válido');
  }

  if (password !== passwordConfirm) {
    return setError('Las contraseñas no coinciden');
  }

  if (password.length < 6) {
    return setError('La contraseña debe tener al menos 6 caracteres');
  }

  try {
    setError('');
    setLoading(true);
    await signup(email, password);
    navigate('/');
  } catch (error) {
    setError(getErrorMessage(error.code));
  } finally {
    setLoading(false);
  }
}
```

#### Profile.jsx
Componente para gestionar el perfil de usuario, vincular y desvincular proveedores de autenticación.

### Dashboard (`src/features/dashboard/`)

#### Dashboard.jsx
Componente principal que organiza la navegación y estructura de la aplicación después del login.

```jsx
// Fragmento clave: Estructura de navegación
<Routes>
  <Route path="profile" element={<Profile />} />
  <Route path="stores" element={<StoreList />} />
  <Route path="categories" element={<CategoryList />} />
  <Route path="products" element={<ProductList />} />
  <Route path="help" element={<HelpCenter />} />
  <Route path="/" element={<Navigate to="products" replace />} />
</Routes>
```

### Productos (`src/features/products/`)

#### ProductList.jsx
Muestra, filtra y gestiona productos del usuario.

#### ProductForm.jsx
Formulario para crear y editar productos.

### Categorías (`src/features/categories/`)

#### CategoryList.jsx
Lista y gestiona las categorías de productos.

#### CategoryForm.jsx
Formulario para crear y editar categorías.

### Tiendas (`src/features/stores/`)

#### StoreList.jsx
Visualiza y gestiona las tiendas donde se realizan las compras.

#### StoreForm.jsx
Formulario para crear y editar tiendas.

## Flujos de Usuario

### Flujo de Autenticación
1. El usuario accede a la aplicación
2. Se presenta la pantalla de login
3. El usuario puede:
   - Iniciar sesión con email/contraseña
   - Iniciar sesión con Google
   - Iniciar sesión con GitHub
   - Ir a la pantalla de registro si no tiene cuenta
4. Tras la autenticación exitosa, se redirige al dashboard

### Flujo de Gestión de Productos
1. El usuario navega a la sección de Productos
2. Visualiza la lista de productos existentes
3. Puede filtrar por categoría, tienda, precio, etc.
4. Puede crear, editar o eliminar productos
5. Puede marcar productos como comprados

### Flujo de Análisis de Gastos
1. El usuario accede a la visualización de gastos
2. Puede ver gráficos de gastos por categoría, tienda o período
3. Puede exportar los datos para análisis adicional

## Autenticación

La aplicación utiliza Firebase Authentication para gestionar la identidad de los usuarios. Se implementan varios métodos de autenticación:

- Email y contraseña
- Google
- GitHub

El contexto de autenticación (`AuthContext.jsx`) gestiona el estado del usuario y proporciona métodos para:
- Iniciar sesión
- Registrarse
- Cerrar sesión
- Iniciar sesión con proveedores sociales
- Vincular y desvincular proveedores

```jsx
// Fragmento clave: AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Métodos de autenticación...

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

## Base de Datos

La aplicación utiliza Firebase Firestore como base de datos NoSQL. La estructura de la base de datos es la siguiente:

### Colecciones
- **users**: Información básica de usuarios
- **categories**: Categorías de productos creadas por los usuarios
- **stores**: Tiendas registradas por los usuarios
- **products**: Productos añadidos por los usuarios, con referencias a categorías y tiendas

### Seguridad
Las reglas de Firestore (`firestore.rules`) aseguran que los usuarios solo pueden acceder a sus propios datos mediante reglas de seguridad basadas en la autenticación.

## Servicios

La aplicación incluye servicios para interactuar con la base de datos:

### categoryService.js
Gestiona las operaciones CRUD para categorías:

```javascript
// Fragmento clave: Obtener categorías del usuario
export const getCategories = async ({ userId }) => {
  try {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};
```

### storeService.js
Gestiona las operaciones CRUD para tiendas:

```javascript
// Fragmento clave: Crear una nueva tienda
export const createStore = async ({ name, address, userId }) => {
  try {
    const storesRef = collection(db, "stores");
    const newStore = {
      name,
      address,
      userId,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(storesRef, newStore);
    return {
      id: docRef.id,
      ...newStore
    };
  } catch (error) {
    console.error("Error al crear tienda:", error);
    throw error;
  }
};
```

### productService.js
Gestiona las operaciones CRUD para productos y realiza análisis de gastos:

```javascript
// Fragmento clave: Filtrar productos
export const getProducts = async (filters = {}) => {
  try {
    const { userId, isActive, name, brand, categoryId, storeId, minPrice, maxPrice } = filters;
    
    let q = query(collection(db, "products"));
    
    // Aplicar filtros
    if (userId) q = query(q, where("userId", "==", userId));
    if (isActive !== undefined) q = query(q, where("isActive", "==", isActive));
    if (categoryId) q = query(q, where("categoryId", "==", categoryId));
    if (storeId) q = query(q, where("storeId", "==", storeId));
    
    // Obtener resultados y filtrar adicionalmente
    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      price: parseFloat(doc.data().price || 0)
    }));
    
    // Filtros adicionales en memoria
    if (name) {
      const searchTerm = name.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (brand) {
      const searchTerm = brand.toLowerCase();
      products = products.filter(product => 
        (product.brand || '').toLowerCase().includes(searchTerm)
      );
    }
    
    if (minPrice !== undefined) {
      products = products.filter(product => product.price >= minPrice);
    }
    
    if (maxPrice !== undefined) {
      products = products.filter(product => product.price <= maxPrice);
    }
    
    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};
```

## Estilos

La aplicación utiliza una combinación de React Bootstrap y estilos personalizados:

### Global.css
Estilos globales para toda la aplicación, incluyendo variables de colores, tipografía y utilidades.

### Auth.css
Estilos específicos para los componentes de autenticación, con animaciones y efectos visuales modernos.

### Dashboard.css
Estilos para el layout del dashboard, navegación y contenido principal.

## Despliegue

La aplicación está configurada para ser desplegada utilizando Vite:

```bash
# Construir la aplicación para producción
npm run build

# Vista previa de la aplicación construida
npm run preview
```

## Pruebas

La aplicación incluye configuración para pruebas con Vitest:

```bash
# Ejecutar pruebas
npm run test

# Ejecutar pruebas con interfaz visual
npm run test:ui

# Ejecutar pruebas con cobertura
npm run test:coverage
```

---

## Guía de Uso Rápido

### Instalar dependencias
```bash
npm install
```

### Iniciar en modo desarrollo
```bash
npm run dev
```

### Construir para producción
```bash
npm run build
```

### Ejecutar pruebas
```bash
npm run test
```

---

Documentación preparada el 8 de abril de 2024. 