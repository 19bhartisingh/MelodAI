
import { Track, GenerationParams } from '../types';

const DB_NAME = 'MelodaiCache';
const STORE_NAME = 'tracks';
const MAX_ITEMS = 50;
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
const CACHE_EXPIRY_MS = 1 * 60 * 60 * 1000; // 1 Hour

interface CacheEntry {
  key: string;
  metadata: Track;
  audioBlob: Blob;
  createdAt: number;
  lastAccessed: number;
  size: number;
}

export class CacheManager {
  private dbPromise: Promise<IDBDatabase>;
  private cacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    count: 0
  };

  constructor() {
    this.dbPromise = this.openDB();
    this.updateStats();
  }

  private openDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
        return Promise.reject("IndexedDB not supported");
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      };
    });
  }

  public async generateKey(params: GenerationParams): Promise<string> {
    // Exact mapping of identical prompt + parameters as requested
    const cleanParams = {
        prompt: params.prompt.trim().toLowerCase(),
        duration: params.duration,
        mood: params.mood,
        modelVariant: params.modelVariant,
        energyLevel: params.energyLevel,
        rhythmicDensity: params.rhythmicDensity,
        harmonicComplexity: params.harmonicComplexity,
        negativePrompt: params.negativePrompt?.trim().toLowerCase(),
        keySignature: params.keySignature,
        timeSignature: params.timeSignature
    };
    const str = JSON.stringify(cleanParams);
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
  }

  public async get(key: string): Promise<{ track: Track; audioBlob: Blob } | null> {
    try {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => {
                const entry = request.result as CacheEntry;
                if (entry) {
                    // Check for 1 hour expiry
                    if (Date.now() - entry.createdAt > CACHE_EXPIRY_MS) {
                        store.delete(key);
                        this.cacheStats.misses++;
                        resolve(null);
                        return;
                    }
                    
                    // Update LRU: Update last accessed time
                    entry.lastAccessed = Date.now();
                    store.put(entry);
                    this.cacheStats.hits++;
                    resolve({ track: entry.metadata, audioBlob: entry.audioBlob });
                } else {
                    this.cacheStats.misses++;
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn("Cache get failed", e);
        return null;
    }
  }

  public async set(key: string, track: Track, audioBlob: Blob): Promise<void> {
    try {
        const db = await this.dbPromise;
        const size = audioBlob.size;
        
        const entry: CacheEntry = {
            key,
            metadata: { ...track, fromCache: true },
            audioBlob,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            size
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(entry);
            
            request.onsuccess = async () => {
                resolve();
                // Check limits (LRU eviction)
                this.enforceLimits().then(() => this.updateStats());
            };
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn("Cache set failed", e);
    }
  }

  private async enforceLimits(): Promise<void> {
      try {
          const db = await this.dbPromise;
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const index = store.index('lastAccessed'); 
          
          const getAllRequest = index.getAll();
          
          getAllRequest.onsuccess = () => {
              const items = getAllRequest.result as CacheEntry[];
              let totalSize = items.reduce((acc, item) => acc + item.size, 0);
              let count = items.length;
              
              const toDelete: string[] = [];
              
              // Sort check: index.getAll() on lastAccessed gives oldest first
              for (const item of items) { 
                  if (count > MAX_ITEMS || totalSize > MAX_SIZE_BYTES) {
                      toDelete.push(item.key);
                      totalSize -= item.size;
                      count--;
                  } else {
                      break; 
                  }
              }

              if (toDelete.length > 0) {
                  const delTx = db.transaction([STORE_NAME], 'readwrite');
                  const delStore = delTx.objectStore(STORE_NAME);
                  toDelete.forEach(key => delStore.delete(key));
                  console.log(`Evicted ${toDelete.length} items from cache (LRU)`);
              }
          };
      } catch (e) {
          console.error("Cache enforcement failed", e);
      }
  }

  public async clear(): Promise<void> {
      const db = await this.dbPromise;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      this.cacheStats = { hits: 0, misses: 0, size: 0, count: 0 };
  }

  public async updateStats(): Promise<void> {
      try {
        const db = await this.dbPromise;
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const items = request.result as CacheEntry[];
            this.cacheStats.count = items.length;
            this.cacheStats.size = items.reduce((acc, i) => acc + i.size, 0);
        }
      } catch(e) { /* ignore */ }
  }

  public getStats() {
      const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
        ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(1) 
        : "0.0";
      return { ...this.cacheStats, hitRate };
  }
}

export const cacheManager = new CacheManager();
