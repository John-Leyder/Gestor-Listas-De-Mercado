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
  Timestamp,
  startAfter
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const COLLECTION_NAME = 'products';

// Caché simple para productos
const productCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

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
  async getProducts(userId, filters = {}, lastDoc = null, pageSize = 10) {
    try {
      const cacheKey = `${userId}-${JSON.stringify(filters)}-${lastDoc?.id || 'first'}`;
      const cachedData = productCache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data;
      }

      // Construir la consulta base
      let q = query(
        collection(db, 'products'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );

      // Aplicar filtros adicionales si existen
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.store) {
        q = query(q, where('store', '==', filters.store));
      }

      // Obtener los documentos
      const querySnapshot = await getDocs(q);
      const products = [];
      let lastVisible = null;

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
          price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date()
        });
      }

      // Ordenar los productos por fecha de creación (más recientes primero)
      products.sort((a, b) => b.createdAt - a.createdAt);

      // Aplicar paginación en memoria
      const startIndex = lastDoc ? products.findIndex(p => p.id === lastDoc.id) + 1 : 0;
      const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

      if (paginatedProducts.length > 0) {
        lastVisible = { id: paginatedProducts[paginatedProducts.length - 1].id };
      }

      const result = {
        products: paginatedProducts,
        lastVisible,
        hasMore: startIndex + pageSize < products.length
      };

      // Guardar en caché
      productCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error al obtener productos:', error);
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

// Función para limpiar la caché
export const clearProductCache = () => {
  productCache.clear();
}; 