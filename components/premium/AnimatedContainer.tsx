import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useScrollAnimation } from '../../hooks/useAnimations';
import * as animations from '../../lib/animations';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: keyof typeof animations;
  className?: string;
  delay?: number;
}

export const AnimatedContainer = ({ 
  children, 
  animation = 'fadeIn',
  className = '',
  delay = 0
}: AnimatedContainerProps) => {
  const { ref, isInView } = useScrollAnimation();
  const animationVariant = animations[animation];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={animationVariant}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
