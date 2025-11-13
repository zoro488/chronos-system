/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      CHRONOS LAYOUT COMPONENTS                             ║
 * ║                Premium Layout System with Glassmorphism                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Sistema de layout completo:
 * - PageLayout (estructura principal)
 * - ContentSection (secciones con glassmorphism)
 * - Grid (sistema de grillas responsivo)
 * - Stack (layout vertical/horizontal)
 * - Container (contenedor centrado)
 *
 * @module LayoutComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// PAGE LAYOUT
// ============================================================================

/**
 * PageLayout - Layout principal con sidebar + header + content
 */
export const PageLayout = ({
  children,
  sidebar,
  header,
  sidebarCollapsed = false,
  onSidebarToggle,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onSidebarToggle) onSidebarToggle(newState);
  };

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]',
        className
      )}
    >
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebar && (
          <motion.aside
            initial={{ width: isCollapsed ? 80 : 256 }}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative bg-gray-900/40 backdrop-blur-2xl border-r border-white/10"
          >
            <div className="flex flex-col h-full">
              {/* Toggle Button */}
              <button
                onClick={handleToggle}
                className="absolute -right-3 top-8 w-6 h-6 flex items-center justify-center rounded-full bg-[#667eea] text-white shadow-lg hover:scale-110 transition-transform z-10"
              >
                {isCollapsed ? '→' : '←'}
              </button>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                {sidebar}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {header && (
          <header className="bg-gray-900/40 backdrop-blur-2xl border-b border-white/10">
            {header}
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  sidebar: PropTypes.node,
  header: PropTypes.node,
  sidebarCollapsed: PropTypes.bool,
  onSidebarToggle: PropTypes.func,
  className: PropTypes.string,
};

// ============================================================================
// CONTENT SECTION
// ============================================================================

/**
 * ContentSection - Sección de contenido con glassmorphism
 */
export const ContentSection = ({
  children,
  title,
  description,
  action,
  noPadding = false,
  className = '',
}) => {
  return (
    <section
      className={cn(
        'rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        'hover:border-white/20 transition-all duration-300',
        className
      )}
    >
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
              {description && <p className="text-sm text-white/60 mt-1">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </section>
  );
};

ContentSection.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  noPadding: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// GRID
// ============================================================================

/**
 * Grid - Sistema de grillas responsivo
 */
export const Grid = ({ children, cols = 1, gap = 6, responsive = true, className = '' }) => {
  const gridClasses = responsive
    ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`
    : `grid grid-cols-${cols}`;

  return <div className={cn(gridClasses, `gap-${gap}`, className)}>{children}</div>;
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.number,
  gap: PropTypes.number,
  responsive: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// STACK
// ============================================================================

/**
 * Stack - Layout vertical/horizontal con spacing
 */
export const Stack = ({
  children,
  direction = 'vertical',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  className = '',
}) => {
  const flexDirection = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const alignItems = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];
  const justifyContent = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }[justify];

  return (
    <div className={cn('flex', flexDirection, alignItems, justifyContent, `gap-${gap}`, className)}>
      {children}
    </div>
  );
};

Stack.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  gap: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around']),
  className: PropTypes.string,
};

// ============================================================================
// CONTAINER
// ============================================================================

/**
 * Container - Contenedor centrado con ancho máximo
 */
export const Container = ({ children, size = 'lg', centered = true, className = '' }) => {
  const maxWidth = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <div
      className={cn('w-full', maxWidth, centered && 'mx-auto', 'px-4 sm:px-6 lg:px-8', className)}
    >
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  centered: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// DIVIDER
// ============================================================================

/**
 * Divider - Separador visual
 */
export const Divider = ({ orientation = 'horizontal', className = '' }) => {
  const orientationClass = orientation === 'horizontal' ? 'w-full h-px' : 'w-px h-full';

  return <div className={cn(orientationClass, 'bg-white/10', className)} />;
};

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  PageLayout,
  ContentSection,
  Grid,
  Stack,
  Container,
  Divider,
};
