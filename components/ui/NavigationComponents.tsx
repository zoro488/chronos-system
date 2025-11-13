/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 NAVIGATION COMPONENTS - CHRONOS SYSTEM                    ║
 * ║  Componentes de navegación: Breadcrumbs, Tabs, Pagination, Stepper       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { motion } from 'framer-motion';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================================================
// BREADCRUMBS COMPONENT
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1.5',
                  isLast ? 'font-medium text-white' : 'text-gray-400'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}

            {!isLast && <ChevronRight className="h-4 w-4 text-gray-600" />}
          </div>
        );
      })}
    </nav>
  );
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'default',
  className,
}: TabsProps) {
  const variantStyles = {
    default: {
      container: 'rounded-xl bg-white/5 p-1',
      tab: 'rounded-lg',
      active: 'bg-white/10 text-white shadow-lg',
      inactive: 'text-gray-400 hover:text-white hover:bg-white/5',
    },
    pills: {
      container: 'space-x-2',
      tab: 'rounded-full',
      active: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50',
      inactive: 'text-gray-400 hover:text-white hover:bg-white/10',
    },
    underline: {
      container: 'border-b border-white/10 space-x-6',
      tab: 'pb-3',
      active: 'text-white border-b-2 border-purple-500',
      inactive: 'text-gray-400 hover:text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('flex', styles.container, className)}>
      {items.map((item) => {
        const isActive = item.id === value;

        return (
          <button
            key={item.id}
            onClick={() => !item.disabled && onChange(item.id)}
            disabled={item.disabled}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              styles.tab,
              isActive ? styles.active : styles.inactive
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-gray-400'
                )}
              >
                {item.badge}
              </span>
            )}

            {/* Underline indicator */}
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    }

    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('ellipsis');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      )}

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-gray-400"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border font-medium transition-all',
              page === currentPage
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'border-white/10 bg-white/5 text-gray-300 backdrop-blur-xl hover:bg-white/10'
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// STEPPER COMPONENT
// ============================================================================

export interface StepItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  allowClickPrevious?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  allowClickPrevious = true,
  className,
}: StepperProps) {
  const isStepClickable = (index: number) => {
    if (!onStepClick) return false;
    if (allowClickPrevious && index < currentStep) return true;
    return false;
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = isStepClickable(index);

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all',
                    isCompleted &&
                      'bg-green-500 border-green-500 text-white',
                    isActive &&
                      'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50',
                    !isActive &&
                      !isCompleted &&
                      'border-white/20 bg-white/5 text-gray-400',
                    isClickable && 'cursor-pointer hover:scale-110'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-12 mt-2',
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-white/20'
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-8">
                <h4
                  className={cn(
                    'font-semibold',
                    isActive
                      ? 'text-white'
                      : isCompleted
                      ? 'text-green-400'
                      : 'text-gray-400'
                  )}
                >
                  {step.label}
                </h4>
                {step.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = isStepClickable(index);

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step */}
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all',
                  isCompleted &&
                    'bg-green-500 border-green-500 text-white',
                  isActive &&
                    'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/50',
                  !isActive &&
                    !isCompleted &&
                    'border-white/20 bg-white/5 text-gray-400',
                  isClickable && 'cursor-pointer hover:scale-110'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </button>

              <span
                className={cn(
                  'mt-2 text-sm text-center',
                  isActive
                    ? 'font-medium text-white'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 -mt-8',
                  isCompleted ? 'bg-green-500' : 'bg-white/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MENU COMPONENT (Simple Dropdown Menu)
// ============================================================================

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({ trigger, items, align = 'left', className }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] rounded-xl border border-white/10 bg-slate-900 backdrop-blur-xl shadow-xl overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-white/10"
                  />
                );
              }

              const content = (
                <>
                  {item.icon && (
                    <span className={item.danger ? 'text-red-400' : ''}>
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </>
              );

              const classes = cn(
                'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white hover:bg-white/10',
                item.disabled && 'opacity-50 cursor-not-allowed'
              );

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={classes}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.();
                        setIsOpen(false);
                      }
                    }}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn('w-full text-left', classes)}
                >
                  {content}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
