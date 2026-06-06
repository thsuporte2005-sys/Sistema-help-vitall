/**
 * Help Vitall Database Management (IndexedDB Wrapper)
 */

const DB_NAME = 'HelpVitallDB';
const DB_VERSION = 1;

class HelpVitallDB {
  constructor() {
    this.db = null;
  }

  /**
   * Initializes the IndexedDB database
   */
  init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this);
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Database failed to open:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Products Store
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        }

        // Clients Store
        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
          clientStore.createIndex('productId', 'productId', { unique: false });
          clientStore.createIndex('date', 'date', { unique: false });
          clientStore.createIndex('status', 'status', { unique: false });
        }

        // Expenses Store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          expenseStore.createIndex('productId', 'productId', { unique: false });
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * General CRUD operations
   */
  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(Number(key) || key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  add(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clean ID if present to let autoincrement work
      if (item.id === '' || item.id === undefined || item.id === null) {
        delete item.id;
      }
      
      const request = store.add(item);

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject(request.error);
    });
  }

  put(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (item.id) {
        item.id = Number(item.id);
      }
      
      const request = store.put(item);

      request.onsuccess = () => resolve(item.id || request.result);
      request.onerror = () => reject(request.error);
    });
  }

  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(Number(key) || key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Configuration Helpers
   */
  getSetting(key, defaultValue) {
    return this.get('settings', key).then(record => {
      return record ? record.value : defaultValue;
    });
  }

  setSetting(key, value) {
    return this.put('settings', { key, value });
  }
}

// Export database instance
window.db = new HelpVitallDB();
