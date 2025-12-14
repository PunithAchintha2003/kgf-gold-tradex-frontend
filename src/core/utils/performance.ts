/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (label && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.disconnect();
      }
    });
  }, options);
  
  observer.observe(img);
  
  return () => observer.disconnect();
}

/**
 * Check if code is running in production
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * Check if code is running in development
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};




