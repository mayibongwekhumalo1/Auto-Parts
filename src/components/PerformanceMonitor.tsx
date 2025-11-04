'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  useEffect(() => {
    // Only run in browser and not in development
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
      return;
    }

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const perfEntry = entry as PerformanceEventTiming;
        setMetrics(prev => ({ ...prev, fid: perfEntry.processingStart - entry.startTime }));
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
        }
      });
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Time to First Byte
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !localStorage.getItem('show-performance-metrics')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        {metrics.fcp && <div>FCP: {metrics.fcp.toFixed(0)}ms</div>}
        {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(0)}ms</div>}
        {metrics.fid && <div>FID: {metrics.fid.toFixed(0)}ms</div>}
        {metrics.cls !== null && <div>CLS: {metrics.cls.toFixed(4)}</div>}
        {metrics.ttfb && <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>}
      </div>
    </div>
  );
}