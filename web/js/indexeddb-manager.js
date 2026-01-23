/**
 * INDEXEDDB MANAGER - Sistema de persistencia local
 * Guarda: datasets, historial, preferencias, análisis
 */

class IndexedDBManager {
    constructor() {
        this.dbName = 'TelecomXDB';
        this.version = 1;
        this.db = null;
        this.isReady = false;
    }

    /**
     * Inicializa la base de datos
     */
    async init() {
        return new Promise((resolve, reject) => {
            // Verificar soporte de IndexedDB
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB not supported');
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                console.log('✅ IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para datasets subidos
                if (!db.objectStoreNames.contains('datasets')) {
                    const datasetStore = db.createObjectStore('datasets', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    datasetStore.createIndex('timestamp', 'timestamp', { unique: false });
                    datasetStore.createIndex('filename', 'filename', { unique: false });
                }

                // Store para historial de análisis
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { 
                        keyPath: 'timestamp' 
                    });
                    historyStore.createIndex('type', 'type', { unique: false });
                }

                // Store para preferencias de usuario
                if (!db.objectStoreNames.contains('preferences')) {
                    db.createObjectStore('preferences', { keyPath: 'key' });
                }

                // Store para análisis guardados
                if (!db.objectStoreNames.contains('savedAnalysis')) {
                    const analysisStore = db.createObjectStore('savedAnalysis', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    analysisStore.createIndex('name', 'name', { unique: false });
                }

                console.log('📦 IndexedDB schema created');
            };
        });
    }

    /**
     * Guarda un dataset
     */
    async saveDataset(data, metadata = {}) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readwrite');
            const store = transaction.objectStore('datasets');

            const datasetObj = {
                data: data,
                filename: metadata.filename || 'unknown',
                filesize: metadata.filesize || 0,
                rowCount: data.length,
                timestamp: new Date().toISOString(),
                metadata: metadata
            };

            const request = store.add(datasetObj);

            request.onsuccess = () => {
                console.log('✅ Dataset saved to IndexedDB');
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Error saving dataset:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene el último dataset guardado
     */
    async getLastDataset() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readonly');
            const store = transaction.objectStore('datasets');
            const index = store.index('timestamp');

            const request = index.openCursor(null, 'prev');

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    resolve(cursor.value);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene todos los datasets
     */
    async getAllDatasets() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readonly');
            const store = transaction.objectStore('datasets');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Elimina un dataset
     */
    async deleteDataset(id) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['datasets'], 'readwrite');
            const store = transaction.objectStore('datasets');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('✅ Dataset deleted');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Guarda en historial
     */
    async saveHistory(entry) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');

            const historyEntry = {
                ...entry,
                timestamp: new Date().toISOString()
            };

            const request = store.add(historyEntry);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene historial (últimas N entradas)
     */
    async getHistory(limit = 10) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const request = store.getAll();

            request.onsuccess = () => {
                const all = request.result;
                // Ordenar por timestamp descendente y limitar
                const sorted = all.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                ).slice(0, limit);
                resolve(sorted);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Limpia historial
     */
    async clearHistory() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');
            const request = store.clear();

            request.onsuccess = () => {
                console.log('✅ History cleared');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Guarda preferencia
     */
    async savePreference(key, value) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['preferences'], 'readwrite');
            const store = transaction.objectStore('preferences');

            const request = store.put({ key, value, updated: new Date().toISOString() });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene preferencia
     */
    async getPreference(key) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['preferences'], 'readonly');
            const store = transaction.objectStore('preferences');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Guarda análisis completo
     */
    async saveAnalysis(name, data) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['savedAnalysis'], 'readwrite');
            const store = transaction.objectStore('savedAnalysis');

            const analysis = {
                name,
                data,
                timestamp: new Date().toISOString()
            };

            const request = store.add(analysis);

            request.onsuccess = () => {
                console.log('✅ Analysis saved');
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene análisis guardados
     */
    async getSavedAnalyses() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['savedAnalysis'], 'readonly');
            const store = transaction.objectStore('savedAnalysis');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Obtiene tamaño de almacenamiento usado
     */
    async getStorageSize() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percentage: (estimate.usage / estimate.quota * 100).toFixed(2),
                usageFormatted: this.formatBytes(estimate.usage),
                quotaFormatted: this.formatBytes(estimate.quota)
            };
        }
        return null;
    }

    /**
     * Formatea bytes
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Limpia toda la base de datos
     */
    async clearAll() {
        if (!this.isReady) await this.init();

        const stores = ['datasets', 'history', 'preferences', 'savedAnalysis'];
        const promises = stores.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });

        await Promise.all(promises);
        console.log('✅ All data cleared');
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.IndexedDBManager = IndexedDBManager;
    window.indexedDBManager = new IndexedDBManager();
    
    // Auto-inicializar
    window.indexedDBManager.init().catch(err => {
        console.warn('⚠️ IndexedDB initialization failed:', err);
    });
    
    console.log('✅ IndexedDBManager loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexedDBManager;
}
