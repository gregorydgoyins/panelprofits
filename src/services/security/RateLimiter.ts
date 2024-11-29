import { PERFORMANCE_CONFIG } from '../../config/performance';

export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  isAllowed(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < window);
    
    if (validTimestamps.length >= limit) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  async waitForAvailability(key: string, limit: number, window: number): Promise<void> {
    while (!this.isAllowed(key, limit, window)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}