import { PERFORMANCE_CONFIG } from '../../config/performance';
import { PerformanceOptimizer } from '../performance/PerformanceOptimizer';

export class ResourceManager {
  private static instance: ResourceManager;
  private performanceOptimizer: PerformanceOptimizer;
  private resourceUsage: Map<string, number> = new Map();
  private requestQueue: Array<{ id: string; priority: number; task: () => Promise<any> }> = [];

  private constructor() {
    this.performanceOptimizer = PerformanceOptimizer.getInstance();
    this.initializeMonitoring();
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  private initializeMonitoring() {
    setInterval(() => this.checkResourceUsage(), 1000);
  }

  private checkResourceUsage() {
    const metrics = performance.memory;
    if (metrics && metrics.usedJSHeapSize > metrics.jsHeapSizeLimit * 0.8) {
      this.optimizeMemoryUsage();
    }
  }

  private async optimizeMemoryUsage() {
    // Clear unnecessary caches
    this.clearOldCaches();
    
    // Optimize image resources
    await this.performanceOptimizer.optimizeImages();
    
    // Request garbage collection (if available)
    if (global.gc) {
      global.gc();
    }
  }

  private clearOldCaches() {
    const now = Date.now();
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.open(cacheName).then(cache => {
          cache.keys().then(requests => {
            requests.forEach(request => {
              cache.match(request).then(response => {
                if (response) {
                  const timestamp = new Date(response.headers.get('date')).getTime();
                  if (now - timestamp > PERFORMANCE_CONFIG.cacheDuration.staticAssets) {
                    cache.delete(request);
                  }
                }
              });
            });
          });
        });
      });
    });
  }

  async queueTask(task: () => Promise<any>, priority: number = 1): Promise<any> {
    const taskId = Date.now().toString();
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        id: taskId,
        priority,
        task: async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.requestQueue.length === 0) return;

    // Sort by priority
    this.requestQueue.sort((a, b) => b.priority - a.priority);

    while (this.requestQueue.length > 0 && 
           this.resourceUsage.size < PERFORMANCE_CONFIG.resourceLimits.maxConcurrentAiRequests) {
      const nextTask = this.requestQueue.shift();
      if (nextTask) {
        this.resourceUsage.set(nextTask.id, Date.now());
        try {
          await nextTask.task();
        } finally {
          this.resourceUsage.delete(nextTask.id);
          this.processQueue();
        }
      }
    }
  }

  async optimizeAssets(assets: Array<{ type: string; data: any }>) {
    const batches = this.createBatches(assets, PERFORMANCE_CONFIG.batchSize.imageOptimization);
    
    for (const batch of batches) {
      await Promise.all(batch.map(asset => {
        switch (asset.type) {
          case 'image':
            return this.performanceOptimizer.optimizeImages();
          case 'audio':
            return this.optimizeAudio(asset.data);
          default:
            return Promise.resolve();
        }
      }));
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    return items.reduce((batches: T[][], item: T, index: number) => {
      const batchIndex = Math.floor(index / batchSize);
      if (!batches[batchIndex]) {
        batches[batchIndex] = [];
      }
      batches[batchIndex].push(item);
      return batches;
    }, []);
  }

  private async optimizeAudio(audioData: any) {
    // Audio optimization implementation
  }
}