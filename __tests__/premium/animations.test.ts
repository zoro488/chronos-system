/**
 * Tests for Premium Animation Components
 */
import { describe, expect, it } from 'vitest';
import * as animations from '../../lib/animations';
import { AnimatedContainer } from '../../components/premium/AnimatedContainer';
import { 
  RippleButton, 
  AnimatedSwitch, 
  LoadingSpinner, 
  AnimatedProgressBar 
} from '../../components/premium/MicroInteractions';
import { PageTransition } from '../../components/premium/PageTransition';

describe('Premium Animation Exports', () => {
  it('should export all animation variants', () => {
    expect(animations.fadeIn).toBeDefined();
    expect(animations.slideInFromLeft).toBeDefined();
    expect(animations.slideInFromRight).toBeDefined();
    expect(animations.slideInFromBottom).toBeDefined();
    expect(animations.slideInFromTop).toBeDefined();
    expect(animations.scaleIn).toBeDefined();
    expect(animations.rotateIn).toBeDefined();
    expect(animations.hoverScale).toBeDefined();
    expect(animations.hoverGlow).toBeDefined();
    expect(animations.tapScale).toBeDefined();
    expect(animations.staggerChildren).toBeDefined();
    expect(animations.listItem).toBeDefined();
    expect(animations.pulse).toBeDefined();
    expect(animations.shake).toBeDefined();
    expect(animations.bounce).toBeDefined();
    expect(animations.pageTransition).toBeDefined();
    expect(animations.shimmer).toBeDefined();
  });

  it('should have correct animation variant structure', () => {
    expect(animations.fadeIn).toHaveProperty('hidden');
    expect(animations.fadeIn).toHaveProperty('visible');
    expect(animations.fadeIn.hidden).toHaveProperty('opacity', 0);
    expect(animations.fadeIn.visible).toHaveProperty('opacity', 1);
  });

  it('should have stagger animation with transition properties', () => {
    expect(animations.staggerChildren.visible.transition).toHaveProperty('staggerChildren', 0.1);
    expect(animations.staggerChildren.visible.transition).toHaveProperty('delayChildren', 0.2);
  });
});

describe('Premium Animation Components', () => {
  it('should export AnimatedContainer component', () => {
    expect(AnimatedContainer).toBeDefined();
    expect(typeof AnimatedContainer).toBe('function');
  });

  it('should export MicroInteractions components', () => {
    expect(RippleButton).toBeDefined();
    expect(AnimatedSwitch).toBeDefined();
    expect(LoadingSpinner).toBeDefined();
    expect(AnimatedProgressBar).toBeDefined();
  });

  it('should export PageTransition component', () => {
    expect(PageTransition).toBeDefined();
    expect(typeof PageTransition).toBe('function');
  });
});

describe('Animation Variants Structure', () => {
  it('should have proper ease curve for transitions', () => {
    const transition = animations.fadeIn.visible.transition;
    expect(transition).toBeDefined();
    expect(transition.ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it('should have spring animation for scaleIn', () => {
    const transition = animations.scaleIn.visible.transition;
    expect(transition).toBeDefined();
    expect(transition.type).toBe('spring');
    expect(transition.stiffness).toBe(200);
    expect(transition.damping).toBe(20);
  });

  it('should have infinite repeat for pulse animation', () => {
    expect(animations.pulse.transition.repeat).toBe(Infinity);
    expect(animations.pulse.transition.duration).toBe(2);
  });
});
