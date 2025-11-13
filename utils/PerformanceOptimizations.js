/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 CHRONOS PERFORMANCE OPTIMIZATIONS                          ║
 * ║           Utilidades y Patrones para Máximo Rendimiento                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PropTypes from 'prop-types';

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

/**
 * Wrapper para lazy loading con fallback personalizado
 */
export const lazyLoadComponent = (importFn, fallback = <div>Loading...</div>) => {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

/**
 * Preload de componentes lazy
 */
export const preloadComponent = (importFn) => {
  const component = lazy(importFn);
  importFn();
  return component;
};

// ============================================================================
// MEMOIZATION HELPERS
// ============================================================================

/**
 * HOC para memoizar componentes pesados
 */
export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

/**
 * Hook personalizado para computaciones pesadas
 * @param {Function} fn - Función a memoizar
 * @param {Array} deps - Dependencias
 */
export const useHeavyComputation = (fn, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => fn(), deps);
};

/**
 * Hook para callbacks estables
 * @param {Function} fn - Callback a memoizar
 * @param {Array} deps - Dependencias
 */
export const useStableCallback = (fn, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(fn, deps);
};

// ============================================================================
// VIRTUAL SCROLLING
// ============================================================================

/**
 * Virtual List Component
 * Renderiza solo items visibles en el viewport
 */
export const VirtualList = memo(function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
}) {
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((window.scrollY + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  return (
    <div style={{ height: totalHeight, position: 'relative' }}>
      {visibleItems.map(({ item, index }) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: index * itemHeight,
            height: itemHeight,
            width: '100%',
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  overscan: PropTypes.number,
};

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Lazy Image Component
 * Carga diferida de imágenes con placeholder
 */
export const LazyImage = memo(function LazyImage({ src, alt, placeholder, className }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        e.target.src = placeholder || '/placeholder.png';
      }}
    />
  );
});

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Progressive Image Component
 * Carga progresiva con blur effect
 */
export const ProgressiveImage = memo(function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <img
        src={placeholderSrc}
        alt={alt}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ filter: 'blur(10px)' }}
      />
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
});

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  placeholderSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

/**
 * Hook para debounce
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttle
 */
export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
};

// ============================================================================
// INTERSECTION OBSERVER
// ============================================================================

/**
 * Hook para detectar visibilidad de elementos
 */
export const useIntersectionObserver = (
  elementRef,
  { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false }
) => {
  const [entry, setEntry] = useState();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]) => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
};

// ============================================================================
// CODE SPLITTING PATTERNS
// ============================================================================

/**
 * Route-based code splitting
 */
export const routes = {
  Dashboard: lazy(() => import('../pages/MasterDashboard')),
  Ventas: lazy(() => import('../pages/VentasPage')),
  Compras: lazy(() => import('../pages/ComprasPage')),
  Inventario: lazy(() => import('../pages/InventarioPage')),
  Clientes: lazy(() => import('../pages/ClientesPage')),
  Bancos: lazy(() => import('../pages/BancosPage')),
  Reportes: lazy(() => import('../pages/ReportesPage')),
  Configuracion: lazy(() => import('../pages/ConfiguracionPage')),
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Medir tiempo de renderizado
 */
export const measureRenderTime = (componentName, callback) => {
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();

  if (endTime - startTime > 16) {
    // eslint-disable-next-line no-console
    console.warn(`${componentName} render took ${(endTime - startTime).toFixed(2)}ms`);
  }

  return result;
};

/**
 * Hook para detectar renderizados innecesarios
 */
export const useWhyDidYouUpdate = (name, props) => {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        // eslint-disable-next-line no-console
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
};

// ============================================================================
// BUNDLE SIZE OPTIMIZATION
// ============================================================================

/**
 * Import dinámico de librerías pesadas
 */
export const loadHeavyLibrary = async (libraryName) => {
  switch (libraryName) {
    case 'recharts':
      return await import('recharts');
    case 'framer-motion':
      return await import('framer-motion');
    case 'three':
      return await import('three');
    default:
      throw new Error(`Library ${libraryName} not found`);
  }
};

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * GUÍA DE OPTIMIZACIÓN CHRONOS
 *
 * 1. LAZY LOADING
 *    - Usa React.lazy() para rutas
 *    - Preload componentes críticos
 *    - Suspense con fallbacks apropiados
 *
 * 2. MEMOIZATION
 *    - React.memo() para componentes pesados
 *    - useMemo() para cálculos complejos
 *    - useCallback() para funciones en props
 *
 * 3. VIRTUAL SCROLLING
 *    - Listas largas (>100 items)
 *    - Tablas con muchos registros
 *    - Infinite scroll
 *
 * 4. IMAGE OPTIMIZATION
 *    - Lazy loading con loading="lazy"
 *    - WebP con fallback a PNG/JPG
 *    - Placeholders con blur effect
 *
 * 5. CODE SPLITTING
 *    - Por ruta (route-based)
 *    - Por componente (component-based)
 *    - Por librería (vendor splitting)
 *
 * 6. DEBOUNCE/THROTTLE
 *    - Búsquedas en tiempo real
 *    - Scroll handlers
 *    - Resize handlers
 *
 * 7. BUNDLE SIZE
 *    - Tree shaking
 *    - Import dinámico
 *    - Chunk splitting
 *
 * 8. MONITORING
 *    - React DevTools Profiler
 *    - Chrome DevTools Performance
 *    - Lighthouse audits
 */

export default {
  lazyLoadComponent,
  preloadComponent,
  withMemo,
  useHeavyComputation,
  useStableCallback,
  VirtualList,
  LazyImage,
  ProgressiveImage,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  routes,
  measureRenderTime,
  useWhyDidYouUpdate,
  loadHeavyLibrary,
};
