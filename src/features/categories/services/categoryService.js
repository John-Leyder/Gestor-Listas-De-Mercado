import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'categories';

export const categoryService = {
  async getCategories({ userId }) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  async createCategory({ name, userId }) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        userId,
        createdAt: new Date()
      });
      return {
        id: docRef.id,
        name,
        userId
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(categoryId, { name }) {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, categoryId);
      await updateDoc(categoryRef, {
        name,
        updatedAt: new Date()
      });
      return {
        id: categoryId,
        name
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, categoryId));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}; 