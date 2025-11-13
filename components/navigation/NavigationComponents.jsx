/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   CHRONOS NAVIGATION COMPONENTS                            ║
 * ║            Breadcrumb, Pagination, Stepper Premium                         ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes de navegación:
 * - Breadcrumb (migas de pan)
 * - Pagination (paginación avanzada)
 * - Stepper (pasos de formulario multi-step)
 * - Tabs (tabs avanzados con router support)
 *
 * @module NavigationComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// BREADCRUMB
// ============================================================================

/**
 * Breadcrumb - Migas de pan con navegación
 */
export const Breadcrumb = ({ items = [], separator = '/', className = '' }) => {
  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-white/30">{separator}</span>}
          {item.href ? (
            <a href={item.href} className="text-white/60 hover:text-white transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
  separator: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// PAGINATION (Advanced)
// ============================================================================

/**
 * Pagination - Paginación avanzada
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    // Always show first page
    pages.push(1);

    // Add ellipsis after first page if needed
    if (leftSibling > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (rightSibling < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          'bg-white/5 hover:bg-white/10 border border-white/10',
          currentPage === 1 && 'opacity-50 cursor-not-allowed'
        )}
      >
        Anterior
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-white/50">
                ...
              </span>
            );
          }

          return (
            <motion.button
              key={page}
              onClick={() => onPageChange(page)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-10 h-10 rounded-lg font-medium transition-all',
                page === currentPage
                  ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              )}
            >
              {page}
            </motion.button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          'bg-white/5 hover:bg-white/10 border border-white/10',
          currentPage === totalPages && 'opacity-50 cursor-not-allowed'
        )}
      >
        Siguiente
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// STEPPER
// ============================================================================

/**
 * Stepper - Indicador de pasos para formularios multi-step
 */
export const Stepper = ({ steps = [], currentStep, onStepClick, className = '' }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isClickable = isCompleted || isActive;

        return (
          <div key={stepNumber} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={cn(
                'relative flex flex-col items-center gap-2',
                !isClickable && 'cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'font-bold text-lg transition-all duration-300',
                  isCompleted && 'bg-green-500 text-white',
                  isActive &&
                    'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg scale-110',
                  !isActive && !isCompleted && 'bg-white/10 text-white/50'
                )}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span
                className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-white/50')}
              >
                {step.label}
              </span>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func,
  className: PropTypes.string,
};

// ============================================================================
// TABS (Advanced with Router Support)
// ============================================================================

/**
 * AdvancedTabs - Tabs con soporte para router
 */
export const AdvancedTabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'line',
  className = '',
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab List */}
      <div
        className={cn(
          'flex items-center gap-2',
          variant === 'pills' ? 'bg-white/5 p-1 rounded-xl' : 'border-b border-white/10'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all relative',
                variant === 'line' && 'hover:text-white',
                variant === 'pills' && 'hover:bg-white/10',
                isActive && variant === 'line' && 'text-white',
                isActive &&
                  variant === 'pills' &&
                  'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg',
                !isActive && 'text-white/50'
              )}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  {tab.badge}
                </span>
              )}

              {/* Underline for line variant */}
              {isActive && variant === 'line' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tabs.map((tab) => {
        if (tab.value !== activeTab) return null;

        return (
          <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab.content}
          </motion.div>
        );
      })}
    </div>
  );
};

AdvancedTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.number,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['line', 'pills']),
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Breadcrumb,
  Pagination,
  Stepper,
  AdvancedTabs,
};
