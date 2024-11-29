export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string, ttl: number = 3600000): Promise<T | null> {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600000
  ): Promise<T> {
    const cached = await this.get<T>(key, ttl);
    if (cached !== null) return cached;
    
    const fresh = await fetchFn();
    this.set(key, fresh);
    return fresh;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}