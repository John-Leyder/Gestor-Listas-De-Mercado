import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const COLLECTION_NAME = 'products';

export const productService = {
  // Crear un nuevo producto
  async createProduct(productData) {
    try {
      // Asegurarnos de que los campos requeridos estén presentes y los tipos sean correctos
      const productToSave = {
        ...productData,
        price: parseFloat(productData.price || 0),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'products'), productToSave);

      // Crear entrada en el historial de precios
      await addDoc(collection(db, 'priceHistory'), {
        productId: docRef.id,
        price: parseFloat(productData.price || 0),
        date: serverTimestamp(),
        userId: productData.userId
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Actualizar un producto
  async updateProduct(productId, productData) {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Asegurarnos de que el precio sea un número
      const dataToUpdate = {
        ...productData,
        price: parseFloat(productData.price || 0),
        updatedAt: serverTimestamp()
      };
      
      // Actualizar el producto
      await updateDoc(productRef, dataToUpdate);

      // Agregar al historial de precios si el precio cambió
      await addDoc(collection(db, 'priceHistory'), {
        productId,
        price: parseFloat(productData.price || 0),
        date: serverTimestamp(),
        userId: productData.userId
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Obtener productos con filtros
  async getProducts(filters = {}) {
    try {
      let q = collection(db, 'products');
      const constraints = [];

      // Aplicar filtro por userId
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      // Aplicar filtro por estado activo/inactivo
      if (filters.isActive !== undefined && filters.isActive !== '') {
        // Convertir el string 'true'/'false' a booleano
        const isActiveValue = filters.isActive === true || filters.isActive === 'true';
        constraints.push(where('isActive', '==', isActiveValue));
      }

      // Aplicar filtro por categoría
      if (filters.categoryId) {
        constraints.push(where('categoryId', '==', filters.categoryId));
      }

      // Aplicar filtro por tienda
      if (filters.storeId) {
        constraints.push(where('storeId', '==', filters.storeId));
      }

      // Aplicar la consulta con todos los filtros
      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);
      let products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Asegurarnos de que el precio sea un número
        const price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);
        
        // Procesar la fecha según su tipo
        let createdAt;
        if (data.createdAt?.toDate) {
          createdAt = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt;
        } else {
          createdAt = new Date();
        }
        
        return {
          id: doc.id,
          ...data,
          price: isNaN(price) ? 0 : price,
          // Almacenar la fecha procesada
          createdAt: createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          // Asegurar que estos campos existan
          name: data.name || '',
          brand: data.brand || '',
          categoryName: data.categoryName || 'Sin categoría',
          storeName: data.storeName || 'Sin tienda',
          isActive: typeof data.isActive === 'boolean' ? data.isActive : true
        };
      });

      // Aplicar filtros de texto y precio en memoria
      if (filters.name) {
        const searchName = filters.name.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchName)
        );
      }

      if (filters.brand) {
        const searchBrand = filters.brand.toLowerCase();
        products = products.filter(product => 
          product.brand.toLowerCase().includes(searchBrand)
        );
      }

      // Filtrar por fecha de inicio y fin
      if (filters.startDate && filters.endDate) {
        const startDate = filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate);
        const endDate = filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate);
        
        // Ajustar la hora de la fecha final para incluir todo el día
        endDate.setHours(23, 59, 59, 999);
        
        products = products.filter(product => {
          const productDate = product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt);
          return productDate >= startDate && productDate <= endDate;
        });
      }

      if (filters.minPrice !== undefined && filters.minPrice !== '') {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice)) {
          products = products.filter(product => product.price >= minPrice);
        }
      }

      if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          products = products.filter(product => product.price <= maxPrice);
        }
      }

      console.log('Productos recuperados de Firestore:', products);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Cambiar el estado activo/inactivo de un producto
  async toggleProductStatus(productId, isActive) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { 
        isActive,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  },

  // Obtener el historial de precios de un producto
  async getPriceHistory(productId) {
    try {
      const q = query(
        collection(db, 'priceHistory'),
        where('productId', '==', productId),
        orderBy('date', 'desc'),
        limit(12)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  },

  // Obtener resumen de gastos por mes
  async getMonthlyExpenseSummary(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const q = query(
        collection(db, 'products'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt;
        
        // Manejar diferentes formatos de fecha
        if (data.createdAt?.toDate) {
          // Es un Timestamp de Firestore
          createdAt = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
          // Es una fecha en formato string
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt instanceof Date) {
          // Ya es un objeto Date
          createdAt = data.createdAt;
        } else {
          // Si no hay fecha, usar la fecha actual
          createdAt = new Date();
        }

        // Asegurarnos de que el precio sea un número
        const price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);

        return {
          id: doc.id,
          ...data,
          createdAt,
          price: isNaN(price) ? 0 : price
        };
      }).filter(product => {
        // Filtrar por el mes y año seleccionados
        return product.createdAt >= startDate && product.createdAt <= endDate;
      });

      // Calcular totales
      const totalAmount = products.reduce((sum, product) => sum + (product.price || 0), 0);
      const totalProducts = products.length;

      // Agrupar por categoría
      const byCategory = products.reduce((acc, product) => {
        const categoryId = product.categoryId || 'sin-categoria';
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: product.categoryName || 'Sin categoría',
            total: 0,
            count: 0
          };
        }
        acc[categoryId].total += product.price || 0;
        acc[categoryId].count += 1;
        return acc;
      }, {});

      // Agrupar por tienda
      const byStore = products.reduce((acc, product) => {
        const storeId = product.storeId || 'sin-tienda';
        if (!acc[storeId]) {
          acc[storeId] = {
            name: product.storeName || 'Sin tienda',
            total: 0,
            count: 0
          };
        }
        acc[storeId].total += product.price || 0;
        acc[storeId].count += 1;
        return acc;
      }, {});

      console.log('Resumen calculado:', {
        totalAmount,
        totalProducts,
        byCategory,
        byStore,
        products
      });

      return {
        totalAmount,
        totalProducts,
        byCategory,
        byStore
      };
    } catch (error) {
      console.error('Error getting monthly expense summary:', error);
      throw error;
    }
  }
}; 