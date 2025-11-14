import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card = ({ children, className = '', hover = true, glass = false }: CardProps) => {
  return (
    <motion.div
      className={`
        ${glass 
          ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }
        rounded-2xl shadow-lg
        ${hover ? 'hover:shadow-2xl' : ''}
        transition-all duration-300
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
