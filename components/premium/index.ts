/**
 * Premium Animation Components - Index
 * Export all animation components and utilities
 */

// Animation variants
export * from '../../lib/animations';

// Hooks
export { useScrollAnimation, useParallax, useMouseParallax } from '../../hooks/useAnimations';

// Components
export { AnimatedContainer } from './AnimatedContainer';
export { PageTransition } from './PageTransition';
export {
  RippleButton,
  AnimatedSwitch,
  LoadingSpinner,
  AnimatedProgressBar,
} from './MicroInteractions';

// Demo
export { default as AnimationsDemo } from './AnimationsDemo';
