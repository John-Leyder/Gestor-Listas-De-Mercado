import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'stores';

export const storeService = {
  async getStores({ userId }) {
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
      console.error('Error getting stores:', error);
      throw error;
    }
  },

  async createStore({ name, address, userId }) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        address,
        userId,
        createdAt: new Date()
      });
      return {
        id: docRef.id,
        name,
        address,
        userId
      };
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  async updateStore(storeId, { name, address }) {
    try {
      const storeRef = doc(db, COLLECTION_NAME, storeId);
      await updateDoc(storeRef, {
        name,
        address,
        updatedAt: new Date()
      });
      return {
        id: storeId,
        name,
        address
      };
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  },

  async deleteStore(storeId) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, storeId));
      return true;
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  }
}; 