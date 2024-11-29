import { useState } from 'react';
import { ResourceOptimizer } from '../services/optimization/ResourceOptimizer';
import { PerformanceMonitor } from '../services/optimization/PerformanceMonitor';

export function useOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  
  const optimizer = ResourceOptimizer.getInstance();
  const monitor = PerformanceMonitor.getInstance();

  const optimizeOperation = async <T>(
    resourceType: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsOptimizing(true);
    try {
      const result = await optimizer.optimizeRequest(resourceType, operation);
      setMetrics(optimizer.getResourceMetrics());
      return result;
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeBatch = async <T>(
    items: T[],
    operation: (batch: T[]) => Promise<any>,
    options: {
      batchSize?: number;
      resourceType: string;
    }
  ) => {
    setIsOptimizing(true);
    try {
      const results = await optimizer.optimizeBatch(items, operation, options);
      setMetrics(optimizer.getResourceMetrics());
      return results;
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPerformanceMetrics = () => {
    return monitor.getMetrics();
  };

  return {
    isOptimizing,
    metrics,
    optimizeOperation,
    optimizeBatch,
    getPerformanceMetrics
  };
}