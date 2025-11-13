import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ scale: 1.02 }}
    className={className}
  >
    {children}
  </motion.div>
);

interface FadeInProps {
  children: ReactNode;
  duration?: number;
}

export const FadeIn = ({ children, duration = 0.3 }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration }}
  >
    {children}
  </motion.div>
);

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const SlideIn = ({ children, direction = 'left' }: SlideInProps) => {
  const variants: Record<'left' | 'right' | 'up' | 'down', { x?: number; y?: number }> = {
    left: { x: -50 },
    right: { x: 50 },
    up: { y: -50 },
    down: { y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...variants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
